import ActivityLog from "../models/activityLogSchema.js";

export const logActivity = async (userId, action, details, targetId = null) => {
  try {
    await ActivityLog.create({ user: userId, action, details, targetId });
  } catch (e) {
    console.error("Log error:", e.message);
  }
};
