import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, RefreshCw, Sparkles } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StyleProfileResponse {
  captionStyles: string[];
  commonThemes: string[];
  recommendedHashtags: string[];
  engagementInsights: {
    averageLikes: number;
    averageComments: number;
    totalPosts: number;
  };
  captionLengthPreference: string;
  emojiUsage: string;
  captionTone: string[];
  mentionFrequency: string;
  hashtagsPerPost: number;
}

export function InstagramStylePreview() {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  // Query Instagram profile to see if connected
  const { data: instagramProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/instagram/profile'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Get the user's Instagram style profile if connected
  const { data: styleProfile, isLoading: isLoadingStyle } = useQuery<StyleProfileResponse>({
    queryKey: ['/api/instagram/style-profile'],
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!instagramProfile?.connected,
  });

  // Mutation to refresh posts (to get latest Instagram style)
  const refreshPostsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/instagram/refresh-posts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error('Failed to refresh Instagram posts');
      }

      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Instagram Posts Refreshed',
        description: 'Your Instagram style information has been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/instagram/style-profile'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Refresh Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  if (!instagramProfile?.connected) {
    return null;
  }

  if (isLoadingProfile || isLoadingStyle) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-4 w-4" />
            <div className="h-6 w-40 bg-muted rounded"></div>
          </CardTitle>
          <CardDescription className="h-4 w-60 bg-muted rounded"></CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-4 w-4" />
          Your Instagram Style Profile
        </CardTitle>
        <CardDescription>
          This information is used to personalize your captions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {styleProfile ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Caption Style
                </h4>
                <div className="flex flex-wrap gap-1">
                  {styleProfile.captionStyles.map((style, index) => (
                    <span key={index} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      {style}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Content Themes</h4>
                <div className="flex flex-wrap gap-1">
                  {styleProfile.commonThemes.map((theme, index) => (
                    <span key={index} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {isExpanded && (
              <>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Writing Style</h4>
                    <ul className="text-xs space-y-1">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Caption Length:</span>
                        <span>{styleProfile.captionLengthPreference}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Emoji Usage:</span>
                        <span>{styleProfile.emojiUsage}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Tone:</span>
                        <span>{styleProfile.captionTone.slice(0, 2).join(', ')}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Mentions:</span>
                        <span>{styleProfile.mentionFrequency}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Hashtags/Post:</span>
                        <span>{styleProfile.hashtagsPerPost.toFixed(1)}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Engagement</h4>
                    <ul className="text-xs space-y-1">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Avg. Likes:</span>
                        <span>{styleProfile.engagementInsights.averageLikes.toFixed(0)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Avg. Comments:</span>
                        <span>{styleProfile.engagementInsights.averageComments.toFixed(1)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Total Posts:</span>
                        <span>{styleProfile.engagementInsights.totalPosts}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {styleProfile.recommendedHashtags.length > 0 && (
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">Your Popular Hashtags</h4>
                    <div className="flex flex-wrap gap-1">
                      {styleProfile.recommendedHashtags.slice(0, 8).map((hashtag, index) => (
                        <span key={index} className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => refreshPostsMutation.mutate()}
                disabled={refreshPostsMutation.isPending}
              >
                <RefreshCw className="h-3 w-3" />
                {refreshPostsMutation.isPending ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              No style profile available. We'll generate one based on your Instagram posts.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => refreshPostsMutation.mutate()}
              disabled={refreshPostsMutation.isPending}
            >
              <RefreshCw className="h-3 w-3" />
              {refreshPostsMutation.isPending ? 'Analyzing...' : 'Analyze My Posts'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
