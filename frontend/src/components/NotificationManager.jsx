import { useEffect, useRef } from "react";
import { getNotifications } from "../utils/preferences";

function sendNotification(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
    });
  }
}

export default function NotificationManager() {
  const timers = useRef([]);

  useEffect(() => {
    const schedule = () => {
      timers.current.forEach(clearInterval);
      timers.current = [];

      const settings = getNotifications();

      // Browser notifications work while the EduGenie tab is open.
      if (settings.studyReminders) {
        timers.current.push(
          setInterval(() => {
            const current = getNotifications();
            if (current.studyReminders) {
              sendNotification(
                "EduGenie Study Reminder",
                "Take a few minutes to review your study material."
              );
            }
          }, 60 * 60 * 1000)
        );
      }

      if (settings.quizReminders) {
        timers.current.push(
          setInterval(() => {
            const current = getNotifications();
            if (current.quizReminders) {
              sendNotification(
                "EduGenie Quiz Reminder",
                "Ready? Test yourself with a quick quiz."
              );
            }
          }, 2 * 60 * 60 * 1000)
        );
      }
    };

    const onSettingsChange = () => schedule();

    schedule();

    window.addEventListener(
      "edugenie-notifications-updated",
      onSettingsChange
    );

    return () => {
      timers.current.forEach(clearInterval);
      window.removeEventListener(
        "edugenie-notifications-updated",
        onSettingsChange
      );
    };
  }, []);

  return null;
}
