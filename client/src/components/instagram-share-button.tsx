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
      // For mobile devices, directly open Instagram
      const instagramUrl = `instagram://library?AssetPath=${encodeURIComponent(
        image.enhancedUrl
      )}&InstagramCaption=${encodeURIComponent(image.caption)}`;

      // Try to open Instagram app
      window.location.href = instagramUrl;

      // Set a timeout to check if the app was opened
      setTimeout(() => {
        // If we're still here after a short delay, Instagram might not be installed
        if (document.hidden) return; // User switched to Instagram
        
        toast({
          title: "Couldn't open Instagram",
          description: "Please make sure you have Instagram installed on your device.",
          variant: "destructive",
        });
      }, 2000);
    } else {
      // For desktop, show QR code modal
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
