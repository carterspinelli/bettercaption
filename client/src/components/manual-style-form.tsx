import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const styleFormSchema = z.object({
  captionLength: z.enum(["Short", "Medium", "Long"]),
  emojiUsage: z.enum(["Low", "Moderate", "High"]),
  captionTone: z.array(z.string()).min(1, "Select at least one tone"),
  themes: z.array(z.string()).min(1, "Select at least one theme"),
  useHashtags: z.boolean(),
});

type StyleFormValues = z.infer<typeof styleFormSchema>;

interface ManualStyleFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManualStyleForm({ isOpen, onClose }: ManualStyleFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StyleFormValues>({
    resolver: zodResolver(styleFormSchema),
    defaultValues: {
      captionLength: "Medium",
      emojiUsage: "Moderate",
      captionTone: ["Friendly", "Casual"],
      themes: ["Photography", "Lifestyle"],
      useHashtags: true,
    },
  });

  const saveStyleMutation = useMutation({
    mutationFn: async (data: StyleFormValues) => {
      const res = await fetch("/api/instagram/manual-style", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save style preferences");
      }

      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Style preferences saved",
        description: "Your caption personalization preferences have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/instagram/style-profile"] });
      setIsSubmitting(false);
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: StyleFormValues) => {
    setIsSubmitting(true);
    saveStyleMutation.mutate(data);
  };

  const toneOptions = [
    { id: "Friendly", label: "Friendly" },
    { id: "Casual", label: "Casual" },
    { id: "Professional", label: "Professional" },
    { id: "Humorous", label: "Humorous" },
    { id: "Inspirational", label: "Inspirational" },
    { id: "Educational", label: "Educational" },
    { id: "Formal", label: "Formal" },
    { id: "Promotional", label: "Promotional" },
  ];

  const themeOptions = [
    { id: "Travel", label: "Travel" },
    { id: "Fashion", label: "Fashion" },
    { id: "Food", label: "Food" },
    { id: "Fitness", label: "Fitness" },
    { id: "Business", label: "Business" },
    { id: "Art", label: "Art" },
    { id: "Tech", label: "Technology" },
    { id: "Nature", label: "Nature" },
    { id: "Lifestyle", label: "Lifestyle" },
    { id: "Beauty", label: "Beauty" },
    { id: "Photography", label: "Photography" },
    { id: "Personal", label: "Personal" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Customize Your Caption Style</DialogTitle>
          <DialogDescription>
            We couldn't analyze your Instagram posts automatically. Help us understand your
            preferences to personalize your captions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="captionLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Caption Length</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Short">Short (1-2 lines)</SelectItem>
                      <SelectItem value="Medium">Medium (3-5 lines)</SelectItem>
                      <SelectItem value="Long">Long (6+ lines)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How long do you usually make your captions?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emojiUsage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emoji Usage</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select emoji preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Low">Low (Few or no emojis)</SelectItem>
                      <SelectItem value="Moderate">Moderate (Occasional emojis)</SelectItem>
                      <SelectItem value="High">High (Lots of emojis)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often do you use emojis in your captions?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="captionTone"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Caption Tone</FormLabel>
                    <FormDescription>
                      Select the tones that best match your style
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {toneOptions.map((tone) => (
                      <FormField
                        key={tone.id}
                        control={form.control}
                        name="captionTone"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={tone.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(tone.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, tone.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== tone.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {tone.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="themes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Content Themes</FormLabel>
                    <FormDescription>
                      What themes do you typically post about?
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {themeOptions.map((theme) => (
                      <FormField
                        key={theme.id}
                        control={form.control}
                        name="themes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={theme.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(theme.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, theme.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== theme.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {theme.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="useHashtags"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Include Hashtags</FormLabel>
                    <FormDescription>
                      Should we add relevant hashtags to your captions?
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
