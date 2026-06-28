'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Check, ImageIcon, RotateCcw, AlertCircle, Move, Search } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';
import { Slider } from '@/components/ui/slider';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  title?: string;
  description?: string;
  overlayTitle?: string;
  overlayAlt?: string;
  enableCropping?: boolean;
  aspect?: number;
  minWidth?: number;
  minHeight?: number;
  recommendedResolution?: string;
}

export function ImageUpload({ 
  onUploadComplete, 
  title = "Carousel Image", 
  description = "Upload image for the hero carousel", 
  overlayTitle, 
  overlayAlt,
  enableCropping = true,
  aspect = 16 / 9,
  minWidth = 1920,
  minHeight = 1080,
  recommendedResolution
}: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageDimensions, setImageDimensions] = useState<{ w: number; h: number } | null>(null);
  
  // Cropper State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (selectedFile.size > 15 * 1024 * 1024) {
      setError('File too large (max 15MB)');
      return;
    }

    setError(null);
    const url = URL.createObjectURL(selectedFile);
    const img = new window.Image();
    img.onload = () => {
      setImageDimensions({ w: img.naturalWidth, h: img.naturalHeight });
      setFile(selectedFile);
      setPreviewUrl(url);
      setUploadUrl('');
    };
    img.src = url;
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleUpload = async () => {
    if (!file || !previewUrl) return;
    if (enableCropping && !croppedAreaPixels) return;

    setIsUploading(true);
    setError(null);

    try {
      let fileToUpload: File | Blob = file;

      if (enableCropping) {
        // Perform client-side crop to get a lossless PNG file
        const croppedFile = await getCroppedImg(previewUrl, croppedAreaPixels);
        if (!croppedFile) {
          throw new Error("Could not crop image");
        }
        fileToUpload = croppedFile;
      }

      // Upload the file
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const response = await axios.post('/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadUrl(response.data.url);
      onUploadComplete(response.data.url);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadUrl('');
    setError(null);
    setImageDimensions(null);
  };

  return (
    <Card className="rounded-[2rem] border-[3px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 backdrop-blur-md shadow-[0_8px_0_#cbd5e1] dark:shadow-[0_8px_0_#0f172a] overflow-hidden transition-all h-full flex flex-col">
      <CardHeader className="relative">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">{title}</CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">{description}</CardDescription>
          {recommendedResolution && (
            <p className="text-[10px] font-bold text-red-500/80 dark:text-red-400/80 uppercase tracking-wider mt-1">
              Recommended: {recommendedResolution}
            </p>
          )}
        </div>
        
        {imageDimensions && (
          <div className={`absolute top-6 right-6 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-inner ${
            imageDimensions.w < minWidth ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
          }`}>
            {imageDimensions.w < minWidth && <AlertCircle className="h-3.5 w-3.5" />}
            {imageDimensions.w} × {imageDimensions.h}PX
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0">
        {error && (
          <div className="mb-4 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="relative flex-1 min-h-[300px]">
          {!(previewUrl || uploadUrl) ? (
            <div
              className="absolute inset-0 border-3 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300 group/upload bg-slate-50/50 dark:bg-slate-800/30"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); processFile(e.dataTransfer.files[0]); }}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 group-hover/upload:text-red-500 group-hover/upload:scale-110 transition-all duration-300 shadow-sm border-2 border-transparent group-hover/upload:border-red-100 dark:group-hover/upload:border-red-900">
                <Upload className="h-8 w-8" strokeWidth={2.5} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-white">Click or drag image to upload</p>
                <p className="text-[10px] text-slate-400 font-medium tracking-normal">Max size: 15MB</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full gap-4">
              <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-900 shadow-2xl group/cropper">
                {uploadUrl ? (
                  <img 
                    src={uploadUrl} 
                    className="w-full h-full object-cover" 
                    alt="Uploaded" 
                  />
                ) : enableCropping ? (
                  <div className="absolute inset-0">
                    <Cropper
                      image={previewUrl!}
                      crop={crop}
                      zoom={zoom}
                      aspect={aspect}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                      classes={{
                        containerClassName: "rounded-[2.5rem]",
                        mediaClassName: "rounded-[2.5rem]",
                        cropAreaClassName: "rounded-[2.5rem] border-[3px] border-white/80 shadow-[0_0_0_9999em_rgba(15,23,42,0.8)]",
                      }}
                    />
                    
                  </div>
                ) : (
                  <img 
                    src={previewUrl!} 
                    className="w-full h-full object-contain" 
                    alt="Preview" 
                  />
                )}
                
                {uploadUrl && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-slate-900/90 px-6 py-3 rounded-full flex items-center gap-3 text-green-600 font-black shadow-2xl border border-white/20 animate-in zoom-in-90 duration-300">
                      <Check className="h-6 w-6" strokeWidth={4} />
                      <span className="uppercase tracking-widest text-sm">Published Successfully</span>
                    </div>
                  </div>
                )}
              </div>

              {!uploadUrl && enableCropping && (
                <div className="flex items-center justify-center gap-3 sm:gap-4 bg-slate-100 dark:bg-slate-800/80 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-700 w-full shadow-sm mt-2">
                  <div className="flex items-center gap-3 sm:gap-4 w-full max-w-[400px]">
                    <Search className="h-5 w-5 text-slate-500 shrink-0" />
                    <Slider
                      value={[zoom]}
                      min={1}
                      max={3}
                      step={0.01}
                      onValueChange={(vals) => setZoom(vals[0])}
                      className="w-full cursor-grab active:cursor-grabbing"
                    />
                  </div>
                  <div className="w-[2px] h-8 bg-slate-300 dark:bg-slate-600 mx-2 shrink-0" />
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-white font-black text-xs sm:text-sm uppercase tracking-widest shrink-0">
                    <Move className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 dark:text-yellow-400 animate-pulse" />
                    <span className="hidden sm:inline">Drag to Pan</span>
                    <span className="sm:hidden">Pan</span>
                  </div>
                </div>
              )}

              {!uploadUrl ? (
                <div className="flex gap-2 mt-auto">
                  <Button 
                    variant="ghost" 
                    onClick={reset} 
                    className="w-fit bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black px-6 pb-2 pt-2.5 rounded-xl text-xs shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#1e293b] hover:bg-slate-300 dark:hover:bg-slate-700 hover:-translate-y-0.5 hover:shadow-[0_6px_0_#cbd5e1] dark:hover:shadow-[0_6px_0_#1e293b] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpload} 
                    disabled={isUploading}
                    className="w-fit bg-[#d60000] hover:bg-[#d60000] text-white font-black px-6 pb-2 pt-2.5 rounded-xl text-xs shadow-[0_4px_0_#991b1b] hover:-translate-y-0.5 hover:shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-[0_0px_0_#991b1b] transition-all uppercase tracking-widest"
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" strokeWidth={3} />
                        {enableCropping ? 'Apply & Upload' : 'Upload Image'}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" onClick={reset} className="w-full rounded-xl h-11 text-slate-500 hover:text-slate-800">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Upload another image
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
