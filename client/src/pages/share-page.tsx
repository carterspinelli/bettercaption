
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

export function SharePage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  useEffect(() => {
    const handleShare = async () => {
      const imageUrl = searchParams.get('image');
      const caption = searchParams.get('caption');
      
      if (!imageUrl || !caption) {
        toast({
          title: "Error",
          description: "Invalid share link",
          variant: "destructive",
        });
        return;
      }
      
      try {
        // Copy caption to clipboard
        await navigator.clipboard.writeText(decodeURIComponent(caption));
        
        // Download image
        const response = await fetch(decodeURIComponent(imageUrl));
        const blob = await response.blob();
        
        if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'instagram-photo.jpg', { type: 'image/jpeg' })] })) {
          await navigator.share({
            files: [new File([blob], 'instagram-photo.jpg', { type: 'image/jpeg' })],
          });
        } else {
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
          description: "✨ Photo saved and caption copied to clipboard. You can now create your Instagram post!",
          duration: 5000,
        });
        
        // Open Instagram
        setTimeout(() => {
          window.location.href = 'instagram://library';
        }, 1500);
        
      } catch (error) {
        toast({
          title: "Error",
          description: "There was a problem preparing the share. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    handleShare();
  }, [searchParams]);
  
  return (
    <div className="h-screen flex items-center justify-center p-4">
      <p className="text-center text-muted-foreground">
        Preparing your content for Instagram...
      </p>
    </div>
  );
}
