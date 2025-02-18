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

        // Fetch the image and create a blob
        const response = await fetch(image.originalUrl);
        const blob = await response.blob();
        
        // Try to use the Web Share API first
        if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'instagram-photo.jpg', { type: 'image/jpeg' })] })) {
          await navigator.share({
            files: [new File([blob], 'instagram-photo.jpg', { type: 'image/jpeg' })],
          });
          
          toast({
            title: "Success!",
            description: "1. Save the photo when prompted\n2. Open Instagram and create a new post\n3. Select the saved photo\n4. Paste the copied caption",
            duration: 5000,
          });
        } else {
          // Fallback for browsers that don't support sharing files
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'instagram-photo.jpg';
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast({
            title: "Photo saved!",
            description: "Caption copied. You can now create your Instagram post.",
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