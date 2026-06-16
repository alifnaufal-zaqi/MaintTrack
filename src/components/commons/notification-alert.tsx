"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MailCheck, MailOpen } from "lucide-react";
import { createClient } from "@/lib/client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "../ui/spinner";
import { Notification } from "@/types/notifications";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export function NotificationAlert() {
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const { data: notifications, isLoading: notificationsLoading } = useQuery<
    Notification[] | null
  >({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
            id,
            title,
            message,
            is_read,
            created_at
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        toast.error("Gagal", { description: error.message });
      }

      return data as Notification[] | null;
    },
  });
  const { data: allNotifications, isLoading: allNotificationsLoading } =
    useQuery<Notification[] | null>({
      queryKey: ["notifications"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("notifications")
          .select(
            `
            id,
            title,
            message,
            is_read,
            created_at
        `
          )
          .order("created_at", { ascending: false });

        if (error) {
          toast.error("Gagal", { description: error.message });
        }

        return data as Notification[] | null;
      },
    });
  const { mutate: updateStatusNotification } = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", notificationId)
        .single();

      if (data && data.is_read) {
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onError: (error) => toast.error("Gagal", { description: error.message }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const notificationCount = useMemo(() => {
    return notifications?.filter((notification) => !notification.is_read)
      .length;
  }, [notifications]);

  useEffect(() => {
    const channel = supabase
      .channel("notification")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new as Notification & {
            asset_id: string;
          };
          toast.success(payload.new.title, {
            icon: <MailCheck />,
            action: (
              <Button
                onClick={() => {
                  setSelectedNotification({
                    id: newNotification.id,
                    created_at: newNotification.created_at,
                    is_read: newNotification.is_read,
                    message: newNotification.message,
                    title: newNotification.title,
                  });
                  setIsNotificationOpen(true);
                }}
              >
                Lihat Detail
              </Button>
            ),
            cancel: <Button>Tutup</Button>,
            duration: 2000,
            description: payload.new.message,
          });
          queryClient.invalidateQueries({
            queryKey: ["notifications"],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, router]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="text-[12px] text-white absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500">
              {notificationCount ?? 0}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          {notificationsLoading && (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <Spinner />
            </div>
          )}
          {notifications?.length === 0 && (
            <DropdownMenuItem className="flex justify-center">
              Tidak ada Notifikasi
            </DropdownMenuItem>
          )}
          {notifications?.map((notification) => (
            <DropdownMenuItem
              className="p-2 flex gap-2"
              key={notification.id}
              onClick={() => {
                setSelectedNotification(notification);
                setIsNotificationOpen(true);
                updateStatusNotification(notification.id);
              }}
            >
              <div className="p-2 bg-gray-300 rounded-full">
                {notification.is_read ? (
                  <MailOpen className="size-4" />
                ) : (
                  <Mail className="size-4" />
                )}
              </div>
              <div className="grow">
                <h3 className="text-sm font-semibold">{notification.title}</h3>
                <p className="text-[13px]">
                  {notification.message.split(" ").slice(0, 4).join(" ") +
                    " ..."}
                </p>
                <span className="text-[12px] text-muted-foreground">
                  {notification.created_at
                    .split("T")
                    .filter((item) => item !== "T")
                    .join(" ")
                    .slice(0, 19)}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
          {notifications?.length !== undefined &&
            notifications?.length >= 1 && (
              <>
                <DropdownMenuSeparator />
                <div className="w-full flex justify-end p-2 mt-2">
                  <Dialog>
                    <DialogTrigger>
                      <Button
                        variant={"link"}
                        className="text-blue-700 hover:underline"
                      >
                        Lihat semua notifikasi
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="md:max-w-xl md:px-8">
                      <DialogHeader>
                        <DialogTitle>Pesan Masuk</DialogTitle>
                        <DialogDescription>
                          Lihat pesan masuk disini
                        </DialogDescription>
                      </DialogHeader>
                      {allNotificationsLoading && (
                        <div className="w-full h-full flex flex-col justify-center items-center">
                          <Spinner />
                        </div>
                      )}
                      {allNotifications?.length === 0 && (
                        <div className="w-full h-full flex flex-col justify-center items-center">
                          <p>Tidak ada pesan masuk</p>
                        </div>
                      )}
                      {allNotifications?.map((notification) => (
                        <Card
                          className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto cursor-pointer"
                          onClick={() => {
                            setSelectedNotification(notification);
                            setIsNotificationOpen(true);
                          }}
                        >
                          <CardHeader>
                            <CardTitle>{notification.title}</CardTitle>
                            <CardDescription>
                              {notification.created_at
                                .split("T")
                                .filter((item) => item !== "T")
                                .join(" ")
                                .slice(0, 19)}
                            </CardDescription>
                            <CardContent className="p-0">
                              <p>
                                {notification.message
                                  .split(" ")
                                  .slice(0, 5)
                                  .join(" ") + " ..."}
                              </p>
                            </CardContent>
                          </CardHeader>
                        </Card>
                      ))}
                    </DialogContent>
                  </Dialog>
                </div>
              </>
            )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog
        open={isNotificationOpen}
        onOpenChange={(value) => setIsNotificationOpen(value)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title}</DialogTitle>
            <DialogDescription>
              {selectedNotification?.created_at
                .split("T")
                .filter((item) => item !== "T")
                .join(" ")
                .slice(0, 19)}
            </DialogDescription>
          </DialogHeader>
          <p>{selectedNotification?.message}</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Tutup</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
