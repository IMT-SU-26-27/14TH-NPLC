import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FeeAmountProps } from "@/types/competition";

// The price to pay. During the early bird the normal price sits above it, struck through.
export function FeeAmount({ fee, normalFee, lang, labels, className }: FeeAmountProps) {
  if (fee >= normalFee) return <span className={className}>{formatRupiah(fee, lang)}</span>;

  return (
    <span className="flex flex-col">
      <span className="text-muted-foreground text-sm font-normal line-through">
        <span className="sr-only">{`${labels.normal} `}</span>
        {formatRupiah(normalFee, lang)}
      </span>
      <span className={cn(className)}>
        <span className="sr-only">{`${labels.early} `}</span>
        {formatRupiah(fee, lang)}
      </span>
    </span>
  );
}
