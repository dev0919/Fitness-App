import { MemStorage } from './storage';
import { 
  demoWorkouts, 
  demoActivities, 
  demoChallengeParticipations, 
  demoFriends, 
  demoSocialActivities, 
  demoSocialInteractions,
  demoPrivateMessages
} from './demoData';

const DEMO_USER_ID = 1; // Alex's user ID
const DEMO_USERNAME = 'alex';

/**
 * Class responsible for managing demo user data
 * This includes loading initial demo data and resetting demo data on logout
 */
export class DemoDataManager {
  private storage: MemStorage;
  private initializedDemo: boolean = false;

  constructor(storage: MemStorage) {
    this.storage = storage;
  }

  /**
   * Initializes demo data for the alex account if not already initialized
   */
  async initializeDemoData(): Promise<void> {
    if (this.initializedDemo) {
      return;
    }

    // Check if user is configured but has no workouts or activities
    const alexUser = await this.storage.getUserByUsername(DEMO_USERNAME);
    if (!alexUser || alexUser.id !== DEMO_USER_ID) {
      console.log('Demo user not found or has incorrect ID');
      return;
    }

    // Check if user already has workouts
    const existingWorkouts = await this.storage.getWorkoutsByUserId(DEMO_USER_ID);
    if (existingWorkouts.length > 0) {
      console.log('Demo user already has workouts, skipping initialization');
      this.initializedDemo = true;
      return;
    }

    console.log('Initializing demo data for user:', DEMO_USERNAME);

    // Load demo workouts
    for (const workout of demoWorkouts) {
      await this.storage.createWorkout({
        ...workout,
        userId: DEMO_USER_ID
      });
    }

    // Load demo activities
    for (const activity of demoActivities) {
      await this.storage.createActivity({
        ...activity,
        userId: DEMO_USER_ID
      });
    }

    // Add demo friends
    const alexData = await this.storage.getUser(DEMO_USER_ID);
    if (alexData) {
      alexData.friends = [...demoFriends];
      await this.storage.updateUser(DEMO_USER_ID, { friends: alexData.friends });
      
      // Update the other users to have Alex as a friend
      for (const friendId of demoFriends) {
        const friend = await this.storage.getUser(friendId);
        if (friend) {
          friend.friends = [...(friend.friends || []), DEMO_USER_ID];
          await this.storage.updateUser(friendId, { friends: friend.friends });
        }
      }
    }

    // Join demo challenges
    for (const { challengeId, participation } of demoChallengeParticipations) {
      // Check if challenge exists
      const challenge = await this.storage.getChallenge(challengeId);
      if (challenge) {
        await this.storage.joinChallenge({
          ...participation,
          userId: DEMO_USER_ID,
          challengeId
        });
      }
    }

    // Add demo social activities
    const socialActivityIds = [];
    for (const activity of demoSocialActivities) {
      const newActivity = await this.storage.createSocialActivity(activity);
      socialActivityIds.push(newActivity.id);
    }

    // Add demo social interactions
    for (let i = 0; i < demoSocialInteractions.length; i++) {
      const interaction = demoSocialInteractions[i];
      // Adjust activityId to match newly created activities
      if (i < socialActivityIds.length) {
        await this.storage.createSocialInteraction({
          ...interaction,
          activityId: socialActivityIds[i]
        });
      }
    }

    // Add demo private messages
    for (const message of demoPrivateMessages) {
      await this.storage.createPrivateMessage(message);
    }

    this.initializedDemo = true;
    console.log('Demo data initialization complete');
  }

  /**
   * Resets user data to original demo state when they log out
   */
  async resetDemoData(): Promise<void> {
    console.log('Resetting demo data for user:', DEMO_USERNAME);
    
    // Get the user
    const alexUser = await this.storage.getUser(DEMO_USER_ID);
    if (!alexUser) {
      console.log('Demo user not found, cannot reset');
      return;
    }

    // 1. Delete all workouts not in demo data and reset demo workouts
    const allWorkouts = await this.storage.getWorkoutsByUserId(DEMO_USER_ID);
    
    // Delete any non-demo workouts
    for (const workout of allWorkouts) {
      const isDemo = demoWorkouts.some(demo => 
        demo.title === workout.title && 
        demo.type === workout.type
      );
      
      if (!isDemo) {
        // Delete custom workout
        await this.storage.deleteWorkout(workout.id);
      }
    }
    
    // 2. Reset activities to demo data (delete and recreate)
    const allActivities = await this.storage.getActivitiesByUserId(DEMO_USER_ID, 100);
    
    // Store today's activity which we'll preserve partially
    const todayStr = new Date().toDateString();
    const todayActivity = allActivities.find(a => new Date(a.date).toDateString() === todayStr);
    
    // Delete all activities
    for (const activity of allActivities) {
      // We'd delete the activity here if we had a deleteActivity method
      // For now, we'll override with zeros except for today which we'll update with demo data
    }
    
    // Recreate demo activities (we assume createActivity will overwrite if same date)
    for (const activity of demoActivities) {
      // If it's today's activity, preserve any workout the user did
      if (new Date(activity.date).toDateString() === todayStr && todayActivity) {
        await this.storage.updateActivity(todayActivity.id, {
          ...activity,
          // Preserve today's workout count if higher
          workouts: Math.max(activity.workouts, todayActivity.workouts)
        });
      } else {
        // For past days, use the demo data directly
        await this.storage.createActivity({
          ...activity,
          userId: DEMO_USER_ID
        });
      }
    }
    
    // 3. Reset challenge participations
    const userChallenges = await this.storage.getUserChallenges(DEMO_USER_ID);
    
    // Reset demo challenges to their specified progress
    for (const { challengeId, participation } of demoChallengeParticipations) {
      const existing = userChallenges.find(c => c.challenge.id === challengeId);
      
      if (existing) {
        // Update progress to demo value
        await this.storage.updateChallengeProgress(
          existing.participant.id,
          participation.progress,
          participation.completed
        );
      } else {
        // Join the challenge if not already joined
        const challenge = await this.storage.getChallenge(challengeId);
        if (challenge) {
          await this.storage.joinChallenge({
            ...participation,
            userId: DEMO_USER_ID,
            challengeId
          });
        }
      }
    }
    
    // Remove user from any non-demo challenges
    for (const userChallenge of userChallenges) {
      const isDemo = demoChallengeParticipations.some(
        demo => demo.challengeId === userChallenge.challenge.id
      );
      
      if (!isDemo) {
        // We would ideally remove the user from this challenge
        // If there's no method for this, we could set progress to 0
        await this.storage.updateChallengeProgress(
          userChallenge.participant.id,
          0,
          false
        );
      }
    }
    
    // 4. Reset friends list
    if (alexUser) {
      // Set friends to demo list
      await this.storage.updateUser(DEMO_USER_ID, { friends: [...demoFriends] });
    }
    
    console.log('Demo data reset complete');
  }

  /**
   * Check if the given user is the demo user
   */
  isDemoUser(userId: number): boolean {
    return userId === DEMO_USER_ID;
  }

  isDemoUsername(username: string): boolean {
    return username.toLowerCase() === DEMO_USERNAME.toLowerCase();
  }
}