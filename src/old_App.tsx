import React, { useState, useCallback, useRef } from 'react';

/**
 * Interface for the duotone effect parameters.
 */
interface DuotoneParams {
  redMultiplier: number;
  greenMultiplier: number;
  blueMultiplier: number;
}

/**
 * Default duotone parameters for a cool-toned effect.
 */
const DEFAULT_DUOTONE_PARAMS: DuotoneParams = {
  redMultiplier: 0.5,
  greenMultiplier: 0.2,
  blueMultiplier: 1.2,
};

/**
 * Applies a duotone effect to an image source and returns the processed image as a data URL.
 * @param src - The source image data URL.
 * @param params - The duotone parameters.
 * @returns A promise that resolves to the duotone image data URL or null if failed.
 */
const applyDuotoneEffect = async (
  src: string,
  params: DuotoneParams = DEFAULT_DUOTONE_PARAMS
): Promise<string | null> => {
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

        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = Math.min(255, avg * params.redMultiplier);
          data[i + 1] = Math.min(255, avg * params.greenMultiplier);
          data[i + 2] = Math.min(255, avg * params.blueMultiplier);
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

/**
 * Main App component for the Duotone Photo Transformer.
 */
export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [duotoneImage, setDuotoneImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duotoneParams, setDuotoneParams] = useState<DuotoneParams>(DEFAULT_DUOTONE_PARAMS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (imageSrc: string) => {
    setIsProcessing(true);
    try {
      const duotoneResult = await applyDuotoneEffect(imageSrc, duotoneParams);
      setDuotoneImage(duotoneResult);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('An error occurred while processing the image.');
      setOriginalImage(null);
      setDuotoneImage(null);
    } finally {
      setIsProcessing(false);
    }
  }, [duotoneParams]);

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

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDuotoneParams(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  React.useEffect(() => {
    if (originalImage) {
      processImage(originalImage);
    }
  }, [duotoneParams, originalImage, processImage]);

  const handleInputClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse-slow">
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
            <h2 className="text-xl font-bold mb-4">Adjust Duotone Levels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400">Red Multiplier</label>
                <input
                  type="range"
                  name="redMultiplier"
                  min="0"
                  max="3"
                  step="0.1"
                  value={duotoneParams.redMultiplier}
                  onChange={handleParamChange}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-400">{duotoneParams.redMultiplier.toFixed(1)}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Green Multiplier</label>
                <input
                  type="range"
                  name="greenMultiplier"
                  min="0"
                  max="3"
                  step="0.1"
                  value={duotoneParams.greenMultiplier}
                  onChange={handleParamChange}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-400">{duotoneParams.greenMultiplier.toFixed(1)}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Blue Multiplier</label>
                <input
                  type="range"
                  name="blueMultiplier"
                  min="0"
                  max="3"
                  step="0.1"
                  value={duotoneParams.blueMultiplier}
                  onChange={handleParamChange}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-400">{duotoneParams.blueMultiplier.toFixed(1)}</span>
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
                    maxHeight: 'min(50vh, 50vw)', // Constrains image to a max of 50% of viewport height or width
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