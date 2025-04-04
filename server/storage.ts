import {
  users, 
  User, 
  InsertUser,
  workouts,
  Workout,
  InsertWorkout,
  activities,
  Activity,
  InsertActivity,
  challenges,
  Challenge,
  InsertChallenge,
  challengeParticipants,
  ChallengeParticipant,
  InsertChallengeParticipant,
  socialActivities,
  SocialActivity,
  InsertSocialActivity,
  socialInteractions,
  SocialInteraction,
  InsertSocialInteraction,
  friendRequests,
  FriendRequest,
  InsertFriendRequest,
  privateMessages,
  PrivateMessage,
  InsertPrivateMessage
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFriendCode(friendCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  addFriend(userId: number, friendId: number): Promise<User | undefined>;
  removeFriend(userId: number, friendId: number): Promise<User | undefined>;
  getFriends(userId: number): Promise<User[]>;
  
  // Friend Request methods
  createFriendRequest(request: InsertFriendRequest): Promise<FriendRequest>;
  getFriendRequest(id: number): Promise<FriendRequest | undefined>;
  getPendingFriendRequests(userId: number): Promise<FriendRequest[]>;
  updateFriendRequestStatus(id: number, status: string): Promise<FriendRequest | undefined>;
  getFriendRequestBySenderAndReceiver(senderId: number, receiverId: number): Promise<FriendRequest | undefined>;
  
  // Private Message methods
  createPrivateMessage(message: InsertPrivateMessage): Promise<PrivateMessage>;
  getPrivateMessage(id: number): Promise<PrivateMessage | undefined>;
  getConversation(userId1: number, userId2: number, limit?: number): Promise<PrivateMessage[]>;
  markMessageAsRead(id: number): Promise<PrivateMessage | undefined>;
  getUnreadMessageCount(userId: number): Promise<number>;
  
  // Workout methods
  getWorkout(id: number): Promise<Workout | undefined>;
  getWorkoutsByUserId(userId: number): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, workout: Partial<InsertWorkout>): Promise<Workout | undefined>;
  deleteWorkout(id: number): Promise<boolean>;
  
  // Activity methods
  getActivity(id: number): Promise<Activity | undefined>;
  getActivityByUserAndDate(userId: number, date: Date): Promise<Activity | undefined>;
  getActivitiesByUserId(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  
  // Challenge methods
  getChallenge(id: number): Promise<Challenge | undefined>;
  getAllChallenges(): Promise<Challenge[]>;
  getUpcomingChallenges(): Promise<Challenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  
  // Challenge Participants methods
  getChallengeParticipant(challengeId: number, userId: number): Promise<ChallengeParticipant | undefined>;
  getChallengeParticipants(challengeId: number): Promise<ChallengeParticipant[]>;
  getUserChallenges(userId: number): Promise<{ challenge: Challenge, participant: ChallengeParticipant }[]>;
  joinChallenge(participant: InsertChallengeParticipant): Promise<ChallengeParticipant>;
  updateChallengeProgress(id: number, progress: number, completed?: boolean): Promise<ChallengeParticipant | undefined>;
  
  // Social Activity methods
  getSocialActivity(id: number): Promise<SocialActivity | undefined>;
  getSocialActivitiesByUserId(userId: number): Promise<SocialActivity[]>;
  getFriendActivities(userIds: number[], limit?: number): Promise<SocialActivity[]>;
  createSocialActivity(activity: InsertSocialActivity): Promise<SocialActivity>;
  
  // Social Interaction methods
  getSocialInteraction(id: number): Promise<SocialInteraction | undefined>;
  getSocialInteractionsByActivityId(activityId: number): Promise<SocialInteraction[]>;
  createSocialInteraction(interaction: InsertSocialInteraction): Promise<SocialInteraction>;
  deleteSocialInteraction(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workouts: Map<number, Workout>;
  private activities: Map<number, Activity>;
  private challenges: Map<number, Challenge>;
  private challengeParticipants: Map<number, ChallengeParticipant>;
  private socialActivities: Map<number, SocialActivity>;
  private socialInteractions: Map<number, SocialInteraction>;
  private friendRequests: Map<number, FriendRequest>;
  private privateMessages: Map<number, PrivateMessage>;
  private userIdCounter: number;
  private workoutIdCounter: number;
  private activityIdCounter: number;
  private challengeIdCounter: number;
  private challengeParticipantIdCounter: number;
  private socialActivityIdCounter: number;
  private socialInteractionIdCounter: number;
  private friendRequestIdCounter: number;
  private privateMessageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.workouts = new Map();
    this.activities = new Map();
    this.challenges = new Map();
    this.challengeParticipants = new Map();
    this.socialActivities = new Map();
    this.socialInteractions = new Map();
    this.friendRequests = new Map();
    this.privateMessages = new Map();
    this.userIdCounter = 1;
    this.workoutIdCounter = 1;
    this.activityIdCounter = 1;
    this.challengeIdCounter = 1;
    this.challengeParticipantIdCounter = 1;
    this.socialActivityIdCounter = 1;
    this.socialInteractionIdCounter = 1;
    this.friendRequestIdCounter = 1;
    this.privateMessageIdCounter = 1;
    
    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Create first sample user
    const user1: InsertUser = {
      username: 'alex',
      email: 'alex@example.com',
      password: 'password123', // In a real app, this would be hashed
      firstName: 'Alex',
      lastName: 'Johnson',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80',
      friendCode: 'ALEX1234',
      friends: []
    };
    const alex = this.createUser(user1);
    
    // Create second sample user
    const user2: InsertUser = {
      username: 'sarah',
      email: 'sarah@example.com',
      password: 'password123',
      firstName: 'Sarah',
      lastName: 'Williams',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80',
      friendCode: 'SARAH123',
      friends: []
    };
    this.createUser(user2);
    
    // Add challenges
    const now = new Date();
    const twoDaysLater = new Date(now);
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const fiveDaysLater = new Date(now);
    fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);
    const thirtyDaysLater = new Date(now);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const fourteenDaysLater = new Date(now);
    fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    this.createChallenge({
      title: '30-Day Running',
      description: 'Run at least 2km every day for 30 days and earn badges!',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=640',
      startDate: twoDaysLater,
      endDate: thirtyDaysLater,
      goal: { type: 'distance', amount: 60000 }
    });
    
    this.createChallenge({
      title: 'Weekly Plank',
      description: 'Increase your plank time each day for one week!',
      imageUrl: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=640',
      startDate: tomorrow,
      endDate: sevenDaysLater,
      goal: { type: 'duration', amount: 300 }
    });
    
    this.createChallenge({
      title: '10K Steps',
      description: 'Achieve 10,000 steps every day for two weeks straight!',
      imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=640',
      startDate: fiveDaysLater,
      endDate: fourteenDaysLater,
      goal: { type: 'steps', amount: 140000 }
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getUserByFriendCode(friendCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.friendCode === friendCode
    );
  }

  // Generate a unique friend code
  private generateFriendCode(): string {
    // Generate a random 8-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;
    
    // Keep generating until we find a unique code
    while (!isUnique) {
      code = '';
      for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      // Check if this code is already used by another user
      const existingUser = Array.from(this.users.values()).find(
        (user) => user.friendCode === code
      );
      
      if (!existingUser) {
        isUnique = true;
      }
    }
    
    return code;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // Generate a unique friend code if not provided
    const friendCode = user.friendCode || this.generateFriendCode();
    // Initialize empty friends array if not provided
    const friends: number[] = Array.isArray(user.friends) ? user.friends : [];
    
    // Create a fresh user object to avoid TypeScript errors
    const newUser: User = {
      id,
      username: user.username,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName || null,
      profileImage: user.profileImage || null,
      friendCode,
      friends
    };
    
    this.users.set(id, newUser);
    return newUser;
  }
  
  async getFriends(userId: number): Promise<User[]> {
    const user = await this.getUser(userId);
    if (!user || !user.friends) return [];
    
    // Get all friends by their IDs
    const friends: User[] = [];
    for (const friendId of user.friends) {
      const friend = await this.getUser(friendId);
      if (friend) {
        // Don't include password in returned friends
        const { password, ...friendData } = friend;
        friends.push(friend);
      }
    }
    
    return friends;
  }
  
  async addFriend(userId: number, friendId: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    const friend = await this.getUser(friendId);
    
    if (!user || !friend) return undefined;
    
    // Add friendId to user's friends list if not already there
    if (!user.friends) {
      user.friends = [];
    }
    
    if (!user.friends.includes(friendId)) {
      // Add friend to user's friend list
      user.friends.push(friendId);
      this.users.set(userId, user);
      
      // Add user to friend's friend list (make bidirectional)
      if (!friend.friends) {
        friend.friends = [];
      }
      if (!friend.friends.includes(userId)) {
        friend.friends.push(userId);
        this.users.set(friendId, friend);
      }
      
      // Create a social activity for adding a friend
      await this.createSocialActivity({
        userId,
        type: 'friend_added',
        content: `added ${friend.firstName} ${friend.lastName || ''} as a friend`,
        relatedId: friendId
      });
    }
    
    return user;
  }
  
  async removeFriend(userId: number, friendId: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    const friend = await this.getUser(friendId);
    
    if (!user || !user.friends) return undefined;
    
    // Remove friendId from user's friends list
    user.friends = user.friends.filter(id => id !== friendId);
    this.users.set(userId, user);
    
    // Also remove userId from friend's friends list (make bidirectional)
    if (friend && friend.friends) {
      friend.friends = friend.friends.filter(id => id !== userId);
      this.users.set(friendId, friend);
    }
    
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    // Handle friends array specifically to avoid type issues
    let friends = existingUser.friends;
    if (userData.friends !== undefined) {
      friends = Array.isArray(userData.friends) ? userData.friends : [];
    }
    
    // Create a properly typed updated user object
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      friends,
      // Ensure these fields are of the correct type
      lastName: userData.lastName !== undefined ? userData.lastName : existingUser.lastName,
      profileImage: userData.profileImage !== undefined ? userData.profileImage : existingUser.profileImage,
      friendCode: userData.friendCode !== undefined ? userData.friendCode : existingUser.friendCode
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Workout methods
  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async getWorkoutsByUserId(userId: number): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const id = this.workoutIdCounter++;
    const createdAt = new Date();
    const newWorkout: Workout = { ...workout, id, createdAt };
    this.workouts.set(id, newWorkout);
    
    // Update user's activity for the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let activity = await this.getActivityByUserAndDate(workout.userId, today);
    
    if (activity) {
      await this.updateActivity(activity.id, { 
        workoutsCompleted: activity.workoutsCompleted + 1,
        caloriesBurned: activity.caloriesBurned + (workout.caloriesBurned || 0)
      });
    } else {
      await this.createActivity({
        userId: workout.userId,
        date: today,
        steps: 0,
        caloriesBurned: workout.caloriesBurned || 0,
        activeMinutes: workout.duration,
        workoutsCompleted: 1
      });
    }
    
    // Create social activity
    await this.createSocialActivity({
      userId: workout.userId,
      type: 'workout_completed',
      content: `completed a ${workout.title} workout`,
      relatedId: id
    });
    
    return newWorkout;
  }

  async updateWorkout(id: number, workoutData: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const existingWorkout = await this.getWorkout(id);
    if (!existingWorkout) return undefined;
    
    const updatedWorkout = { ...existingWorkout, ...workoutData };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  async deleteWorkout(id: number): Promise<boolean> {
    return this.workouts.delete(id);
  }

  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getActivityByUserAndDate(userId: number, date: Date): Promise<Activity | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.activities.values()).find(
      activity => 
        activity.userId === userId && 
        new Date(activity.date) >= startOfDay &&
        new Date(activity.date) <= endOfDay
    );
  }

  async getActivitiesByUserId(userId: number, limit: number = 7): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const newActivity: Activity = { ...activity, id };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async updateActivity(id: number, activityData: Partial<InsertActivity>): Promise<Activity | undefined> {
    const existingActivity = await this.getActivity(id);
    if (!existingActivity) return undefined;
    
    const updatedActivity = { ...existingActivity, ...activityData };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  // Challenge methods
  async getChallenge(id: number): Promise<Challenge | undefined> {
    return this.challenges.get(id);
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  async getUpcomingChallenges(): Promise<Challenge[]> {
    const now = new Date();
    return Array.from(this.challenges.values())
      .filter(challenge => new Date(challenge.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const id = this.challengeIdCounter++;
    const createdAt = new Date();
    const newChallenge: Challenge = { ...challenge, id, createdAt };
    this.challenges.set(id, newChallenge);
    return newChallenge;
  }

  // Challenge Participants methods
  async getChallengeParticipant(challengeId: number, userId: number): Promise<ChallengeParticipant | undefined> {
    return Array.from(this.challengeParticipants.values()).find(
      participant => participant.challengeId === challengeId && participant.userId === userId
    );
  }

  async getChallengeParticipants(challengeId: number): Promise<ChallengeParticipant[]> {
    return Array.from(this.challengeParticipants.values())
      .filter(participant => participant.challengeId === challengeId);
  }

  async getUserChallenges(userId: number): Promise<{ challenge: Challenge, participant: ChallengeParticipant }[]> {
    const userParticipations = Array.from(this.challengeParticipants.values())
      .filter(participant => participant.userId === userId);
    
    const result = [];
    for (const participant of userParticipations) {
      const challenge = await this.getChallenge(participant.challengeId);
      if (challenge) {
        result.push({ challenge, participant });
      }
    }
    
    return result;
  }

  async joinChallenge(participant: InsertChallengeParticipant): Promise<ChallengeParticipant> {
    const id = this.challengeParticipantIdCounter++;
    const joinedAt = new Date();
    const newParticipant: ChallengeParticipant = { ...participant, id, joinedAt };
    this.challengeParticipants.set(id, newParticipant);
    
    // Create social activity
    const challenge = await this.getChallenge(participant.challengeId);
    if (challenge) {
      await this.createSocialActivity({
        userId: participant.userId,
        type: 'challenge_joined',
        content: `joined the "${challenge.title}" challenge`,
        relatedId: challenge.id
      });
    }
    
    return newParticipant;
  }

  async updateChallengeProgress(id: number, progress: number, completed: boolean = false): Promise<ChallengeParticipant | undefined> {
    const participant = this.challengeParticipants.get(id);
    if (!participant) return undefined;
    
    const updatedParticipant = { ...participant, progress, completed };
    this.challengeParticipants.set(id, updatedParticipant);
    
    // If the challenge was completed, create a social activity
    if (completed && !participant.completed) {
      const challenge = await this.getChallenge(participant.challengeId);
      if (challenge) {
        await this.createSocialActivity({
          userId: participant.userId,
          type: 'challenge_completed',
          content: `completed the "${challenge.title}" challenge`,
          relatedId: challenge.id
        });
      }
    }
    
    return updatedParticipant;
  }

  // Social Activity methods
  async getSocialActivity(id: number): Promise<SocialActivity | undefined> {
    return this.socialActivities.get(id);
  }

  async getSocialActivitiesByUserId(userId: number): Promise<SocialActivity[]> {
    return Array.from(this.socialActivities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getFriendActivities(userIds: number[], limit: number = 10): Promise<SocialActivity[]> {
    return Array.from(this.socialActivities.values())
      .filter(activity => userIds.includes(activity.userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createSocialActivity(activity: InsertSocialActivity): Promise<SocialActivity> {
    const id = this.socialActivityIdCounter++;
    const createdAt = new Date();
    const newActivity: SocialActivity = { ...activity, id, createdAt };
    this.socialActivities.set(id, newActivity);
    return newActivity;
  }

  // Social Interaction methods
  async getSocialInteraction(id: number): Promise<SocialInteraction | undefined> {
    return this.socialInteractions.get(id);
  }

  async getSocialInteractionsByActivityId(activityId: number): Promise<SocialInteraction[]> {
    return Array.from(this.socialInteractions.values())
      .filter(interaction => interaction.activityId === activityId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createSocialInteraction(interaction: InsertSocialInteraction): Promise<SocialInteraction> {
    const id = this.socialInteractionIdCounter++;
    const createdAt = new Date();
    const newInteraction: SocialInteraction = { ...interaction, id, createdAt };
    this.socialInteractions.set(id, newInteraction);
    return newInteraction;
  }

  async deleteSocialInteraction(id: number): Promise<boolean> {
    return this.socialInteractions.delete(id);
  }

  // Friend Request methods
  async createFriendRequest(request: InsertFriendRequest): Promise<FriendRequest> {
    const id = this.friendRequestIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newRequest: FriendRequest = { ...request, id, createdAt, updatedAt };
    this.friendRequests.set(id, newRequest);
    return newRequest;
  }

  async getFriendRequest(id: number): Promise<FriendRequest | undefined> {
    return this.friendRequests.get(id);
  }

  async getPendingFriendRequests(userId: number): Promise<FriendRequest[]> {
    return Array.from(this.friendRequests.values())
      .filter(request => request.receiverId === userId && request.status === "pending")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateFriendRequestStatus(id: number, status: string): Promise<FriendRequest | undefined> {
    const request = await this.getFriendRequest(id);
    if (!request) return undefined;

    const updatedRequest: FriendRequest = {
      ...request,
      status,
      updatedAt: new Date()
    };
    this.friendRequests.set(id, updatedRequest);
    
    // If the request was accepted, add users as friends (only addFriend once, as it's now bidirectional)
    if (status === "accepted") {
      await this.addFriend(request.senderId, request.receiverId);
    }
    
    return updatedRequest;
  }

  async getFriendRequestBySenderAndReceiver(senderId: number, receiverId: number): Promise<FriendRequest | undefined> {
    return Array.from(this.friendRequests.values()).find(
      request => request.senderId === senderId && request.receiverId === receiverId
    );
  }

  // Private Message methods
  async createPrivateMessage(message: InsertPrivateMessage): Promise<PrivateMessage> {
    const id = this.privateMessageIdCounter++;
    const createdAt = new Date();
    const newMessage: PrivateMessage = { ...message, id, createdAt };
    this.privateMessages.set(id, newMessage);
    return newMessage;
  }

  async getPrivateMessage(id: number): Promise<PrivateMessage | undefined> {
    return this.privateMessages.get(id);
  }

  async getConversation(userId1: number, userId2: number, limit: number = 50): Promise<PrivateMessage[]> {
    return Array.from(this.privateMessages.values())
      .filter(msg => 
        (msg.senderId === userId1 && msg.receiverId === userId2) || 
        (msg.senderId === userId2 && msg.receiverId === userId1)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-limit);
  }

  async markMessageAsRead(id: number): Promise<PrivateMessage | undefined> {
    const message = await this.getPrivateMessage(id);
    if (!message) return undefined;

    const updatedMessage: PrivateMessage = { ...message, isRead: true };
    this.privateMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.privateMessages.values())
      .filter(msg => msg.receiverId === userId && !msg.isRead)
      .length;
  }
}

export const storage = new MemStorage();
