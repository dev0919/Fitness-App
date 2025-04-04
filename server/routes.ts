import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertWorkoutSchema, 
  insertActivitySchema,
  insertChallengeSchema,
  insertChallengeParticipantSchema,
  insertSocialActivitySchema,
  insertSocialInteractionSchema,
  insertFriendRequestSchema,
  insertPrivateMessageSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import { WebSocketServer, WebSocket } from "ws";

const Session = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(session({
    secret: 'fitconnect-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new Session({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    }
  }));

  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password !== password) { // In real app, use proper password hashing
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };

  // API Routes - all prefixed with /api
  const apiRouter = express.Router();

  // AUTH ROUTES
  apiRouter.post('/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      const user = await storage.createUser(userData);
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Log the user in after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error during login after registration' });
        }
        
        // Force the session to be saved before response
        req.session.save((err) => {
          if (err) {
            return res.status(500).json({ message: 'Error saving session' });
          }
          return res.status(201).json(userWithoutPassword);
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error during registration' });
    }
  });

  apiRouter.post('/auth/login', passport.authenticate('local'), (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    
    // Force the session to be saved before response
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error saving session' });
      }
      res.json(userWithoutPassword);
    });
  });

  apiRouter.post('/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error during logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  apiRouter.get('/auth/me', isAuthenticated, (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // USER ROUTES
  apiRouter.get('/users/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // FRIEND ROUTES
  apiRouter.get('/users/find/:friendCode', isAuthenticated, async (req, res) => {
    try {
      const friendCode = req.params.friendCode;
      const user = await storage.getUserByFriendCode(friendCode);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found with this friend code' });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  apiRouter.get('/friends', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const friends = await storage.getFriends(userId);
      
      // Friends list already has passwords removed
      res.json(friends);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  apiRouter.post('/friends/add/:friendId', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const friendId = parseInt(req.params.friendId);
      
      // Check if friendId is valid
      const friend = await storage.getUser(friendId);
      if (!friend) {
        return res.status(404).json({ message: 'Friend not found' });
      }
      
      // Check if trying to add yourself
      if (userId === friendId) {
        return res.status(400).json({ message: 'Cannot add yourself as a friend' });
      }
      
      const updatedUser = await storage.addFriend(userId, friendId);
      if (!updatedUser) {
        return res.status(500).json({ message: 'Failed to add friend' });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  apiRouter.delete('/friends/remove/:friendId', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const friendId = parseInt(req.params.friendId);
      
      const updatedUser = await storage.removeFriend(userId, friendId);
      if (!updatedUser) {
        return res.status(404).json({ message: 'Friend not found' });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.patch('/users/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      // Check if the user is updating their own profile
      if (userId !== (req.user as any).id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const updateSchema = insertUserSchema.partial();
      const userData = updateSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  // WORKOUT ROUTES
  apiRouter.get('/workouts', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const workouts = await storage.getWorkoutsByUserId(userId);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.get('/workouts/:id', isAuthenticated, async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const workout = await storage.getWorkout(workoutId);
      if (!workout) {
        return res.status(404).json({ message: 'Workout not found' });
      }
      
      // Check if the workout belongs to the authenticated user
      if (workout.userId !== (req.user as any).id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.post('/workouts', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const workoutData = insertWorkoutSchema.parse({
        ...req.body,
        userId
      });
      
      const workout = await storage.createWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.patch('/workouts/:id', isAuthenticated, async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const workout = await storage.getWorkout(workoutId);
      if (!workout) {
        return res.status(404).json({ message: 'Workout not found' });
      }
      
      // Check if the workout belongs to the authenticated user
      if (workout.userId !== (req.user as any).id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const updateSchema = insertWorkoutSchema.partial();
      const workoutData = updateSchema.parse(req.body);
      
      const updatedWorkout = await storage.updateWorkout(workoutId, workoutData);
      res.json(updatedWorkout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.delete('/workouts/:id', isAuthenticated, async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const workout = await storage.getWorkout(workoutId);
      if (!workout) {
        return res.status(404).json({ message: 'Workout not found' });
      }
      
      // Check if the workout belongs to the authenticated user
      if (workout.userId !== (req.user as any).id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      await storage.deleteWorkout(workoutId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ACTIVITY ROUTES
  apiRouter.get('/activities', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivitiesByUserId(userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.get('/activities/:date', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const date = new Date(req.params.date);
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      
      const activity = await storage.getActivityByUserAndDate(userId, date);
      if (!activity) {
        // Return empty activity with default values
        return res.json({
          userId,
          date,
          steps: 0,
          caloriesBurned: 0,
          activeMinutes: 0,
          workoutsCompleted: 0
        });
      }
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.post('/activities', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const activityData = insertActivitySchema.parse({
        ...req.body,
        userId
      });
      
      // Check if activity already exists for this date
      // Ensure date exists in activityData and create Date object
      const activityDate = activityData.date ? new Date(activityData.date) : new Date();
      const existingActivity = await storage.getActivityByUserAndDate(userId, activityDate);
      if (existingActivity) {
        const updatedActivity = await storage.updateActivity(existingActivity.id, activityData);
        return res.json(updatedActivity);
      }
      
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  // CHALLENGE ROUTES
  apiRouter.get('/challenges', async (req, res) => {
    try {
      const challenges = await storage.getAllChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.get('/challenges/upcoming', async (req, res) => {
    try {
      const challenges = await storage.getUpcomingChallenges();
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  apiRouter.post('/challenges', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const challengeData = { ...req.body, creatorId: userId };
      
      const challenge = await storage.createChallenge(challengeData);
      res.status(201).json(challenge);
    } catch (error) {
      console.error('Error creating challenge:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.get('/challenges/:id', async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.post('/challenges/:id/join', isAuthenticated, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      // Check if challenge exists
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: 'Challenge not found' });
      }
      
      // Check if user already joined this challenge
      const existingParticipation = await storage.getChallengeParticipant(challengeId, userId);
      if (existingParticipation) {
        return res.status(400).json({ message: 'User already joined this challenge' });
      }
      
      const participantData = insertChallengeParticipantSchema.parse({
        challengeId,
        userId,
        progress: 0,
        completed: false
      });
      
      const participant = await storage.joinChallenge(participantData);
      res.status(201).json(participant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.get('/challenges/user/joined', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const userChallenges = await storage.getUserChallenges(userId);
      res.json(userChallenges);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // SOCIAL ACTIVITY ROUTES
  apiRouter.get('/social/activities/friends', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      if (!user || !user.friends || user.friends.length === 0) {
        // If user has no friends, return empty array
        return res.json([]);
      }
      
      // Get activities from user's friends
      const activities = await storage.getFriendActivities(user.friends);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.get('/social/activities/:userId', isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const activities = await storage.getSocialActivitiesByUserId(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // POST new social activity
  apiRouter.post('/social/activities', isAuthenticated, async (req, res) => {
    try {
      // Get the current user from session
      const userId = (req.user as any).id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { type, content } = req.body;
      
      if (!type || !content) {
        return res.status(400).json({ error: "Type and content are required" });
      }
      
      const newActivity = await storage.createSocialActivity({
        userId,
        type,
        content
      });
      
      res.status(201).json(newActivity);
    } catch (error) {
      console.error("Error creating social activity:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ error: "Could not create social activity" });
    }
  });

  // SOCIAL INTERACTION ROUTES
  apiRouter.post('/social/interactions', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const interactionData = insertSocialInteractionSchema.parse({
        ...req.body,
        userId
      });
      
      const interaction = await storage.createSocialInteraction(interactionData);
      res.status(201).json(interaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.get('/social/interactions/:activityId', isAuthenticated, async (req, res) => {
    try {
      const activityId = parseInt(req.params.activityId);
      const interactions = await storage.getSocialInteractionsByActivityId(activityId);
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  apiRouter.delete('/social/interactions/:id', isAuthenticated, async (req, res) => {
    try {
      const interactionId = parseInt(req.params.id);
      const interaction = await storage.getSocialInteraction(interactionId);
      
      if (!interaction) {
        return res.status(404).json({ message: 'Interaction not found' });
      }
      
      // Check if the interaction belongs to the authenticated user
      if (interaction.userId !== (req.user as any).id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      await storage.deleteSocialInteraction(interactionId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // STATS ROUTES
  apiRouter.get('/stats/current', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Get today's activity
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayActivity = await storage.getActivityByUserAndDate(userId, today) || {
        steps: 0,
        caloriesBurned: 0,
        activeMinutes: 0,
        workoutsCompleted: 0
      };
      
      // Get recent workouts
      const workouts = await storage.getWorkoutsByUserId(userId);
      const recentWorkouts = workouts.slice(0, 3);
      
      // Calculate streak
      let streak = 0;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let checkDate = yesterday;
      let hasActivity = true;
      
      while (hasActivity) {
        const activity = await storage.getActivityByUserAndDate(userId, checkDate);
        if (activity && (activity.steps > 0 || activity.workoutsCompleted > 0)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          hasActivity = false;
        }
      }
      
      // Get activities for weekly chart
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const weeklyActivities = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(sevenDaysAgo);
        date.setDate(date.getDate() + i);
        const activity = await storage.getActivityByUserAndDate(userId, date) || {
          steps: 0,
          caloriesBurned: 0,
          activeMinutes: 0,
          workoutsCompleted: 0,
          date
        };
        weeklyActivities.push(activity);
      }
      
      // Return dashboard stats
      res.json({
        stats: {
          steps: todayActivity.steps,
          calories: todayActivity.caloriesBurned,
          workouts: workouts.filter(w => {
            const workoutDate = new Date(w.createdAt);
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return workoutDate >= weekAgo && workoutDate <= today;
          }).length,
          streak: streak
        },
        recentWorkouts,
        weeklyActivities
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // FRIEND REQUEST ROUTES
  apiRouter.post('/friend-requests', isAuthenticated, async (req, res) => {
    try {
      const senderId = (req.user as any).id;
      const { receiverId } = req.body;
      
      // Validate receiverId
      if (!receiverId) {
        return res.status(400).json({ message: 'receiverId is required' });
      }
      
      // Check if user is trying to send a request to themselves
      if (senderId === receiverId) {
        return res.status(400).json({ message: 'Cannot send a friend request to yourself' });
      }
      
      // Check if receiver exists
      const receiver = await storage.getUser(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' });
      }
      
      // Check if they are already friends
      const user = await storage.getUser(senderId);
      if (user?.friends.includes(receiverId)) {
        return res.status(400).json({ message: 'Already friends with this user' });
      }
      
      // Check if there is already a pending request
      const existingRequest = await storage.getFriendRequestBySenderAndReceiver(senderId, receiverId);
      if (existingRequest && existingRequest.status === 'pending') {
        return res.status(400).json({ message: 'Friend request already sent' });
      }
      
      // Create friend request
      const requestData = insertFriendRequestSchema.parse({
        senderId,
        receiverId,
        status: 'pending'
      });
      
      const request = await storage.createFriendRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  apiRouter.get('/friend-requests/pending', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const requests = await storage.getPendingFriendRequests(userId);
      
      // Get sender details for each request
      const detailedRequests = await Promise.all(requests.map(async (request) => {
        const sender = await storage.getUser(request.senderId);
        if (!sender) return request;
        
        const { password, ...senderWithoutPassword } = sender;
        return { ...request, sender: senderWithoutPassword };
      }));
      
      res.json(detailedRequests);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  apiRouter.patch('/friend-requests/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be "accepted" or "rejected"' });
      }
      
      // Get the request
      const request = await storage.getFriendRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Friend request not found' });
      }
      
      // Check if the user is the receiver
      if (request.receiverId !== userId) {
        return res.status(403).json({ message: 'Cannot update a friend request that was not sent to you' });
      }
      
      // Check if the request is still pending
      if (request.status !== 'pending') {
        return res.status(400).json({ message: 'This friend request has already been processed' });
      }
      
      // Update request status (this will also add as friends if accepted)
      const updatedRequest = await storage.updateFriendRequestStatus(requestId, status);
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // MESSAGING ROUTES
  apiRouter.get('/messages/:userId', isAuthenticated, async (req, res) => {
    try {
      const currentUserId = (req.user as any).id;
      const otherUserId = parseInt(req.params.userId);
      
      // Check if users are friends
      const currentUser = await storage.getUser(currentUserId);
      if (!currentUser?.friends.includes(otherUserId)) {
        return res.status(403).json({ message: 'You can only message your friends' });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const messages = await storage.getConversation(currentUserId, otherUserId, limit);
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  apiRouter.patch('/messages/:id/read', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const messageId = parseInt(req.params.id);
      
      // Check if message exists and is addressed to the current user
      const message = await storage.getPrivateMessage(messageId);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      if (message.receiverId !== userId) {
        return res.status(403).json({ message: 'Cannot mark a message as read if you are not the receiver' });
      }
      
      const updatedMessage = await storage.markMessageAsRead(messageId);
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  apiRouter.get('/messages/unread/count', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.use('/api', apiRouter);

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Map to store active connections
  const activeConnections = new Map<number, WebSocket>();
  
  wss.on('connection', (ws: WebSocket, req) => {
    // Parse the session from the request to get the user
    const sessionID = req.url?.split('sessionID=')[1];
    if (!sessionID) {
      ws.close(1008, 'Authentication required');
      return;
    }
    
    // Use the express session parser to get the session
    app.request.sessionStore.get(sessionID, (err, session) => {
      if (err || !session || !session.passport || !session.passport.user) {
        ws.close(1008, 'Authentication required');
        return;
      }
      
      const userId = session.passport.user;
      activeConnections.set(userId, ws);
      
      // Handle incoming messages
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          if (data.type === 'message') {
            const { receiverId, content, publicKey } = data;
            
            // Verify that the sender and receiver are friends
            const sender = await storage.getUser(userId);
            if (!sender || !sender.friends.includes(receiverId)) {
              ws.send(JSON.stringify({
                type: 'error',
                error: 'You can only send messages to your friends'
              }));
              return;
            }
            
            // Create the message in the database
            const messageData = insertPrivateMessageSchema.parse({
              senderId: userId,
              receiverId,
              encryptedContent: content.encryptedContent,
              encryptedKey: content.encryptedKey,
              iv: content.iv,
              isRead: false
            });
            
            const savedMessage = await storage.createPrivateMessage(messageData);
            
            // Send the message to the receiver if they are online
            const receiverWs = activeConnections.get(receiverId);
            if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
              receiverWs.send(JSON.stringify({
                type: 'message',
                message: savedMessage,
                senderPublicKey: publicKey
              }));
            }
            
            // Acknowledge message receipt to sender
            ws.send(JSON.stringify({
              type: 'messageAck',
              messageId: savedMessage.id
            }));
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Error processing message'
          }));
        }
      });
      
      // Handle disconnection
      ws.on('close', () => {
        activeConnections.delete(userId);
      });
      
      // Send confirmation of connection
      ws.send(JSON.stringify({
        type: 'connected',
        userId
      }));
    });
  });
  
  return httpServer;
}
