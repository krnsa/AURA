// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  const conversationList = document.querySelector(".conversation-list");
  const chatHeader = document.querySelector(".chat-header");
  const chatMessages = document.querySelector(".chat-messages");
  const chatInput = document.querySelector(".chat-input input");
  const sendButton = document.querySelector(".send-btn");

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

      console.log("response: " + response);

      const data = await response.json();

      // Store current user ID from the response
      currentUserId = data.currentUserId;

      // Process messages to create conversation list
      processMessages(data.messages);
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

  // Process messages from API to create conversation list
  function processMessages(messageData) {
    // Clear the conversation list
    conversationList.innerHTML = "";

    // Group messages by conversation (other user)
    const conversationsMap = new Map();

    messageData.forEach((message) => {
      const otherUserId =
        message.sender_id === currentUserId
          ? message.receiver_id
          : message.sender_id;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          messages: [],
          lastMessage: null,
          lastMessageTime: null,
          userName: message.otherUserName, // Default name, should be replaced with actual user data
        });
      }

      const conversation = conversationsMap.get(otherUserId);
      conversation.messages.push(message);

      // Update last message if this one is newer
      if (
        !conversation.lastMessageTime ||
        new Date(message.created_at) > new Date(conversation.lastMessageTime)
      ) {
        conversation.lastMessage = message.content;
        conversation.lastMessageTime = message.created_at;
      }
    });

    // Convert map to array and sort by last message time
    conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    // Create conversation items for each user
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
    if (isActive) conversationElement.classList.add("active");

    // Format the time
    const messageDate = new Date(conversation.lastMessageTime);
    const formattedTime = messageDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    // Create a placeholder avatar URL
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      conversation.userName
    )}&background=random`;

    conversationElement.innerHTML = `
      <div class="avatar">
        <img src="${avatarUrl}" alt="Avatar">
      </div>
      <div class="conversation-info">
        <h3>${conversation.userName}</h3>
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
    displayMessages(conversation.messages);
  }

  // Update chat header with user information
  function updateChatHeader(conversation) {
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      conversation.userName
    )}&background=random`;

    chatHeader.innerHTML = `
      <div class="chat-contact">
        <div class="avatar">
          <img src="${avatarUrl}" alt="Avatar">
        </div>
        <div class="contact-info">
          <h3>${conversation.userName}</h3>
          <p>Online</p>
        </div>
      </div>
    `;
  }

  // Display messages in the chat area
  // In messages.js, modify the displayMessages function
  function displayMessages(messages) {
    // Sort messages by date
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
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

      // Add messages, but filter to only show messages that belong to this conversation
      msgs.forEach((message) => {
        const isReceived = message.sender_id !== currentUserId;
        const messageTime = new Date(message.created_at).toLocaleTimeString(
          [],
          {
            hour: "numeric",
            minute: "2-digit",
          }
        );

        const messageElement = document.createElement("div");
        messageElement.className = `message ${
          isReceived ? "received" : "sent"
        }`;
        messageElement.innerHTML = `
        <div class="message-content">
          <p>${message.content}</p>
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
      const messageDate = new Date(message.created_at);
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

    // Get current time
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

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

    // Clear input
    chatInput.value = "";

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
          receiver_id: activeConversation.userId,
          content: messageText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Add message to conversation data
      const messageData = await response.json();
      if (messageData) {
        // Add to active conversation
        activeConversation.messages.push(messageData);
        activeConversation.lastMessage = messageText;
        activeConversation.lastMessageTime = now.toISOString();

        // Update conversation list
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
        conversation === activeConversation
      );
    });
  }
});
