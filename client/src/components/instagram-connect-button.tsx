import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface InstagramProfileResponse {
  connected: boolean;
  username?: string;
  expiresAt?: string;
  message?: string;
}

export function InstagramConnectButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Query Instagram connection status
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/instagram/profile'],
    retry: false,
    refetchOnWindowFocus: false,
    onError: () => {
      // Silently handle error - user might not be connected
    }
  });

  // Disconnect Instagram account
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/instagram/disconnect', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to disconnect Instagram account');
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Instagram Disconnected',
        description: 'Your Instagram account has been disconnected',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/instagram/profile'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Disconnection Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleConnect = () => {
    setIsLoading(true);
    window.location.href = '/api/auth/instagram';
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  if (isLoadingProfile) {
    return (
      <Button variant="outline" className="w-full" disabled>
        <Instagram className="mr-2 h-4 w-4" />
        Checking Instagram Connection...
      </Button>
    );
  }

  if (profile?.connected) {
    return (
      <div className="space-y-2">
        <div className="flex items-center px-3 py-2 border rounded-md bg-muted/30">
          <Instagram className="mr-2 h-4 w-4" />
          <div className="flex-1">
            <p className="text-sm font-medium">Connected to @{profile.username}</p>
            <p className="text-xs text-muted-foreground">
              Your captions are now personalized based on your Instagram style
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDisconnect}
            disabled={disconnectMutation.isPending}
          >
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleConnect}
      disabled={isLoading || disconnectMutation.isPending}
    >
      <Instagram className="mr-2 h-4 w-4" />
      {isLoading ? 'Connecting...' : 'Connect Instagram Account'}
    </Button>
  );
}
