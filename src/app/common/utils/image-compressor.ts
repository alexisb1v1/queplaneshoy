/**
 * Utilidad de compresión y optimización de imágenes en el cliente (Browser).
 * Convierte formatos pesados (JPG, PNG, HEIC, TIFF) a WebP moderno de alta fidelidad,
 * redimensionando a dimensiones aptas para web con reducción de peso del 80% al 95%.
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (0.82 es el estándar óptimo de balance visual)
  targetFormat?: 'image/webp' | 'image/jpeg';
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // Porcentaje de reducción (ej. 85%)
  width: number;
  height: number;
}

/**
 * Resuelve las dimensiones máximas recomendadas según la carpeta de destino
 */
export function getDefaultDimensionsForFolder(
  folder?: 'banners' | 'croquis' | 'gallery' | 'landings' | 'organizers' | string
): { maxWidth: number; maxHeight: number } {
  switch (folder) {
    case 'banners':
      return { maxWidth: 1920, maxHeight: 1080 };
    case 'croquis':
      return { maxWidth: 1600, maxHeight: 1200 };
    case 'gallery':
      return { maxWidth: 1440, maxHeight: 1080 };
    case 'organizers':
      return { maxWidth: 800, maxHeight: 800 };
    case 'landings':
      return { maxWidth: 1920, maxHeight: 1080 };
    default:
      return { maxWidth: 1600, maxHeight: 1200 };
  }
}

/**
 * Comprime un archivo de imagen en el navegador antes de subirlo a almacenamiento
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressionResult> {
  // 1. Verificaciones tempranas y SSR guard
  if (typeof window === 'undefined') {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      width: 0,
      height: 0,
    };
  }

  // 2. Si es un SVG, conservarlo intacto (ya es vectorial ultra ligero)
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      width: 0,
      height: 0,
    };
  }

  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.82,
    targetFormat = 'image/webp',
  } = options;

  try {
    // 3. Cargar la imagen en memoria
    const objectUrl = URL.createObjectURL(file);
    const img = await loadImageAsync(objectUrl);
    URL.revokeObjectURL(objectUrl);

    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;

    if (!originalWidth || !originalHeight) {
      throw new Error('Dimensiones inválidas de la imagen.');
    }

    // 4. Calcular nuevas dimensiones manteniendo la relación de aspecto exacta
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (targetWidth > maxWidth) {
      targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
      targetWidth = maxWidth;
    }

    if (targetHeight > maxHeight) {
      targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
      targetHeight = maxHeight;
    }

    // 5. Dibujar en un canvas oculto con suavizado de alta calidad
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No se pudo obtener el contexto 2D del Canvas.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // 6. Exportar a Blob WebP optimizado
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), targetFormat, quality);
    });

    if (!blob) {
      throw new Error('Error al serializar el Blob comprimido.');
    }

    // Si por alguna razón extrema el archivo comprimido fuera más grande que el original,
    // usamos el original
    if (blob.size >= file.size && file.type === targetFormat) {
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        width: originalWidth,
        height: originalHeight,
      };
    }

    // 7. Generar nuevo nombre con extensión .webp
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
    const newFileName = `${cleanBaseName}.webp`;

    const compressedFile = new File([blob], newFileName, {
      type: targetFormat,
      lastModified: Date.now(),
    });

    const ratio = Math.max(0, Math.round(((file.size - compressedFile.size) / file.size) * 100));

    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: ratio,
      width: targetWidth,
      height: targetHeight,
    };
  } catch (error) {
    // Fallback de contingencia: si la compresión falla, retornar el archivo original intacto
    console.warn('[ImageCompressor] Fallback al archivo original debido a un error:', error);
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      width: 0,
      height: 0,
    };
  }
}

/**
 * Helper para cargar una imagen como Promesa de forma asíncrona
 */
function loadImageAsync(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Fallo al cargar imagen para compresión: ' + e));
    img.src = url;
  });
}

