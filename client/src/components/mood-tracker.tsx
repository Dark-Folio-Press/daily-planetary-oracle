import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Smile, Meh, Frown, Angry, Star, Sparkles } from 'lucide-react';

const moodSchema = z.object({
  overall_mood: z.enum(['very_positive', 'positive', 'neutral', 'negative', 'very_negative']),
  energy_level: z.enum(['very_high', 'high', 'medium', 'low', 'very_low']),
  stress_level: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
  sleep_quality: z.enum(['excellent', 'good', 'fair', 'poor', 'very_poor']),
  notes: z.string().optional(),
});

type MoodForm = z.infer<typeof moodSchema>;

const moodOptions = [
  { value: 'very_positive', label: 'Euphoric', icon: Star, color: 'text-yellow-500' },
  { value: 'positive', label: 'Happy', icon: Smile, color: 'text-green-500' },
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-gray-500' },
  { value: 'negative', label: 'Down', icon: Frown, color: 'text-orange-500' },
  { value: 'very_negative', label: 'Troubled', icon: Angry, color: 'text-red-500' },
];

const energyOptions = [
  { value: 'very_high', label: 'Bursting', color: 'text-red-500' },
  { value: 'high', label: 'Energetic', color: 'text-orange-500' },
  { value: 'medium', label: 'Balanced', color: 'text-yellow-500' },
  { value: 'low', label: 'Tired', color: 'text-blue-500' },
  { value: 'very_low', label: 'Drained', color: 'text-purple-500' },
];

const stressOptions = [
  { value: 'very_low', label: 'Zen', color: 'text-green-500' },
  { value: 'low', label: 'Calm', color: 'text-blue-400' },
  { value: 'medium', label: 'Balanced', color: 'text-yellow-500' },
  { value: 'high', label: 'Tense', color: 'text-orange-500' },
  { value: 'very_high', label: 'Overwhelmed', color: 'text-red-500' },
];

const sleepOptions = [
  { value: 'excellent', label: 'Excellent', color: 'text-green-500' },
  { value: 'good', label: 'Good', color: 'text-blue-500' },
  { value: 'fair', label: 'Fair', color: 'text-yellow-500' },
  { value: 'poor', label: 'Poor', color: 'text-orange-500' },
  { value: 'very_poor', label: 'Very Poor', color: 'text-red-500' },
];

interface MoodTrackerProps {
  onClose?: () => void;
}

export default function MoodTracker({ onClose }: MoodTrackerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MoodForm>({
    resolver: zodResolver(moodSchema),
  });

  const saveMoodMutation = useMutation({
    mutationFn: async (data: MoodForm) => {
      // Format data to match backend API expectations
      const moodData = {
        date: new Date().toISOString().split('T')[0], // Today's date
        mood: data.overall_mood === 'very_negative' ? 1 : 
              data.overall_mood === 'negative' ? 2 : 
              data.overall_mood === 'neutral' ? 3 : 
              data.overall_mood === 'positive' ? 4 : 5,
        energy: data.energy_level === 'very_low' ? 1 : 
                data.energy_level === 'low' ? 2 : 
                data.energy_level === 'medium' ? 3 : 
                data.energy_level === 'high' ? 4 : 5,
        emotions: [data.stress_level, data.sleep_quality],
        journalEntry: data.notes || ''
      };
      const response = await apiRequest('POST', '/api/mood/daily', moodData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mood Tracked Successfully",
        description: "Your daily cosmic vibrations have been recorded! This helps us tailor better recommendations for you.",
        duration: 4000,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mood'] });
      form.reset();
      onClose?.();
    },
    onError: (error: any) => {
      toast({
        title: "Tracking Failed",
        description: error.message || "Failed to save your mood. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: MoodForm) => {
    saveMoodMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 cosmic-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl">Daily Mood Tracker</CardTitle>
          <CardDescription>
            Capture your cosmic vibrations to help our AI tailor better recommendations for your journey
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              {/* Overall Mood */}
              <FormField
                control={form.control}
                name="overall_mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Overall Mood</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-5 gap-3"
                      >
                        {moodOptions.map((mood) => (
                          <FormItem key={mood.value} className="space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={mood.value}
                                id={mood.value}
                                className="sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor={mood.value}
                              className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                                field.value === mood.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-muted-foreground/20'
                              }`}
                            >
                              <mood.icon className={`w-6 h-6 mb-1 ${mood.color}`} />
                              <span className="text-xs font-medium">{mood.label}</span>
                            </label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Energy Level */}
              <FormField
                control={form.control}
                name="energy_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Energy Level</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-5 gap-3"
                      >
                        {energyOptions.map((energy) => (
                          <FormItem key={energy.value} className="space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={energy.value}
                                id={`energy_${energy.value}`}
                                className="sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor={`energy_${energy.value}`}
                              className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                                field.value === energy.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-muted-foreground/20'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full mb-1 ${energy.color} bg-current`} />
                              <span className="text-xs font-medium">{energy.label}</span>
                            </label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stress Level */}
              <FormField
                control={form.control}
                name="stress_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Stress Level</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-5 gap-3"
                      >
                        {stressOptions.map((stress) => (
                          <FormItem key={stress.value} className="space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={stress.value}
                                id={`stress_${stress.value}`}
                                className="sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor={`stress_${stress.value}`}
                              className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                                field.value === stress.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-muted-foreground/20'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full mb-1 ${stress.color} bg-current`} />
                              <span className="text-xs font-medium">{stress.label}</span>
                            </label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sleep Quality */}
              <FormField
                control={form.control}
                name="sleep_quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Sleep Quality</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-5 gap-3"
                      >
                        {sleepOptions.map((sleep) => (
                          <FormItem key={sleep.value} className="space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={sleep.value}
                                id={`sleep_${sleep.value}`}
                                className="sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor={`sleep_${sleep.value}`}
                              className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                                field.value === sleep.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-muted-foreground/20'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full mb-1 ${sleep.color} bg-current`} />
                              <span className="text-xs font-medium">{sleep.label}</span>
                            </label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Daily Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Share any thoughts, dreams, or observations about your day..."
                        className="min-h-[100px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                {onClose && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    disabled={saveMoodMutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={saveMoodMutation.isPending}
                  className="cosmic-gradient"
                >
                  {saveMoodMutation.isPending && <Sparkles className="w-4 h-4 mr-2 animate-spin" />}
                  Track My Mood
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}