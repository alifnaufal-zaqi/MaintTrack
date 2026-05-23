"use client";

import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

type DropzoneUploadProps = {
  id: string;
  name: string;
  error?: string;
};

export function DropzoneUpload({ id, name, error }: DropzoneUploadProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="
          border-2
          border-dashed
          rounded-lg
          p-8
          flex
          flex-col
          items-center
          justify-center
          cursor-pointer
          text-center
          w-full
          min-h-[300px]
        "
      >
        <Upload className="h-10 w-10 text-muted-foreground" />

        <p className="font-medium mt-4">Upload file</p>

        <p className="text-sm text-muted-foreground">
          Drag and drop atau pilih file
        </p>

        <p className="text-sm text-muted-foreground">
          Maksimum ukuran file: 2 MB
        </p>

        <Input id={id} name={name} type="file" className="hidden" />
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
