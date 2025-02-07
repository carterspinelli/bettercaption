import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Image } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: Image;
}

export function ShareModal({ isOpen, onClose, image }: ShareModalProps) {
  // Create a URL that will deep link to Instagram with the image and caption
  const createInstagramShareUrl = () => {
    const baseUrl = 'instagram://library?AssetPath=';
    // In a production environment, we would need to first save the image to the user's
    // camera roll and then reference it here. For now, we'll demonstrate the flow.
    return `${baseUrl}${encodeURIComponent(image.enhancedUrl)}&InstagramCaption=${encodeURIComponent(image.caption)}`;
  };

  const shareUrl = createInstagramShareUrl();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share to Instagram</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <QRCodeSVG
            value={shareUrl}
            size={256}
            level="H"
            includeMargin={true}
          />
          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code with your phone's camera to open Instagram and create your post
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
