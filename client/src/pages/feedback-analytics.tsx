import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { Music, Sparkles, TrendingUp, Heart, MessageSquare, Users, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useLocation } from 'wouter';

interface ContentFeedback {
  id: number;
  userId: string;
  contentType: string;
  contentId: string | null;
  accuracyRating: number | null;
  resonanceRating: number | null;
  helpfulnessRating: number | null;
  feedback: string | null;
  tags: string[] | null;
  date: string;
  createdAt: string;
}

const contentTypeLabels = {
  playlist: 'Playlists',
  horoscope: 'Horoscopes',
  chart: 'Birth Chart Readings',
  transit: 'Transit Details',
};

const contentTypeIcons = {
  playlist: Music,
  horoscope: Sparkles,
  chart: TrendingUp,
  transit: Heart,
};

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];

export default function FeedbackAnalytics() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: feedbackData, isLoading } = useQuery<ContentFeedback[]>({
    queryKey: ['/api/feedback/content'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to view feedback analytics</p>
            <Button onClick={() => setLocation('/login')} className="cosmic-gradient">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-pulse" />
          <p className="text-muted-foreground">Loading feedback analytics...</p>
        </div>
      </div>
    );
  }

  // Process feedback data for analytics
  const feedbackStats = feedbackData ? {
    total: feedbackData.length,
    byType: Object.entries(
      feedbackData.reduce((acc, item) => {
        acc[item.contentType] = (acc[item.contentType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([type, count]) => ({
      type,
      count,
      label: contentTypeLabels[type as keyof typeof contentTypeLabels] || type,
    })),
    averageRatings: Object.entries(
      feedbackData.reduce((acc, item) => {
        if (!acc[item.contentType]) {
          acc[item.contentType] = { accuracy: [], resonance: [], helpfulness: [] };
        }
        if (item.accuracyRating) acc[item.contentType].accuracy.push(item.accuracyRating);
        if (item.resonanceRating) acc[item.contentType].resonance.push(item.resonanceRating);
        if (item.helpfulnessRating) acc[item.contentType].helpfulness.push(item.helpfulnessRating);
        return acc;
      }, {} as Record<string, { accuracy: number[], resonance: number[], helpfulness: number[] }>)
    ).map(([type, ratings]) => ({
      type,
      label: contentTypeLabels[type as keyof typeof contentTypeLabels] || type,
      accuracy: ratings.accuracy.length > 0 ? (ratings.accuracy.reduce((a, b) => a + b, 0) / ratings.accuracy.length).toFixed(1) : 'N/A',
      resonance: ratings.resonance.length > 0 ? (ratings.resonance.reduce((a, b) => a + b, 0) / ratings.resonance.length).toFixed(1) : 'N/A',
      helpfulness: ratings.helpfulness.length > 0 ? (ratings.helpfulness.reduce((a, b) => a + b, 0) / ratings.helpfulness.length).toFixed(1) : 'N/A',
    })),
    recentFeedback: feedbackData.slice(0, 10).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')} 
            className="mb-4"
            data-testid="button-back-home"
          >
            ← Back to Chat
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Content Feedback Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            View user feedback trends and content performance insights
          </p>
        </div>

        {!feedbackStats || feedbackStats.total === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Feedback Data Yet</h3>
              <p className="text-muted-foreground">
                User feedback will appear here once content has been rated
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="ratings" data-testid="tab-ratings">Ratings</TabsTrigger>
              <TabsTrigger value="trends" data-testid="tab-trends">Trends</TabsTrigger>
              <TabsTrigger value="comments" data-testid="tab-comments">Comments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{feedbackStats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      User responses collected
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Content Types</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{feedbackStats.byType.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Different content types rated
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {feedbackData && feedbackData.length > 0 ? (
                        (feedbackData
                          .filter(f => f.resonanceRating)
                          .reduce((sum, f) => sum + (f.resonanceRating || 0), 0) / 
                         feedbackData.filter(f => f.resonanceRating).length).toFixed(1)
                      ) : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Overall user satisfaction
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback by Content Type</CardTitle>
                    <CardDescription>Distribution of feedback across different content types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={feedbackStats.byType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ label, value }) => `${label}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {feedbackStats.byType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average Ratings by Type</CardTitle>
                    <CardDescription>How different content types perform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={feedbackStats.averageRatings}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" fontSize={12} />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Bar dataKey="accuracy" fill="#8b5cf6" name="Accuracy" />
                        <Bar dataKey="resonance" fill="#ec4899" name="Resonance" />
                        <Bar dataKey="helpfulness" fill="#06b6d4" name="Helpfulness" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ratings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {feedbackStats.byType.map((contentType, index) => {
                  const Icon = contentTypeIcons[contentType.type as keyof typeof contentTypeIcons] || MessageSquare;
                  const avgData = feedbackStats.averageRatings.find(r => r.type === contentType.type);
                  
                  return (
                    <Card key={contentType.type}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-5 w-5 text-purple-500" />
                            <CardTitle className="text-sm">{contentType.label}</CardTitle>
                          </div>
                          <Badge variant="secondary">{contentType.count}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Accuracy:</span>
                            <span className="font-medium">{avgData?.accuracy}/5</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Resonance:</span>
                            <span className="font-medium">{avgData?.resonance}/5</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Helpfulness:</span>
                            <span className="font-medium">{avgData?.helpfulness}/5</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                  <CardDescription>How users rate different aspects of content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['accuracy', 'resonance', 'helpfulness'].map((metric) => {
                      const ratings = feedbackData?.map(f => f[`${metric}Rating` as keyof ContentFeedback] as number).filter(Boolean) || [];
                      const distribution = [1, 2, 3, 4, 5].map(rating => ({
                        rating,
                        count: ratings.filter(r => r === rating).length
                      }));

                      return (
                        <div key={metric}>
                          <h4 className="font-medium mb-3 capitalize">{metric} Ratings</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={distribution}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="rating" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count" fill="#8b5cf6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Feedback Comments</CardTitle>
                  <CardDescription>Latest user feedback and suggestions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedbackStats.recentFeedback.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No written feedback yet</p>
                      </div>
                    ) : (
                      feedbackStats.recentFeedback
                        .filter(feedback => feedback.feedback)
                        .map((feedback) => {
                          const Icon = contentTypeIcons[feedback.contentType as keyof typeof contentTypeIcons] || MessageSquare;
                          
                          return (
                            <div key={feedback.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Icon className="h-4 w-4 text-purple-500" />
                                  <Badge variant="outline">
                                    {contentTypeLabels[feedback.contentType as keyof typeof contentTypeLabels] || feedback.contentType}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(feedback.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex space-x-2 text-xs">
                                  {feedback.accuracyRating && (
                                    <Badge variant="secondary">Accuracy: {feedback.accuracyRating}/5</Badge>
                                  )}
                                  {feedback.resonanceRating && (
                                    <Badge variant="secondary">Rating: {feedback.resonanceRating}/5</Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {feedback.feedback}
                              </p>
                            </div>
                          );
                        })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}