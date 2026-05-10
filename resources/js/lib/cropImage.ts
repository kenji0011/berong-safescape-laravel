/**
 * Crop utility for react-easy-crop.
 * Outputs at the FULL native pixel resolution of the source image.
 * Uses PNG for lossless quality.
 * 
 * react-easy-crop reports croppedAreaPixels relative to the natural image size,
 * so we use naturalWidth/naturalHeight for the source canvas, then extract
 * the crop at those exact pixel coordinates.
 */
export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<File | null> => {
  const image = await createImage(imageSrc);
  
  // Use the full native resolution of the image
  const naturalW = image.naturalWidth;
  const naturalH = image.naturalHeight;

  // Create a canvas at the exact crop dimensions (full native pixel resolution)
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // High quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw only the cropped portion of the source image directly onto the canvas.
  // Source rectangle: the crop area from the full-size image
  // Destination rectangle: the entire output canvas
  ctx.drawImage(
    image,
    pixelCrop.x,          // source x
    pixelCrop.y,          // source y
    pixelCrop.width,      // source width
    pixelCrop.height,     // source height
    0,                    // destination x
    0,                    // destination y
    pixelCrop.width,      // destination width (same = no scaling)
    pixelCrop.height      // destination height (same = no scaling)
  );

  // Output as PNG for lossless quality
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const myFile = new File([blob], 'cropped-carousel.png', {
          type: 'image/png',
          lastModified: Date.now(),
        });
        resolve(myFile);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/png');
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
