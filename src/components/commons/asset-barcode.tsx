import { QRCodeSVG } from "qrcode.react";

export function AssetBarcode({
  tag,
  margin,
  size = 200,
}: {
  tag: string;
  margin?: string;
  size?: number;
}) {
  return <QRCodeSVG className={`${margin}`} value={tag} size={size} />;
}
