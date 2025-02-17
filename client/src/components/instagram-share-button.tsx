
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShareModal } from "./share-modal";
import { Image } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface InstagramShareButtonProps {
  image: Image;
}

export function InstagramShareButton({ image }: InstagramShareButtonProps) {
  const isMobile = useIsMobile();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (isMobile) {
      try {
        // Copy caption to clipboard
        await navigator.clipboard.writeText(image.caption);
        
        // Download image
        const link = document.createElement('a');
        link.href = image.originalUrl;
        link.download = 'enhanced-image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Open Instagram
        setTimeout(() => {
          window.location.href = 'instagram://library';
        }, 1000);
        
      } catch (error) {
        toast({
          title: "Error sharing to Instagram",
          description: "There was a problem preparing the share. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleShare}
        variant="secondary"
        className="w-full"
      >
        <Instagram className="mr-2 h-4 w-4" />
        Share to Instagram
      </Button>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        image={image}
      />
    </>
  );
}
