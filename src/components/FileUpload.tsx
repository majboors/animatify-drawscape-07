import { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
}

export const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      onUploadComplete(publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className="relative">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`fixed inset-0 z-50 transition-colors ${
          isDragging 
            ? 'bg-blue-500/20 pointer-events-auto' 
            : 'pointer-events-none hidden'
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-8 bg-white rounded-lg shadow-lg text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-medium">Drop your image here</p>
          </div>
        </div>
      </div>
      
      <div className="inline-block">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="file-upload"
          onChange={handleFileInput}
        />
        <label htmlFor="file-upload">
          <Button variant="outline" size="icon" className="cursor-pointer">
            <Upload className="h-4 w-4" />
          </Button>
        </label>
      </div>
    </div>
  );
};