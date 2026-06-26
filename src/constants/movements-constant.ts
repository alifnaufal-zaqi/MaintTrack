import { Form, QrCode } from "lucide-react";

export const MOVEMENTS_TABLE_HEADER = [
  "gambar aset",
  "nama aset",
  "lokasi awal",
  "lokasi tujuan",
  "tanggal pindah",
  "pic",
  "aksi",
];

export const DROPDOWN_MENUS = [
  {
    label: "Input QRTag",
    icon: Form,
  },
  {
    label: "Scan QRCode",
    icon: QrCode,
  },
];
