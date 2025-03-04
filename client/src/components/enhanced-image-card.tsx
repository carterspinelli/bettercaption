import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Image } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Copy, Instagram, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InstagramShareButton } from "./instagram-share-button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { useQuery } from "@tanstack/react-query";

interface EnhancedImageCardProps {
  image: Image;
}

export function EnhancedImageCard({ image }: EnhancedImageCardProps) {
  const { toast } = useToast();

  // Check if user has Instagram connected to show personalization badge
  const { data: instagramProfile } = useQuery({
    queryKey: ['/api/instagram/profile'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const copyCaption = () => {
    navigator.clipboard.writeText(image.caption);
    toast({
      title: "Caption copied!",
      description: "The caption has been copied to your clipboard.",
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-square relative">
          <img
            src={image.enhancedUrl}
            alt="Enhanced"
            className="w-full h-full object-cover"
          />
          {instagramProfile?.connected && (
            <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1 border">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Instagram Style</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4 p-6">
        <div className="w-full">
          {instagramProfile?.connected && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                  <Instagram className="h-3 w-3" />
                  <span>Caption personalized for @{instagramProfile.username}</span>
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Personalized Caption</h4>
                  <p className="text-xs">
                    This caption has been tailored based on your Instagram posting style, content themes, and engagement patterns.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <p>The AI analyzes your:</p>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Caption length and tone</li>
                      <li>Content themes and interests</li>
                      <li>Hashtag usage patterns</li>
                      <li>Engagement metrics</li>
                    </ul>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
          <p className="text-sm text-muted-foreground">{image.caption}</p>
        </div>
        <div className="flex flex-col w-full gap-2">
          <InstagramShareButton image={image} />
          <Button
            variant="outline"
            className="w-full"
            onClick={copyCaption}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Caption
          </Button>
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">How to share to Instagram:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Share to Instagram" button</li>
              <li>Save the photo when prompted</li>
              <li>Open Instagram and create a new post</li>
              <li>Select the saved photo</li>
              <li>Paste the copied caption</li>
            </ol>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}