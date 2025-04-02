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
  insertSocialInteractionSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

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
      secure: process.env.NODE_ENV === "production"
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
        return res.status(201).json(userWithoutPassword);
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
    res.json(userWithoutPassword);
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
      // In a real app, this would get activities from user's friends
      // For demo, we'll return activities from all users
      const activities = await storage.getFriendActivities([1]);
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

  app.use('/api', apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
