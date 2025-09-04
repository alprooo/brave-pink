import React, { useState, useCallback, useRef, useEffect } from 'react';

// Applies a duotone effect to an image source.
const applyDuotoneEffect = async (src: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Canvas context not available');
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const hexToRgb = (hex: string) => {
          const r = parseInt(hex.substring(1, 3), 16);
          const g = parseInt(hex.substring(3, 5), 16);
          const b = parseInt(hex.substring(5, 7), 16);
          return { r, g, b };
        };

        const highlightColor = hexToRgb('#f99fd2');
        const shadowColor = hexToRgb('#165027');

        for (let i = 0; i < data.length; i += 4) {
          // Calculate the luminosity (grayscale value)
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

          // Interpolate between shadow and highlight colors
          const ratio = avg / 255;
          
          data[i] = Math.min(255, shadowColor.r + (highlightColor.r - shadowColor.r) * ratio);
          data[i + 1] = Math.min(255, shadowColor.g + (highlightColor.g - shadowColor.g) * ratio);
          data[i + 2] = Math.min(255, shadowColor.b + (highlightColor.b - shadowColor.b) * ratio);
        }

        ctx.putImageData(imageData, 0, 0);
        const duotoneDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(duotoneDataUrl);
      } catch (error) {
        console.error('Error applying duotone effect:', error);
        resolve(null);
      }
    };

    img.onerror = () => {
      console.error('Error loading image');
      resolve(null);
    };

    img.src = src;
  });
};

// Main App component for the Duotone Photo Transformer.
export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [duotoneImage, setDuotoneImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (imageSrc: string) => {
    setIsProcessing(true);
    try {
      const duotoneResult = await applyDuotoneEffect(imageSrc);
      setDuotoneImage(duotoneResult);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('An error occurred while processing the image.');
      setOriginalImage(null);
      setDuotoneImage(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setOriginalImage(result);
    };
    reader.onerror = () => {
      console.error('Error reading file');
      alert('Failed to read the uploaded file. Please try again.');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setOriginalImage(result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (originalImage) {
      processImage(originalImage);
    }
  }, [originalImage, processImage]);

  const handleInputClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        ✨ Duotone Photo Transformer
      </h1>

      <div
        className={`relative p-8 border-2 border-dashed rounded-xl w-full max-w-lg mb-8 text-center transition-colors
        ${isProcessing ? 'border-gray-500' : 'border-gray-700 hover:border-blue-500 cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <p className="text-gray-400 text-lg mb-2">
          {isProcessing ? 'Processing...' : 'Drag & Drop your photo here'}
        </p>
        <p className="text-gray-500 text-sm">
          or click to upload
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          onClick={handleInputClick}
          disabled={isProcessing}
        />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {originalImage && (
        <>
          <div className="w-full max-w-5xl mb-8 p-4 bg-gray-800 rounded-lg shadow-xl">
            <div className="flex justify-center items-center gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-white" style={{ backgroundColor: '#588061' }}></div>             
              </div>
             
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-white" style={{ backgroundColor: '#F9E0DB' }}></div>            
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
            {/* Original Image Container */}
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 flex flex-col items-center">
              <h2 className="text-2xl font-semibold mb-4 text-blue-300">Original Image</h2>
              <div className="relative w-full max-w-md aspect-square overflow-hidden rounded-lg bg-black">
                <img
                  src={originalImage}
                  alt="Original"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full object-contain transform hover:scale-105 transition-transform duration-300"
                  style={{
                    maxHeight: 'min(50vh, 50vw)',
                    maxWidth: 'min(50vh, 50vw)'
                  }}
                />
              </div>
            </div>
            {/* Duotone Image Container */}
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 flex flex-col items-center relative">
              <h2 className="text-2xl font-semibold mb-4 text-purple-300">Duotone Effect</h2>
              <div className="relative w-full max-w-md aspect-square overflow-hidden rounded-lg bg-black">
                <img
                  src={duotoneImage || ''}
                  alt="Duotone"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full object-contain transform hover:scale-105 transition-transform duration-300"
                  style={{
                    maxHeight: 'min(50vh, 50vw)',
                    maxWidth: 'min(50vh, 50vw)'
                  }}
                />
              </div>
              {duotoneImage && (
                <a
                  href={duotoneImage}
                  download="duotone-photo.jpeg"
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
                >
                  Download
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}