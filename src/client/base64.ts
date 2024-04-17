"use client";
export const base64ToImageElement = async (
  base64: string
): Promise<HTMLImageElement> => {
  const img = new Image();
  img.src = base64;
  return img;
};

export const convertToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = (error) => reject(error);
  });
};

export function dateFormat(text: string | null): Number | null {
  if (text === null) {
    console.error("no text provided");
    return null;
  }
  //const changed = text.replace(/\./g, "/");
  const splited = text.split(".");
  const day = parseInt(splited[0], 10);
  const month = parseInt(splited[1], 10) - 1;
  const year = parseInt(splited[2], 10);

  return parseInt((new Date(year, month, day).getTime() / 1000).toFixed(0));
}
