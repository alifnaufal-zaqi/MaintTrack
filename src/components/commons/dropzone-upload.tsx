import {
  useSupabaseUpload,
  UseSupabaseUploadReturn,
} from "@/hooks/use-supabase-upload";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "../dropzone";
import { cn } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "../ui/field";

type DropzoneUploadProps = {
  pathName: string;
  name: string;
  id: string;
  label: string;
  error: string | undefined;
  files?: UseSupabaseUploadReturn["files"];
};

export function DropzoneUpload({
  pathName,
  name,
  label,
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
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
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
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
