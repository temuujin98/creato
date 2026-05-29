/**
 * Fetches a URL as a blob and triggers a native browser file download.
 *
 * Why this is needed: the HTML <a download> attribute is silently ignored by
 * browsers for cross-origin URLs (spec §4.6.5). Supabase Storage signed URLs
 * are cross-origin, so the browser opens them inline rather than saving them.
 * Fetching the content as a Blob and wrapping it in a same-origin object URL
 * bypasses this restriction — the download attribute is always honoured for
 * blob: URLs.
 *
 * Security: the signed URL is already ownership-verified before it reaches the
 * client. This function only issues a fetch for that pre-validated URL and does
 * not expose any storage path or service role credentials.
 */
/**
 * Builds a safe, human-readable download filename.
 *
 * Format: creato-{sanitized-name}-{yyyy-mm-dd}-{index}.png
 *
 * Examples:
 *   buildDownloadFilename("Sale Poster", "2026-05-29T05:00:00Z", 0)
 *   → "creato-sale-poster-2026-05-29-0.png"
 */
export function buildDownloadFilename(
  name: string,
  date?: string | null,
  index = 0,
): string {
  const safeName =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "") || "output";

  const dateStr = (() => {
    if (!date) return new Date().toISOString().slice(0, 10);
    const d = new Date(date);
    return Number.isNaN(d.getTime())
      ? new Date().toISOString().slice(0, 10)
      : d.toISOString().slice(0, 10);
  })();

  return `creato-${safeName}-${dateStr}-${index}.png`;
}

export async function triggerBlobDownload(url: string, filename: string): Promise<void> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed: HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;

  // Append to body so Firefox honours the click.
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Revoke after a short delay to give the browser time to begin the download.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
