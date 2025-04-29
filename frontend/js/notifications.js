function updateNotificationCount() {
  const unreadCount = document.querySelectorAll(
    ".notificationCard.unread"
  ).length;
  const countElement = document.getElementById("num-of-notif");
  countElement.textContent = unreadCount;
}

document.addEventListener("DOMContentLoaded", () => {
  // Handle the "Mark all as read" button click
  const markAllReadButton = document.getElementById("mark-as-read");
  markAllReadButton.addEventListener("click", () => {
    const unreadNotifications = document.querySelectorAll(
      ".notificationCard.unread"
    );
    unreadNotifications.forEach((notification) => {
      notification.classList.remove("unread");
    });
    updateNotificationCount();
  });

  // Handle individual notification clicks
  const notifications = document.querySelectorAll(".notificationCard");
  notifications.forEach((notification) => {
    notification.addEventListener("click", () => {
      if (notification.classList.contains("unread")) {
        notification.classList.remove("unread");
        updateNotificationCount();
      }
    });
  });

  // Initial count update
  updateNotificationCount();
});
