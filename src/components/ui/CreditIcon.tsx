import { Gem } from "lucide-react";

type Props = {
  /** Tailwind size + any extra classes. Defaults to h-3.5 w-3.5. */
  className?: string;
};

/**
 * Shared credit icon used everywhere a credit amount or cost is displayed.
 * Uses the Gem icon in primary-color so credit indicators look consistent
 * across the header wallet pill, product cards, and creation detail views.
 */
export function CreditIcon({ className = "h-3.5 w-3.5" }: Props) {
  return <Gem className={`text-primary ${className}`} aria-hidden="true" />;
}
