import {
  useSupabaseUpload,
  UseSupabaseUploadReturn,
} from "@/hooks/use-supabase-upload";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "../dropzone";
import { cn } from "@/lib/utils";

type DropzoneUploadProps = {
  pathName: string;
  name: string;
  id: string;
  error: string | undefined;
  files?: UseSupabaseUploadReturn["files"];
};

export function DropzoneUpload({
  pathName,
  name,
  id,
  error,
}: DropzoneUploadProps) {
  const props = useSupabaseUpload({
    bucketName: "MaintTrack-Assets",
    path: pathName,
    allowedMimeTypes: ["image/jpg", "image/png", "image/jpeg", "image/svg"],
    maxFiles: 1,
    maxFileSize: 1000 * 1000 * 2,
  });

  return (
    <div className="p-1 space-y-2 h-full">
      <Dropzone
        {...props}
        className={cn("h-full flex flex-col justify-center", {
          "border border-red-500": error,
        })}
        id={id}
        name={name}
      >
        <DropzoneContent />
        <DropzoneEmptyState />
      </Dropzone>
    </div>
  );
}
