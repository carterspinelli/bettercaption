import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface InstagramProfileResponse {
  connected: boolean;
  username?: string;
  expiresAt?: string;
  message?: string;
}

export function InstagramConnectButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [location] = useLocation();

  // Query Instagram connection status
  const { data: profile, isLoading: isLoadingProfile } = useQuery<InstagramProfileResponse>({
    queryKey: ['/api/instagram/profile'],
    retry: false,
    refetchOnWindowFocus: false,
    onError: () => {
      // Silently handle error - user might not be connected
    }
  });

  // Check URL parameters for Instagram connection results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('instagram') === 'connected') {
      toast({
        title: "Instagram Connected!",
        description: "Your Instagram account has been successfully connected.",
        duration: 5000,
      });
      // Remove the query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh profile data
      queryClient.invalidateQueries({ queryKey: ['/api/instagram/profile'] });
      setIsLoading(false);
    } else if (params.get('error') === 'instagram-connection-failed') {
      const message = params.get('message') || 'Please try again later.';
      toast({
        title: "Instagram Connection Failed",
        description: `Could not connect your Instagram account: ${message}`,
        variant: "destructive",
        duration: 7000,
      });
      // Remove the query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsLoading(false);
    }
  }, [location, toast]);

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
    // Use the exact Instagram OAuth URL provided
    try {
      // Try opening in a popup window first
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        'https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=4197013223860242&redirect_uri=https://bettercaption-carterspinelli.replit.app/dashboard&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights',
        'Connect Instagram',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // If popup failed, fallback to direct navigation
        toast({
          title: "Popup Blocked",
          description: "Popup was blocked. Redirecting you directly to Instagram login.",
          duration: 3000,
        });

        // Wait a moment to show the toast before redirecting
        setTimeout(() => {
          window.location.href = 'https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=4197013223860242&redirect_uri=https://bettercaption-carterspinelli.replit.app/dashboard&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights';
        }, 1500);
      } else {
        // Set up a timer to check if the popup has been closed
        const checkPopupClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopupClosed);
            setIsLoading(false);
            queryClient.invalidateQueries({ queryKey: ['/api/instagram/profile'] });
          }
        }, 1000);

        // Set a timeout to stop checking after 2 minutes
        setTimeout(() => {
          clearInterval(checkPopupClosed);
          setIsLoading(false);
        }, 120000);
      }
    } catch (error) {
      console.error("Error opening Instagram auth page:", error);
      toast({
        title: "Connection Error",
        description: "Could not connect to Instagram. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
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