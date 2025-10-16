// src/components/FileUploader.tsx

import React, { useRef } from "react";

interface Props {
  onFileLoad: (geojson: any) => void;
}

export default function FileUploader({ onFileLoad }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onFileLoad(json);
      } catch {
        alert("Invalid GeoJSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".geojson,application/geo+json"
        onChange={handleFile}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span>Upload GeoJSON File</span>
      </button>
    </div>
  );
}