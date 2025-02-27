import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Image } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InstagramShareButton } from "./instagram-share-button";

interface EnhancedImageCardProps {
  image: Image;
}

export function EnhancedImageCard({ image }: EnhancedImageCardProps) {
  const { toast } = useToast();

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
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4 p-6">
        <p className="text-sm text-muted-foreground">{image.caption}</p>
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