"use client";
import cv, { CV_32F } from "@techstark/opencv-js";
import { log } from "console";
import { createWorker } from "tesseract.js";

import { FrontID } from "./frontID";
import { BackID } from "./backID";
export async function processImages(
  frontImage: HTMLImageElement,
  backImage: HTMLImageElement
): Promise<[HTMLCanvasElement, HTMLCanvasElement]> {
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

  //Denoising
  let ksize = new cv.Size(5, 5); // kelner
  let sigmaX = 1.5;
  let sigmaY = 0.1;
  cv.GaussianBlur(
    srcFront,
    frontMedianBlurDst,
    ksize,
    sigmaX,
    sigmaY,
    cv.BORDER_DEFAULT
  );
  cv.GaussianBlur(
    srcBack,
    backMedianBlurDst,
    ksize,
    sigmaX,
    sigmaY,
    cv.BORDER_DEFAULT
  );

  //Histogram
  cv.cvtColor(frontMedianBlurDst, frontGray, cv.COLOR_RGBA2GRAY, 0);
  cv.equalizeHist(frontGray, frontEqualizeHist);

  cv.cvtColor(backMedianBlurDst, backGray, cv.COLOR_RGBA2GRAY, 0);
  cv.equalizeHist(backGray, backEqualizeHist);

  //applying treshold
  const TRESHOLD = 20;
  const MAX_TRESHOLD = 255;

  cv.threshold(
    frontEqualizeHist,
    frontThreshold,
    TRESHOLD,
    MAX_TRESHOLD,
    cv.THRESH_BINARY
  );

  cv.threshold(
    backEqualizeHist,
    backThreshold,
    TRESHOLD,
    MAX_TRESHOLD,
    cv.THRESH_BINARY
  );

  const canvasFront = document.createElement("canvas");
  const canvasBack = document.createElement("canvas");
  cv.imshow(canvasFront, frontThreshold);
  cv.imshow(canvasBack, backThreshold);

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
  return [canvasFront, canvasBack];
}

export async function recognizeTextFromImage(
  image: HTMLCanvasElement
): Promise<string> {
  const worker = await createWorker("pol");
  try {
    const result = await worker.recognize(image);
    const text = result.data.text;

    return text;
  } catch (error) {
    throw new Error("Problem with text recognizion");
  } finally {
    await worker.terminate();
  }
}
