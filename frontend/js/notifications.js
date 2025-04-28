import { getAvatarHTML } from "./components/avatarHelper.js";

document.addEventListener("DOMContentLoaded", function () {
  const conversationList = document.querySelector(".conversation-list");
  const chatMessages = document.querySelector(".chat-messages");
  const chatInput = document.querySelector(".chat-input input");
  const sendButton = document.querySelector(".send-btn");

  const startConversationBtn = document.getElementById("start-conversation-btn");
  const userSearchContainer = document.getElementById("user-search-container");
  const closeSearchBtn = document.querySelector(".close-search-btn");

  const token = localStorage.getItem("token");
  let conversations = [];
  let activeConversation = null;

  const notificationsList = document.querySelector(".notifications-list");

  fetchConversations();
  fetchNotifications();

  function showUserSearch() {
    startConversationBtn.style.opacity = "0";
    userSearchContainer.style.display = "block";
    document.getElementById("user-search").value = "";
  }

  function hideUserSearch() {
    userSearchContainer.style.display = "none";
    startConversationBtn.style.opacity = "1";
  }

  async function searchUsers(query) {
    try {
      const response = await fetch(`${window.CONFIG.API_URL}/api/searchUsers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ searchQuery: query }),
      });
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
      searchResults.innerHTML = "<div class='no-results'>No users found</div>";
      return;
    }

    searchResults.innerHTML = users.map(user => `
      <div class="search-result-item" onclick="startConversationWithUser(${user.id})">
        <div class="avatar">${getAvatarHTML(user.username)}</div>
        <h4>${user.username}</h4>
      </div>
    `).join('');
  }

  async function fetchConversations() {
    try {
      const response = await fetch(`${window.CONFIG.API_URL}/api/messages`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      conversations = data.conversations;
      conversations.forEach(conversation => createConversationElement(conversation));
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }

  function createConversationElement(conversation) {
    const conversationElement = document.createElement("div");
    conversationElement.className = "conversation";
    conversationElement.dataset.conversationId = conversation.id;
    conversationElement.innerHTML = `
      <div class="avatar">${getAvatarHTML(conversation.otherUserName)}</div>
      <div class="conversation-info">
        <h3>${conversation.otherUserName}</h3>
        <p>${conversation.lastMessage}</p>
      </div>
    `;

    conversationElement.addEventListener("click", () => {
      activeConversation = conversation;
      displayConversation(conversation);
    });

    conversationList.appendChild(conversationElement);
  }

  function displayConversation(conversation) {
    chatMessages.innerHTML = conversation.messages.map(message => `
      <div class="message ${message.sender_id !== activeConversation.otherUserId ? 'sent' : 'received'}">
        <p>${message.content}</p>
      </div>
    `).join('');
  }

  async function sendMessage() {
    const messageText = chatInput.value.trim();
    if (!messageText || !activeConversation) return;

    chatInput.value = "";
    const message = { sender_id: activeConversation.otherUserId, content: messageText };

    chatMessages.innerHTML += `
      <div class="message sent">
        <p>${messageText}</p>
      </div>
    `;
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      await fetch(`${window.CONFIG.API_URL}/api/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiver_id: activeConversation.otherUserId, content: messageText }),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

  startConversationBtn.addEventListener("click", showUserSearch);
  closeSearchBtn.addEventListener("click", hideUserSearch);

  async function fetchNotifications() {
    try {
      const response = await fetch(`${window.CONFIG.API_URL}/api/notifications`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      const data = await response.json();
      displayNotifications(data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  function displayNotifications(notifications) {
    notificationsList.innerHTML = notifications.map(notification => `
      <div class="notification ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
        <div class="notification-avatar">
          ${getNotificationIcon(notification.type)}
        </div>
        <div class="notification-content">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-message">${notification.message}</div>
        </div>
        <div class="notification-time">${formatTimeAgo(notification.created_at)}</div>
      </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.notification').forEach(notif => {
      notif.addEventListener('click', () => markAsRead(notif.dataset.id));
    });
  }

  function getNotificationIcon(type) {
    const icons = {
      like: '❤️',
      comment: '💬',
      follow: '👤',
      message: '✉️',
      system: '🔔'
    };
    return icons[type] || '🔔';
  }

  async function markAsRead(notificationId) {
    try {
      await fetch(`${window.CONFIG.API_URL}/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const notification = document.querySelector(`[data-id="${notificationId}"]`);
      if (notification) {
        notification.classList.remove('unread');
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  function formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
  }
});
