import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useParams, Link } from "wouter";
import { ArrowLeft, Trophy, Users, Calendar, BarChart, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const ChallengeDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const challengeId = parseInt(id);
  
  // Fetch challenge details
  const { data: challenge, isLoading: isChallengeLoading } = useQuery({
    queryKey: [`/api/challenges/${challengeId}`],
  });
  
  // Fetch challenge participants
  const { data: participants, isLoading: isParticipantsLoading } = useQuery({
    queryKey: [`/api/challenges/${challengeId}/participants`],
    enabled: !!challengeId,
  });
  
  // Check if user is already participating
  const { data: userChallenges, isLoading: isUserChallengesLoading } = useQuery({
    queryKey: ['/api/challenges/user/joined'],
  });
  
  const isUserParticipating = !isUserChallengesLoading && userChallenges?.some(
    (uc: any) => uc.challenge.id === challengeId
  );
  
  // Join challenge mutation
  const joinChallenge = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/challenges/${challengeId}/join`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've joined the challenge",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges/user/joined'] });
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${challengeId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${challengeId}/participants`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to join challenge. You may already be participating.",
        variant: "destructive"
      });
    }
  });
  
  // Update progress mutation
  const updateProgress = useMutation({
    mutationFn: async (progress: number) => {
      return await apiRequest("PATCH", `/api/challenges/${challengeId}/progress`, { progress });
    },
    onSuccess: () => {
      toast({
        title: "Progress Updated",
        description: "Your challenge progress has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges/user/joined'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    }
  });
  
  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const calculateTimeLeft = (endDateString: string) => {
    const endDate = new Date(endDateString);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return "Challenge ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days} days, ${hours} hours remaining`;
  };
  
  const calculateStatus = (startDateString: string, endDateString: string) => {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    const now = new Date();
    
    if (now < startDate) return "upcoming";
    if (now > endDate) return "completed";
    return "active";
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "upcoming": return "text-orange-500 bg-orange-100";
      case "active": return "text-green-500 bg-green-100";
      case "completed": return "text-blue-500 bg-blue-100";
      default: return "text-gray-500 bg-gray-100";
    }
  };
  
  if (isChallengeLoading) {
    return (
      <div className="px-4 py-6 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!challenge) {
    return (
      <div className="px-4 py-6 md:px-8">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Challenge Not Found</h2>
          <p className="text-gray-600 mb-4">The challenge you're looking for doesn't exist or has been removed.</p>
          <Link href="/challenges">
            <a className="inline-flex items-center text-[#4CAF50] hover:text-[#388E3C]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Challenges
            </a>
          </Link>
        </div>
      </div>
    );
  }
  
  const challengeStatus = calculateStatus(challenge.startDate, challenge.endDate);
  const statusColor = getStatusColor(challengeStatus);
  
  // Find user's participation data if they're participating
  const userParticipation = userChallenges?.find(
    (uc: any) => uc.challenge.id === challengeId
  )?.participant;
  
  return (
    <div className="px-4 py-6 md:px-8">
      <div className="mb-6">
        <Link href="/challenges">
          <a className="inline-flex items-center text-[#616161] hover:text-[#212121]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </a>
        </Link>
      </div>
      
      {/* Challenge Header */}
      <div 
        className="h-48 md:h-64 rounded-t-lg bg-cover bg-center flex items-end"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7)), url('${challenge.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1280'}')`}}
      >
        <div className="p-6 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${statusColor}`}>
                {challengeStatus.charAt(0).toUpperCase() + challengeStatus.slice(1)}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{challenge.title}</h1>
            </div>
            {!isUserParticipating && challengeStatus !== "completed" && (
              <button
                onClick={() => joinChallenge.mutate()}
                disabled={joinChallenge.isPending}
                className="mt-4 md:mt-0 px-6 py-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#388E3C] flex items-center"
              >
                {joinChallenge.isPending ? 'Joining...' : 'Join Challenge'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Challenge Content */}
      <div className="bg-white shadow rounded-b-lg">
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Description and Stats */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#212121] mb-4">About This Challenge</h2>
                <p className="text-[#616161]">{challenge.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#F5F5F5] p-4 rounded-lg flex flex-col items-center text-center">
                  <Calendar className="h-6 w-6 text-[#4CAF50] mb-2" />
                  <p className="text-sm text-[#9E9E9E]">Start Date</p>
                  <p className="text-sm font-medium text-[#212121]">{formatDate(challenge.startDate)}</p>
                </div>
                
                <div className="bg-[#F5F5F5] p-4 rounded-lg flex flex-col items-center text-center">
                  <Calendar className="h-6 w-6 text-[#F44336] mb-2" />
                  <p className="text-sm text-[#9E9E9E]">End Date</p>
                  <p className="text-sm font-medium text-[#212121]">{formatDate(challenge.endDate)}</p>
                </div>
                
                <div className="bg-[#F5F5F5] p-4 rounded-lg flex flex-col items-center text-center">
                  <Users className="h-6 w-6 text-[#2196F3] mb-2" />
                  <p className="text-sm text-[#9E9E9E]">Participants</p>
                  <p className="text-sm font-medium text-[#212121]">
                    {isParticipantsLoading ? '...' : participants?.length || 0}
                  </p>
                </div>
                
                <div className="bg-[#F5F5F5] p-4 rounded-lg flex flex-col items-center text-center">
                  <Clock className="h-6 w-6 text-[#FF9800] mb-2" />
                  <p className="text-sm text-[#9E9E9E]">Time Left</p>
                  <p className="text-sm font-medium text-[#212121]">
                    {challengeStatus === "completed" 
                      ? "Completed" 
                      : challengeStatus === "upcoming" 
                        ? "Not started" 
                        : calculateTimeLeft(challenge.endDate)
                    }
                  </p>
                </div>
              </div>
              
              {/* Rules Section */}
              <div>
                <h2 className="text-xl font-bold text-[#212121] mb-4">Challenge Rules</h2>
                <div className="bg-[#F5F5F5] p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-2 text-[#616161]">
                    <li>Complete the challenge goal before the end date</li>
                    <li>Track your progress regularly</li>
                    <li>Encourage and support other participants</li>
                    <li>Have fun and stay consistent!</li>
                  </ul>
                </div>
              </div>
              
              {/* Leaderboard Section */}
              <div>
                <h2 className="text-xl font-bold text-[#212121] mb-4">Leaderboard</h2>
                {isParticipantsLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : participants && participants.length > 0 ? (
                  <div className="bg-[#F5F5F5] rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#E0E0E0]">
                        <tr>
                          <th className="p-3 text-left text-sm font-medium text-[#212121]">Rank</th>
                          <th className="p-3 text-left text-sm font-medium text-[#212121]">User</th>
                          <th className="p-3 text-left text-sm font-medium text-[#212121]">Progress</th>
                          <th className="p-3 text-right text-sm font-medium text-[#212121]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E0E0E0]">
                        {participants
                          .sort((a: any, b: any) => b.progress - a.progress)
                          .map((participant: any, index: number) => (
                            <tr key={participant.id} className="bg-white">
                              <td className="p-3 text-sm text-[#212121]">#{index + 1}</td>
                              <td className="p-3 text-sm text-[#212121]">{participant.username || 'User'}</td>
                              <td className="p-3">
                                <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                                  <div 
                                    className="bg-[#4CAF50] h-2 rounded-full" 
                                    style={{ width: `${participant.progress}%` }}
                                  ></div>
                                </div>
                              </td>
                              <td className="p-3 text-right text-sm">
                                {participant.completed ? (
                                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                    Completed
                                  </span>
                                ) : (
                                  <span className="text-[#616161]">{participant.progress}%</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-[#F5F5F5] p-6 rounded-lg text-center">
                    <p className="text-[#9E9E9E]">No participants yet. Be the first to join!</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Your Progress */}
            <div>
              <div className="bg-[#F5F5F5] p-6 rounded-lg">
                <h2 className="text-xl font-bold text-[#212121] mb-4">Your Progress</h2>
                
                {isUserParticipating && userParticipation ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-[#616161]">Completion</span>
                        <span className="text-sm font-medium text-[#212121]">{userParticipation.progress}%</span>
                      </div>
                      <div className="relative w-full bg-[#E0E0E0] rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500 ease-in-out" 
                          style={{ width: `${userParticipation.progress}%` }}
                        ></div>
                        {/* Challenge Goal Markers */}
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-1">
                          {[25, 50, 75].map((milestone) => (
                            <div 
                              key={milestone}
                              className={`h-6 w-0.5 ${userParticipation.progress >= milestone ? 'bg-white' : 'bg-gray-400'} relative`}
                              style={{ left: `${milestone}%`, marginLeft: '-1px' }}
                            >
                              <div className={`absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs ${userParticipation.progress >= milestone ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                {milestone}%
                              </div>
                            </div>
                          ))}
                          <div 
                            className={`h-6 w-0.5 ${userParticipation.progress >= 100 ? 'bg-white' : 'bg-gray-400'} relative`}
                            style={{ left: '100%', marginLeft: '-1px' }}
                          >
                            <div className={`absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs ${userParticipation.progress >= 100 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                              100%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {userParticipation.completed ? (
                      <div className="bg-green-100 p-4 rounded-lg text-center">
                        <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-green-800 font-medium">Challenge Completed!</p>
                        <p className="text-green-700 text-sm mt-1">Congratulations on your achievement</p>
                      </div>
                    ) : challengeStatus === "active" ? (
                      <div className="space-y-4">
                        <div className="bg-blue-100 p-4 rounded-lg">
                          <p className="text-blue-800 text-sm">
                            Update your progress regularly to stay on track!
                          </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <label className="block text-sm font-medium text-[#424242] mb-2">Update Progress</label>
                          <div className="space-y-4">
                            {/* Progress Slider */}
                            <div>
                              <input 
                                type="range" 
                                min="0"
                                max="100"
                                step="5"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                                defaultValue={userParticipation.progress}
                                id="progress-slider"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  document.getElementById('progress-value')!.textContent = value;
                                  document.getElementById('progress-number-input')!.value = value;
                                }}
                              />
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-500">0%</span>
                                <span id="progress-value" className="text-sm font-medium text-green-600">{userParticipation.progress}%</span>
                                <span className="text-xs text-gray-500">100%</span>
                              </div>
                            </div>
                            
                            {/* Numeric Input and Update Button */}
                            <div className="flex mt-2">
                              <input 
                                id="progress-number-input"
                                type="number" 
                                min="0"
                                max="100"
                                className="w-20 p-2 border border-[#E0E0E0] rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50] text-center"
                                placeholder="0-100"
                                defaultValue={userParticipation.progress}
                                onChange={(e) => {
                                  const input = e.target as HTMLInputElement;
                                  const value = parseInt(input.value);
                                  if (!isNaN(value) && value >= 0 && value <= 100) {
                                    document.getElementById('progress-slider')!.value = input.value;
                                    document.getElementById('progress-value')!.textContent = input.value + "%";
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  const input = document.getElementById('progress-number-input') as HTMLInputElement;
                                  const progress = parseInt(input.value);
                                  if (progress >= 0 && progress <= 100) {
                                    updateProgress.mutate(progress);
                                  }
                                }}
                                disabled={updateProgress.isPending}
                                className="flex-1 px-4 py-2 bg-[#4CAF50] text-white rounded-r-md hover:bg-[#388E3C] disabled:opacity-75 flex items-center justify-center"
                              >
                                {updateProgress.isPending ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                  </>
                                ) : 'Save Progress'}
                              </button>
                            </div>
                            
                            {/* Quick Milestone Buttons */}
                            <div className="grid grid-cols-4 gap-2 mt-2">
                              {[25, 50, 75, 100].map((milestone) => (
                                <button
                                  key={milestone}
                                  onClick={() => {
                                    document.getElementById('progress-slider')!.value = milestone.toString();
                                    document.getElementById('progress-value')!.textContent = milestone + "%";
                                    document.getElementById('progress-number-input')!.value = milestone.toString();
                                  }}
                                  className={`py-1 text-xs border rounded-md ${userParticipation.progress >= milestone ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'} hover:bg-green-100`}
                                >
                                  {milestone}%
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : challengeStatus === "upcoming" ? (
                      <div className="bg-orange-100 p-4 rounded-lg text-center">
                        <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                        <p className="text-orange-800 font-medium">Challenge Not Started</p>
                        <p className="text-orange-700 text-sm mt-1">
                          The challenge will begin on {formatDate(challenge.startDate)}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-blue-100 p-4 rounded-lg text-center">
                        <Trophy className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-blue-800 font-medium">Challenge Ended</p>
                        <p className="text-blue-700 text-sm mt-1">
                          This challenge has concluded. Your final progress: {userParticipation.progress}%
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BarChart className="h-12 w-12 text-[#9E9E9E] mx-auto mb-3" />
                    <h3 className="text-[#616161] font-medium mb-2">Not Participating</h3>
                    <p className="text-[#9E9E9E] text-sm mb-4">
                      Join this challenge to track your progress
                    </p>
                    {challengeStatus !== "completed" && (
                      <button
                        onClick={() => joinChallenge.mutate()}
                        disabled={joinChallenge.isPending}
                        className="px-4 py-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#388E3C] w-full"
                      >
                        {joinChallenge.isPending ? 'Joining...' : 'Join Challenge'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;