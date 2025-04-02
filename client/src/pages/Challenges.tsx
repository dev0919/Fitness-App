import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Challenge } from "@shared/schema";
import { useState } from "react";
import { Link } from "wouter";

const Challenges = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "upcoming" | "joined">("all");
  
  // Fetch challenges based on filter
  const { data: challenges, isLoading } = useQuery({
    queryKey: [filter === "upcoming" ? '/api/challenges/upcoming' : '/api/challenges'],
  });
  
  // Fetch user's joined challenges
  const { data: joinedChallenges, isLoading: isJoinedChallengesLoading } = useQuery({
    queryKey: ['/api/challenges/user/joined'],
    enabled: filter === "joined",
  });
  
  const joinChallenge = useMutation({
    mutationFn: async (challengeId: number) => {
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
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to join challenge. You may already be participating.",
        variant: "destructive"
      });
    }
  });
  
  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffInDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return "Ended";
    if (diffInDays === 0) return "Ends today";
    if (diffInDays === 1) return "1 day left";
    return `${diffInDays} days left`;
  };
  
  const formatStartDate = (date: string) => {
    const now = new Date();
    const challengeDate = new Date(date);
    const diffMs = challengeDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Started';
    if (diffDays === 1) return 'Starts tomorrow';
    return `Starts in ${diffDays} days`;
  };
  
  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayChallenges = filter === "joined" ? (joinedChallenges || []) : (challenges || []);

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#212121]">Challenges</h2>
          <p className="text-[#616161] mt-1">Join fitness challenges and compete with friends</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === "all" 
              ? "bg-[#4CAF50] text-white" 
              : "bg-white text-[#616161] border border-[#E0E0E0]"
          }`}
        >
          All Challenges
        </button>
        <button
          onClick={() => setFilter("upcoming")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === "upcoming" 
              ? "bg-[#4CAF50] text-white" 
              : "bg-white text-[#616161] border border-[#E0E0E0]"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter("joined")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === "joined" 
              ? "bg-[#4CAF50] text-white" 
              : "bg-white text-[#616161] border border-[#E0E0E0]"
          }`}
        >
          My Challenges
        </button>
      </div>
      
      {/* Challenges grid */}
      {filter === "joined" && isJoinedChallengesLoading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayChallenges.length > 0 ? (
            displayChallenges.map((challenge: any) => {
              const isJoined = filter === "joined";
              const hasStarted = new Date(challenge.startDate) <= new Date();
              
              return (
                <div key={challenge.id} className="bg-white border border-[#E0E0E0] rounded-lg shadow-sm overflow-hidden">
                  <div 
                    className="h-40 w-full bg-cover bg-center" 
                    style={{ backgroundImage: `url('${challenge.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=640'}')` }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-40">
                      <h3 className="text-white font-bold text-xl px-4 text-center" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {challenge.title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-[#212121]">
                        {isJoined ? (
                          <span className={hasStarted ? "text-[#4CAF50]" : "text-[#FF9800]"}>
                            <i className={`fas ${hasStarted ? "fa-play-circle" : "fa-hourglass-half"} mr-1`}></i>
                            {hasStarted ? "In progress" : formatStartDate(challenge.startDate)}
                          </span>
                        ) : (
                          <span>
                            <i className="far fa-calendar mr-1"></i>
                            {formatStartDate(challenge.startDate)}
                          </span>
                        )}
                      </div>
                      
                      {isJoined && (
                        <div className="text-sm text-[#616161]">
                          {formatTimeLeft(challenge.endDate)}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-[#616161] mb-4 h-12 overflow-hidden">
                      {challenge.description}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm text-[#9E9E9E] mb-4">
                      <div>
                        <i className="far fa-calendar-alt mr-1"></i> 
                        {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                      </div>
                    </div>
                    
                    {isJoined ? (
                      <div>
                        <div className="text-sm text-[#616161] mb-1">Progress</div>
                        <div className="w-full bg-[#E0E0E0] rounded-full h-2.5 mb-4">
                          <div 
                            className="bg-[#4CAF50] h-2.5 rounded-full" 
                            style={{ width: `${challenge.participant.progress}%` }}
                          ></div>
                        </div>
                        <Link href={`/challenges/${challenge.id}`}>
                          <button 
                            className="w-full flex items-center justify-center px-4 py-2 border border-[#4CAF50] rounded-md shadow-sm text-sm font-medium text-[#4CAF50] bg-white hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50]"
                          >
                            View Details
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button 
                          onClick={() => joinChallenge.mutate(challenge.id)}
                          disabled={joinChallenge.isPending}
                          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50] disabled:opacity-75"
                        >
                          {joinChallenge.isPending ? 'Joining...' : 'Join Challenge'}
                        </button>
                        <Link href={`/challenges/${challenge.id}`}>
                          <button 
                            className="w-full flex items-center justify-center px-4 py-2 border border-[#4CAF50] rounded-md shadow-sm text-sm font-medium text-[#4CAF50] bg-white hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50]"
                          >
                            View Details
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-10 text-center">
              <div className="h-16 w-16 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-trophy text-[#9E9E9E] text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-[#212121]">
                {filter === "joined" 
                  ? "You haven't joined any challenges yet" 
                  : filter === "upcoming" 
                    ? "No upcoming challenges available" 
                    : "No challenges available"}
              </h3>
              <p className="text-[#616161] mt-1">
                {filter === "joined" 
                  ? "Join a challenge to start competing" 
                  : "Check back soon for new challenges"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Challenges;
