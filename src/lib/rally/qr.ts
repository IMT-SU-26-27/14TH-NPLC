import "server-only";
import QRCode from "qrcode";

// What the team QR holds: rally_lookup_team recognises this prefix.
export const rallyQrPayload = (token: string) => `nplc-rally:${token}`;

// An SVG, so the QR is rendered on the server and adds no JavaScript to the page.
export function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: "svg", errorCorrectionLevel: "M", margin: 2 });
}
