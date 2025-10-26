import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GalleryImage } from '@/config/galleryImages';
import { Loader2 } from 'lucide-react';

const downloadSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number is too long")
    .regex(/^[\d\s\-\(\)\+]+$/, "Please enter a valid phone number")
});

type DownloadFormData = z.infer<typeof downloadSchema>;

interface DownloadDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DownloadFormData) => Promise<void>;
  downloadType: 'all' | 'selected';
  photoCount: number;
  selectedPhotos?: GalleryImage[];
}

const DownloadDataModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  downloadType, 
  photoCount,
  selectedPhotos 
}: DownloadDataModalProps) => {
  const { toast } = useToast();
  const form = useForm<DownloadFormData>({
    resolver: zodResolver(downloadSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: ''
    }
  });

  const handleSubmit = async (data: DownloadFormData) => {
    try {
      // Insert download record into database
      const { error: insertError } = await supabase
        .from('gallery_downloads')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          download_type: downloadType,
          photo_count: photoCount,
          selected_photos: downloadType === 'selected' 
            ? selectedPhotos?.map(p => ({ src: p.src, alt: p.alt })) 
            : null
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        toast({
          title: "Error saving data",
          description: "Your download will continue, but we couldn't save your information.",
          variant: "destructive"
        });
      }

      // Trigger the download
      await onSubmit(data);

      // Reset form
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Download Photos</DialogTitle>
          <DialogDescription>
            Please provide your information to download {photoCount} photo{photoCount !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="XXX-XXX-XXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 gap-2"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  'Download'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadDataModal;
