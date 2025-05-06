// Copyright (c) 2025 Alex Frutkin
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (theJunkyard), to deal in
// theJunkyard without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// theJunkyard, and to permit persons to whom theJunkyard is furnished to do so,
// subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of theJunkyard.
// 
// THEJUNKYARD IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THEJUNKYARD OR THE USE OR OTHER DEALINGS IN THEJUNKYARD.

import { centerCrop, makeAspectCrop } from 'react-image-crop';

/**
 * Converts a Data URL string to a Blob object.
 * @param {string} dataurl - The Data URL string.
 * @returns {Blob|null} The Blob object or null if conversion fails.
 */
export function dataURLtoBlob(dataurl) {
    // Check if dataurl is valid
    if (!dataurl || !dataurl.includes(',')) {
        console.error("Invalid data URL provided to dataURLtoBlob:", dataurl);
        return null; // Return null or throw an error
    }
    try {
        const arr = dataurl.split(',');
        // Check if split result is valid
        if (!arr || arr.length < 2) {
            console.error("Could not split data URL:", dataurl);
            return null;
        }
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch || mimeMatch.length < 2) {
            console.error("Could not extract mime type from data URL:", arr[0]);
            return null;
        }
        const mime = mimeMatch[1];
        const bstr = atob(arr[arr.length - 1]); // Use arr.length - 1 for robustness
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    } catch (e) {
        console.error("Error in dataURLtoBlob:", e, "Data URL:", dataurl.substring(0, 100) + "..."); // Log error and truncated data URL
        return null; // Return null on error
    }
}

/**
 * Calculates a centered crop rectangle with a specific aspect ratio.
 * @param {number} mediaWidth - The width of the media (image).
 * @param {number} mediaHeight - The height of the media (image).
 * @param {number} aspect - The desired aspect ratio (width / height).
 * @returns {import('react-image-crop').Crop} The calculated crop object.
 */
