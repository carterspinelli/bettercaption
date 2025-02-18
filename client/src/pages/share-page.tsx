
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function SharePage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  useEffect(() => {
    const handleShare = async () => {
      const imageUrl = searchParams.get('imageUrl');
      const caption = searchParams.get('caption');
      
      if (imageUrl && caption) {
        try {
          // Fetch and save the image
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'instagram-photo.jpg';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          // Copy caption to clipboard
          await navigator.clipboard.writeText(caption);
          
          toast({
            title: "Ready to share!",
            description: "Photo saved and caption copied to clipboard. You can now create your Instagram post!",
            duration: 5000,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "There was a problem preparing your share. Please try again.",
            variant: "destructive",
          });
        }
      }
    };
    
    handleShare();
  }, [searchParams, toast]);
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Preparing your Instagram share...</h1>
        <p className="text-muted-foreground">
          You can close this window after saving the photo.
        </p>
      </div>
    </div>
  );
}
