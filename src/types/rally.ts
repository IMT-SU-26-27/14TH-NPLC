export type QrScannerProps = {
  paused?: boolean;
  onDetect: (text: string) => void;
  onError: (message: string) => void;
};

export type ScanTestPanelProps = {
  expected: string;
};

export type ScanTestDetection = {
  text: string;
  elapsedMs: number;
};
