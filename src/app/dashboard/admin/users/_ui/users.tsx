"use client";

import { resetPassword } from "@/app/actions/reset-password";
import { ActionButton } from "@/components/commons/action-button";
import { FieldInput } from "@/components/commons/field-input";
import { PaginationButton } from "@/components/commons/pagination-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { USERS_TABLE_HEADER } from "@/constants/users-constant";
import { useMasterData } from "@/hooks/use-mater-data";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import useTotalPage from "@/hooks/use-total-page";
import { User } from "@/types/users";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

export function AssetsUsers() {
  const router = useRouter();
  const { page, limit, handleLimitChange, handlePageChange } = usePagination();
  const { keyword, handleKeywordChange } = useSearch();
  const { data: users, isLoading } = useMasterData<User[] | null>({
    table: "user_profiles",
    key: ["users", page, limit, keyword],
    keyword,
    offset: { from: (page - 1) * limit, to: page * limit - 1 },
  });
  const [dialogState, setDialogState] = useState({ reset: false });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const resetPasswordWithId = resetPassword.bind(null, selectedUser?.user_id);
  const [state, action, loading] = useActionState(
    resetPasswordWithId,
    undefined
  );
  const { totalPage } = useTotalPage(users, limit);

  useEffect(() => {
    if (state?.status === "success") {
      toast.success("Berhasil", { description: state.message });
      setDialogState((prev) => ({ ...prev, reset: false }));
    }

    if (state?.status === "error" && state?.message) {
      toast.error("Gagal", { description: state.message });
    }
  }, [state, router]);

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl text-primary font-bold">
        Manajemen Data Pengguna
      </h1>

      <Card className="p-2 flex flex-row gap-2 items-center">
        <Input
          type="search"
          placeholder="Cari data pengguna berdasarkan nama"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleKeywordChange(event.target.value)
          }
        />

        <Link href="/dashboard/admin/users/create">
          <Button>
            <span>
              <Plus />
            </span>
            Tambah Pengguna
          </Button>
        </Link>
      </Card>

      <Card className="p-0">
        <Table className="w-full rounded-lg overflow-hidden">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {USERS_TABLE_HEADER.map((head) => (
                <TableHead key={head} className="capitalize px-6 py-3">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {users?.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Image
                    alt={user.fullname}
                    src={user.photo_profile_url}
                    width={0}
                    height={0}
                    className="w-12 h-12 mx-4 rounded-full border"
                  />
                </TableCell>
                <TableCell className="px-6 py-3">{user.fullname}</TableCell>
                <TableCell className="px-6 py-3">{user.email}</TableCell>
                <TableCell className="px-6 py-3">{user.phone_number}</TableCell>
                <TableCell className="px-6 py-3">
                  {user.address === null ? "-" : user.address}
                </TableCell>
                <TableCell className="px-6 py-3">{user.role}</TableCell>
                <TableCell className="px-6 py-3">
                  <ActionButton
                    isResetPassword
                    onResetPasswordClick={() => {
                      setSelectedUser(user);
                      setDialogState((prev) => ({ ...prev, reset: true }));
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}

            {users?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={USERS_TABLE_HEADER.length}
                  className="h-24 text-center"
                >
                  Data belum tersedia
                </TableCell>
              </TableRow>
            )}

            {isLoading && (
              <TableRow>
                <TableCell colSpan={USERS_TABLE_HEADER.length} className="h-24">
                  <div className="flex flex-col gap-2 justify-center items-center w-full">
                    <Spinner />
                    <span>Memuat...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <PaginationButton
        currentLimit={limit}
        currentPage={page}
        onChangeLimit={handleLimitChange}
        onChangePage={handlePageChange}
        totalPages={totalPage}
      />

      <Dialog
        open={dialogState.reset}
        onOpenChange={(value) =>
          setDialogState((prev) => ({ ...prev, reset: value }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Ubah password pengguna anda disini
            </DialogDescription>
          </DialogHeader>
          <form action={action}>
            <FieldSet>
              <FieldGroup>
                <FieldInput
                  id="password"
                  name="newPassword"
                  error={state?.errors?.newPassword?.[0]}
                  label="Password Baru"
                  type="password"
                  placeholder="*****"
                />
                <FieldInput
                  id="confirmPassword"
                  name="confirmPassword"
                  error={state?.errors?.confirmPassword?.[0]}
                  label="Konfirmasi Password"
                  type="password"
                  placeholder="*****"
                />
              </FieldGroup>
            </FieldSet>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant={"outline"}>Tutup</Button>
              </DialogClose>
              <Button type="submit">{loading ? <Spinner /> : "Edit"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
