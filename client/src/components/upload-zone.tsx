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
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        // Log file details for debugging
        console.log('File selected:', {
          name: acceptedFiles[0].name,
          type: acceptedFiles[0].type,
          size: acceptedFiles[0].size
        });

        if (acceptedFiles[0].size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please select an image under 5MB",
            variant: "destructive"
          });
          return;
        }

        if (!acceptedFiles[0].type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please select an image file",
            variant: "destructive"
          });
          return;
        }

        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic'], // Added .heic for iOS photos
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isUploading,
    multiple: false
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
          : "Drag & drop an image here, or click to select"}
      </p>
    </div>
  );
}