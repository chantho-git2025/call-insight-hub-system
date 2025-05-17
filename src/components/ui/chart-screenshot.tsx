
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';

interface ChartScreenshotProps {
  targetRef: React.RefObject<HTMLDivElement>;
  filename?: string;
}

const ChartScreenshot: React.FC<ChartScreenshotProps> = ({ 
  targetRef, 
  filename = 'chart-screenshot' 
}) => {
  const { toast } = useToast();

  const takeScreenshot = async () => {
    if (!targetRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      
      toast({
        title: "Capturing screenshot...",
        description: "Please wait a moment",
        variant: "default",
      });
      
      const canvas = await html2canvas(targetRef.current, {
        scale: 2, // Higher scale for better quality
        backgroundColor: null,
        logging: false
      });

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          toast({
            title: "Screenshot Failed",
            description: "Could not create image",
            variant: "destructive",
          });
          return;
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}-${new Date().toISOString().substring(0, 10)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Screenshot Captured",
          description: "Image has been downloaded",
          variant: "default",
        });
      });
    } catch (error) {
      console.error("Screenshot error:", error);
      toast({
        title: "Screenshot Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={takeScreenshot} 
      variant="outline" 
      size="icon"
      className="absolute top-2 right-2 z-10 bg-white shadow-md rounded-full h-8 w-8 p-1"
    >
      <Camera className="h-4 w-4 text-gray-600" />
      <span className="sr-only">Capture</span>
    </Button>
  );
};

export { ChartScreenshot };
