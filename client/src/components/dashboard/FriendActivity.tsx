import { SocialActivity, SocialInteraction } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

type FriendActivityProps = {
  activities: {
    activity: SocialActivity;
    user: {
      id: number;
      username: string;
      firstName: string;
      lastName?: string;
      profileImage?: string;
    };
    interactions: {
      likes: number;
      likedByCurrentUser: boolean;
      comments: number;
    };
  }[];
};

// Helper to format the activity time
const formatActivityTime = (date: Date): string => {
  const now = new Date();
  const activityDate = new Date(date);
  const diffMs = now.getTime() - activityDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return activityDate.toLocaleDateString();
};

export const FriendActivity = ({ activities }: FriendActivityProps) => {
  const { toast } = useToast();
  const [expandedCommentActivity, setExpandedCommentActivity] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  
  const handleLike = useMutation({
    mutationFn: async (activityId: number) => {
      return await apiRequest("POST", "/api/social/interactions", {
        activityId,
        type: "like"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/activities/friends"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not like this activity",
        variant: "destructive"
      });
    }
  });
  
  const handleComment = useMutation({
    mutationFn: async ({ activityId, content }: { activityId: number, content: string }) => {
      return await apiRequest("POST", "/api/social/interactions", {
        activityId,
        type: "comment",
        content
      });
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["/api/social/activities/friends"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not post comment",
        variant: "destructive"
      });
    }
  });
  
  const toggleCommentSection = (activityId: number) => {
    setExpandedCommentActivity(expandedCommentActivity === activityId ? null : activityId);
    setCommentText("");
  };
  
  const submitComment = (activityId: number) => {
    if (commentText.trim()) {
      handleComment.mutate({ activityId, content: commentText });
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-[#E0E0E0] flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-[#212121]">
            Friend Activity
          </h3>
          <p className="mt-1 text-sm text-[#616161]">
            Recent activities from your friends
          </p>
        </div>
        <Link href="/community">
          <div className="text-sm text-[#4CAF50] hover:text-[#388E3C] cursor-pointer">
            View all
          </div>
        </Link>
      </div>
      <div className="bg-white">
        <ul className="divide-y divide-[#E0E0E0]">
          {activities.length > 0 ? (
            activities.map(({ activity, user, interactions }) => (
              <li key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-[#F5F5F5]">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Link href={`/profile/${user.id}`}>
                      <div className="cursor-pointer">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName || ''}&background=random`} 
                          alt={`${user.firstName} ${user.lastName || ''}`}
                        />
                      </div>
                    </Link>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-[#212121]">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-[#616161]">
                      {activity.content} <span className="text-[#9E9E9E]">• {formatActivityTime(new Date(activity.createdAt))}</span>
                    </p>
                    <div className="mt-2 flex items-center">
                      <button 
                        onClick={() => handleLike.mutate(activity.id)}
                        className="flex items-center text-sm text-[#9E9E9E] hover:text-[#4CAF50]"
                        disabled={handleLike.isPending}
                      >
                        <i className={`${interactions.likedByCurrentUser ? 'fas text-[#4CAF50]' : 'far'} fa-heart mr-1`}></i>
                        <span>{interactions.likes}</span>
                      </button>
                      <button 
                        onClick={() => toggleCommentSection(activity.id)}
                        className="flex items-center text-sm text-[#9E9E9E] hover:text-[#4CAF50] ml-4"
                      >
                        <i className="far fa-comment mr-1"></i>
                        <span>{interactions.comments}</span>
                      </button>
                    </div>
                    
                    {expandedCommentActivity === activity.id && (
                      <div className="mt-3">
                        <div className="flex">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 p-2 text-sm border border-[#E0E0E0] rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                          />
                          <button
                            onClick={() => submitComment(activity.id)}
                            disabled={handleComment.isPending || !commentText.trim()}
                            className="px-3 py-2 bg-[#4CAF50] text-white rounded-r-md hover:bg-[#388E3C] disabled:opacity-50"
                          >
                            <i className="fas fa-paper-plane"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-center text-[#9E9E9E]">
              No friend activities to display. Connect with other fitness enthusiasts!
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
