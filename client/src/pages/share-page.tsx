import { useEffect } from 'react';
import { useSearchParams, BrowserRouter } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

function SharePageContent() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleShare = async () => {
      const imageId = searchParams.get('id');

      if (imageId) {
        try {
          // First copy caption
          const response = await fetch(`/api/images/${imageId}`);
          const image = await response.json();
          await navigator.clipboard.writeText(image.caption);

          // Then trigger download
          window.location.href = `/api/images/${imageId}`;

          toast({
            title: "Ready to share!",
            description: "Image downloading and caption copied to clipboard",
            duration: 5000,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "There was a problem downloading the image. Please try again.",
            variant: "destructive",
          });
          console.error('Share error:', error);
        }
      }
    };

    handleShare();
  }, [searchParams, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Preparing your download...</h1>
        <p className="text-muted-foreground">
          Your image will download automatically.
        </p>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <BrowserRouter>
      <SharePageContent />
    </BrowserRouter>
  );
}