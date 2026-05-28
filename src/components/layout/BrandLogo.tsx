type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  showIcon?: boolean;
};

export function BrandLogo({
  className = "",
  markClassName = "h-8 w-8",
  showIcon = true,
}: BrandLogoProps) {
  if (!showIcon) {
    return (
      <img
        src="/brand/dark-logo.png"
        alt="creato"
        className={`h-7 w-auto object-contain sm:h-8 ${className}`}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/brand/creato-icon.png"
        alt=""
        className={`${markClassName} rounded-lg object-cover dark:hidden`}
      />
      <span className="text-xl font-semibold tracking-normal text-neutral-950 dark:hidden">
        creato
      </span>
      <img
        src="/brand/dark-logo.png"
        alt="creato"
        className="hidden h-8 w-auto object-contain dark:block"
      />
    </span>
  );
}
