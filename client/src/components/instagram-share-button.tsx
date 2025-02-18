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
        
        // Download image using fetch
        const response = await fetch(image.originalUrl);
        const blob = await response.blob();
        
        // Try to save the image using native sharing
        if (navigator.share) {
          await navigator.share({
            files: [new File([blob], 'instagram-photo.jpg', { type: 'image/jpeg' })],
            text: image.caption
          });
        } else {
          // Fallback for browsers that don't support native sharing
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'instagram-photo.jpg';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }

        toast({
          title: "Ready to share!",
          description: "Photo ready for sharing.",
        });

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