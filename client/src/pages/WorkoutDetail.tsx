import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, Edit, Trash2, Save, X, Play, CheckSquare } from "lucide-react";
import { Workout, insertWorkoutSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Create a form schema by extending insertWorkoutSchema and making userId optional
const workoutFormSchema = insertWorkoutSchema.omit({ userId: true });
type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

const WorkoutDetail = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const workoutId = parseInt(id || "0");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Fetch workout data
  const { data: workout, isLoading } = useQuery<Workout>({
    queryKey: [`/api/workouts/${workoutId}`],
    enabled: !!workoutId,
  });
  
  // Setup form
  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      title: "",
      type: "run",
      duration: 0,
      distance: 0,
      caloriesBurned: 0,
      description: "",
      completed: false,
      inProgress: false,
    },
  });
  
  // Update form values when workout data is loaded
  useEffect(() => {
    if (workout) {
      form.reset({
        title: workout.title,
        type: workout.type,
        duration: workout.duration,
        distance: workout.distance || 0,
        caloriesBurned: workout.caloriesBurned || 0,
        description: workout.description || "",
        completed: workout.completed,
        inProgress: workout.inProgress || false,
      });
    }
  }, [workout, form]);
  
  // Mutation for updating workout
  const updateWorkout = useMutation({
    mutationFn: async (data: WorkoutFormValues) => {
      return await apiRequest(
        "PATCH", 
        `/api/workouts/${workoutId}`, 
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workouts/${workoutId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      setIsEditing(false);
      toast({
        title: "Workout updated",
        description: "Your workout has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating workout:", error);
      toast({
        title: "Error",
        description: "Failed to update workout. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for starting a workout
  const startWorkout = useMutation({
    mutationFn: async () => {
      return await apiRequest(
        "PATCH", 
        `/api/workouts/${workoutId}`, 
        { inProgress: true, completed: false }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workouts/${workoutId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Workout started",
        description: "Your workout has been started! Good luck!",
      });
    },
    onError: (error) => {
      console.error("Error starting workout:", error);
      toast({
        title: "Error",
        description: "Failed to start workout. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for completing a workout
  const completeWorkout = useMutation({
    mutationFn: async () => {
      return await apiRequest(
        "PATCH", 
        `/api/workouts/${workoutId}`, 
        { inProgress: false, completed: true }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workouts/${workoutId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      toast({
        title: "Workout completed",
        description: "Great job! Your workout has been completed successfully.",
      });
    },
    onError: (error) => {
      console.error("Error completing workout:", error);
      toast({
        title: "Error",
        description: "Failed to complete workout. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for deleting workout
  const deleteWorkout = useMutation({
    mutationFn: async () => {
      return await apiRequest(
        "DELETE", 
        `/api/workouts/${workoutId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      navigate("/workouts");
      toast({
        title: "Workout deleted",
        description: "Your workout has been deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting workout:", error);
      toast({
        title: "Error",
        description: "Failed to delete workout. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: WorkoutFormValues) => {
    updateWorkout.mutate(data);
  };
  
  // Confirm delete handler
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this workout? This action cannot be undone.")) {
      deleteWorkout.mutate();
    }
  };

  // Helper functions
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes > 0 ? remainingMinutes + ' minutes' : ''}`;
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      run: "Running",
      strength: "Strength Training",
      cycling: "Cycling",
      swimming: "Swimming",
      yoga: "Yoga",
      hiking: "Hiking",
    };
    return types[type.toLowerCase()] || type;
  };

  const getWorkoutIcon = (type: string) => {
    const icons: Record<string, string> = {
      run: "fa-running",
      strength: "fa-dumbbell",
      cycling: "fa-biking",
      swimming: "fa-swimmer",
      yoga: "fa-om",
      hiking: "fa-hiking",
      default: "fa-heartbeat"
    };
    
    const bgColors: Record<string, string> = {
      run: "bg-[#81C784]",
      strength: "bg-[#64B5F6]",
      cycling: "bg-[#FF8A65]",
      swimming: "bg-[#4FC3F7]",
      yoga: "bg-[#CE93D8]",
      hiking: "bg-[#FFD54F]",
      default: "bg-[#81C784]"
    };
    
    const iconColors: Record<string, string> = {
      run: "text-[#4CAF50]",
      strength: "text-[#2196F3]",
      cycling: "text-[#FF5722]",
      swimming: "text-[#03A9F4]",
      yoga: "text-[#9C27B0]",
      hiking: "text-[#FFC107]",
      default: "text-[#4CAF50]"
    };
    
    const key = type.toLowerCase();
    
    return {
      icon: icons[key] || icons.default,
      bgColor: bgColors[key] || bgColors.default,
      iconColor: iconColors[key] || iconColors.default
    };
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="px-4 py-6 md:px-8">
        <div className="text-center py-10">
          <div className="h-16 w-16 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-exclamation-triangle text-[#9E9E9E] text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-[#212121]">Workout not found</h3>
          <p className="text-[#616161] mt-1 mb-4">The workout you're looking for doesn't exist or has been removed</p>
          <Link href="/workouts" className="text-[#4CAF50] hover:text-[#388E3C]">
            <span className="flex items-center justify-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to workouts
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const { icon, bgColor, iconColor } = getWorkoutIcon(workout.type);

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="mb-6 flex items-center">
        <Link href="/workouts" className="mr-4 text-[#9E9E9E] hover:text-[#212121]">
          <ArrowLeft />
        </Link>
        <h2 className="text-2xl font-bold text-[#212121]">Workout Details</h2>
      </div>

      {/* Workout header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className={`flex-shrink-0 h-16 w-16 rounded-full ${bgColor} flex items-center justify-center`}>
              <i className={`fas ${icon} ${iconColor} text-2xl`}></i>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-medium text-[#212121]">{workout.title}</h3>
              <p className="text-[#616161]">{getTypeLabel(workout.type)}</p>
            </div>
          </div>
          <div className="md:ml-auto flex space-x-2">
            {isEditing ? (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 text-[#F44336]"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  type="button"
                  size="sm" 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={updateWorkout.isPending}
                  className="flex items-center gap-1 bg-[#4CAF50] hover:bg-[#388E3C]"
                >
                  {updateWorkout.isPending ? 'Saving...' : (
                    <>
                      <Save className="h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* Start/Finish Workout Buttons */}
                {!workout.completed && !workout.inProgress && (
                  <Button
                    size="sm"
                    onClick={() => startWorkout.mutate()}
                    disabled={startWorkout.isPending}
                    className="flex items-center gap-1 bg-[#4CAF50] hover:bg-[#388E3C] text-white"
                  >
                    {startWorkout.isPending ? 'Starting...' : (
                      <>
                        <Play className="h-4 w-4" />
                        Start Workout
                      </>
                    )}
                  </Button>
                )}
                
                {workout.inProgress && !workout.completed && (
                  <Button
                    size="sm"
                    onClick={() => completeWorkout.mutate()}
                    disabled={completeWorkout.isPending}
                    className="flex items-center gap-1 bg-[#FF9800] hover:bg-[#F57C00] text-white"
                  >
                    {completeWorkout.isPending ? 'Finishing...' : (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        Finish Workout
                      </>
                    )}
                  </Button>
                )}
                
                {/* Regular Edit/Delete Buttons */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-[#2196F3]"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleteWorkout.isPending}
                  className="flex items-center gap-1 text-[#F44336]"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteWorkout.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Workout details - Edit mode and View mode */}
      {isEditing ? (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="border-b border-[#E0E0E0] px-6 py-4">
            <h4 className="text-[#616161] text-sm font-medium">EDIT WORKOUT</h4>
          </div>
          <div className="px-6 py-4">
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workout Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter workout title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select workout type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="run">Running</SelectItem>
                            <SelectItem value="strength">Strength Training</SelectItem>
                            <SelectItem value="cycling">Cycling</SelectItem>
                            <SelectItem value="swimming">Swimming</SelectItem>
                            <SelectItem value="yoga">Yoga</SelectItem>
                            <SelectItem value="hiking">Hiking</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distance (meters)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="caloriesBurned"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calories Burned</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add workout notes or details" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="inProgress"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 text-[#FF9800] border-gray-300 rounded"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Mark as in progress</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="completed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 text-[#4CAF50] border-gray-300 rounded"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Mark as completed</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
        </div>
      ) : (
        <>
          {/* Workout details */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="border-b border-[#E0E0E0] px-6 py-4">
              <h4 className="text-[#616161] text-sm font-medium">WORKOUT DETAILS</h4>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-[#9E9E9E]">Date</p>
                  <p className="text-[#212121] font-medium">{formatDate(workout.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#9E9E9E]">Duration</p>
                  <p className="text-[#212121] font-medium">{formatDuration(workout.duration)}</p>
                </div>
                {workout.distance && (
                  <div>
                    <p className="text-sm text-[#9E9E9E]">Distance</p>
                    <p className="text-[#212121] font-medium">{(workout.distance / 1000).toFixed(2)} kilometers</p>
                  </div>
                )}
                {workout.caloriesBurned && (
                  <div>
                    <p className="text-sm text-[#9E9E9E]">Calories Burned</p>
                    <p className="text-[#212121] font-medium">{workout.caloriesBurned} kcal</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-[#9E9E9E]">Status</p>
                  <p className="text-[#212121] font-medium flex items-center">
                    {workout.completed ? (
                      <span className="flex items-center text-[#4CAF50]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Completed
                      </span>
                    ) : workout.inProgress ? (
                      <span className="flex items-center text-[#FF9800]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        In Progress
                      </span>
                    ) : (
                      <span className="flex items-center text-[#9E9E9E]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Not Started
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description section */}
          {workout.description && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="border-b border-[#E0E0E0] px-6 py-4">
                <h4 className="text-[#616161] text-sm font-medium">DESCRIPTION</h4>
              </div>
              <div className="px-6 py-4">
                <p className="text-[#212121] whitespace-pre-line">{workout.description}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorkoutDetail;