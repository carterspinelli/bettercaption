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
  // Create a compact share URL that only includes the image ID
  const createShareUrl = () => {
    const baseUrl = 'instagram://library?LocalIdentifier=';
    // We'll just pass the image ID - Instagram will handle the media selection
    return `${baseUrl}${image.id}&InstagramCaption=${encodeURIComponent(image.caption)}`;
  };

  const shareUrl = createShareUrl();

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
            level="M"
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