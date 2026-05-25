"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Image, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

type CategoryType = "NADIR" | "OBLIQUE1" | "OBLIQUE2" | "OBLIQUE3" | "OBLIQUE4";

interface CategorizedFile {
  file: File;
  category: CategoryType;
}

interface UploadZoneProps {
  onFilesChange: (files: CategorizedFile[]) => void;
  files: CategorizedFile[];
}

const categories: { value: CategoryType; label: string; desc: string }[] = [
  { value: "NADIR", label: "Nadir", desc: "Photos à la verticale, vers le bas" },
  { value: "OBLIQUE1", label: "Oblique 1", desc: "Photos en angle, 1er passage" },
  { value: "OBLIQUE2", label: "Oblique 2", desc: "Photos en angle, 2ème passage" },
  { value: "OBLIQUE3", label: "Oblique 3", desc: "Photos en angle, 3ème passage" },
  { value: "OBLIQUE4", label: "Oblique 4", desc: "Photos en angle, 4ème passage" },
];

export default function UploadZone({ onFilesChange, files }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType>("NADIR");
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    const categorized = newFiles.map((file) => ({
      file,
      category: activeCategory as CategoryType,
    }));
    onFilesChange([...files, ...categorized]);
  }, [files, activeCategory, onFilesChange]);

  const removeFile = useCallback((index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  }, [files, onFilesChange]);

  const changeCategory = useCallback((index: number, category: CategoryType) => {
    const updated = files.map((f, i) => i === index ? { ...f, category } : f);
    onFilesChange(updated);
  }, [files, onFilesChange]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const imageFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    addFiles(imageFiles);
  }, [addFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const imageFiles = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    addFiles(imageFiles);
    if (inputRef.current) inputRef.current.value = "";
  }, [addFiles]);

  const filesByCategory = categories.map((cat) => ({
    ...cat,
    files: files.filter((f) => f.category === cat.value),
  }));

  return (
    <div className="space-y-4">
      {/* Category selector */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === cat.value
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-anthracite-800 text-gray-400 border border-anthracite-700 hover:border-anthracite-600"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Catégorie active : <span className="text-cyan-400 font-medium">{categories.find(c => c.value === activeCategory)?.label}</span>
        {" — "}{categories.find(c => c.value === activeCategory)?.desc}
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragging
            ? "border-cyan-400 bg-cyan-500/5"
            : "border-anthracite-600 hover:border-anthracite-500"
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
        <p className="font-medium mb-1">Glissez-déposez vos photos {activeCategory === "NADIR" ? "nadir" : `obliques (${activeCategory})`}</p>
        <p className="text-sm text-gray-500 mb-3">ou cliquez pour sélectionner</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        <p className="text-xs text-gray-600">JPG, PNG, TIFF — 50 Mo max par photo</p>
      </div>

      {/* Help toggle */}
      <button
        type="button"
        onClick={() => setShowHelp(!showHelp)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-cyan-400"
      >
        {showHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {showHelp ? "Masquer" : "Afficher"} les consignes de classement
      </button>

      {showHelp && (
        <div className="p-4 bg-anthracite-800/50 border border-anthracite-700 rounded-xl text-sm space-y-2">
          <p className="text-cyan-400 font-medium">Comment classer vos photos :</p>
          <ul className="space-y-1 text-gray-400">
            <li><strong className="text-gray-300">NADIR</strong> — Toutes les photos prises à la verticale (drone pointé vers le bas)</li>
            <li><strong className="text-gray-300">OBLIQUE1 à 4</strong> — Photos en angle, jusqu&apos;à 4 passages différents autour du bâtiment</li>
            <li className="text-xs text-gray-500 mt-2">Vous pouvez changer la catégorie d&apos;une photo après l&apos;avoir déposée en utilisant le menu déroulant</li>
          </ul>
        </div>
      )}

      {/* File list by category */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{files.length} fichier(s) au total</p>
            <button type="button" onClick={() => onFilesChange([])} className="text-xs text-red-400 hover:text-red-300">
              Tout supprimer
            </button>
          </div>

          {filesByCategory.map((cat) => cat.files.length > 0 && (
            <div key={cat.value}>
              <p className="text-xs font-medium text-cyan-400 mb-2 uppercase">{cat.label} ({cat.files.length})</p>
              <div className="space-y-1.5">
                {cat.files.map((cf, i) => {
                  const globalIndex = files.indexOf(cf);
                  return (
                    <div key={`${cf.file.name}-${i}`} className="flex items-center justify-between p-2 bg-anthracite-800/50 border border-anthracite-700 rounded-lg text-sm">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Image className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="truncate text-xs">{cf.file.name}</span>
                        <span className="text-[10px] text-gray-600 shrink-0">({(cf.file.size / (1024 * 1024)).toFixed(1)} Mo)</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <select
                          value={cf.category}
                          onChange={(e) => changeCategory(globalIndex, e.target.value as CategoryType)}
                          className="text-[10px] bg-anthracite-700 border border-anthracite-600 rounded px-1 py-0.5 text-gray-300"
                        >
                          {categories.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                        <button type="button" onClick={() => removeFile(globalIndex)}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
