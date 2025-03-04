import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Image } from "@shared/schema";
import { UploadZone } from "@/components/upload-zone";
import { EnhancedImageCard } from "@/components/enhanced-image-card";
import { Button } from "@/components/ui/button";
import { InstagramConnectButton } from "@/components/instagram-connect-button";
import { InstagramStylePreview } from "@/components/instagram-style-preview";
import { LogOut, Info } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
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
        <div className="space-y-8">
          {/* Instagram Connect Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold">Instagram Integration</h2>
                <div className="relative ml-2 group">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <div className="absolute left-0 -top-2 transform -translate-y-full w-64 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                    Connect your Instagram account to generate captions that match your personal style and get better engagement!
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your Instagram account to personalize your captions based on your posting style and improve engagement.
              </p>
              <InstagramConnectButton />
            </div>

            {/* Instagram Style Preview */}
            <InstagramStylePreview />
          </div>

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
        </div>
      </main>
    </div>
  );
}