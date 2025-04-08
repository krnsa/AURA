// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  const conversationList = document.querySelector(".conversation-list");
  const chatHeader = document.querySelector(".chat-header");
  const chatMessages = document.querySelector(".chat-messages");
  const chatInput = document.querySelector(".chat-input input");
  const sendButton = document.querySelector(".send-btn");

  // Number of random users to fetch
  const numberOfUsers = 15;

  // Fetch random users from the API
  fetch(`https://randomuser.me/api/?results=${numberOfUsers}`)
    .then((response) => response.json())
    .then((data) => {
      // Clear the default conversation
      conversationList.innerHTML = "";

      // Process each user and create conversation items
      data.results.forEach((user, index) => {
        // Generate random last message and time
        const lastMessages = [
          "Hey, how are you doing today?",
          "Can we meet tomorrow?",
          "Did you check the latest project updates?",
          "Thanks for your help yesterday!",
          "What's up?",
          "I'll send you the files soon",
          "Are you free for a call later?",
          "Just sent you an email",
          "Let's catch up soon!",
          "Have you seen the new design?",
        ];

        const randomMessage =
          lastMessages[Math.floor(Math.random() * lastMessages.length)];
        const randomHour = Math.floor(Math.random() * 12) + 1;
        const randomMinute = Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0");
        const amPm = Math.random() > 0.5 ? "AM" : "PM";
        const timeString = `${randomHour}:${randomMinute} ${amPm}`;

        // Create conversation element
        const conversationElement = document.createElement("div");
        conversationElement.className = "conversation";
        if (index === 0) conversationElement.classList.add("active");

        conversationElement.innerHTML = `
          <div class="avatar">
            <img src="${user.picture.medium}" alt="Avatar">
          </div>
          <div class="conversation-info">
            <h3>${user.name.first} ${user.name.last}</h3>
            <p>${randomMessage}</p>
          </div>
          <div class="conversation-time">
            <span>${timeString}</span>
          </div>
        `;

        // Store user data in the element for later use
        conversationElement.dataset.user = JSON.stringify(user);
        conversationElement.dataset.lastMessage = randomMessage;
        conversationElement.dataset.time = timeString;

        // Add click event to show this conversation
        conversationElement.addEventListener("click", function () {
          // Remove active class from all conversations
          document.querySelectorAll(".conversation").forEach((convo) => {
            convo.classList.remove("active");
          });

          // Add active class to clicked conversation
          this.classList.add("active");

          // Get user data
          const userData = JSON.parse(this.dataset.user);
          const lastMsg = this.dataset.lastMessage;
          const msgTime = this.dataset.time;

          // Update chat header
          updateChatHeader(userData);

          // Generate and display random chat messages
          generateRandomChat(userData, lastMsg, msgTime);
        });

        // Add to conversation list
        conversationList.appendChild(conversationElement);

        // Set the first user as default in chat
        if (index === 0) {
          updateChatHeader(user);
          generateRandomChat(user, randomMessage, timeString);
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching random users:", error);
      // Display error in the conversation list
      conversationList.innerHTML = `
        <div class="conversation">
          <div class="conversation-info">
            <h3>Error</h3>
            <p>Failed to load conversations. Please try again later.</p>
          </div>
        </div>
      `;
    });

  // Function to update chat header with user information
  function updateChatHeader(user) {
    chatHeader.innerHTML = `
      <div class="chat-contact">
        <div class="avatar">
          <img src="${user.picture.medium}" alt="Avatar">
        </div>
        <div class="contact-info">
          <h3>${user.name.first} ${user.name.last}</h3>
          <p>Online</p>
        </div>
      </div>
    `;
  }

  // Function to generate random chat messages for a conversation
  function generateRandomChat(user, lastMessage, lastTime) {
    // Clear existing messages
    chatMessages.innerHTML = `
      <div class="message-date">
        <span>Today</span>
      </div>
    `;

    // Create 3-7 random messages
    const messageCount = Math.floor(Math.random() * 5) + 3;
    const messages = [
      "Hi there! How's your day going?",
      "I was wondering if you had time to discuss the project?",
      "Did you get a chance to review the documents I sent?",
      "Looking forward to our meeting next week!",
      "Can you share your thoughts on the latest update?",
      "I've been working on some new ideas I'd like to share.",
      "Have you heard about the upcoming event?",
      "Just checking in to see how you're doing.",
      "Let me know when you're free to chat.",
      "I think we should consider a different approach.",
    ];

    // Start time
    const hourOffset = Math.floor(Math.random() * 2) + 1;
    const baseHour = new Date();
    baseHour.setHours(baseHour.getHours() - hourOffset);

    for (let i = 0; i < messageCount; i++) {
      const isReceived = Math.random() > 0.4;
      const messageText =
        i === messageCount - 1 && isReceived
          ? lastMessage
          : messages[Math.floor(Math.random() * messages.length)];

      // Calculate message time
      const msgTime = new Date(baseHour);
      msgTime.setMinutes(msgTime.getMinutes() + i * 5);
      const formattedTime = msgTime.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

      const messageElement = document.createElement("div");
      messageElement.className = `message ${isReceived ? "received" : "sent"}`;
      messageElement.innerHTML = `
        <div class="message-content">
          <p>${messageText}</p>
          <span class="message-time">${formattedTime}</span>
        </div>
      `;

      chatMessages.appendChild(messageElement);
    }

    // Scroll to the bottom of the chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Handle sending new messages
  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  function sendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText === "") return;

    // Create message element
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    const messageElement = document.createElement("div");
    messageElement.className = "message sent";
    messageElement.innerHTML = `
      <div class="message-content">
        <p>${messageText}</p>
        <span class="message-time">${formattedTime}</span>
      </div>
    `;

    // Add to chat
    chatMessages.appendChild(messageElement);

    // Clear input
    chatInput.value = "";

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate reply after 1-3 seconds
    setTimeout(() => {
      simulateReply();
    }, Math.random() * 2000 + 1000);
  }

  function simulateReply() {
    const replies = [
      "Sure, that sounds good!",
      "I'll get back to you on that.",
      "Interesting point!",
      "Let me check and let you know.",
      "Thanks for the update!",
      "I'm not sure I understand. Can you explain?",
      "That's great news!",
      "Let's discuss this further tomorrow.",
      "I appreciate your help with this.",
      "I'll be available later today if you want to talk.",
    ];

    const replyText = replies[Math.floor(Math.random() * replies.length)];
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    const messageElement = document.createElement("div");
    messageElement.className = "message received";
    messageElement.innerHTML = `
      <div class="message-content">
        <p>${replyText}</p>
        <span class="message-time">${formattedTime}</span>
      </div>
    `;

    // Add to chat
    chatMessages.appendChild(messageElement);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Update the conversation list to show latest message
    const activeConversation = document.querySelector(".conversation.active");
    if (activeConversation) {
      const conversationInfo = activeConversation.querySelector(
        ".conversation-info p"
      );
      conversationInfo.textContent = replyText;

      const conversationTime = activeConversation.querySelector(
        ".conversation-time span"
      );
      conversationTime.textContent = formattedTime;
    }
  }
});
