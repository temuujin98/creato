import { Download, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { triggerBlobDownload } from "../../lib/download";

type Props = {
  /** Tailwind classes applied to the outer button element. */
  className: string;
  /** Suggested filename for the downloaded file. Defaults to creato-output.png. */
  filename?: string;
  /** Tailwind classes applied to the icon (Download / LoaderCircle). */
  iconClassName?: string;
  /** Visible button label text. */
  label: string;
  /** Signed URL to fetch and download. Must be an ownership-verified signed URL. */
  url: string;
};

/**
 * A button that downloads a file via the blob → object-URL pattern so that
 * cross-origin signed storage URLs are saved as files instead of opened inline.
 */
export function DownloadButton({
  className,
  filename = "creato-output.png",
  iconClassName = "h-4 w-4",
  label,
  url,
}: Props) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      await triggerBlobDownload(url, filename);
    } catch {
      // Download failed — preview image is still visible; no alert is needed.
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      type="button"
      className={className}
      disabled={downloading}
      onClick={handleDownload}
    >
      {downloading ? (
        <LoaderCircle className={`animate-spin ${iconClassName}`} aria-hidden="true" />
      ) : (
        <Download className={iconClassName} aria-hidden="true" />
      )}
      {label}
    </button>
  );
}
