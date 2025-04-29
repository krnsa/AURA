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

  const token = localStorage.getItem("token");

  let currentUserId = null;

  let conversations = [];

  let activeConversation = null;

  fetchConversations();

  function showUserSearch() {
    startConversationBtn.style.opacity = "0";
    startConversationBtn.style.visibility = "hidden";

    userSearchContainer.style.display = "block";

    document.getElementById("search-results").innerHTML = "";

    document.getElementById("user-search").value = "";

    setTimeout(() => {
      userSearchContainer.style.opacity = "1";
      userSearchContainer.style.transform = "translateY(0)";

      document.getElementById("user-search").focus();
    }, 50);
  }

  function hideUserSearch() {
    userSearchContainer.style.opacity = "0";
    userSearchContainer.style.transform = "translateY(-10px)";

    setTimeout(() => {
      userSearchContainer.style.display = "none";
      startConversationBtn.style.opacity = "1";
      startConversationBtn.style.visibility = "visible";
    }, 300);
  }

  async function searchUsers(query) {
    try {
      const url = new URL(`${window.CONFIG.API_URL}/api/searchUsers`);
      url.searchParams.set("searchQuery", query);
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  function displaySearchResults(users) {
    const searchResults = document.getElementById("search-results");

    if (users.length === 0) {
      searchResults.innerHTML = `<div class="no-results">No users found</div>`;
      return;
    }

    searchResults.innerHTML = "";

    users.forEach((user) => {
      console.log(user);
      const resultItem = document.createElement("div");
      resultItem.className = "search-result-item";

      const avatarUrl = `https:
        user.username
      )}&background=random`;

      resultItem.innerHTML = `
      <div class="avatar">
      <img src="${user.avatar_url}" alt="${user.username}" />
      </div>
      <h4>${user.username}</h4>
    `;

      resultItem.addEventListener("click", function () {
        startConversationWithUser(user);
        hideUserSearch();
      });

      searchResults.appendChild(resultItem);
    });
  }

  function startConversationWithUser(user) {
    const existingConversation = conversations.find(
      (conv) => conv.otherUserId === user.id
    );

    if (existingConversation) {
      activeConversation = existingConversation;

      document.querySelectorAll(".conversation").forEach((convo) => {
        convo.classList.remove("active");
      });

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

      displayConversation(existingConversation);

      startPolling();
    } else {
      const newConversation = {
        id: `temp_${Date.now()}`,
        otherUserId: user.id,
        otherUserName: user.username,
        avatar_url: user.avatar_url,
        messages: [],
        lastMessage: "No messages yet",
        lastMessageTime: new Date().toISOString(),
        isNewConversation: true,
      };

      activeConversation = newConversation;

      displayConversation(newConversation);

      if (pollInterval) {
        clearInterval(pollInterval);
      }
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

  async function fetchConversations() {
    try {
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

      const prevActiveId = activeConversation?.id ?? null;
      currentUserId = data.currentUserId;
      processConversations(data.conversations, prevActiveId);
    } catch (error) {
      console.error("Error fetching conversations:", error);

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

  function processConversations(conversationsData, preservedActiveId) {
    conversationList.innerHTML = "";

    conversations = conversationsData.map((conversation) => {
      let lastMessage = {
        message: "No messages yet",
        timestamp: conversation.created_at,
      };

      if (conversation.messages && conversation.messages.length > 0) {
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

    conversations.sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    conversations.forEach((conversation, index) => {
      const isActive = preservedActiveId
        ? conversation.id === preservedActiveId
        : index === 0;
      createConversationElement(conversation, isActive);
    });

    if (conversations.length === 0) {
      chatHeader.innerHTML = `<div class="chat-contact"><h3>No conversations</h3></div>`;
      chatMessages.innerHTML = `<div class="no-messages">You have no messages yet.</div>`;
      return;
    }

    const stillThere = conversations.find((c) => c.id === preservedActiveId);
    if (stillThere) {
      activeConversation = stillThere;
    } else {
      activeConversation = conversations[0];

      document
        .querySelector(`[data-conversation-id="${activeConversation.id}"]`)
        .classList.add("active");
    }

    displayConversation(activeConversation);
    const stored = localStorage.getItem("redirectToMessageUser");
    if (stored) {
      const { id, username } = JSON.parse(stored);
      localStorage.removeItem("redirectToMessageUser");
      startConversationWithUser({ id, username });
    }
  }

  function createConversationElement(conversation, isActive) {
    const conversationElement = document.createElement("div");
    conversationElement.className = "conversation";
    conversationElement.dataset.conversationId = conversation.id;
    if (isActive) conversationElement.classList.add("active");

    const messageDate = new Date(conversation.lastMessageTime);
    const formattedTime = messageDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    const avatarUrl = `https:
      conversation.otherUserName
    )}&background=random`;

    conversationElement.innerHTML = `
      <div class="avatar">
        <img src="${conversation.avatar_url}" alt="${conversation.otherUserName}" />
      </div>
      <div class="conversation-info">
        <h3>${conversation.otherUserName}</h3>
        <p>${conversation.lastMessage}</p>
      </div>
      <div class="conversation-time">
        <span>${formattedTime}</span>
      </div>
    `;

    conversationElement.addEventListener("click", function () {
      document.querySelectorAll(".conversation").forEach((convo) => {
        convo.classList.remove("active");
      });

      this.classList.add("active");

      activeConversation = conversation;
      displayConversation(conversation);
    });

    conversationList.appendChild(conversationElement);
  }

  function updateActiveConversationItem() {
    const id = activeConversation.id.toString();
    const item = document.querySelector(
      `.conversation-list .conversation[data-conversation-id="${id}"]`
    );
    if (!item) return;

    const infoP = item.querySelector(".conversation-info p");
    infoP.textContent = activeConversation.lastMessage;

    const timeSpan = item.querySelector(".conversation-time span");
    const ts = new Date(activeConversation.lastMessageTime);
    timeSpan.textContent = ts.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    conversationList.prepend(item);
  }

  function displayConversation(conversation) {
    updateChatHeader(conversation);

    if (conversation.messages && conversation.messages.length > 0) {
      displayMessages(conversation.messages);
    } else {
      chatMessages.innerHTML = `<div class="no-messages">No messages yet. Start the conversation!</div>`;
    }

    chatInput.disabled = false;
    chatInput.placeholder = "Type a message...";
    sendButton.classList.remove("disabled");
  }

  function updateChatHeader(conversation) {
    const avatarUrl = `https:
      conversation.otherUserName
    )}&background=random`;

    chatHeader.innerHTML = `
      <div class="chat-contact">
        <div class="avatar">
        <img src="${conversation.avatar_url}" alt="${conversation.otherUserName}" />
        </div>
        <div class="contact-info">
          <h3>${conversation.otherUserName}</h3>
        </div>
      </div>
    `;
  }

  function displayMessages(messages) {
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    chatMessages.innerHTML = `
      <div class="message-date">
        <span>Today</span>
      </div>
    `;

    const messagesByDate = groupMessagesByDate(sortedMessages);

    Object.entries(messagesByDate).forEach(([date, msgs]) => {
      if (date !== "Today") {
        chatMessages.innerHTML += `
          <div class="message-date">
            <span>${date}</span>
          </div>
        `;
      }

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

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

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

  function isSameDay(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  async function sendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText === "" || !activeConversation) return;

    chatInput.value = "";

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    const noMessagesDiv = chatMessages.querySelector(".no-messages");
    if (noMessagesDiv) {
      chatMessages.innerHTML = `
        <div class="message-date">
          <span>Today</span>
        </div>
      `;
    }

    const messageElement = document.createElement("div");
    messageElement.className = "message sent";
    messageElement.innerHTML = `
      <div class="message-content">
        <p>${messageText}</p>
        <span class="message-time">${formattedTime}</span>
      </div>
    `;

    chatMessages.appendChild(messageElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
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
        const updatedConversation = responseData.conversation;

        const index = conversations.findIndex(
          (c) => c.id === updatedConversation.id
        );

        if (index >= 0) {
          conversations[index] = {
            ...updatedConversation,
            otherUserName: activeConversation.otherUserName,
            otherUserId: activeConversation.otherUserId,
            lastMessage: messageText,
            lastMessageTime: responseData.newMessage.timestamp,
          };

          activeConversation = conversations[index];
        } else {
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

        updateActiveConversationItem();

        startPolling();
      }
    } catch (error) {
      console.error("Error sending message:", error);

      chatMessages.innerHTML += `
        <div class="message-error">
          <p>Failed to send message. Please try again.</p>
        </div>
      `;
    }
  }

  let pollInterval = null;

  function startPolling() {
    if (pollInterval) clearInterval(pollInterval);

    pollInterval = setInterval(fetchConversations, 1000);
  }

  startPolling();
});
