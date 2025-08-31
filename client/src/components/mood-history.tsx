import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Calendar, TrendingUp, Heart, Moon, Sun, Activity, BookOpen, ArrowLeft, Edit2, Save, X, Star, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, subDays, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, getDay } from 'date-fns';
import { useState } from 'react';

const moodLabels = {
  1: { label: 'Deeply Troubled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  2: { label: 'Very Down', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  3: { label: 'Down', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  4: { label: 'Slightly Low', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  5: { label: 'Neutral', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  6: { label: 'Slightly Good', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  7: { label: 'Good', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  8: { label: 'Happy', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  9: { label: 'Very Happy', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  10: { label: 'Euphoric', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
};

const energyLabels = {
  1: { label: 'Completely Drained', color: 'bg-red-100 text-red-800' },
  2: { label: 'Very Drained', color: 'bg-red-100 text-red-800' },
  3: { label: 'Tired', color: 'bg-orange-100 text-orange-800' },
  4: { label: 'Slightly Tired', color: 'bg-orange-100 text-orange-800' },
  5: { label: 'Balanced', color: 'bg-gray-100 text-gray-800' },
  6: { label: 'Slightly Energetic', color: 'bg-blue-100 text-blue-800' },
  7: { label: 'Energetic', color: 'bg-green-100 text-green-800' },
  8: { label: 'Very Energetic', color: 'bg-green-100 text-green-800' },
  9: { label: 'Highly Energetic', color: 'bg-yellow-100 text-yellow-800' },
  10: { label: 'Bursting with Energy', color: 'bg-yellow-100 text-yellow-800' }
};

interface MoodHistoryProps {
  onClose: () => void;
}

export default function MoodHistory({ onClose }: MoodHistoryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  
  // New mood entry form state
  const [newMoodData, setNewMoodData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    mood: 5,
    energy: 5,
    emotions: '',
    journalEntry: ''
  });

  // Remove date filtering to show all user's mood entries
  const { data: moodHistory = [], isLoading } = useQuery({
    queryKey: ['/api/mood/history'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/mood/history');
      return response.json();
    }
  });

  // Mutation for updating mood entries
  const updateMoodMutation = useMutation({
    mutationFn: async ({ id, journalEntry }: { id: number, journalEntry: string }) => {
      const response = await apiRequest('PUT', `/api/mood/daily/${id}`, {
        journalEntry: journalEntry.trim()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood/history'] });
      setEditingId(null);
      setEditText('');
      toast({
        title: "Entry Updated",
        description: "Your mood journal entry has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update entry. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for creating new mood entries
  const createMoodMutation = useMutation({
    mutationFn: async (moodData: typeof newMoodData) => {
      const response = await apiRequest('POST', '/api/mood/daily', {
        date: moodData.date,
        mood: moodData.mood,
        energy: moodData.energy,
        emotions: moodData.emotions ? moodData.emotions.split(',').map(e => e.trim()).filter(e => e) : [],
        journalEntry: moodData.journalEntry.trim() || null
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood/history'] });
      setShowAddForm(false);
      setNewMoodData({
        date: format(new Date(), 'yyyy-MM-dd'),
        mood: 5,
        energy: 5,
        emotions: '',
        journalEntry: ''
      });
      toast({
        title: "Mood Entry Added",
        description: "Your mood entry has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Save",
        description: error.message || "Failed to save mood entry. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEditStart = (entry: any) => {
    setEditingId(entry.id);
    setEditText(entry.journalEntry || '');
  };

  const handleEditSave = () => {
    if (editingId) {
      updateMoodMutation.mutate({ id: editingId, journalEntry: editText.trim() });
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleNewMoodSubmit = () => {
    createMoodMutation.mutate(newMoodData);
  };

  const handleNewMoodCancel = () => {
    setShowAddForm(false);
    setNewMoodData({
      date: format(selectedDate, 'yyyy-MM-dd'),
      mood: 5,
      energy: 5,
      emotions: '',
      journalEntry: ''
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setNewMoodData({
      date: format(date, 'yyyy-MM-dd'),
      mood: 5,
      energy: 5,
      emotions: '',
      journalEntry: ''
    });
    setShowAddForm(false);
  };

  const handleEditExistingEntry = (entry: any) => {
    setSelectedDate(new Date(entry.date));
    setNewMoodData({
      date: entry.date,
      mood: entry.mood,
      energy: entry.energy,
      emotions: Array.isArray(entry.emotions) ? entry.emotions.join(', ') : '',
      journalEntry: entry.journalEntry || ''
    });
    setShowAddForm(true);
  };

  // Get existing entry for selected date
  const getEntryForDate = (date: Date) => {
    return moodHistory.find((entry: any) => 
      isSameDay(new Date(entry.date), date)
    );
  };

  // Get calendar days with proper week alignment
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd
    });
  };
  
  const calendarDays = getCalendarDays();

  // Calculate analytics
  const analytics = moodHistory.length > 0 ? {
    averageMood: Math.round((moodHistory.reduce((sum: number, entry: any) => sum + entry.mood, 0) / moodHistory.length) * 10) / 10,
    averageEnergy: Math.round((moodHistory.reduce((sum: number, entry: any) => sum + entry.energy, 0) / moodHistory.length) * 10) / 10,
    totalEntries: moodHistory.length,
    mostCommonMood: Object.entries(
      moodHistory.reduce((acc: any, entry: any) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      }, {})
    ).sort(([,a]: any, [,b]: any) => b - a)[0]?.[0],
    streak: calculateStreak(moodHistory),
    weeklyTrend: calculateWeeklyTrend(moodHistory)
  } : null;

  function calculateStreak(entries: any[]) {
    if (entries.length === 0) return 0;
    
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    let currentDate = new Date();
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  function calculateWeeklyTrend(entries: any[]) {
    const thisWeekStart = startOfWeek(new Date());
    const thisWeekEnd = endOfWeek(new Date());
    const lastWeekStart = startOfWeek(subDays(new Date(), 7));
    const lastWeekEnd = endOfWeek(subDays(new Date(), 7));

    const thisWeekEntries = entries.filter(entry => {
      const date = new Date(entry.date);
      return date >= thisWeekStart && date <= thisWeekEnd;
    });

    const lastWeekEntries = entries.filter(entry => {
      const date = new Date(entry.date);
      return date >= lastWeekStart && date <= lastWeekEnd;
    });

    if (thisWeekEntries.length === 0 || lastWeekEntries.length === 0) {
      return { trend: 'neutral', change: 0 };
    }

    const thisWeekAvg = thisWeekEntries.reduce((sum, entry) => sum + entry.mood, 0) / thisWeekEntries.length;
    const lastWeekAvg = lastWeekEntries.reduce((sum, entry) => sum + entry.mood, 0) / lastWeekEntries.length;
    
    const change = Math.round((thisWeekAvg - lastWeekAvg) * 10) / 10;
    
    return {
      trend: change > 0.2 ? 'improving' : change < -0.2 ? 'declining' : 'stable',
      change
    };
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 cosmic-gradient rounded-full flex items-center justify-center animate-spin">
          <Heart className="w-4 h-4 text-white" />
        </div>
        <span className="ml-3 text-muted-foreground">Loading your cosmic journey...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500" />
            Your Cosmic Mood Journey
          </h2>
          <p className="text-muted-foreground mt-1">
            Track your emotional patterns and cosmic alignment over time
          </p>
        </div>
        <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">{analytics.averageMood}/10</div>
              <div className="text-sm text-muted-foreground">Average Mood</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">{analytics.averageEnergy}/10</div>
              <div className="text-sm text-muted-foreground">Average Energy</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">{analytics.streak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">
                {analytics.weeklyTrend.trend === 'improving' ? '↗️' :
                 analytics.weeklyTrend.trend === 'declining' ? '↘️' : '→'}
              </div>
              <div className="text-sm text-muted-foreground">Weekly Trend</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendar Navigation and Entry Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Mood Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subDays(currentMonth, 30))}
                  data-testid="button-prev-month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                  disabled={isSameMonth(currentMonth, new Date())}
                  data-testid="button-next-month"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Click on any day to add or edit your mood entry
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-xs font-medium text-center text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const entry = getEntryForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);
                const isPastDate = day > new Date();
                const isCurrentMonth = isSameMonth(day, currentMonth);
                
                return (
                  <Button
                    key={index}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    className={`
                      h-10 p-1 relative text-xs
                      ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                      ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}
                      ${entry && isCurrentMonth ? 'bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800' : ''}
                      ${isPastDate ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      ${isSelected ? 'cosmic-gradient text-white' : ''}
                    `}
                    onClick={() => !isPastDate && isCurrentMonth && handleDateSelect(day)}
                    disabled={isPastDate || !isCurrentMonth}
                    data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{format(day, 'd')}</span>
                      {entry && isCurrentMonth && (
                        <div className="flex gap-0.5">
                          <div 
                            className="w-1 h-1 rounded-full bg-pink-500"
                            title={`Mood: ${entry.mood}/10`}
                          />
                          <div 
                            className="w-1 h-1 rounded-full bg-orange-500"
                            title={`Energy: ${entry.energy}/10`}
                          />
                        </div>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
            
            {/* Selected Date Info */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h4>
                {isToday(selectedDate) && (
                  <Badge variant="outline" className="text-xs">Today</Badge>
                )}
              </div>
              
              {(() => {
                const entry = getEntryForDate(selectedDate);
                if (entry) {
                  return (
                    <div className="space-y-2">
                      <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-pink-500" />
                          Mood: {entry.mood}/10
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-orange-500" />
                          Energy: {entry.energy}/10
                        </span>
                      </div>
                      {entry.emotions && entry.emotions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.emotions.map((emotion: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditExistingEntry(entry)}
                          data-testid="button-edit-entry"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit Entry
                        </Button>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        No mood entry for this day
                      </p>
                      <Button
                        size="sm"
                        className="cosmic-gradient"
                        onClick={() => setShowAddForm(true)}
                        disabled={selectedDate > new Date()}
                        data-testid="button-add-entry-for-date"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Entry
                      </Button>
                    </div>
                  );
                }
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Entry Form or Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {showAddForm ? 'Mood Entry' : 'Recent Entries'}
            </CardTitle>
            <CardDescription>
              {showAddForm 
                ? `Adding entry for ${format(selectedDate, 'MMMM d, yyyy')}`
                : 'Your latest mood tracking entries'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add Mood Entry Form */}
            {showAddForm ? (
              <div className="p-4 border rounded-lg bg-muted/30">
                <h3 className="font-medium mb-4">Add New Mood Entry</h3>
                <div className="space-y-4">
                  {/* Date Input */}
                  <div>
                    <Label htmlFor="mood-date">Date</Label>
                    <Input
                      id="mood-date"
                      type="date"
                      value={newMoodData.date}
                      onChange={(e) => setNewMoodData({ ...newMoodData, date: e.target.value })}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      data-testid="input-mood-date"
                    />
                  </div>

                  {/* Mood Slider */}
                  <div>
                    <Label htmlFor="mood-slider">Mood: {newMoodData.mood}/10 - {moodLabels[newMoodData.mood as keyof typeof moodLabels]?.label}</Label>
                    <div className="px-2 mt-2">
                      <Slider
                        id="mood-slider"
                        value={[newMoodData.mood]}
                        onValueChange={(value) => setNewMoodData({ ...newMoodData, mood: value[0] })}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                        data-testid="slider-mood"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1</span>
                        <span>5</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>

                  {/* Energy Slider */}
                  <div>
                    <Label htmlFor="energy-slider">Energy: {newMoodData.energy}/10 - {energyLabels[newMoodData.energy as keyof typeof energyLabels]?.label}</Label>
                    <div className="px-2 mt-2">
                      <Slider
                        id="energy-slider"
                        value={[newMoodData.energy]}
                        onValueChange={(value) => setNewMoodData({ ...newMoodData, energy: value[0] })}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                        data-testid="slider-energy"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1</span>
                        <span>5</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>

                  {/* Emotions Input */}
                  <div>
                    <Label htmlFor="emotions">Emotions (comma-separated)</Label>
                    <Input
                      id="emotions"
                      value={newMoodData.emotions}
                      onChange={(e) => setNewMoodData({ ...newMoodData, emotions: e.target.value })}
                      placeholder="happy, excited, grateful, anxious..."
                      data-testid="input-emotions"
                    />
                  </div>

                  {/* Journal Entry */}
                  <div>
                    <Label htmlFor="journal">Journal Entry (optional)</Label>
                    <Textarea
                      id="journal"
                      value={newMoodData.journalEntry}
                      onChange={(e) => setNewMoodData({ ...newMoodData, journalEntry: e.target.value })}
                      placeholder="How are you feeling today? Any synchronicities or cosmic insights?"
                      className="min-h-[80px]"
                      data-testid="textarea-journal"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={handleNewMoodCancel}
                      disabled={createMoodMutation.isPending}
                      data-testid="button-cancel-mood-entry"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleNewMoodSubmit}
                      disabled={createMoodMutation.isPending}
                      className="cosmic-gradient"
                      data-testid="button-save-mood-entry"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {createMoodMutation.isPending ? 'Saving...' : 'Save Entry'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {moodHistory.length === 0 
                    ? "No mood entries yet. Select a date from the calendar to start tracking!"
                    : "Select a date from the calendar to view or edit your mood entry."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}