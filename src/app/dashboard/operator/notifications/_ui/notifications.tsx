"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Bell } from "lucide-react";
import { createClient } from "@/lib/client";

import { useEffect, useState } from "react";

type NotificationType = {
  id: string;
  title: string;
  description: string;
  type: string;
  created_at: string;
};

export function Notifications() {
  const supabase = createClient();

  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  // Fetch awal
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setNotifications(data);
      }
    };

    fetchNotifications();
  }, []);

  // Realtime listener
  useEffect(() => {
    const channel = supabase
      .channel("realtime-notifications")

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) => [
            payload.new as NotificationType,
            ...prev,
          ]);
        },
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter data
  const filteredNotifications = notifications.filter((notif) => {
    const matchSearch =
      notif.title.toLowerCase().includes(search.toLowerCase()) ||
      notif.description.toLowerCase().includes(search.toLowerCase());

    const matchFilter = filter === "all" || notif.type === filter;

    return matchSearch && matchFilter;
  });

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl font-bold text-primary">Pusat Notifikasi</h1>

      {/* Search + Filter */}
      <Card className="p-3 flex flex-col md:flex-row gap-3">
        <Input
          type="search"
          placeholder="Cari notifikasi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={filter} onValueChange={(value) => setFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter Notifikasi" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>

            <SelectItem value="movement">Data Movement</SelectItem>

            <SelectItem value="maintenance">Data Maintenance</SelectItem>

            <SelectItem value="asset">Data Aset</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* Notification List */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <Card key={notif.id} className="p-4 flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Bell className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1">
              <h2 className="font-semibold">{notif.title}</h2>

              <p className="text-sm text-muted-foreground">
                {notif.description}
              </p>

              <span className="text-xs text-muted-foreground">
                {new Date(notif.created_at).toLocaleString()}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