export function centerAspectCrop(
  mediaWidth,
  mediaHeight,
  aspect,
) {
  // Use react-image-crop's built-in functions, imported at the top level now
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90, // Initial crop size percentage
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

/**
 * Creates a cropped image Blob from an image element and crop parameters,
 * resizing and compressing to meet size constraints.
 * @param {HTMLImageElement} image - The source image element.
 * @param {import('react-image-crop').PixelCrop} pixelCrop - The crop dimensions in pixels.
 * @param {string} fileName - The original file name (used for naming the output).
 * @param {string} [fileType='image/png'] - The original file type (ignored for export, uses JPEG).
 * @returns {Promise<Blob>} A promise that resolves with the cropped and processed Blob.
 */
export async function getCroppedImg(
  image,
  pixelCrop,
  fileName,
  fileType = 'image/png' // Keep param for potential future use, but ignore for export
) {
  // console.log('getCroppedImg started.');

  const MAX_CANVAS_DIMENSION = 4096;
  const MAX_CANVAS_AREA = MAX_CANVAS_DIMENSION * MAX_CANVAS_DIMENSION;

  const initialCanvas = document.createElement('canvas');
  const initialCtx = initialCanvas.getContext('2d');
  if (!initialCtx) {
    console.error('getCroppedImg error: Failed to get 2d context.');
    throw new Error('No 2d context');
  }
  // console.log('Initial canvas context obtained.');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  // console.log('Calculated scales:', { scaleX, scaleY });

  const originalTargetWidth = Math.floor(pixelCrop.width * scaleX);
  const originalTargetHeight = Math.floor(pixelCrop.height * scaleY);
  let targetWidth = originalTargetWidth;
  let targetHeight = originalTargetHeight;

  let dimensionDownScale = 1;
  let areaDownScale = 1;

  // console.log(`Original calculated dimensions (pixelCrop * scale): ${originalTargetWidth}x${originalTargetHeight}`);

  // ---> Check dimension limit <---
  if (targetWidth > MAX_CANVAS_DIMENSION || targetHeight > MAX_CANVAS_DIMENSION) {
    const ratioX = MAX_CANVAS_DIMENSION / targetWidth;
    const ratioY = MAX_CANVAS_DIMENSION / targetHeight;
    dimensionDownScale = Math.min(ratioX, ratioY);
    targetWidth = Math.floor(targetWidth * dimensionDownScale);
    targetHeight = Math.floor(targetHeight * dimensionDownScale);
    // console.log(`Applied dimension downscale: ${dimensionDownScale.toFixed(4)}`);
    // console.log(`Dimensions after dimension capping: ${targetWidth}x${targetHeight}`);
  } else {
    // console.log('Dimensions within limit. No dimension downscale needed.');
  }

  // ---> Check area limit <---
  const currentArea = targetWidth * targetHeight;
  // console.log(`Area after dimension capping: ${currentArea} pixels`);
  if (currentArea > MAX_CANVAS_AREA) {
      areaDownScale = Math.sqrt(MAX_CANVAS_AREA / currentArea);
      targetWidth = Math.floor(targetWidth * areaDownScale);
      targetHeight = Math.floor(targetHeight * areaDownScale);
      // console.log(`Applied area downscale: ${areaDownScale.toFixed(4)}`);
      // console.log(`Area after area capping: ${targetWidth}x${targetHeight}`);
  } else {
      // console.log('Area within limit. No area downscale needed.');
  }

  // ---> Combine downscale factors <---
  const combinedDownScaleFactor = dimensionDownScale * areaDownScale;
  // console.log(`Final combined downscale factor: ${combinedDownScaleFactor.toFixed(4)}`);

  // ---> Calculate final target dimensions using combined factor <---
  targetWidth = Math.floor(originalTargetWidth * combinedDownScaleFactor);
  targetHeight = Math.floor(originalTargetHeight * combinedDownScaleFactor);

  if (targetWidth < 1 || targetHeight < 1) {
      console.error(`getCroppedImg error: Calculated canvas dimensions too small (${targetWidth}x${targetHeight}) after scaling.`);
      throw new Error(`Calculated canvas dimensions are too small (${targetWidth}x${targetHeight}) after scaling.`);
  }

  // ---> Set the final canvas dimensions <---
  // console.log(`Final target canvas size: ${targetWidth}x${targetHeight}`);
  initialCanvas.width = targetWidth;
  initialCanvas.height = targetHeight;
  // console.log(`Set initialCanvas dimensions: ${initialCanvas.width}x${initialCanvas.height}`);

  // ---> Apply COMBINED downScaleFactor scaling to context <---
  // console.log(`Applying context scale: ${combinedDownScaleFactor.toFixed(4)}`);
  initialCtx.scale(combinedDownScaleFactor, combinedDownScaleFactor);
  initialCtx.imageSmoothingQuality = 'high';

  const cropX = pixelCrop.x * scaleX;
  const cropY = pixelCrop.y * scaleY;
  const sourceCropWidth = pixelCrop.width * scaleX;
  const sourceCropHeight = pixelCrop.height * scaleY;

  // Destination dimensions need to account for the context scaling
  const destWidth = initialCanvas.width / combinedDownScaleFactor;
  const destHeight = initialCanvas.height / combinedDownScaleFactor;

  // console.log('Calculated source parameters for drawImage:', { cropX, cropY, sourceCropWidth, sourceCropHeight });
  // console.log('Calculated destination parameters for drawImage:', { destWidth, destHeight });

  try {
    const drawParams = {
        sx: cropX, sy: cropY, sWidth: sourceCropWidth, sHeight: sourceCropHeight,
        dx: 0, dy: 0, dWidth: destWidth, dHeight: destHeight
    };
    // console.log('Calling initialCtx.drawImage with:', drawParams);
    // console.log('Image element details:', { complete: image.complete, src: image.src.substring(0,100) + '...' });

    initialCtx.drawImage(
      image,
      cropX, cropY, sourceCropWidth, sourceCropHeight,
      0, 0, destWidth, destHeight
    );
    // console.log('initialCtx.drawImage completed.');
  } catch (drawError) {
      console.error('Error during initialCtx.drawImage:', drawError);
      console.error('DrawImage parameters were:', {
          sx: cropX, sy: cropY, sWidth: sourceCropWidth, sHeight: sourceCropHeight,
          dx: 0, dy: 0, dWidth: destWidth, dHeight: destHeight
      });
      throw new Error(`Failed to draw image onto canvas: ${drawError.message}`);
  }

  // --- Resizing Logic (for file size) ---
  const maxSizeBytes = 1 * 1024 * 1024; // 1MB
  const scaleFactor = 0.9; // Scale down by 10% each time
  const minDimension = 100; // Minimum width/height in pixels
  const maxAttempts = 10; // Max attempts to resize
  const exportFileType = 'image/jpeg'; // Export as JPEG for better compression
  const initialJpegQuality = 0.9; // Initial JPEG quality

  let currentCanvas = initialCanvas;
  let quality = initialJpegQuality;

  // console.log('Finished initial canvas setup. Preparing to return Promise for resizing loop.');

  return new Promise((resolve, reject) => {
    // console.log('Entered Promise executor for resizing loop.');
    // console.log(`Starting resizing loop. Target format: ${exportFileType}`);
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // console.log(`--- Resizing Loop Attempt ${attempt + 1} ---`);

      if (!currentCanvas || currentCanvas.width <= 0 || currentCanvas.height <= 0) {
        console.error(`Attempt ${attempt + 1}: Invalid canvas dimensions before Data URL generation - ${currentCanvas?.width}x${currentCanvas?.height}`);
        return reject(new Error('Invalid canvas dimensions during processing.'));
      }

      // console.log(`Attempt ${attempt + 1}: Current canvas dimensions: ${currentCanvas.width}x${currentCanvas.height}`);

      let blob = null;
      try {
        // console.log(`Attempt ${attempt + 1}: Calling currentCanvas.toDataURL (type: ${exportFileType}, quality: ${quality.toFixed(2)})`);
        const dataUrl = currentCanvas.toDataURL(exportFileType, quality);
        // console.log(`Attempt ${attempt + 1}: toDataURL finished. Data URL length: ${dataUrl?.length ?? 'null/undefined'}`);

        if (!dataUrl || dataUrl === 'data:,') {
             console.error(`Attempt ${attempt + 1}: Failed to generate valid Data URL (returned: ${dataUrl?.substring(0, 30)}...) for canvas size ${currentCanvas.width}x${currentCanvas.height}`);
             return reject(new Error(`Canvas Data URL generation failed (using ${exportFileType}). The canvas might be too large or corrupted.`));
        }

        // console.log(`Attempt ${attempt + 1}: Calling dataURLtoBlob.`);
        blob = dataURLtoBlob(dataUrl);
        // console.log(`Attempt ${attempt + 1}: dataURLtoBlob finished. Blob size: ${blob?.size ?? 'null'}, Blob type: ${blob?.type ?? 'null'}`);

        if (!blob) {
           console.error(`Attempt ${attempt + 1}: dataURLtoBlob returned null.`);
           return reject(new Error('Failed to convert Data URL to Blob.'));
        }

      } catch (error) {
          console.error(`Attempt ${attempt + 1}: Error during Data URL generation or conversion for canvas size ${currentCanvas.width}x${currentCanvas.height}:`, error);
          if (error.name === 'QuotaExceededError') {
             console.error(`Attempt ${attempt + 1}: QuotaExceededError encountered.`);
             return reject(new Error('Canvas is too large for Data URL generation, even after initial scaling.'));
          }
          return reject(new Error(`Canvas processing error: ${error.message}`));
      }

      // console.log(`Attempt ${attempt + 1}: Blob generated. Size = ${(blob.size / 1024 / 1024).toFixed(2)}MB`);

      if (blob.size <= maxSizeBytes) {
        const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        blob.name = `${baseName}.jpeg`; // Ensure the blob has the correct extension
        // console.log(`Success: Final size is within limit. Setting blob name to ${blob.name}. Resolving promise.`);
        return resolve(blob); // Use return here to exit the loop and resolve
      }

      // console.log(`Attempt ${attempt + 1}: Blob size (${blob.size}) exceeds limit (${maxSizeBytes}). Resizing needed.`);
      const newWidth = Math.floor(currentCanvas.width * scaleFactor);
      const newHeight = Math.floor(currentCanvas.height * scaleFactor);
      // console.log(`Attempt ${attempt + 1}: Calculated new dimensions: ${newWidth}x${newHeight}`);

      if (newWidth < minDimension || newHeight < minDimension) {
        console.warn(`Resizing stopped: New dimensions (${newWidth}x${newHeight}) below minimum (${minDimension}px). Rejecting.`);
         return reject(new Error(`Image could not be resized below ${minDimension}px while staying under 1MB.`)); // Use return here
      }

      // Reduce quality first before resizing if possible
      if (quality > 0.5) {
        quality -= 0.05;
        // console.log(`Attempt ${attempt + 1}: Reduced JPEG quality to ${quality.toFixed(2)} for next attempt.`);
        // Continue loop to try with lower quality at current size
        continue;
      } else {
        // console.log(`Attempt ${attempt + 1}: JPEG quality already low (${quality.toFixed(2)}). Resizing canvas.`);
      }

      // Resize canvas if quality reduction wasn't enough or already at minimum
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = newWidth;
      tempCanvas.height = newHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        console.error(`Attempt ${attempt + 1}: Failed to get context for resized canvas (${newWidth}x${newHeight})`);
        return reject(new Error('Failed to get context for resized canvas.')); // Use return here
      }
      tempCtx.imageSmoothingQuality = 'medium'; // Use medium for resizing steps
      // console.log(`Attempt ${attempt + 1}: Drawing current canvas (${currentCanvas.width}x${currentCanvas.height}) onto temp canvas (${newWidth}x${newHeight})`);
      tempCtx.drawImage(currentCanvas, 0, 0, currentCanvas.width, currentCanvas.height, 0, 0, newWidth, newHeight);
      // console.log(`Attempt ${attempt + 1}: drawImage for resize complete.`);

      currentCanvas = tempCanvas; // Update canvas for the next iteration
      // Reset quality slightly when resizing, as smaller image might tolerate higher quality
      quality = Math.min(initialJpegQuality, quality + 0.1);
      // console.log(`Attempt ${attempt + 1}: Reset quality slightly to ${quality.toFixed(2)} after resize.`);
    }

    // If loop finishes without resolving/rejecting
    console.error(`Failed to downsize image below 1MB after ${maxAttempts} attempts. Last canvas size: ${currentCanvas.width}x${currentCanvas.height}. Rejecting.`);
    reject(new Error(`Failed to downsize image below 1MB after ${maxAttempts} attempts.`));
  });
}
