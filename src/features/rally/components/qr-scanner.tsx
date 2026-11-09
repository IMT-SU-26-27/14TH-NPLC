"use client";

import { Scanner, setZXingModuleOverrides } from "@yudiel/react-qr-scanner";
import type { QrScannerProps } from "@/types/rally";

// The decoder is served from this site. By default it comes from a CDN, which a venue network could block.
setZXingModuleOverrides({
  locateFile: (file: string, prefix: string) => (file.endsWith(".wasm") ? "/zxing/zxing_reader.wasm" : prefix + file),
});

// Only preferences: the library's default minimum of 640px height rejects cameras that have no such mode.
const CONSTRAINTS = { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } };
const FORMATS: ["qr_code"] = ["qr_code"];

export function QrScanner({ paused, onDetect, onError }: QrScannerProps) {
  return (
    <Scanner
      paused={paused}
      formats={FORMATS}
      constraints={CONSTRAINTS}
      allowMultiple={false}
      sound={false}
      onScan={(codes) => {
        const text = codes[0]?.rawValue;
        if (text) onDetect(text);
      }}
      onError={(error) => onError(error.message || error.kind)}
    />
  );
}
