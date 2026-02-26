import logoSrc from "@/assets/logo.png";

let cachedBase64: string | null = null;

export async function getLogoBase64(): Promise<string> {
  if (cachedBase64) return cachedBase64;
  
  try {
    const response = await fetch(logoSrc);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        cachedBase64 = reader.result as string;
        resolve(cachedBase64);
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    // Fallback to the import path directly
    return logoSrc;
  }
}
