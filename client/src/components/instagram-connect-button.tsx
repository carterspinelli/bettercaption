import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface InstagramProfileResponse {
  connected: boolean;
  username?: string;
  expiresAt?: string;
  message?: string;
}

const usernameSchema = z.object({
  username: z.string().min(1, "Username is required")
});

type UsernameFormValues = z.infer<typeof usernameSchema>;

export function InstagramConnectButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [location] = useLocation();
  const [isUsernameDialogOpen, setIsUsernameDialogOpen] = useState(false);

  // Setup form
  const form = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: ""
    }
  });

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

  // Connect by username mutation
  const connectByUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await fetch('/api/instagram/connect-by-username', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });

      if (!res.ok) {
        throw new Error('Failed to connect Instagram account by username');
      }

      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Instagram Connected',
        description: 'Your Instagram account has been connected by username',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/instagram/profile'] });
      setIsUsernameDialogOpen(false);
      setIsLoading(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
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
    // Open the username dialog instead of using OAuth
    setIsUsernameDialogOpen(true);
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const onSubmitUsername = (values: UsernameFormValues) => {
    setIsLoading(true);
    connectByUsernameMutation.mutate(values.username);
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
    <>
      <Button
        variant="outline"
        className="w-full"
        onClick={handleConnect}
        disabled={isLoading || connectByUsernameMutation.isPending}
      >
        <Instagram className="mr-2 h-4 w-4" />
        {isLoading ? 'Connecting...' : 'Connect Instagram Account'}
      </Button>

      <Dialog open={isUsernameDialogOpen} onOpenChange={setIsUsernameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Instagram Account</DialogTitle>
            <DialogDescription>
              Enter your Instagram username to connect your account. This will help us personalize captions based on your Instagram style.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitUsername)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="@yourusername" 
                        {...field} 
                        value={field.value}
                        onChange={(e) => {
                          // Remove @ if user types it
                          const value = e.target.value.replace('@', '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsUsernameDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || connectByUsernameMutation.isPending}
                >
                  {isLoading || connectByUsernameMutation.isPending ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}