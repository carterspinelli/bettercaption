import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Image } from "@shared/schema";
import { UploadZone } from "@/components/upload-zone";
import { EnhancedImageCard } from "@/components/enhanced-image-card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: images = [] } = useQuery<Image[]>({
    queryKey: ["/api/images"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/images", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      toast({
        title: "Image uploaded!",
        description: "Your image has been successfully uploaded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bettercaption</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">
              {user?.username}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <UploadZone
          onUpload={(file) => uploadMutation.mutate(file)}
          isUploading={uploadMutation.isPending}
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <EnhancedImageCard key={image.id} image={image} />
          ))}
        </div>

        {images.length === 0 && !uploadMutation.isPending && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              No images yet. Upload one to get started!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}