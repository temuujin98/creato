import type { Dispatch, DragEvent, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Image,
  Upload,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/products";
import { uploadUserImage } from "../../lib/storage";

export type UploadedInputFile = {
  error?: string;
  file: File;
  id: string;
  previewUrl: string;
  publicUrl?: string;
  status: "selected" | "uploading" | "uploaded" | "failed";
  storagePath?: string;
};

type UploadDropzoneProps = {
  files: UploadedInputFile[];
  labels: {
    clickToUpload: string;
    dropzoneDescription: string;
    dropzoneTitle: string;
    failed: string;
    fileTooLarge: string;
    filesReady: string;
    invalidFileType: string;
    loginRequired: string;
    maxFileSize: string;
    maximumImageRequirement: string;
    minimumImageRequirement: string;
    remove: string;
    requiredImages: string;
    selected: string;
    signInToUpload: string;
    supportedFormats: string;
    textOnlyDescription: string;
    textOnlyTitle: string;
    tooManyFiles: string;
    uploadFailed: string;
    uploadHelper: string;
    uploadSuccess: string;
    uploadTitle: string;
    uploaded: string;
    uploading: string;
  };
  onFilesChange: Dispatch<SetStateAction<UploadedInputFile[]>>;
  product: Product;
  userId?: string;
};

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 10 * 1024 * 1024;

function createFileId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(1)}MB`;
}

function statusLabel(status: UploadedInputFile["status"], labels: UploadDropzoneProps["labels"]) {
  if (status === "uploading") return labels.uploading;
  if (status === "uploaded") return labels.uploaded;
  if (status === "failed") return labels.failed;
  return labels.selected;
}

function statusIcon(status: UploadedInputFile["status"]) {
  if (status === "uploaded") {
    return <CheckCircle className="h-4 w-4 text-white/72" aria-hidden="true" />;
  }

  if (status === "failed") {
    return <AlertCircle className="h-4 w-4 text-white/72" aria-hidden="true" />;
  }

  return <Image className="h-4 w-4 text-white/52" aria-hidden="true" />;
}

export function UploadDropzone({
  files,
  labels,
  onFilesChange,
  product,
  userId,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const latestFilesRef = useRef(files);
  const [message, setMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    latestFilesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      latestFilesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  if (!product.requiresImage) {
    return (
      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6">
        <p className="text-lg font-semibold text-white">{labels.textOnlyTitle}</p>
        <p className="mt-3 leading-7 text-white/58">{labels.textOnlyDescription}</p>
      </section>
    );
  }

  function updateFile(id: string, patch: Partial<UploadedInputFile>) {
    onFilesChange((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  async function uploadFile(item: UploadedInputFile) {
    if (!userId) {
      updateFile(item.id, { error: labels.loginRequired, status: "failed" });
      return;
    }

    updateFile(item.id, { error: undefined, status: "uploading" });

    try {
      const result = await uploadUserImage(item.file, userId);
      updateFile(item.id, {
        status: "uploaded",
        storagePath: result.path,
      });
      setMessage(labels.uploadSuccess);
    } catch {
      updateFile(item.id, { error: labels.uploadFailed, status: "failed" });
      setMessage(labels.uploadFailed);
    }
  }

  function handleFiles(nextFiles: FileList | File[]) {
    setMessage(null);

    if (!userId) {
      setMessage(labels.loginRequired);
      return;
    }

    const incoming = Array.from(nextFiles);
    const availableSlots = Math.max(product.maxImages - files.length, 0);

    if (incoming.length > availableSlots) {
      setMessage(labels.tooManyFiles);
      return;
    }

    const accepted: UploadedInputFile[] = [];

    for (const file of incoming) {
      if (!allowedTypes.includes(file.type)) {
        setMessage(labels.invalidFileType);
        continue;
      }

      if (file.size > maxFileSize) {
        setMessage(labels.fileTooLarge);
        continue;
      }

      accepted.push({
        file,
        id: createFileId(),
        previewUrl: URL.createObjectURL(file),
        status: "selected",
      });
    }

    if (accepted.length === 0) {
      return;
    }

    onFilesChange((current) => [...current, ...accepted]);
    accepted.forEach((item) => {
      uploadFile(item);
    });
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function removeFile(fileId: string) {
    onFilesChange((current) => {
      const removed = current.find((item) => item.id === fileId);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return current.filter((item) => item.id !== fileId);
    });
  }

  const readyCount = files.filter((item) => item.status === "uploaded").length;

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">{labels.uploadTitle}</p>
          <p className="mt-2 text-sm text-white/52">{labels.uploadHelper}</p>
        </div>
        <p className="text-sm text-white/48">
          {labels.requiredImages}: {product.minImages}-{product.maxImages}
        </p>
      </div>

      {!userId ? (
        <div className="mt-5 rounded-[1.35rem] border border-white/10 bg-black/34 p-5">
          <p className="font-semibold text-white">{labels.loginRequired}</p>
          <Link
            to="/login"
            className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            {labels.signInToUpload}
          </Link>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={allowedTypes.join(",")}
            multiple={product.maxImages > 1}
            className="hidden"
            onChange={(event) => {
              if (event.target.files) {
                handleFiles(event.target.files);
              }
              event.target.value = "";
            }}
          />
          <button
            type="button"
            className={`mt-6 flex min-h-44 w-full flex-col items-center justify-center rounded-[1.35rem] border border-dashed px-6 text-center transition ${
              isDragging
                ? "border-white/44 bg-white/[0.07]"
                : "border-white/18 bg-black/40 hover:border-white/28 hover:bg-white/[0.04]"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 text-white/44" aria-hidden="true" />
            <span className="mt-4 font-semibold text-white">{labels.dropzoneTitle}</span>
            <span className="mt-2 max-w-md text-sm leading-6 text-white/48">
              {labels.dropzoneDescription}
            </span>
            <span className="mt-3 text-xs font-semibold text-white/62">
              {labels.clickToUpload}
            </span>
          </button>
        </>
      )}

      <div className="mt-4 grid gap-2 text-xs text-white/42 sm:grid-cols-2">
        <p>{labels.supportedFormats}</p>
        <p>{labels.maxFileSize}</p>
        <p>{labels.minimumImageRequirement}: {product.minImages}</p>
        <p>{labels.maximumImageRequirement}: {product.maxImages}</p>
      </div>

      {message ? (
        <p className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-white/68">
          {message}
        </p>
      ) : null}

      {files.length > 0 ? (
        <div className="mt-5 grid gap-3">
          <p className="text-sm font-semibold text-white/64">
            {labels.filesReady.replace("{count}", String(readyCount))}
          </p>
          {files.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-[1.25rem] border border-white/10 bg-black/32 p-3 sm:grid-cols-[5rem_1fr_auto] sm:items-center"
            >
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="aspect-square w-20 rounded-2xl object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {item.file.name}
                </p>
                <p className="mt-1 text-xs text-white/42">
                  {formatFileSize(item.file.size)}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-white/54">
                  {statusIcon(item.status)}
                  {statusLabel(item.status, labels)}
                </div>
                {item.error ? (
                  <p className="mt-2 text-xs text-white/58">{item.error}</p>
                ) : null}
                {item.storagePath ? (
                  <p className="mt-2 truncate font-mono text-[11px] text-white/34">
                    {item.storagePath}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:text-white"
                onClick={() => removeFile(item.id)}
                title={labels.remove}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
