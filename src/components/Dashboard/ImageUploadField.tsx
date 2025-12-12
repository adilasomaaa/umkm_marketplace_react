import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Image } from '@heroui/react';
import { UploadIcon, XIcon } from 'lucide-react';
import type { FormFieldConfig } from '@/types';

export type UploadFieldProps = FormFieldConfig & {
  type: 'upload';
  maxSize?: number;
  allowedExtensions?: string[]; 
  previewUrl?: string;
}

interface ImageUploadFieldComponentProps {
  field: UploadFieldProps;
  register: any;
  errors: any;
  watch: any;
  setValue: any;
}

const ImageUploadField: React.FC<ImageUploadFieldComponentProps> = ({
  field,
  register,
  errors,
  watch,
  setValue,
}) => {
  const fileValue = watch(field.key);
  const [preview, setPreview] = useState<string | null>(field.previewUrl || null);
  const isInvalid = !!errors[field.key];
  const errorMessage = errors[field.key]?.message as string;

  useEffect(() => {
    if (fileValue && fileValue.length > 0 && fileValue[0] instanceof File) {
      const newFile = fileValue[0];
      const objectUrl = URL.createObjectURL(newFile);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else if (field.previewUrl && !fileValue) {
      setPreview(field.previewUrl);
    } else if (!fileValue) {
      setPreview(null);
    }
  }, [fileValue, field.previewUrl]);

  const handleClearFile = useCallback(() => {
    setValue(field.key, null, { shouldValidate: true });
    setPreview(null);

}, [field.key, setValue]);

  const allowedExtDisplay = useMemo(() => {
    return field.allowedExtensions?.map(ext => ext.toUpperCase().replace('.', '')).join(', ') || 'Semua';
  }, [field.allowedExtensions]);

  const maxSizeDisplay = useMemo(() => {
    if (field.maxSize) {
      return (field.maxSize / (1024 * 1024)).toFixed(2) + ' MB';
    }
    return 'Tidak Terbatas';
  }, [field.maxSize]);

  const { onChange, onBlur, name, ref } = register(field.key);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-default-700">{field.label}</label>
      <div className={`border-2 ${isInvalid ? 'border-danger-400' : 'border-dashed border-default-300'} rounded-lg p-4 flex flex-col items-center justify-center transition-colors`}>
        {preview ? (
          <div className="relative w-full max-h-48 overflow-hidden rounded-lg">
            <Image
              src={preview}
              alt="Preview Gambar"
              className="object-contain w-full h-48"
            />
            <Button
              isIconOnly
              size="sm"
              color="danger"
              variant="light"
              className="absolute top-1 right-1 z-10"
              onPress={handleClearFile}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <UploadIcon className="h-6 w-6 text-default-400" />
            <p className="text-sm text-default-500 text-center">
              {field.placeholder || "Seret dan lepas gambar di sini"}
            </p>
            <input
              type="file"
              id={field.key}
              name={name}
              onBlur={onBlur}
              ref={ref}
              onChange={(e) => {
                onChange(e); 
              }}
              className="hidden"
              accept={field.allowedExtensions?.join(',')}
            />
            <label
              htmlFor={field.key}
              className="cursor-pointer px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Pilih File
            </label>
          </div>
        )}
      </div>

      {(field.maxSize || field.allowedExtensions) && (
        <div className="flex flex-col text-xs text-default-500">
          {field.allowedExtensions && <span>**Ekstensi:** {allowedExtDisplay}</span>}
          {field.maxSize && <span>**Maks Ukuran:** {maxSizeDisplay}</span>}
        </div>
      )}

      {isInvalid && (
        <p className="text-sm text-danger-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

export default ImageUploadField;