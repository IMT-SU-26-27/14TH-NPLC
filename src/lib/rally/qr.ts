import "server-only";
import QRCode from "qrcode";

// An SVG, so the QR is rendered on the server and adds no JavaScript to the page.
export function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: "svg", errorCorrectionLevel: "M", margin: 2 });
}
