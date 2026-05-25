"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Upload, X, CheckCircle2, ArrowRight, AlertCircle, Image, ChevronRight } from "lucide-react";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const newFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    // Simulate upload
    await new Promise((r) => setTimeout(r, 2000));
    setUploading(false);
    setUploaded(true);
  };

  if (uploaded) {
    return (
      <section className="pt-28 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Photos envoyées !</h1>
          <p className="text-gray-400 mb-2">
            {files.length} photos ont été uploadées avec succès.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Votre projet sera traité sous 48h. Vous recevrez une notification par email.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all"
            >
              Retour au dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-2 px-6 py-3 border border-anthracite-600 text-gray-300 rounded-xl hover:border-cyan-500/50 transition-all"
            >
              Voir mes projets
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-cyan-400 flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold">Nouveau projet</h1>
          <p className="text-gray-400 mt-2">
            Déposez vos photos pour lancer le traitement photogrammétrique
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <strong className="text-cyan-400">Bonnes pratiques :</strong>{" "}
              Minimum 30 photos avec 70% de recouvrement avant et latéral.
              {" "}Consultez nos <Link href="/tutorials" className="text-cyan-400 underline">tutoriels</Link> pour des résultats optimaux.
            </div>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            dragging
              ? "border-cyan-400 bg-cyan-500/5"
              : "border-anthracite-600 hover:border-anthracite-500"
          }`}
        >
          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">
            Glissez-déposez vos photos ici
          </p>
          <p className="text-sm text-gray-400 mb-4">
            ou cliquez pour sélectionner les fichiers
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-flex items-center gap-2 px-6 py-3 border border-anthracite-600 text-gray-300 rounded-xl hover:border-cyan-500/50 hover:text-cyan-400 cursor-pointer transition-all"
          >
            <Image className="w-4 h-4" />
            Choisir des photos
          </label>
          <p className="text-xs text-gray-500 mt-4">
            Formats acceptés : JPG, PNG, TIFF. Poids max : 50 Mo par photo.
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{files.length} fichier(s)</p>
              <button
                onClick={() => setFiles([])}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Tout supprimer
              </button>
            </div>
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-anthracite-800/50 border border-anthracite-700 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Image className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-sm font-medium truncate max-w-[300px]">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(1)} Mo
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-3.5 mt-4 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>Upload en cours...</>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Uploader {files.length} photo(s)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
