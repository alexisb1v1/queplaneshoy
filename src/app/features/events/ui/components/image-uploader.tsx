'use client';

import React, { useRef, useState } from 'react';
import { apiClient } from '@/app/common/services/api-client';
import {
  compressImage,
  getDefaultDimensionsForFolder,
} from '@/app/common/utils/image-compressor';

interface ImageUploaderProps {
  label?: string;
  helpText?: string;
  value?: string;
  onChange: (publicUrl: string) => void;
  aspectRatio?: 'banner' | 'square' | 'portrait' | 'auto';
  compact?: boolean;
  className?: string;
  folder?: 'banners' | 'croquis' | 'gallery' | 'landings' | 'organizers';
}

export default function ImageUploader({
  label,
  helpText = 'PNG, JPG o WebP (Optimización automática)',
  value,
  onChange,
  aspectRatio = 'auto',
  compact = false,
  className = '',
  folder = 'banners',
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    setCompressionInfo(null);

    if (!file.type.startsWith('image/')) {
      setErrorMsg('El archivo seleccionado no es una imagen válida.');
      return;
    }

    // Límite generoso de 15MB ya que se comprimirá en cliente antes de subir
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('La imagen supera el límite máximo de 15MB.');
      return;
    }

    // Generar vista previa local instantánea
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setUploadPreview(result);
      }
    };
    reader.readAsDataURL(file);

    setIsUploading(true);

    try {
      // 1. Compresión y optimización WebP automática en el cliente (Browser)
      const folderDimensions = getDefaultDimensionsForFolder(folder);
      const compressionResult = await compressImage(file, {
        maxWidth: folderDimensions.maxWidth,
        maxHeight: folderDimensions.maxHeight,
        quality: 0.82,
        targetFormat: 'image/webp',
      });

      const fileToUpload = compressionResult.file;
      if (compressionResult.compressionRatio > 0) {
        setCompressionInfo(`Reducción: ${compressionResult.compressionRatio}%`);
      }

      // 2. Solicitar URL prefirmada al backend NestJS
      const presignedData = await apiClient.post<{
        uploadUrl: string;
        publicUrl: string;
        key: string;
      }>('/media/presigned-url', {
        filename: fileToUpload.name,
        contentType: fileToUpload.type || 'image/webp',
        folder,
      });

      // 3. Subir directamente el archivo optimizado a Cloudflare R2 vía PUT
      const uploadResponse = await fetch(presignedData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': fileToUpload.type || 'image/webp',
        },
        body: fileToUpload,
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `Error al subir la imagen (${uploadResponse.status} ${uploadResponse.statusText})`
        );
      }

      // 4. Si ya existía una imagen anterior en R2 para este mismo slot, solicitar su eliminación
      if (value && value !== presignedData.publicUrl) {
        apiClient
          .delete('/media', { params: { url: value } })
          .catch((delErr) =>
            console.warn('[ImageUploader] No se pudo purgar la imagen anterior:', delErr)
          );
      }

      // 5. Notificar la URL pública definitiva
      onChange(presignedData.publicUrl);
      setUploadPreview(null);
    } catch (err: any) {
      console.error('Error al procesar/subir imagen:', err);
      const isConnectionError =
        err?.message?.includes('Failed to fetch') || err?.name === 'TypeError';
      setErrorMsg(
        isConnectionError
          ? 'No se pudo conectar con el servidor backend (NestJS en http://localhost:3001). Verifica que el backend esté ejecutándose.'
          : (err.message || 'Ocurrió un error al cargar la imagen.')
      );
      setUploadPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Si había una imagen cargada previamente, purgarla de Cloudflare R2
    if (value) {
      apiClient
        .delete('/media', { params: { url: value } })
        .catch((delErr) =>
          console.warn('[ImageUploader] Error al purgar imagen eliminada de R2:', delErr)
        );
    }

    onChange('');
    setUploadPreview(null);
    setCompressionInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAspectClass = () => {
    if (compact) {
      return 'h-24 sm:h-28 w-full';
    }
    switch (aspectRatio) {
      case 'banner':
        return 'aspect-[16/7] min-h-[140px]';
      case 'square':
        return 'aspect-square min-h-[120px]';
      case 'portrait':
        return 'aspect-[3/4] min-h-[150px]';
      default:
        return 'min-h-[120px]';
    }
  };

  const displayImage = uploadPreview || value;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="font-bold text-xs text-deep-slate block">{label}</label>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {displayImage ? (
        <div
          className={`relative group rounded-2xl overflow-hidden border border-surface-variant/80 bg-surface-gray ${getAspectClass()} flex items-center justify-center`}
        >
          {/* Vista previa de la imagen */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt="Vista previa"
            className="w-full h-full object-cover"
          />

          {/* Spinner de carga si está subiendo */}
          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-20">
              <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span className="text-xs font-bold tracking-wide">Cargando...</span>
            </div>
          )}

          {/* Badge de optimización WebP */}
          {compressionInfo && !isUploading && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold shadow flex items-center gap-1 z-10 pointer-events-none">
              <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
              {compressionInfo}
            </div>
          )}

          {/* Overlay de acciones al hover (solo si no está subiendo) */}
          {!isUploading && (
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Cambiar
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors shadow"
                title="Eliminar imagen"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => {
            if (!isUploading) fileInputRef.current?.click();
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
            compact ? 'p-3' : 'p-6'
          } ${
            isDragging
              ? 'border-electric-indigo bg-indigo-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-electric-indigo/80 bg-surface-gray/50 hover:bg-surface-gray'
          } ${getAspectClass()}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-electric-indigo">
              <span className="w-6 h-6 border-2 border-electric-indigo border-t-transparent rounded-full animate-spin"></span>
              <span className="text-xs font-bold">Cargando...</span>
            </div>
          ) : (
            <>
              <div
                className={`${
                  compact ? 'w-8 h-8 mb-1' : 'w-12 h-12 mb-2'
                } rounded-xl bg-indigo-50 text-electric-indigo flex items-center justify-center shadow-xs`}
              >
                <span
                  className={`material-symbols-outlined ${
                    compact ? 'text-[18px]' : 'text-[24px]'
                  }`}
                >
                  cloud_upload
                </span>
              </div>
              <span className="text-xs font-bold text-deep-slate">
                {compact
                  ? 'Subir imagen'
                  : 'Haz clic para subir o arrastra la imagen aquí'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">{helpText}</span>
            </>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {errorMsg}
        </p>
      )}
    </div>
  );
}
