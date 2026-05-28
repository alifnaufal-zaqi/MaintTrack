"use client";

import Link from "next/link";

import { Card } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { QrCode } from "lucide-react";

export function QrScanner() {
  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl text-primary font-bold">Scan QR Asset</h1>

      <Card className="p-10 flex flex-col items-center justify-center gap-5">
        <QrCode className="w-28 h-28 text-primary" />

        <p className="text-muted-foreground text-center">
          Fitur scan QR Code maintenance asset
        </p>

        <Button>Mulai Scan</Button>

        <Link href="/dashboard/operator/maintenances">
          <Button variant="outline">Kembali</Button>
        </Link>
      </Card>
    </div>
  );
}
