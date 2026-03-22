"use client";

import React from "react";

interface ProgressBarProps {
  progress: number;
  label?: string;
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div>
      {label && (
        <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
          {label}
        </p>
      )}
      <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div
          className="h-full bg-brand-500 dark:bg-brand-400 transition-all duration-150"
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {safeProgress.toFixed(0)}%
      </p>
    </div>
  );
}

