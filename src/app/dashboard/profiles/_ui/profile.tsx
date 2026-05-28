"use client";

import { updateProfile } from "@/app/actions/update-profile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getUrlImage } from "@/utils/get-url-image";
import { uploadFileToStorage } from "@/utils/upload-file";
import { ChevronLeft, Pencil, UserCog } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useActionState, useEffect } from "react";
import { toast } from "sonner";

export function ProfileUser() {
  const profile = useAuthStore((state) => state.profile);
  const updateProfileWithUserId = updateProfile.bind(null, profile?.userId);
  const [state, action, loading] = useActionState(
    updateProfileWithUserId,
    undefined
  );

  useEffect(() => {
    if (state?.status === "success") {
      toast.success("Berhasil", { description: state.message });
    }

    if (state?.status === "error" && state.message) {
      toast.error("Gagal", { description: state.message });
    }
  }, [state]);

  const handleProfileChange = async (image: File) => {
    const supabase = createClient();
    let imagePath: string | null = null;

    if (profile?.photoProfileUrl.includes("default.jpg")) {
      const { data: uploadData, error: uploadError } =
        await uploadFileToStorage(image, "user");

      if (uploadError) {
        toast.error("Gagal", { description: uploadError });
        return;
      }

      imagePath = uploadData!.path;
    } else {
      const { data: updateFileData, error: updateFileError } =
        await supabase.storage
          .from("MaintTrack-Assets")
          .update(`user/${profile?.photoProfilePath}`, image, {
            contentType: image.type,
          });

      if (updateFileError) {
        toast.error("Gagal", { description: updateFileError.message });
        return;
      }

      imagePath = updateFileData!.path;
    }

    const imageUrl = getUrlImage(imagePath);
    const { error: updateProfileError } = await supabase
      .from("user_profiles")
      .update({
        photo_profile_url: imageUrl,
        photo_profile_path: imagePath,
      })
      .eq("id", profile!.id);

    if (updateProfileError) {
      toast.error("Gagal", { description: updateProfileError.message });
      return;
    }

    toast.success("Berhasil", {
      description: "Berhasil memperbarui photo profile",
    });
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 w-full">
      <div className="flex gap-2 items-center">
        <Card className="p-2">
          <Link href={`/dashboard/${profile.role}`}>
            <ChevronLeft />
          </Link>
        </Card>
        <h1 className="text-3xl font-bold text-primary">Profile Pengguna</h1>
      </div>
      <div className="flex flex-col gap-8">
        <Card className="p-4 w-full flex flex-row gap-4 jus items-center">
          <div className="flex flex-col relative gap-4">
            <Image
              className="w-32 h-32 mt-4 object-cover rounded-md"
              alt={profile.id}
              src={profile.photoProfileUrl}
              width={0}
              height={0}
            />
            <label
              htmlFor="photo"
              className="p-3 cursor-pointer w-fit rounded-full bg-primary absolute -bottom-2 -right-2"
            >
              <Pencil className="size-4 text-white" />
              <input
                id="photo"
                name="photo"
                type="file"
                className="hidden"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleProfileChange(event.target.files![0])
                }
              />
            </label>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-primary">
              {profile.fullname}
            </h2>
            <p className="text-lg text-muted-foreground font-semibold">
              {profile.role}
            </p>
            <span className="text-md font-light">
              Dibuat pada: {profile.createdAt.split("T")[0]}
            </span>
          </div>
        </Card>
        <Card className="p-4 w-full">
          <div className="flex gap-2 items-center">
            <UserCog className="text-primary" />
            <p className="font-semibold text-md text-primary">
              Informasi Pengguna
            </p>
          </div>
          <form action={action}>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="fullname">Nama Lengkap</FieldLabel>
                  <Input
                    id="fullname"
                    type="text"
                    defaultValue={profile.fullname}
                    name="fullname"
                  />
                </Field>
                <Field orientation={"horizontal"}>
                  <div className="w-full">
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue={profile.email}
                    />
                  </div>
                  <div className="w-full">
                    <FieldLabel htmlFor="phone">Nomor Telepon</FieldLabel>
                    <Input
                      type="tel"
                      name="phone"
                      id="phone"
                      defaultValue={profile.phoneNumber}
                    />
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Alamat</FieldLabel>
                  <Textarea
                    className="h-32 resize-none"
                    name="address"
                    id="address"
                    defaultValue={profile.address}
                  />
                </Field>
                <Field className="flex flex-row justify-end">
                  <Button type="submit" className="max-w-32">
                    {loading ? <Spinner /> : "Simpan Profile"}
                  </Button>
                </Field>
              </FieldGroup>
            </FieldSet>
          </form>
        </Card>
      </div>
    </div>
  );
}
