export const DEFAULT_PREFERENCES = {
  difficulty: "Intermediate",
  language: "English",
};

export const DEFAULT_NOTIFICATIONS = {
  studyReminders: true,
  quizReminders: true,
  aiRecommendations: true,
};

export function getPreferences() {
  try {
    return {
      ...DEFAULT_PREFERENCES,
      ...(JSON.parse(
        localStorage.getItem("edugenie_preferences") || "{}"
      )),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function getNotifications() {
  try {
    return {
      ...DEFAULT_NOTIFICATIONS,
      ...(JSON.parse(
        localStorage.getItem("edugenie_notifications") || "{}"
      )),
    };
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function savePreferences(value) {
  localStorage.setItem(
    "edugenie_preferences",
    JSON.stringify(value)
  );

  window.dispatchEvent(
    new Event("edugenie-preferences-updated")
  );
}

export function saveNotifications(value) {
  localStorage.setItem(
    "edugenie_notifications",
    JSON.stringify(value)
  );

  window.dispatchEvent(
    new Event("edugenie-notifications-updated")
  );
}