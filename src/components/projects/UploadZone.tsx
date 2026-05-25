"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, AlertCircle, Trash2, Plus, X, ExternalLink } from "lucide-react";

interface UploadZoneProps {
  filesByType: Record<string, File[]>;
  onFilesSelected: (type: string, files: File[]) => void;
  onRemoveFile: (type: string, index: number) => void;
  uploading?: boolean;
  uploadProgress?: number;
}

const MAX_FILES = 2000;
const MAX_SIZE = 20 * 1024 * 1024 * 1024;
const CATEGORY_LABELS: Record<string, string> = {
  NADIR: "Photos nadir (vue du dessus)",
};
const CATEGORY_COLORS: Record<string, string> = {
  NADIR: "border-primary-500 bg-primary-50",
};

function getCategoryLabel(type: string): string {
  if (CATEGORY_LABELS[type]) return CATEGORY_LABELS[type];
  const num = type.replace("OBLIQUE", "");
  return `Photos obliques ${num} (vue latérale)`;
}

function getCategoryColor(type: string): string {
  return CATEGORY_COLORS[type] || "border-amber-500 bg-amber-50";
}

export default function UploadZone({ filesByType, onFilesSelected, onRemoveFile, uploading, uploadProgress }: UploadZoneProps) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [obliqueGroups, setObliqueGroups] = useState<string[]>([]);
  const allTypes = ["NADIR", ...obliqueGroups];
  const totalFiles = Object.values(filesByType).reduce((s, f) => s + f.length, 0);

  const addObliqueGroup = () => {
    const next = obliqueGroups.length + 1;
    setObliqueGroups((prev) => [...prev, `OBLIQUE${next}`]);
  };

  const removeObliqueGroup = (type: string) => {
    setObliqueGroups((prev) => prev.filter((t) => t !== type));
    if (filesByType[type]) {
      onFilesSelected(type, []);
    }
  };

  const validateFiles = useCallback((incoming: FileList | File[], currentFiles: File[]) => {
    setError("");
    const arr = Array.from(incoming);
    const total = totalFiles + arr.length;

    if (total > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} photos autorisées. Vous avez ${total}.`);
      return [];
    }

    const allFiles = [...Object.values(filesByType).flat(), ...arr];
    const totalSize = allFiles.reduce((s, f) => s + f.size, 0);
    if (totalSize > MAX_SIZE) {
      setError("Le poids total dépasse 20 Go. Réduisez le nombre de photos.");
      return [];
    }

    const valid = arr.filter((f) => {
      const ext = f.name.toLowerCase();
      return ext.endsWith(".jpg") || ext.endsWith(".jpeg") || ext.endsWith(".png") || ext.endsWith(".dng");
    });

    if (valid.length !== arr.length) {
      setError("Formats acceptés : JPG, PNG, DNG uniquement.");
    }

    return valid;
  }, [totalFiles, filesByType]);

  const handleDrop = useCallback((e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDragOver(null);
    const current = filesByType[type] || [];
    const valid = validateFiles(e.dataTransfer.files, current);
    if (valid.length) onFilesSelected(type, valid);
  }, [validateFiles, onFilesSelected, filesByType]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files) {
      const current = filesByType[type] || [];
      const valid = validateFiles(e.target.files, current);
      if (valid.length) onFilesSelected(type, valid);
      e.target.value = "";
    }
  }, [validateFiles, onFilesSelected, filesByType]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* TABS + BOUTON AJOUTER OBLIQUE */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-dark-500 mr-1">Types :</span>
        <div className="flex items-center gap-1.5">
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-100 text-primary-700">
            NADIR
          </span>
          {obliqueGroups.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700">
              {t}
              {!uploading && (
                <button type="button" onClick={() => removeObliqueGroup(t)} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {!uploading && (
          <button
            type="button"
            onClick={addObliqueGroup}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-dark-300 text-dark-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
          >
            <Plus className="w-3 h-3" /> Oblique
          </button>
        )}
      </div>

      {/* DROP ZONES */}
      <div className="space-y-4">
        {allTypes.map((type) => {
          const currentFiles = filesByType[type] || [];
          const isNadir = type === "NADIR";
          const borderColor = dragOver === type
            ? "border-primary-500 bg-primary-50"
            : isNadir
              ? "border-primary-200 bg-primary-50/50"
              : "border-amber-200 bg-amber-50/50";

          return (
            <div key={type}>
              <p className="text-xs font-medium text-dark-500 mb-1.5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isNadir ? "bg-primary-500" : "bg-amber-500"}`} />
                {getCategoryLabel(type)}
                <span className="text-dark-300">({currentFiles.length} photo{currentFiles.length > 1 ? "s" : ""})</span>
              </p>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(type); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, type)}
                onClick={() => inputRefs.current[type]?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${borderColor}`}
              >
                <input
                  ref={(el) => { inputRefs.current[type] = el; }}
                  type="file"
                  accept=".jpg,.jpeg,.png,.dng"
                  multiple
                  onChange={(e) => handleInput(e, type)}
                  className="hidden"
                />
                <Upload className={`w-8 h-8 mx-auto mb-2 ${dragOver === type ? "text-primary-500" : "text-dark-300"}`} />
                <p className="text-sm text-dark-500">
                  {isNadir ? "Glissez vos photos nadir ici" : "Glissez vos photos obliques ici"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* BARRE PROGRESSION */}
      {uploading && uploadProgress !== undefined && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-dark-500">
            <span>Upload en cours...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-dark-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* PREVIEW PAR TYPE */}
      {totalFiles > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-dark-600 font-medium">{totalFiles} photo{totalFiles > 1 ? "s" : ""} sélectionnée{totalFiles > 1 ? "s" : ""}</p>
            <a href="/tutoriels" target="_blank" className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-500">
              <ExternalLink className="w-3 h-3" /> Tutoriel captation
            </a>
          </div>
          {allTypes.map((type) => {
            const currentFiles = filesByType[type] || [];
            if (currentFiles.length === 0) return null;
            return (
              <div key={type}>
                <p className="text-xs font-semibold text-dark-600 mb-2 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${type === "NADIR" ? "bg-primary-500" : "bg-amber-500"}`} />
                  {type} — {currentFiles.length} photo{currentFiles.length > 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {currentFiles.map((file, i) => (
                    <div key={`${type}-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-dark-100 bg-dark-50">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                      {!uploading && (
                        <button
                          type="button"
                          onClick={() => onRemoveFile(type, i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                        <p className="text-[10px] text-white truncate">{file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalFiles > 0 && totalFiles < 30 && !uploading && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Minimum 30 photos recommandées pour un bon résultat.
        </p>
      )}
    </div>
  );
}