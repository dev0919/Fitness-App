// Demo data for the "alex" account (username: alex, password: password123)
import {
  User,
  Workout,
  Activity,
  Challenge,
  ChallengeParticipant,
  SocialActivity,
  SocialInteraction,
  FriendRequest,
  PrivateMessage,
} from "@shared/schema";

// Define demo workouts
export const demoWorkouts: Omit<Workout, "id">[] = [
  {
    userId: 1, // alex
    title: "Morning Run",
    type: "run",
    description: "5K run around the neighborhood",
    duration: 30,
    distance: 5000,
    caloriesBurned: 350,
    createdAt: new Date(Date.now() - 86400000 * 6), // 6 days ago
  },
  {
    userId: 1, // alex
    title: "Upper Body Strength",
    type: "strength",
    description: "Chest, shoulders, and triceps workout",
    duration: 45,
    distance: null,
    caloriesBurned: 420,
    createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
  },
  {
    userId: 1, // alex
    title: "HIIT Session",
    type: "hiit",
    description: "30-minute high-intensity interval training",
    duration: 30,
    distance: null,
    caloriesBurned: 380,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
  },
];

// Define demo activity data
export const demoActivities: Omit<Activity, "id">[] = [
  {
    userId: 1,
    date: new Date(Date.now() - 86400000 * 6), // 6 days ago
    steps: 8500,
    caloriesBurned: 2200,
    workoutsCompleted: 1,
    activeMinutes: 30,
  },
  {
    userId: 1,
    date: new Date(Date.now() - 86400000 * 5), // 5 days ago
    steps: 7200,
    caloriesBurned: 2100,
    workoutsCompleted: 0,
    activeMinutes: 25,
  },
  {
    userId: 1,
    date: new Date(Date.now() - 86400000 * 4), // 4 days ago
    steps: 9400,
    caloriesBurned: 2350,
    workoutsCompleted: 0,
    activeMinutes: 35,
  },
  {
    userId: 1,
    date: new Date(Date.now() - 86400000 * 3), // 3 days ago
    steps: 10200,
    caloriesBurned: 2450,
    workoutsCompleted: 1,
    activeMinutes: 45,
  },
  {
    userId: 1,
    date: new Date(Date.now() - 86400000 * 2), // 2 days ago
    steps: 9100,
    caloriesBurned: 2250,
    workoutsCompleted: 0,
    activeMinutes: 30,
  },
  {
    userId: 1,
    date: new Date(Date.now() - 86400000), // 1 day ago
    steps: 11500,
    caloriesBurned: 2600,
    workoutsCompleted: 1,
    activeMinutes: 60,
  },
  {
    userId: 1,
    date: new Date(), // Today
    steps: 5400,
    caloriesBurned: 1200,
    workoutsCompleted: 0,
    activeMinutes: 20,
  },
];

// Define demo challenge participations
export const demoChallengeParticipations: {challengeId: number, participation: Omit<ChallengeParticipant, "id">}[] = [
  {
    challengeId: 1, // 30-Day Running
    participation: {
      userId: 1,
      challengeId: 1,
      progress: 15,
      completed: false,
      joinedAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
    }
  },
  {
    challengeId: 2, // Weekly Plank
    participation: {
      userId: 1,
      challengeId: 2,
      progress: 42, // 3 days of 7 completed
      completed: false,
      joinedAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
    }
  }
];

// Define demo friends (user IDs other than alex)
export const demoFriends: number[] = [2]; // Sarah (ID 2)

// Define demo social activity feed items
export const demoSocialActivities: Omit<SocialActivity, "id">[] = [
  {
    userId: 2, // Sarah
    type: "workout_completed",
    content: "Just crushed a 10K run! Feeling amazing! 🏃‍♀️",
    relatedId: null,
    imageData: null,
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
  },
  {
    userId: 1, // Alex (own activity)
    type: "challenge_joined",
    content: "I've joined the Weekly Plank Challenge. Who's with me?",
    relatedId: 2, // Weekly Plank challenge ID
    imageData: null,
    createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
  },
  {
    userId: 2, // Sarah
    type: "badge_earned",
    content: "Just earned the 'Early Bird' badge for 5 consecutive morning workouts!",
    relatedId: null,
    imageData: null,
    createdAt: new Date(Date.now() - 86400000 * 4), // 4 days ago
  },
  {
    userId: 1, // Alex (own activity)
    type: "workout_completed",
    content: "Upper body day complete! 💪",
    relatedId: 2, // Refers to the Upper Body Strength workout
    imageData: null,
    createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
  }
];

// Define social interactions (likes, comments)
export const demoSocialInteractions: Omit<SocialInteraction, "id">[] = [
  {
    userId: 1, // Alex
    activityId: 1, // Sarah's 10K run post
    type: "like",
    content: null,
    createdAt: new Date(Date.now() - 86400000 * 2 + 3600000), // 2 days ago + 1 hour
  },
  {
    userId: 2, // Sarah
    activityId: 2, // Alex's challenge joined post
    type: "comment",
    content: "I'm joining too! Let's do this together!",
    createdAt: new Date(Date.now() - 86400000 * 3 + 7200000), // 3 days ago + 2 hours
  },
  {
    userId: 1, // Alex
    activityId: 3, // Sarah's badge earned post
    type: "comment",
    content: "That's awesome! I need to start waking up earlier too.",
    createdAt: new Date(Date.now() - 86400000 * 4 + 5400000), // 4 days ago + 1.5 hours
  }
];

// Private messages between Alex and Sarah
export const demoPrivateMessages: Omit<PrivateMessage, "id">[] = [
  {
    senderId: 2, // Sarah
    receiverId: 1, // Alex
    content: "Hey Alex! Are you joining the 30-day running challenge?",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 6), // 6 days ago
  },
  {
    senderId: 1, // Alex
    receiverId: 2, // Sarah
    content: "Yes, definitely! I've been wanting to improve my running endurance.",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 6 + 1800000), // 6 days ago + 30 min
  },
  {
    senderId: 2, // Sarah
    receiverId: 1, // Alex
    content: "Great! We can keep each other motivated. I'm aiming to run at least 3km every day.",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 6 + 3600000), // 6 days ago + 1 hour
  },
  {
    senderId: 1, // Alex
    receiverId: 2, // Sarah
    content: "That sounds like a good goal. I'll start with 2km and try to increase throughout the challenge.",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 6 + 5400000), // 6 days ago + 1.5 hours
  },
  {
    senderId: 2, // Sarah
    receiverId: 1, // Alex
    content: "How's the running challenge going? I completed day 3 yesterday!",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
  },
  {
    senderId: 1, // Alex
    receiverId: 2, // Sarah
    content: "It's going well! I've managed to run every day so far, though yesterday was tough after my strength workout.",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 3 + 1800000), // 3 days ago + 30 min
  },
  {
    senderId: 2, // Sarah
    receiverId: 1, // Alex
    content: "That's impressive! Make sure you're taking care of recovery too.",
    isRead: false, // Unread message
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
  }
];