import type { Metadata } from "next";

import { QrScanner } from "../_ui/qr-scanner";

export const metadata: Metadata = {
  title: "MaintTrack | Scan QR",
};

export default function ScanQrPage() {
  return <QrScanner />;
}
