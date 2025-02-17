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
    const link = document.createElement('a');
    link.href = image.originalUrl;
    link.download = 'instagram-photo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Photo downloaded",
      description: "The photo has been saved to your device",
    });
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(image.caption);
    toast({
      title: "Caption copied",
      description: "The caption has been copied to your clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share to Instagram</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <QRCodeSVG
            value={window.location.href}
            size={256}
            level="M"
            includeMargin={true}
          />
          <div className="flex flex-col gap-2 w-full">
            <Button onClick={handleDownload} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Photo
            </Button>
            <Button onClick={copyCaption} variant="outline" className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copy Caption
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            1. Download the photo and copy the caption
            <br />
            2. Open Instagram and create a new post
            <br />
            3. Select the downloaded photo and paste the caption
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
}