import { QRCodeSVG } from "qrcode.react";

export function AssetBarcode({
  tag,
  margin,
}: {
  tag: string;
  margin?: string;
}) {
  return <QRCodeSVG className={`${margin}`} value={tag} size={200} />;
}
