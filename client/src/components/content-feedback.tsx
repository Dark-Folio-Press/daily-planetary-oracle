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
import { MessageSquare, Star, Music, Sparkles, TrendingUp, Heart } from 'lucide-react';

const feedbackSchema = z.object({
  rating: z.enum(['1', '2', '3', '4', '5']),
  accuracy: z.enum(['very_accurate', 'mostly_accurate', 'somewhat_accurate', 'not_accurate']),
  helpfulness: z.enum(['very_helpful', 'somewhat_helpful', 'neutral', 'not_helpful']),
  comments: z.string().optional(),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

const ratingOptions = [
  { value: '1', label: '1', icon: '⭐' },
  { value: '2', label: '2', icon: '⭐⭐' },
  { value: '3', label: '3', icon: '⭐⭐⭐' },
  { value: '4', label: '4', icon: '⭐⭐⭐⭐' },
  { value: '5', label: '5', icon: '⭐⭐⭐⭐⭐' },
];

const accuracyOptions = [
  { value: 'very_accurate', label: 'Very Accurate', color: 'text-green-500' },
  { value: 'mostly_accurate', label: 'Mostly Accurate', color: 'text-blue-500' },
  { value: 'somewhat_accurate', label: 'Somewhat Accurate', color: 'text-yellow-500' },
  { value: 'not_accurate', label: 'Not Accurate', color: 'text-red-500' },
];

const helpfulnessOptions = [
  { value: 'very_helpful', label: 'Very Helpful', color: 'text-green-500' },
  { value: 'somewhat_helpful', label: 'Somewhat Helpful', color: 'text-blue-500' },
  { value: 'neutral', label: 'Neutral', color: 'text-gray-500' },
  { value: 'not_helpful', label: 'Not Helpful', color: 'text-red-500' },
];

const contentTypeLabels = {
  playlist: 'Playlist',
  horoscope: 'Horoscope',
  chart: 'Birth Chart Reading',
  transit: 'Transit Details',
};

const contentTypeIcons = {
  playlist: Music,
  horoscope: Sparkles,
  chart: TrendingUp,
  transit: Heart,
};

interface ContentFeedbackProps {
  contentType: 'playlist' | 'horoscope' | 'chart' | 'transit';
  contentId?: string;
  onClose?: () => void;
}

export default function ContentFeedback({ contentType, contentId, onClose }: ContentFeedbackProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const ContentIcon = contentTypeIcons[contentType];

  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
  });

  const saveFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackForm) => {
      // Format data to match backend API expectations
      const feedbackData = {
        contentType,
        contentId: contentId || null,
        accuracyRating: data.accuracy === 'very_accurate' ? 5 : 
                       data.accuracy === 'mostly_accurate' ? 4 : 
                       data.accuracy === 'somewhat_accurate' ? 3 : 2,
        helpfulnessRating: data.helpfulness === 'very_helpful' ? 5 : 
                          data.helpfulness === 'somewhat_helpful' ? 4 : 
                          data.helpfulness === 'neutral' ? 3 : 2,
        resonanceRating: parseInt(data.rating), // Overall rating 1-5
        feedback: data.comments || null,
        date: new Date().toISOString().split('T')[0], // Today's date
        tags: null
      };
      const response = await apiRequest('POST', '/api/feedback/content', feedbackData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! This helps us improve our cosmic recommendations.",
        duration: 4000,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
      form.reset();
      onClose?.();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: FeedbackForm) => {
    saveFeedbackMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 cosmic-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
            <ContentIcon className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl">Rate Your {contentTypeLabels[contentType]}</CardTitle>
          <CardDescription>
            Share your thoughts to help us improve our cosmic recommendations
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              {/* Overall Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Overall Rating</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-5 gap-3"
                      >
                        {ratingOptions.map((rating) => (
                          <FormItem key={rating.value} className="space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={rating.value}
                                id={`rating_${rating.value}`}
                                className="sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor={`rating_${rating.value}`}
                              className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                                field.value === rating.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-muted-foreground/20'
                              }`}
                            >
                              <span className="text-lg mb-1">{rating.icon}</span>
                              <span className="text-xs font-medium">{rating.label}</span>
                            </label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Accuracy */}
              <FormField
                control={form.control}
                name="accuracy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">How Accurate Was It?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-3"
                      >
                        {accuracyOptions.map((accuracy) => (
                          <FormItem key={accuracy.value} className="space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={accuracy.value}
                                id={`accuracy_${accuracy.value}`}
                                className="sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor={`accuracy_${accuracy.value}`}
                              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                                field.value === accuracy.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-muted-foreground/20'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full mr-3 ${accuracy.color} bg-current`} />
                              <span className="text-sm font-medium">{accuracy.label}</span>
                            </label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Helpfulness */}
              <FormField
                control={form.control}
                name="helpfulness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">How Helpful Was It?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-3"
                      >
                        {helpfulnessOptions.map((helpful) => (
                          <FormItem key={helpful.value} className="space-y-0">
                            <FormControl>
                              <RadioGroupItem
                                value={helpful.value}
                                id={`helpful_${helpful.value}`}
                                className="sr-only"
                              />
                            </FormControl>
                            <label
                              htmlFor={`helpful_${helpful.value}`}
                              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                                field.value === helpful.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-muted-foreground/20'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full mr-3 ${helpful.color} bg-current`} />
                              <span className="text-sm font-medium">{helpful.label}</span>
                            </label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comments */}
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Additional Comments (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Share any specific thoughts about what worked well or could be improved..."
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
                    disabled={saveFeedbackMutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={saveFeedbackMutation.isPending}
                  className="cosmic-gradient"
                >
                  {saveFeedbackMutation.isPending && <Sparkles className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Feedback
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}