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
          const response = await fetch(`/api/images/${imageId}`);
          const image = await response.json();
          const imageUrl = image.originalUrl;

          // Fetch the image data
          const imageResponse = await fetch(imageUrl);
          const blob = await imageResponse.blob();

          // Create object URL
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'instagram-photo.jpg';
          a.setAttribute('data-downloadurl', ['image/jpeg', a.download, a.href].join(':'));
          
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          toast({
            title: "Image ready",
            description: "Your image is being downloaded",
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