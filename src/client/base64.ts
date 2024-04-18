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
