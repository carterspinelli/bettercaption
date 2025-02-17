
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Image } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: Image;
}

export function ShareModal({ isOpen, onClose, image }: ShareModalProps) {
  const { toast } = useToast();
  
  const handleDownload = () => {
    // Create temporary link to download image
    const link = document.createElement('a');
    link.href = image.originalUrl;
    link.download = 'enhanced-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Image downloaded",
      description: "The image has been saved to your device",
    });
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(image.caption);
    toast({
      title: "Caption copied!",
      description: "The caption has been copied to your clipboard.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share to Instagram</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex flex-col gap-2 w-full">
            <Button onClick={handleDownload} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Image
            </Button>
            <Button onClick={copyCaption} variant="outline" className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copy Caption
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            1. Download the image and copy the caption
            <br />
            2. Open Instagram and create a new post
            <br />
            3. Select the downloaded image and paste the caption
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
