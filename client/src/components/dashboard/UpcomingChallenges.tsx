import { Link } from "wouter";
import { Challenge } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type UpcomingChallengesProps = {
  challenges: (Challenge & { participantsCount: number })[];
};

// Helper to format the challenge start date
const formatStartDate = (date: Date): string => {
  const now = new Date();
  const challengeDate = new Date(date);
  const diffMs = challengeDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Starts today';
  if (diffDays === 1) return 'Starts tomorrow';
  if (diffDays > 1) return `Starts in ${diffDays} days`;
  return 'Started';
};

export const UpcomingChallenges = ({ challenges }: UpcomingChallengesProps) => {
  const { toast } = useToast();
  
  const joinChallenge = useMutation({
    mutationFn: async (challengeId: number) => {
      return await apiRequest("POST", `/api/challenges/${challengeId}/join`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've joined the challenge",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/challenges/user/joined"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to join challenge. You may already be participating.",
        variant: "destructive"
      });
    }
  });
  
  const handleJoinChallenge = (challengeId: number) => {
    joinChallenge.mutate(challengeId);
  };
  
  return (
    <div className="mt-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-[#E0E0E0] flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-[#212121]">
              Upcoming Challenges
            </h3>
            <p className="mt-1 text-sm text-[#616161]">
              Challenges starting soon
            </p>
          </div>
          <Link href="/challenges">
            <a className="text-sm text-[#4CAF50] hover:text-[#388E3C]">
              View all
            </a>
          </Link>
        </div>
        <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="inline-flex space-x-4 p-4 min-w-full">
            {challenges.length > 0 ? (
              challenges.map((challenge) => (
                <div key={challenge.id} className="bg-white border border-[#E0E0E0] rounded-lg shadow-sm w-72 flex-shrink-0">
                  <div 
                    className="h-32 w-full rounded-t-lg bg-cover bg-center" 
                    style={{ backgroundImage: `url('${challenge.imageUrl}')` }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-40 rounded-t-lg">
                      <h3 className="text-white font-bold text-xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {challenge.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm font-medium text-[#212121]">
                        <i className="far fa-calendar mr-1"></i> {formatStartDate(new Date(challenge.startDate))}
                      </div>
                      <div className="text-sm text-[#9E9E9E]">
                        <i className="fas fa-users mr-1"></i> {challenge.participantsCount} joined
                      </div>
                    </div>
                    <p className="text-sm text-[#616161] mb-4">
                      {challenge.description}
                    </p>
                    <button 
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={joinChallenge.isPending}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50] disabled:opacity-75"
                    >
                      {joinChallenge.isPending ? 'Joining...' : 'Join Challenge'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-[#9E9E9E] w-full">
                No upcoming challenges at the moment. Check back soon!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
