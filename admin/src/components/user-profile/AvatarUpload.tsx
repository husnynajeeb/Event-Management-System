"use client";

import React, { useState, useCallback, useRef } from "react";
import Cropper, { type Area } from "react-easy-crop";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Image from "next/image";
import { CloseIcon } from "@/icons";
import ProgressBar from "@/components/ui/ProgressBar";
import {
  getAuthTokenFromCookie,
  getUserServiceUrl,
} from "@/lib/authClient";

interface AvatarUploadProps {
  label?: string;
  value?: string | null;
  onChange: (url: string) => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

const getCroppedImgCircle = async (
  imageSrc: string,
  pixelCrop: Area,
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const size = Math.min(pixelCrop.width, pixelCrop.height);
  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  );

  ctx.globalCompositeOperation = "destination-in";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve("");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    }, "image/png");
  });
};

export default function AvatarUpload({
  label = "Avatar",
  value,
  onChange,
}: AvatarUploadProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    [],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const token = getAuthTokenFromCookie();
    if (!token) {
      alert("You must be signed in to change your avatar.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const croppedImageUrl = await getCroppedImgCircle(
        imageSrc,
        croppedAreaPixels,
      );

      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], "avatar.png", { type: "image/png" });

      const baseUrl = getUserServiceUrl();

      await new Promise<void>((resolve, reject) => {
        const formData = new FormData();
        formData.append("avatar", file);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            try {
              const uploadData = JSON.parse(xhr.responseText);
              const url: string | undefined =
                uploadData?.user?.imageUrl ?? uploadData?.imageUrl;
              if (url) {
                setUploadProgress(100);
                onChange(url);
                setShowCropModal(false);
                setImageSrc("");
                resolve();
              } else {
                reject(new Error("Avatar URL missing in response"));
              }
            } catch (error: any) {
              reject(
                new Error(error?.message || "Failed to parse avatar response"),
              );
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during avatar upload"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Avatar upload was aborted"));
        });

        xhr.open("PATCH", `${baseUrl}/users/me/avatar`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("Error uploading avatar:", error);
      alert(`Failed to upload avatar: ${error?.message || "Unknown error"}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {label && <Label>{label}</Label>}
      <div className="mt-2 flex items-center gap-4">
        {value ? (
          <div className="relative">
            <div className="relative w-20 h-20 overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-700">
              <Image
                src={value}
                alt="Avatar"
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-1 -right-1 p-1 bg-error-500 rounded-full text-white hover:bg-error-600"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="avatar-upload"
          />
          <label
            htmlFor="avatar-upload"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            {value ? "Change Avatar" : "Upload Avatar"}
          </label>
        </div>
      </div>

      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white/90">
              Crop Avatar
            </h3>
            <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zoom: {zoom.toFixed(2)}
              </label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            {uploading && (
              <div className="mt-4">
                <ProgressBar
                  progress={uploadProgress}
                  label="Uploading avatar..."
                />
              </div>
            )}
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCropModal(false);
                  setImageSrc("");
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCropComplete}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Save Avatar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

