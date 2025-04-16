// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  const conversationList = document.querySelector(".conversation-list");
  const chatHeader = document.querySelector(".chat-header");
  const chatMessages = document.querySelector(".chat-messages");
  const chatInput = document.querySelector(".chat-input input");
  const sendButton = document.querySelector(".send-btn");

  const startConversationBtn = document.getElementById(
    "start-conversation-btn"
  );
  const userSearchContainer = document.getElementById("user-search-container");
  const closeSearchBtn = document.querySelector(".close-search-btn");

  // Get token from localStorage (global.js already checks this)
  const token = localStorage.getItem("token");

  // Current user ID (will be set after fetching data)
  let currentUserId = null;
  // Store conversations data
  let conversations = [];
  // Current active conversation
  let activeConversation = null;

  // Fetch conversations from API
  fetchConversations();

  // Function to show the search bar
  function showUserSearch() {
    // Hide the start conversation button
    startConversationBtn.style.opacity = "0";
    startConversationBtn.style.visibility = "hidden";

    // Show the search container
    userSearchContainer.style.display = "block";

    // Clear previous search results
    document.getElementById("search-results").innerHTML = "";

    // Clear the search input
    document.getElementById("user-search").value = "";

    // Add a small delay before starting the animation
    setTimeout(() => {
      userSearchContainer.style.opacity = "1";
      userSearchContainer.style.transform = "translateY(0)";

      // Focus on the search input
      document.getElementById("user-search").focus();
    }, 50);
  }

  // Function to hide the search bar
  function hideUserSearch() {
    // Hide the search container
    userSearchContainer.style.opacity = "0";
    userSearchContainer.style.transform = "translateY(-10px)";

    // After animation completes, hide the element and show the button
    setTimeout(() => {
      userSearchContainer.style.display = "none";
      startConversationBtn.style.opacity = "1";
      startConversationBtn.style.visibility = "visible";
    }, 300);
  }

  // Function to search for users
  async function searchUsers(query) {
    try {
      const response = await fetch(`${window.CONFIG.API_URL}/api/searchUsers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          searchQuery: query,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to search users");
      }

      const data = await response.json();
      return data.users || [];
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }

  // Function to display search results
  function displaySearchResults(users) {
    const searchResults = document.getElementById("search-results");

    if (users.length === 0) {
      searchResults.innerHTML = `<div class="no-results">No users found</div>`;
      return;
    }

    // Clear previous results
    searchResults.innerHTML = "";

    // Add each user to the results
    users.forEach((user) => {
      const resultItem = document.createElement("div");
      resultItem.className = "search-result-item";

      // Create avatar URL
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.username
      )}&background=random`;

      resultItem.innerHTML = `
      <div class="avatar">
        <img src="${avatarUrl}" alt="Avatar">
      </div>
      <h4>${user.username}</h4>
    `;

      // Add click event to start conversation with this user
      resultItem.addEventListener("click", function () {
        startConversationWithUser(user);
        hideUserSearch();
      });

      searchResults.appendChild(resultItem);
    });
  }

  // Function to start a conversation with a selected user
  function startConversationWithUser(user) {
    // Check if there's already a conversation with this user
    const existingConversation = conversations.find(
      (conv) => conv.otherUserId === user.id
    );

    if (existingConversation) {
      // If conversation exists, just set it as active
      activeConversation = existingConversation;

      // Update UI to show this conversation as active
      document.querySelectorAll(".conversation").forEach((convo) => {
        convo.classList.remove("active");
      });

      // Find the conversation element and make it active
      const conversationElements = document.querySelectorAll(".conversation");
      for (let i = 0; i < conversationElements.length; i++) {
        if (
          conversationElements[i].dataset.conversationId ===
          existingConversation.id.toString()
        ) {
          conversationElements[i].classList.add("active");
          break;
        }
      }

      // Display the conversation
      displayConversation(existingConversation);
    } else {
      // Create a new conversation object
      const newConversation = {
        id: `temp_${Date.now()}`, // Temporary ID until saved to database
        otherUserId: user.id,
        otherUserName: user.username,
        messages: [], // No messages yet
        lastMessage: "No messages yet",
        lastMessageTime: new Date().toISOString(),
        isNewConversation: true, // Flag to indicate this is a new conversation
      };

      // Set as active conversation
      activeConversation = newConversation;

      // Display the new conversation
      displayConversation(newConversation);

      // We don't add it to the conversations list yet - we'll do that after the first message is sent
    }
  }

  startConversationBtn.addEventListener("click", showUserSearch);
  closeSearchBtn.addEventListener("click", hideUserSearch);
  const userSearchInput = document.getElementById("user-search");
  let lastQuery = "";
  userSearchInput.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    if (query === lastQuery) return;
    lastQuery = query;

    if (query.length >= 2) {
      if (event.target.searchTimeout) clearTimeout(event.target.searchTimeout);
      event.target.searchTimeout = setTimeout(async () => {
        const users = await searchUsers(query);
        if (query === lastQuery) {
          displaySearchResults(users);
        }
      }, 300);
    } else {
      document.getElementById("search-results").innerHTML = "";
    }
  });

  // Function to fetch user conversations from backend
  async function fetchConversations() {
    try {
      // Get all messages related to current user
      const response = await fetch(`${window.CONFIG.API_URL}/api/messages`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();

      // Store current user ID from the response
      currentUserId = data.currentUserId;

      // Process conversations
      processConversations(data.conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      // Display error in the conversation list
      conversationList.innerHTML = `
        <div class="conversation">
          <div class="conversation-info">
            <h3>Error</h3>
            <p>Failed to load conversations. Please try again later.</p>
          </div>
        </div>
      `;
    }
  }

  // Process conversations from API to create conversation list
  function processConversations(conversationsData) {
    // Clear the conversation list
    conversationList.innerHTML = "";

    // Set conversations data
    conversations = conversationsData.map((conversation) => {
      // Find the last message in the conversation
      let lastMessage = {
        message: "No messages yet",
        timestamp: conversation.created_at,
      };

      if (conversation.messages && conversation.messages.length > 0) {
        // Sort messages by timestamp
        const sortedMessages = [...conversation.messages].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        lastMessage = sortedMessages[0];
      }

      return {
        ...conversation,
        lastMessage: lastMessage.message,
        lastMessageTime: lastMessage.timestamp,
      };
    });

    // Sort conversations by last message time
    conversations.sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    // Create conversation items for each conversation
    conversations.forEach((conversation, index) => {
      // Create DOM element for each conversation
      createConversationElement(conversation, index === 0);
    });

    // Select first conversation by default
    if (conversations.length > 0) {
      activeConversation = conversations[0];
      displayConversation(activeConversation);
    } else {
      // No conversations
      chatHeader.innerHTML = `<div class="chat-contact"><h3>No conversations</h3></div>`;
      chatMessages.innerHTML = `<div class="no-messages">You have no messages yet.</div>`;
    }
  }

  // Create a conversation element in the sidebar
  function createConversationElement(conversation, isActive) {
    const conversationElement = document.createElement("div");
    conversationElement.className = "conversation";
    conversationElement.dataset.conversationId = conversation.id; // Store conversation ID for easy access
    if (isActive) conversationElement.classList.add("active");

    // Format the time
    const messageDate = new Date(conversation.lastMessageTime);
    const formattedTime = messageDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    // Create a placeholder avatar URL
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      conversation.otherUserName
    )}&background=random`;

    conversationElement.innerHTML = `
      <div class="avatar">
        <img src="${avatarUrl}" alt="Avatar">
      </div>
      <div class="conversation-info">
        <h3>${conversation.otherUserName}</h3>
        <p>${conversation.lastMessage}</p>
      </div>
      <div class="conversation-time">
        <span>${formattedTime}</span>
      </div>
    `;

    // Add click event to show this conversation
    conversationElement.addEventListener("click", function () {
      // Remove active class from all conversations
      document.querySelectorAll(".conversation").forEach((convo) => {
        convo.classList.remove("active");
      });

      // Add active class to clicked conversation
      this.classList.add("active");

      // Set active conversation and display messages
      activeConversation = conversation;
      displayConversation(conversation);
    });

    // Add to conversation list
    conversationList.appendChild(conversationElement);
  }

  // Display a conversation in the chat area
  function displayConversation(conversation) {
    // Update chat header
    updateChatHeader(conversation);

    // Display messages
    if (conversation.messages && conversation.messages.length > 0) {
      displayMessages(conversation.messages);
    } else {
      chatMessages.innerHTML = `<div class="no-messages">No messages yet. Start the conversation!</div>`;
    }

    // Enable the chat input
    chatInput.disabled = false;
    chatInput.placeholder = "Type a message...";
    sendButton.classList.remove("disabled");
  }

  // Update chat header with user information
  function updateChatHeader(conversation) {
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      conversation.otherUserName
    )}&background=random`;

    chatHeader.innerHTML = `
      <div class="chat-contact">
        <div class="avatar">
          <img src="${avatarUrl}" alt="Avatar">
        </div>
        <div class="contact-info">
          <h3>${conversation.otherUserName}</h3>
          <p>Online</p>
        </div>
      </div>
    `;
  }

  // Display messages in the chat area
  function displayMessages(messages) {
    // Sort messages by date
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Clear existing messages
    chatMessages.innerHTML = `
      <div class="message-date">
        <span>Today</span>
      </div>
    `;

    // Group messages by date
    const messagesByDate = groupMessagesByDate(sortedMessages);

    // Add each message group to the chat
    Object.entries(messagesByDate).forEach(([date, msgs]) => {
      // Add date separator if not "Today"
      if (date !== "Today") {
        chatMessages.innerHTML += `
          <div class="message-date">
            <span>${date}</span>
          </div>
        `;
      }

      // Add messages
      msgs.forEach((message) => {
        const isReceived = message.sender_id !== currentUserId;
        const messageTime = new Date(message.timestamp).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });

        const messageElement = document.createElement("div");
        messageElement.className = `message ${
          isReceived ? "received" : "sent"
        }`;
        messageElement.innerHTML = `
          <div class="message-content">
            <p>${message.message}</p>
            <span class="message-time">${messageTime}</span>
          </div>
        `;

        chatMessages.appendChild(messageElement);
      });
    });

    // Scroll to the bottom of the chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Group messages by date (Today, Yesterday, or specific date)
  function groupMessagesByDate(messages) {
    const groups = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp);
      let dateKey;

      if (isSameDay(messageDate, today)) {
        dateKey = "Today";
      } else if (isSameDay(messageDate, yesterday)) {
        dateKey = "Yesterday";
      } else {
        dateKey = messageDate.toLocaleDateString();
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(message);
    });

    return groups;
  }

  // Check if two dates represent the same day
  function isSameDay(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  // Handle sending new messages
  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  async function sendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText === "" || !activeConversation) return;

    // Clear input
    chatInput.value = "";

    // Get current time
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    // Check if this is the first message (if there's a "no-messages" div)
    const noMessagesDiv = chatMessages.querySelector(".no-messages");
    if (noMessagesDiv) {
      // Clear the chat area completely if this is the first message
      chatMessages.innerHTML = `
        <div class="message-date">
          <span>Today</span>
        </div>
      `;
    }

    // Create message element and add to chat
    const messageElement = document.createElement("div");
    messageElement.className = "message sent";
    messageElement.innerHTML = `
      <div class="message-content">
        <p>${messageText}</p>
        <span class="message-time">${formattedTime}</span>
      </div>
    `;

    chatMessages.appendChild(messageElement);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      // Send message to API
      const response = await fetch(`${window.CONFIG.API_URL}/api/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: currentUserId,
          receiver_id: activeConversation.otherUserId,
          content: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const responseData = await response.json();

      if (responseData.conversation && responseData.newMessage) {
        // Update active conversation with new data
        const updatedConversation = responseData.conversation;

        // Find and update the conversation in our list
        const index = conversations.findIndex(
          (c) => c.id === updatedConversation.id
        );

        if (index >= 0) {
          // Update the conversation in our array
          conversations[index] = {
            ...updatedConversation,
            otherUserName: activeConversation.otherUserName,
            otherUserId: activeConversation.otherUserId,
            lastMessage: messageText,
            lastMessageTime: responseData.newMessage.timestamp,
          };

          // Set the active conversation to the updated one
          activeConversation = conversations[index];
        } else {
          // New conversation created
          const newConversation = {
            ...updatedConversation,
            otherUserName: activeConversation.otherUserName,
            otherUserId: activeConversation.otherUserId,
            lastMessage: messageText,
            lastMessageTime: responseData.newMessage.timestamp,
          };

          conversations.push(newConversation);
          activeConversation = newConversation;
        }

        // Update conversation list UI
        updateConversationList();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Show error message
      chatMessages.innerHTML += `
        <div class="message-error">
          <p>Failed to send message. Please try again.</p>
        </div>
      `;
    }
  }

  // Update the conversation list (e.g., after sending a message)
  function updateConversationList() {
    // Resort conversations by last message time
    conversations.sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    // Update UI
    conversationList.innerHTML = "";
    conversations.forEach((conversation, index) => {
      createConversationElement(
        conversation,
        conversation.id === activeConversation.id
      );
    });
  }
});
