"use client";
import cv from "@techstark/opencv-js";
import { log } from "console";
import { createWorker } from "tesseract.js";

export async function processImages(
  frontImage: HTMLImageElement,
  backImage: HTMLImageElement
) {
  let srcFront = cv.imread(frontImage);
  let srcBack = cv.imread(backImage);
  let frontMedianBlurDst = new cv.Mat();
  let backMedianBlurDst = new cv.Mat();

  let frontGray = new cv.Mat();
  let backGray = new cv.Mat();

  let frontEqualizeHist = new cv.Mat();
  let backEqualizeHist = new cv.Mat();

  let frontThreshold = new cv.Mat();
  let backThreshold = new cv.Mat();

  cv.medianBlur(srcFront, frontMedianBlurDst, 9);
  cv.medianBlur(srcBack, backMedianBlurDst, 9);
  console.log("udalo sie 1");

  cv.cvtColor(frontMedianBlurDst, frontGray, cv.COLOR_RGBA2GRAY, 0);
  cv.equalizeHist(frontGray, frontEqualizeHist);

  cv.cvtColor(backMedianBlurDst, backGray, cv.COLOR_RGBA2GRAY, 0);
  cv.equalizeHist(backGray, backEqualizeHist);
  console.log("udalo sie 2");
  cv.threshold(frontEqualizeHist, frontThreshold, 20, 255, cv.THRESH_BINARY);
  cv.threshold(backEqualizeHist, backThreshold, 20, 255, cv.THRESH_BINARY);

  console.log("udalo sie 3");

  const canvasFront = document.createElement("canvas");
  const canvasBack = document.createElement("canvas");
  cv.imshow(canvasFront, frontThreshold);
  cv.imshow(canvasBack, backThreshold);

  await recognizeTextFromImage(canvasFront);
  await recognizeTextFromImage(canvasBack);

  srcFront.delete();
  srcBack.delete();
  frontMedianBlurDst.delete();
  backMedianBlurDst.delete();
  frontGray.delete();
  backGray.delete();
  frontEqualizeHist.delete();
  backEqualizeHist.delete();
  frontThreshold.delete();
  backThreshold.delete();
}

async function recognizeTextFromImage(image: HTMLCanvasElement) {
  (async () => {
    const worker = await createWorker("pol");
    const ret = await worker.recognize(image);
    console.log(ret.data.text);
    await worker.terminate();
  })();
}
