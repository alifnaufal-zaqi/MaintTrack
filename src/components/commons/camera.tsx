"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import jsQR from "jsqr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useQrStore } from "@/lib/stores/qr-store";
import { useRouter } from "next/navigation";

type CameraProps = {
  onQrTagChange: (tag: string) => void;
};

export function Camera({ onQrTagChange }: CameraProps) {
  const setTag = useQrStore((state) => state.setTag);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number | null>(null);

  const lastScannedTime = useRef<number>(0);
  const lastScannedCode = useRef<string>("");

  const [cameraSelected, setCameraSelected] = useState<"environment" | "user">(
    "environment"
  );

  useEffect(() => {
    let isMounted = true;
    let activeStream: MediaStream | null = null;

    const canvasElement = document.createElement("canvas");
    const canvasContext = canvasElement.getContext("2d", {
      willReadFrequently: true,
    });

    const scanFrame = () => {
      const video = videoRef.current;

      if (
        video &&
        video.readyState === video.HAVE_ENOUGH_DATA &&
        canvasContext
      ) {
        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;

        canvasContext.drawImage(
          video,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );

        const imageData = canvasContext.getImageData(
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          const now = Date.now();
          const cooldownPeriod = 3000;

          if (
            code.data !== lastScannedCode.current ||
            now - lastScannedTime.current > cooldownPeriod
          ) {
            lastScannedCode.current = code.data;
            lastScannedTime.current = now;

            toast.success(`Aset Ditemukan: ${code.data}`);
            // Buat sebuah callback function untuk melakukan aksi di parent component supaya menjadi reuseable
            // setTag(code.data);
            // router.push("/dashboard/operator/movements/create");
            onQrTagChange(code.data);
          }
        }
      }

      requestRef.current = requestAnimationFrame(scanFrame);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: cameraSelected } })
      .then((stream) => {
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadeddata = () => {
            scanFrame();
          };
        }
      })
      .catch((error) => {
        if (isMounted) {
          toast.error("Akses Kamera Gagal", { description: error.message });
        }
      });

    return () => {
      isMounted = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [cameraSelected]);

  return (
    <div className="w-full h-full space-y-4">
      <div className="w-full relative">
        <video
          autoPlay
          playsInline
          ref={videoRef}
          className="w-full h-auto bg-black rounded-md aspect-video object-cover"
        ></video>
      </div>

      <Select
        defaultValue={cameraSelected}
        onValueChange={(value) =>
          setCameraSelected(value as typeof cameraSelected)
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="w-full">
          <SelectItem value="environment">Kamera Belakang</SelectItem>
          <SelectItem value="user">Kamera Depan</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
