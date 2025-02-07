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
      // For mobile devices, create a more compact share URL
      const instagramUrl = `instagram://library?LocalIdentifier=${image.id}&InstagramCaption=${encodeURIComponent(image.caption)}`;

      try {
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
      } catch (error) {
        toast({
          title: "Error sharing to Instagram",
          description: "There was a problem opening Instagram. Please try again.",
          variant: "destructive",
        });
      }
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