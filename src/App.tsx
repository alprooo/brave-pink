import React, { useState, useCallback, useRef } from "react";

// --- Applies a duotone effect to an image source ---
const applyDuotoneEffect = async (src: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Canvas context not available");
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";

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

        const highlightColor = hexToRgb("#f99fd2");
        const shadowColor = hexToRgb("#165027");

        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const ratio = avg / 255;

          data[i] = Math.min(
            255,
            shadowColor.r + (highlightColor.r - shadowColor.r) * ratio
          );
          data[i + 1] = Math.min(
            255,
            shadowColor.g + (highlightColor.g - shadowColor.g) * ratio
          );
          data[i + 2] = Math.min(
            255,
            shadowColor.b + (highlightColor.b - shadowColor.b) * ratio
          );
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      } catch (error) {
        console.error("Error applying duotone effect:", error);
        resolve(null);
      }
    };

    img.onerror = () => {
      console.error("Error loading image");
      resolve(null);
    };

    img.src = src;
  });
};

// --- Main App ---
export default function App() {
  const [duotoneImage, setDuotoneImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (imageSrc: string) => {
    setIsProcessing(true);
    try {
      const result = await applyDuotoneEffect(imageSrc);
      setDuotoneImage(result);
    } catch (error) {
      console.error("Error processing image:", error);
      alert("An error occurred while processing the image.");
      setDuotoneImage(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => processImage(reader.result as string);
      reader.onerror = () => alert("Failed to read file. Please try again.");
      reader.readAsDataURL(file);
    },
    [processImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file?.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => processImage(reader.result as string);
        reader.readAsDataURL(file);
      }
    },
    [processImage]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-6 pt-12 md:pt-[10%]">
      <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        ✨ ChromaFlow ✨
      </h1>      
      <p className="text-lg text-gray-400 text-center max-w-1xl mb-8">
        <span className="font-semibold text-pink-400">Duotone Effect.</span>{" "}
        <br />
        Transform your photos with elegant duotone effects. Processing happens entirely in your browser — your images remain yours.
      </p>


      {/* Upload Zone */}
      <div
        className={`relative p-8 border-2 border-dashed rounded-xl w-full max-w-lg mb-8 text-center transition-colors
        ${
          isProcessing
            ? "border-gray-500"
            : "border-gray-700 hover:border-blue-500 cursor-pointer"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <p className="text-gray-400 text-lg mb-2">
          {isProcessing ? "Processing..." : "Drag & Drop your photo here"}
        </p>
        <p className="text-gray-500 text-sm">or click to upload</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          disabled={isProcessing}
        />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Duotone Result */}
      {duotoneImage && (
        <div className="w-full max-w-3xl">
            <div className="bg-gray-800 rounded-xl shadow-xl p-6 flex flex-col items-center relative">
                {/* Close button in top-right */}
                <button
                  onClick={() => {
                    setDuotoneImage(null);
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

            <h2 className="text-2xl font-semibold mb-4 text-purple-300">
              Duotone Effect
            </h2>
            <div className="relative w-full max-w-md aspect-square overflow-hidden rounded-lg bg-black">
              <img
                src={duotoneImage}
                alt="Duotone"
                className="absolute inset-0 m-auto max-w-full max-h-full object-contain transform hover:scale-105 transition-transform duration-300"
              />
            </div>

              {/* Info message */}
              <p className="mt-4 text-sm text-gray-400 text-center max-w-md">
                Everything happens right in your browser<br/>
                — your photos always stay with you.
                <br />
                <br />
                <span className="text-gray-500">
                  developed by{" "}
                  <a
                    href="https://www.instagram.com/alfianrsa/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    alfianrsa
                  </a>
                </span>
              </p>

            {/* Buttons row */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              {/* New Photo Button */}
              <button
                onClick={() => setDuotoneImage(null)}
                className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-lg"
              >
                {/* Replace photo icon (refresh/uturn arrow) */}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                  />
                </svg>
                <span>New Photo</span>
              </button>


              {/* Download Button */}
              <a
                href={duotoneImage}
                download="duotone-photo.jpeg"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                  />
                </svg>
                <span>Download Photo</span>
              </a>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="mt-12 py-6 text-center border-t border-gray-800 w-full">
        <span className="text-gray-500">
          developed by{" "}
          <a
            href="https://www.instagram.com/alfianrsa/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            alfianrsa
          </a>
        </span>
      </footer>
    </div>
  );
}
