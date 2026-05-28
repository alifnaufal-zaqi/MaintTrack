import { QRCodeSVG } from "qrcode.react";

export function AssetBarcode({ tag }: { tag: string }) {
  return <QRCodeSVG value={tag} size={200} />;
}
