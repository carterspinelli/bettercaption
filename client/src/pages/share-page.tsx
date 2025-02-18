import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function SharePage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleShare = async () => {
      const imageId = searchParams.get('id');

      if (imageId) {
        try {
          // Fetch image details
          const response = await fetch(`/api/images/${imageId}`);
          const image = await response.json();
          const imageUrl = image.originalUrl;
          const caption = image.caption;

          // Fetch and save the image
          const imageResponse = await fetch(imageUrl);
          const blob = await imageResponse.blob();
          const url = window.URL.createObjectURL(blob);

          if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            // For mobile devices - show image
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.width = '100%';
            img.style.maxWidth = '500px';
            document.body.innerHTML = '';
            document.body.style.display = 'flex';
            document.body.style.justifyContent = 'center';
            document.body.style.alignItems = 'center';
            document.body.style.padding = '20px';
            document.body.appendChild(img);
            
            // Add download button
            const downloadBtn = document.createElement('button');
            downloadBtn.innerText = 'Save Image';
            downloadBtn.style.position = 'fixed';
            downloadBtn.style.bottom = '20px';
            downloadBtn.style.padding = '10px 20px';
            downloadBtn.style.backgroundColor = '#000';
            downloadBtn.style.color = '#fff';
            downloadBtn.style.border = 'none';
            downloadBtn.style.borderRadius = '5px';
            downloadBtn.onclick = () => {
              const link = document.createElement('a');
              link.href = url;
              link.download = 'instagram-photo.jpg';
              link.click();
            };
            document.body.appendChild(downloadBtn);
          } else {
            // For desktop
            const a = document.createElement('a');
            a.href = url;
            a.download = 'instagram-photo.jpg';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }

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
          console.error('Share error:', error);
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