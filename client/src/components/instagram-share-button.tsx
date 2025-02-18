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
        
        try {
          // Try to use the Web Share API first
          if (navigator.share && navigator.canShare) {
            const response = await fetch(image.originalUrl);
            const blob = await response.blob();
            const file = new File([blob], 'instagram-photo.jpg', { type: 'image/jpeg' });
            
            await navigator.share({
              files: [file],
              text: image.caption
            });
            
            toast({
              title: "Success!",
              description: "Photo ready to share on Instagram.",
            });
          } else {
            // Fallback for browsers without Web Share API
            const response = await fetch(image.originalUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'instagram-photo.jpg';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
              title: "Ready to share!",
              description: "Photo downloaded and caption copied to clipboard.",
            });
          }
        } catch (error) {
          console.error('Error sharing:', error);
          toast({
            title: "Error sharing",
            description: "There was a problem sharing the photo. Please try again.",
            variant: "destructive",
          });
        }

        // Open Instagram after a short delay
        setTimeout(() => {
          window.location.href = 'instagram://library';
        }, 1500);
      } catch (error) {
        toast({
          title: "Error sharing to Instagram",
          description: "There was a problem preparing the share. Please try again.",
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