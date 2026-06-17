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
import { Profile } from "@/types/auth";
import { getUrlImage } from "@/utils/get-url-image";
import { uploadFileToStorage } from "@/utils/upload-file";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Pencil, UserCog } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";

// Helper to map Supabase snake_case response to camelCase Profile type
function mapToProfile(data: Record<string, unknown>): Omit<Profile, "userId"> {
  return {
    id: data.id as string,
    fullname: data.fullname as string,
    email: data.email as string,
    phoneNumber: data.phone_number as string,
    address: data.address as string,
    photoProfileUrl: data.photo_profile_url as string,
    photoProfilePath: data.photo_profile_path as string,
    role: data.role as "admin" | "operator",
    createdAt: data.created_at as string,
  };
}

export function ProfileUser() {
  const profileState = useAuthStore((state) => state.profile);
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<Omit<Profile, "userId"> | null>(
    {
      queryKey: ["profiles"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("user_profiles")
          .select(
            "id, fullname, email, phone_number, address, photo_profile_url, photo_profile_path, role, created_at"
          )
          .eq("user_id", profileState?.userId)
          .single();

        if (error) toast.error("Gagal", { description: error.message });
        if (!data) return null;

        return mapToProfile(data);
      },
    }
  );

  // Mutation for updating profile data with optimistic update
  const { mutate: mutateProfile, isPending: profileLoading } = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateProfile(
        profileState?.userId,
        undefined,
        formData
      );

      if (result?.status === "error") {
        throw new Error(result.message || "Gagal mengubah profile");
      }

      return {
        fullname: formData.get("fullname") as string,
        email: formData.get("email") as string,
        phoneNumber: formData.get("phone") as string,
        address: formData.get("address") as string,
      };
    },
    onMutate: async (formData: FormData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["profiles"] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<Omit<Profile, "userId"> | null>(["profiles"]);

      // Optimistically update the cache
      if (previousProfile) {
        queryClient.setQueryData<Omit<Profile, "userId"> | null>(["profiles"], {
          ...previousProfile,
          fullname: (formData.get("fullname") as string) || previousProfile.fullname,
          email: (formData.get("email") as string) || previousProfile.email,
          phoneNumber: (formData.get("phone") as string) || previousProfile.phoneNumber,
          address: (formData.get("address") as string) || previousProfile.address,
        });
      }

      return { previousProfile };
    },
    onError: (error, _variables, context) => {
      // Rollback to previous data on error
      if (context?.previousProfile) {
        queryClient.setQueryData(["profiles"], context.previousProfile);
      }
      toast.error("Gagal", { description: error.message });
    },
    onSuccess: () => {
      toast.success("Berhasil", { description: "Berhasil mengubah profile" });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mutateProfile(formData);
  };

  const handleProfileChange = async (image: File) => {
    const supabase = createClient();

    // Snapshot the previous profile for rollback
    const previousProfile = queryClient.getQueryData<Omit<Profile, "userId"> | null>(["profiles"]);

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
          .update(profile?.photoProfilePath as string, image, {
            contentType: image.type,
          });

      if (updateFileError) {
        toast.error("Gagal", { description: updateFileError.message });
        return;
      }

      imagePath = updateFileData!.path;
    }

    const imageUrl = getUrlImage(imagePath);

    // Optimistically update the UI with local preview
    if (previousProfile) {
      const localPreviewUrl = URL.createObjectURL(image);
      queryClient.setQueryData<Omit<Profile, "userId"> | null>(["profiles"], {
        ...previousProfile,
        photoProfileUrl: localPreviewUrl,
        photoProfilePath: imagePath!,
      });
    }

    const { error: updateProfileError } = await supabase
      .from("user_profiles")
      .update({
        photo_profile_url: imageUrl,
        photo_profile_path: imagePath,
      })
      .eq("id", profile!.id);

    if (updateProfileError) {
      // Rollback on error
      if (previousProfile) {
        queryClient.setQueryData(["profiles"], previousProfile);
      }
      toast.error("Gagal", { description: updateProfileError.message });
      return;
    }

    // Refetch to get the real URL from server
    queryClient.invalidateQueries({ queryKey: ["profiles"] });

    toast.success("Berhasil", {
      description: "Berhasil memperbarui photo profile",
    });
  };

  if (!profile || !profileState) {
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
              Dibuat pada: {profile.createdAt?.split("T")[0] ?? "-"}
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
          <form onSubmit={handleSubmit}>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="fullname">Nama Lengkap</FieldLabel>
                  <Input
                    id="fullname"
                    type="text"
                    defaultValue={profile.fullname}
                    name="fullname"
                    key={`fullname-${profile.fullname}`}
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
                      key={`email-${profile.email}`}
                    />
                  </div>
                  <div className="w-full">
                    <FieldLabel htmlFor="phone">Nomor Telepon</FieldLabel>
                    <Input
                      type="tel"
                      name="phone"
                      id="phone"
                      defaultValue={profile.phoneNumber}
                      key={`phone-${profile.phoneNumber}`}
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
                    key={`address-${profile.address}`}
                  />
                </Field>
                <Field className="flex flex-row justify-end">
                  <Button type="submit" className="max-w-32" disabled={profileLoading}>
                    {profileLoading ? <Spinner /> : "Simpan Profile"}
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
