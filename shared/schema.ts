import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  profileImage: text("profile_image"),
  friendCode: text("friend_code").unique(),
  friends: json("friends").$type<number[]>().default([]),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  profileImage: true,
  friendCode: true,
  friends: true,
});

// Workout schema
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // e.g., "run", "strength", "cycling"
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  distance: integer("distance"), // in meters
  caloriesBurned: integer("calories_burned"),
  completed: boolean("completed").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWorkoutSchema = createInsertSchema(workouts).pick({
  userId: true,
  type: true,
  title: true,
  description: true,
  duration: true,
  distance: true,
  caloriesBurned: true,
  completed: true,
});

// Activity schema (daily stats)
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  steps: integer("steps").notNull().default(0),
  caloriesBurned: integer("calories_burned").notNull().default(0),
  activeMinutes: integer("active_minutes").notNull().default(0),
  workoutsCompleted: integer("workouts_completed").notNull().default(0),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  date: true,
  steps: true,
  caloriesBurned: true,
  activeMinutes: true,
  workoutsCompleted: true,
});

// Challenge schema
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  goal: json("goal").notNull(), // e.g., { type: "distance", amount: 5000 }
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChallengeSchema = createInsertSchema(challenges).pick({
  title: true,
  description: true,
  imageUrl: true,
  startDate: true,
  endDate: true,
  goal: true,
});

// Challenge Participants schema
export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  userId: integer("user_id").notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  progress: integer("progress").notNull().default(0), // percentage of goal completed
  completed: boolean("completed").notNull().default(false),
});

export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants).pick({
  challengeId: true,
  userId: true,
  progress: true,
  completed: true,
});

// Social Activity schema
export const socialActivities = pgTable("social_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // e.g., "workout_completed", "challenge_joined", "achievement_earned"
  content: text("content").notNull(),
  relatedId: integer("related_id"), // e.g., workout id, challenge id
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSocialActivitySchema = createInsertSchema(socialActivities).pick({
  userId: true,
  type: true,
  content: true,
  relatedId: true,
});

// Social Interaction schema (likes, comments)
export const socialInteractions = pgTable("social_interactions", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "like" or "comment"
  content: text("content"), // For comments
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSocialInteractionSchema = createInsertSchema(socialInteractions).pick({
  activityId: true,
  userId: true,
  type: true,
  content: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type InsertChallengeParticipant = z.infer<typeof insertChallengeParticipantSchema>;

export type SocialActivity = typeof socialActivities.$inferSelect;
export type InsertSocialActivity = z.infer<typeof insertSocialActivitySchema>;

export type SocialInteraction = typeof socialInteractions.$inferSelect;
export type InsertSocialInteraction = z.infer<typeof insertSocialInteractionSchema>;

// Friend Request schema
export const friendRequests = pgTable("friend_requests", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "accepted", "rejected"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFriendRequestSchema = createInsertSchema(friendRequests).pick({
  senderId: true,
  receiverId: true,
  status: true,
});

export type FriendRequest = typeof friendRequests.$inferSelect;
export type InsertFriendRequest = z.infer<typeof insertFriendRequestSchema>;

// Private Message schema (for E2E encrypted chat)
export const privateMessages = pgTable("private_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  encryptedContent: text("encrypted_content").notNull(), // E2E encrypted message content
  encryptedKey: text("encrypted_key").notNull(), // Receiver's public key encrypted message key
  iv: text("iv").notNull(), // Initialization vector for encryption
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
});

export const insertPrivateMessageSchema = createInsertSchema(privateMessages).pick({
  senderId: true,
  receiverId: true,
  encryptedContent: true,
  encryptedKey: true,
  iv: true,
  isRead: true,
});

export type PrivateMessage = typeof privateMessages.$inferSelect;
export type InsertPrivateMessage = z.infer<typeof insertPrivateMessageSchema>;
