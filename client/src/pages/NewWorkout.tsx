import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import * as z from "zod";
import { insertWorkoutSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Dumbbell, Timer, Route, Flame, CheckCircle } from "lucide-react";

// Extend the schema with validation requirements
const workoutSchema = insertWorkoutSchema.extend({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  type: z.string().min(1, { message: "Please select a workout type" }),
  duration: z.coerce.number().min(1, { message: "Duration must be at least 1 minute" }),
  distance: z.coerce.number().optional(),
  caloriesBurned: z.coerce.number().optional(),
  notes: z.string().optional()
});

type WorkoutFormValues = z.infer<typeof workoutSchema>;

const NewWorkout = () => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Initialize the form
  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      title: "",
      type: "",
      duration: 30,
      distance: undefined,
      caloriesBurned: undefined,
      notes: ""
    }
  });

  // Create mutation for submitting workout
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: WorkoutFormValues) => {
      return apiRequest("POST", "/api/workouts", data);
    },
    onSuccess: () => {
      toast({
        title: "Workout added",
        description: "Your workout has been successfully recorded."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/current'] });
      setLocation("/workouts");
    },
    onError: (error) => {
      console.error("Error adding workout:", error);
      toast({
        title: "Failed to add workout",
        description: "There was an error adding your workout. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Form submission handler
  const onSubmit = (data: WorkoutFormValues) => {
    console.log("Submitting workout:", data);
    // Create a new workout record
    mutate(data);
  };

  return (
    <div className="container py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#212121]">New Workout</h2>
          <p className="text-[#616161] mt-1">Record your fitness activity</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Workout Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Morning Run, Strength Training, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Workout Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a workout type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="run">Running</SelectItem>
                      <SelectItem value="strength">Strength Training</SelectItem>
                      <SelectItem value="cycling">Cycling</SelectItem>
                      <SelectItem value="swimming">Swimming</SelectItem>
                      <SelectItem value="yoga">Yoga</SelectItem>
                      <SelectItem value="hiking">Hiking</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Distance */}
              <FormField
                control={form.control}
                name="distance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distance (meters)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Route className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          className="pl-10"
                          placeholder="Optional"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : Number(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">For running, cycling, etc.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Calories */}
              <FormField
                control={form.control}
                name="caloriesBurned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories Burned</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Flame className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          className="pl-10"
                          placeholder="Optional"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : Number(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How did the workout feel? Any observations or achievements?"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button" 
                variant="outline"
                onClick={() => setLocation("/workouts")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isPending}
                className="bg-[#4CAF50] hover:bg-[#388E3C] text-white"
              >
                {isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save Workout
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewWorkout;