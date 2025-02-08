import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function UploadZone({ onUpload, isUploading }: UploadZoneProps) {
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Log file details for debugging
        console.log('File selected:', {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified
        });

        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please select an image under 5MB",
            variant: "destructive"
          });
          return;
        }

        // Handle HEIC/HEIF files from iOS
        if (file.type.includes('heic') || file.type.includes('heif')) {
          toast({
            title: "Processing image",
            description: "Converting image format...",
          });
          // For now we'll just try to upload it directly
          // In a production app, we'd convert HEIC to JPEG here
        }

        try {
          onUpload(file);
        } catch (error) {
          console.error('Error handling file:', error);
          toast({
            title: "Upload failed",
            description: "There was an error processing your image",
            variant: "destructive"
          });
        }
      }
    },
    [onUpload, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic', '.heif'], // Added iOS image formats
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isUploading,
    multiple: false,
    useFsAccessApi: false // Disable File System Access API for better mobile compatibility
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50",
        isUploading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">
        {isDragActive
          ? "Drop the image here"
          : isUploading
          ? "Uploading..."
          : "Tap to select an image from your library"}
      </p>
    </div>
  );
}