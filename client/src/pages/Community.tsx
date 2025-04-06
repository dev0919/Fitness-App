import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SocialActivity } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

// We'll use real friends data from the API

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
  const [newPostText, setNewPostText] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Fetch friend activities and user's own posts
  const { data: activities, isLoading, refetch } = useQuery({
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
  
  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setImagePreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove selected image
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };
  
  // Function to compress and resize an image before upload
  const compressImage = async (file: File, maxWidth = 800, maxHeight = 600, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          // Create canvas and resize image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to base64 with reduced quality
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            // Fallback if canvas context is not available
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target && typeof e.target.result === 'string') {
                resolve(e.target.result);
              } else {
                resolve('');
              }
            };
            reader.readAsDataURL(file);
          }
        };
        
        if (readerEvent.target && typeof readerEvent.target.result === 'string') {
          img.src = readerEvent.target.result;
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Create post mutation
  const createPost = useMutation({
    mutationFn: async () => {
      // Convert image to base64 string if there's an image selected
      let imageData = null;
      if (selectedImage) {
        try {
          // Compress and resize the image before sending
          imageData = await compressImage(selectedImage);
        } catch (error) {
          console.error("Error processing image:", error);
          toast({
            title: "Error",
            description: "Could not process the image. Try a smaller image.",
            variant: "destructive"
          });
        }
      }
      
      return await apiRequest("POST", "/api/social/activities", {
        type: "post",
        content: newPostText,
        imageData: imageData
      });
    },
    onSuccess: () => {
      setNewPostText("");
      setShowNewPostForm(false);
      setSelectedImage(null);
      setImagePreview(null);
      toast({
        title: "Success!",
        description: "Your post has been published",
      });
      refetch(); // Explicitly refetch to show the new post
      queryClient.invalidateQueries({ queryKey: ["/api/social/activities/friends"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not create post",
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
  
  // Get current user data for use in posts
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    refetchOnWindowFocus: false
  });
  
  // Get user's friends
  const { data: friendsData } = useQuery({
    queryKey: ['/api/friends'],
    retry: false,
    refetchOnWindowFocus: false
  });
  
  // Activities already have user data from the backend
  const enhancedActivities = activities || [];
  
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
          {/* New Post Form */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4">
              {showNewPostForm ? (
                <div>
                  <textarea
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="What's on your mind? Share your fitness achievements, goals, or tips..."
                    className="w-full p-3 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50] min-h-[120px]"
                  />
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-3 relative border border-[#E0E0E0] rounded-md overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full max-h-60 object-cover"
                      />
                      <button 
                        onClick={removeSelectedImage}
                        className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    {/* Image Upload Button */}
                    <div>
                      <label htmlFor="image-upload" className="cursor-pointer flex items-center text-[#4CAF50] hover:text-[#388E3C]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        Add Photo
                      </label>
                      <input 
                        type="file" 
                        id="image-upload" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setShowNewPostForm(false);
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="px-4 py-2 border border-[#E0E0E0] rounded-md text-[#616161]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => createPost.mutate()}
                        disabled={createPost.isPending || (!newPostText.trim() && !selectedImage)}
                        className="px-4 py-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#388E3C] disabled:opacity-50"
                      >
                        {createPost.isPending ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setShowNewPostForm(true)}
                  className="flex items-center p-2 border border-[#E0E0E0] rounded-md cursor-pointer hover:bg-[#F5F5F5]"
                >
                  <span className="text-[#9E9E9E] pl-2">What's on your mind?</span>
                </div>
              )}
            </div>
          </div>
          
          {enhancedActivities.length > 0 ? (
            enhancedActivities.map(({ activity, user, interactions }) => (
              <div key={activity.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Link href={`/profile/${user.id}`}>
                        {user.profileImage ? (
                          <img 
                            className="h-10 w-10 rounded-full object-cover cursor-pointer" 
                            src={user.profileImage}
                            alt={`${user.firstName} ${user.lastName || ''}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-[#4CAF50] text-white flex items-center justify-center text-sm font-medium cursor-pointer">
                            {user.firstName.charAt(0)}{user.lastName ? user.lastName.charAt(0) : ''}
                          </div>
                        )}
                      </Link>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#212121]">
                          {user.firstName} {user.lastName || ''}
                        </p>
                        <p className="text-xs text-[#9E9E9E]">
                          {formatTime(activity.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm text-[#616161] mt-1">
                        {activity.content}
                      </p>
                      
                      {/* Display image if available */}
                      {activity.imageData && (
                        <div className="mt-3 border border-[#E0E0E0] rounded-md overflow-hidden">
                          <img 
                            src={activity.imageData} 
                            alt="Post attachment" 
                            className="w-full max-h-96 object-contain"
                          />
                        </div>
                      )}
                      
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
            {friendsData && friendsData.length > 0 ? (
              friendsData.map((friend) => (
                <li key={friend.id} className="p-4 hover:bg-[#F5F5F5]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {friend.profileImage ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={friend.profileImage}
                          alt={`${friend.firstName} ${friend.lastName || ''}`}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#4CAF50] text-white flex items-center justify-center text-sm font-medium">
                          {friend.firstName.charAt(0)}{friend.lastName ? friend.lastName.charAt(0) : ''}
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-[#212121]">{friend.firstName} {friend.lastName || ''}</p>
                        <p className="text-xs text-[#9E9E9E]">@{friend.username}</p>
                      </div>
                    </div>
                    <Link href={`/profile/${friend.id}`}>
                      <span className="text-sm text-[#4CAF50] hover:text-[#388E3C] cursor-pointer">View Profile</span>
                    </Link>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-6 text-center text-[#9E9E9E]">
                No friends found. Add friends to see them here!
              </li>
            )}
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
