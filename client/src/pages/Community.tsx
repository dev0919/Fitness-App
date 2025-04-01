import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SocialActivity } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Mock friend data (would come from API in a real app)
const MOCK_FRIENDS = [
  { id: 1, name: "Sarah Williams", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80" },
  { id: 2, name: "Michael Chen", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80" },
  { id: 3, name: "Jessica Lee", avatar: "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=80&h=80" },
  { id: 4, name: "David Kim", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80" },
  { id: 5, name: "Emma Johnson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80" },
];

// Helper function for formatting time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

const Community = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'feed' | 'friends'>('feed');
  const [expandedCommentActivity, setExpandedCommentActivity] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  
  // Fetch friend activities
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/social/activities/friends'],
  });
  
  // Like mutation
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
  
  // Comment mutation
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
  
  // Enhancing activities with user data (in a real app this would be server-side)
  const enhancedActivities = activities ? 
    activities.map((activity: SocialActivity, index: number) => {
      const mockFriend = MOCK_FRIENDS[index % MOCK_FRIENDS.length];
      return {
        activity,
        user: {
          id: mockFriend.id,
          name: mockFriend.name,
          avatar: mockFriend.avatar
        },
        interactions: {
          likes: Math.floor(Math.random() * 20) + 1,
          likedByCurrentUser: false,
          comments: Math.floor(Math.random() * 5)
        }
      };
    }) : [];
  
  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#212121]">Community</h2>
          <p className="text-[#616161] mt-1">Connect with fitness friends and see their activity</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-[#E0E0E0] mb-6">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'feed' 
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]' 
              : 'text-[#616161]'
          }`}
        >
          Activity Feed
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'friends' 
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]' 
              : 'text-[#616161]'
          }`}
        >
          Friends
        </button>
      </div>
      
      {/* Activity Feed Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {enhancedActivities.length > 0 ? (
            enhancedActivities.map(({ activity, user, interactions }) => (
              <div key={activity.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Link href={`/profile/${user.id}`}>
                        <a>
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={user.avatar} 
                            alt={user.name}
                          />
                        </a>
                      </Link>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#212121]">
                          {user.name}
                        </p>
                        <p className="text-xs text-[#9E9E9E]">
                          {formatTime(activity.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm text-[#616161] mt-1">
                        {activity.content}
                      </p>
                      
                      <div className="mt-3 flex items-center">
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
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white shadow rounded-lg">
              <div className="h-16 w-16 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-users text-[#9E9E9E] text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-[#212121]">No activities yet</h3>
              <p className="text-[#616161] mt-1">Connect with friends to see their fitness activities</p>
            </div>
          )}
        </div>
      )}
      
      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b border-[#E0E0E0]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-[#9E9E9E]"></i>
              </div>
              <input
                type="text"
                placeholder="Search friends..."
                className="block w-full pl-10 pr-3 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50] focus:border-[#4CAF50]"
              />
            </div>
          </div>
          
          <ul className="divide-y divide-[#E0E0E0]">
            {MOCK_FRIENDS.map((friend) => (
              <li key={friend.id} className="p-4 hover:bg-[#F5F5F5]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      className="h-10 w-10 rounded-full object-cover" 
                      src={friend.avatar} 
                      alt={friend.name}
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-[#212121]">{friend.name}</p>
                      <p className="text-xs text-[#9E9E9E]">Active today</p>
                    </div>
                  </div>
                  <Link href={`/profile/${friend.id}`}>
                    <a className="text-sm text-[#4CAF50] hover:text-[#388E3C]">View Profile</a>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="p-4 border-t border-[#E0E0E0] text-center">
            <button className="text-sm text-[#4CAF50] hover:text-[#388E3C]">
              Find More Friends
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
