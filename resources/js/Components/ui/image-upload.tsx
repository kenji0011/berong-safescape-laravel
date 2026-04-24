'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Copy, Check, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  key?: React.Key;
  onUploadComplete: (url: string) => void;
  title?: string;
  description?: string;
}

export function ImageUpload({ onUploadComplete, title = "Image Upload", description = "Upload an image to generate a URL" }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clean up preview URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 15MB)
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError('File size too large. Maximum 15MB allowed.');
        return;
      }

      setFile(selectedFile);
      setError(null);

      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setUploadUrl('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      const result = response.data;
      setUploadUrl(result.url);
      onUploadComplete(result.url);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = () => {
    if (uploadUrl) {
      navigator.clipboard.writeText(uploadUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith('image/')) {
        setError('Please drop an image file (JPEG, PNG, etc.)');
        return;
      }

      if (droppedFile.size > 15 * 1024 * 1024) {
        setError('File size too large. Maximum 15MB allowed.');
        return;
      }

      setFile(droppedFile);
      setError(null);

      // Create preview URL
      const url = URL.createObjectURL(droppedFile);
      setPreviewUrl(url);
      setUploadUrl('');
    }
  };

  return (
    <Card className="rounded-[1.5rem] border-[3px] border-slate-200 shadow-sm hover:shadow-[0_4px_0_#e2e8f0] overflow-hidden bg-white transition-all h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800">{title}</CardTitle>
        <CardDescription className="text-slate-500 font-medium">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2">
            <span className="text-sm font-bold text-red-700">{error}</span>
          </div>
        )}
        
        <div className={`grid gap-6 ${previewUrl || uploadUrl ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} h-full items-stretch`}>
          <div
            className="border-[3px] border-dashed border-slate-300 rounded-[1.5rem] p-6 text-center cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-all shadow-inner flex flex-col items-center justify-center min-h-[200px]"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="bg-white p-3 rounded-full shadow-sm border-2 border-slate-200">
                <Upload className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">
                  {file ? file.name : 'Click or drag image'}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  Max size: 15MB
                </p>
              </div>
            </div>
          </div>

          {(previewUrl || uploadUrl) && (
            <div className="flex flex-col items-center justify-between border-2 border-slate-200 bg-slate-50 rounded-[1.5rem] p-4 shadow-sm min-h-[200px]">
              {previewUrl && !uploadUrl && (
                <>
                  <div className="flex-1 w-full flex items-center justify-center bg-white rounded-xl border-2 border-slate-200 mb-4 overflow-hidden p-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-32 object-contain"
                    />
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full bg-[#d60000] text-white font-extrabold h-11 rounded-xl text-sm shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all"
                  >
                    {isUploading ? (
                      <>
                        <span className="mr-2">Uploading...</span>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" strokeWidth={2.5} />
                        Upload Image
                      </>
                    )}
                  </Button>
                </>
              )}

              {uploadUrl && (
                <>
                  <div className="flex-1 w-full flex items-center justify-center bg-white rounded-xl border-2 border-slate-200 mb-4 overflow-hidden p-2">
                    <img
                      src={uploadUrl}
                      alt="Uploaded"
                      className="max-h-32 object-contain"
                    />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <div className="w-full flex items-center justify-center gap-2 p-2.5 bg-green-50 border-2 border-green-200 rounded-xl">
                      <Check className="h-5 w-5 text-green-600" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-green-700">
                        Upload Success!
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
