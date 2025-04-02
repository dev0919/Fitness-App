import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

// Create challenge schema with validation
const challengeSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  imageUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  startDate: z.string().refine(value => {
    const startDate = new Date(value);
    return startDate >= new Date(new Date().setHours(0, 0, 0, 0));
  }, { message: "Start date must be today or in the future" }),
  endDate: z.string().refine(value => {
    const endDate = new Date(value);
    return endDate > new Date();
  }, { message: "End date must be in the future" }),
  goalType: z.enum(["distance", "steps", "workouts", "calories"]),
  goalAmount: z.number().min(1, { message: "Goal amount must be at least 1" })
});

type ChallengeFormValues = z.infer<typeof challengeSchema>;

const NewChallenge = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().substring(0, 10),
      goalType: "distance",
      goalAmount: 10
    }
  });
  
  const createChallenge = useMutation({
    mutationFn: async (data: ChallengeFormValues) => {
      // Format the goal as a JSON object
      const formattedData = {
        ...data,
        goal: {
          type: data.goalType,
          amount: data.goalAmount
        }
      };
      
      // Remove the fields that are not in the API schema
      const { goalType, goalAmount, ...challengeData } = formattedData;
      
      return await apiRequest("POST", "/api/challenges", challengeData);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Challenge created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges/upcoming'] });
      
      // Redirect to challenges page
      setLocation("/challenges");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create challenge",
        variant: "destructive"
      });
    }
  });
  
  const onSubmit = (data: ChallengeFormValues) => {
    createChallenge.mutate(data);
  };
  
  // Helper function to get goal unit label
  const getGoalUnitLabel = (goalType: string) => {
    switch (goalType) {
      case "distance":
        return "kilometers";
      case "steps":
        return "steps";
      case "workouts":
        return "workouts";
      case "calories":
        return "calories";
      default:
        return "units";
    }
  };
  
  return (
    <div className="px-4 py-6 md:px-8">
      <div className="mb-6 flex items-center">
        <Link href="/challenges" className="mr-4 text-[#9E9E9E] hover:text-[#212121]">
          <ArrowLeft />
        </Link>
        <h2 className="text-2xl font-bold text-[#212121]">Create New Challenge</h2>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[#616161]">
              Challenge Title
            </label>
            <input
              id="title"
              {...form.register("title")}
              className="mt-1 block w-full px-3 py-2 border border-[#E0E0E0] rounded-md shadow-sm focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50]"
              placeholder="e.g., 30-Day Running Challenge"
            />
            {form.formState.errors.title && (
              <p className="mt-1 text-sm text-[#F44336]">{form.formState.errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#616161]">
              Description
            </label>
            <textarea
              id="description"
              {...form.register("description")}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-[#E0E0E0] rounded-md shadow-sm focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50]"
              placeholder="Describe your challenge and what participants should do"
            ></textarea>
            {form.formState.errors.description && (
              <p className="mt-1 text-sm text-[#F44336]">{form.formState.errors.description.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-[#616161]">
              Image URL (Optional)
            </label>
            <input
              id="imageUrl"
              {...form.register("imageUrl")}
              className="mt-1 block w-full px-3 py-2 border border-[#E0E0E0] rounded-md shadow-sm focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50]"
              placeholder="https://example.com/image.jpg"
            />
            {form.formState.errors.imageUrl && (
              <p className="mt-1 text-sm text-[#F44336]">{form.formState.errors.imageUrl.message}</p>
            )}
            <p className="mt-1 text-xs text-[#9E9E9E]">Leave blank for a default image</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-[#616161]">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                {...form.register("startDate")}
                className="mt-1 block w-full px-3 py-2 border border-[#E0E0E0] rounded-md shadow-sm focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50]"
              />
              {form.formState.errors.startDate && (
                <p className="mt-1 text-sm text-[#F44336]">{form.formState.errors.startDate.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-[#616161]">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                {...form.register("endDate")}
                className="mt-1 block w-full px-3 py-2 border border-[#E0E0E0] rounded-md shadow-sm focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50]"
              />
              {form.formState.errors.endDate && (
                <p className="mt-1 text-sm text-[#F44336]">{form.formState.errors.endDate.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="goalType" className="block text-sm font-medium text-[#616161]">
                Goal Type
              </label>
              <select
                id="goalType"
                {...form.register("goalType")}
                className="mt-1 block w-full px-3 py-2 border border-[#E0E0E0] rounded-md shadow-sm focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50]"
              >
                <option value="distance">Distance</option>
                <option value="steps">Steps</option>
                <option value="workouts">Workouts</option>
                <option value="calories">Calories</option>
              </select>
              {form.formState.errors.goalType && (
                <p className="mt-1 text-sm text-[#F44336]">{form.formState.errors.goalType.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="goalAmount" className="block text-sm font-medium text-[#616161]">
                Goal Amount
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="goalAmount"
                  type="number"
                  {...form.register("goalAmount", { valueAsNumber: true })}
                  className="block w-full px-3 py-2 border border-[#E0E0E0] rounded-l-md shadow-sm focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50]"
                  min="1"
                />
                <span className="inline-flex items-center px-3 py-2 border border-l-0 border-[#E0E0E0] bg-[#F5F5F5] text-[#616161] text-sm rounded-r-md">
                  {getGoalUnitLabel(form.watch("goalType"))}
                </span>
              </div>
              {form.formState.errors.goalAmount && (
                <p className="mt-1 text-sm text-[#F44336]">{form.formState.errors.goalAmount.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Link href="/challenges">
              <button
                type="button"
                className="px-4 py-2 border border-[#E0E0E0] rounded-md shadow-sm text-sm font-medium text-[#616161] bg-white hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50]"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={createChallenge.isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50] disabled:bg-opacity-70"
            >
              {createChallenge.isPending ? "Creating..." : "Create Challenge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChallenge;