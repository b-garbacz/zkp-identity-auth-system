"use server";
import cv from "@techstark/opencv-js";

// Convert File to an HTMLCanvasElement tu cos gpt wygenerował

// async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();

//     reader.onload = function (event) {
//       const img = new Image();
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         const ctx = canvas.getContext("2d");
//         canvas.width = img.width;
//         canvas.height = img.height;
//         if (ctx) {
//           ctx.drawImage(img, 0, 0);
//         }
//         resolve(canvas);
//       };

//       img.onerror = () => reject(new Error("Image loading error"));
//       if (event.target && typeof event.target.result === "string") {
//         img.src = event.target.result;
//       } else {
//         reject(new Error("FileReader did not return a string"));
//       }
//     };

//     reader.onerror = () => reject(new Error("FileReader encountered an error"));

//     reader.readAsDataURL(file);
//   });
// }

async function noiseReduction(canvas: HTMLElement): Promise<cv.Mat> {
  const src = cv.imread(canvas);
  const dst = new cv.Mat();
  cv.medianBlur(src, dst, 5);
  src.delete();
  return dst;
}

async function histogram(canvas: HTMLElement): Promise<cv.Mat> {
  const src = cv.imread(canvas);
  const dst = new cv.Mat();
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  cv.equalizeHist(src, dst);
  src.delete();
  return dst;
}

async function applyThreshold(
  canvas: HTMLElement,
  thresholdValue = 128
): Promise<cv.Mat> {
  const src = cv.imread(canvas);
  const dst = new cv.Mat();
  cv.threshold(src, dst, thresholdValue, 255, cv.THRESH_BINARY);
  src.delete();
  return dst;
}

export async function processImages(formData: FormData): Promise<void> {
  const frontFile = formData.get("frontID");
  const backFile = formData.get("backID");

  if (frontFile instanceof File && backFile instanceof File) {
    //const frontCanvas = await fileToCanvas(frontFile);
    //const backCanvas = await fileToCanvas(backFile);
    // const noiseReducedFront = await noiseReduction(frontCanvas);
    // const contrastEnhancedFront = await histogram(frontCanvas);
    // const thresholdedFront = await applyThreshold(frontCanvas);
    // const noiseReducedBack = await noiseReduction(backCanvas);
    // const contrastEnhancedBack = await histogram(backCanvas);
    // const thresholdedBack = await applyThreshold(backCanvas);
  } else {
    throw new Error("Both files must be provided and valid.");
  }
}
