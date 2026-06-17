import { supabaseAuthAdminClient } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron (in production)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = supabaseAuthAdminClient;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Calculate 7 days from now
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysStr = sevenDaysFromNow.toISOString().split("T")[0];

    // Fetch assets where next_maintenance_date is within 7 days (today < next_maintenance_date <= today + 7)
    const { data: assets, error: fetchError } = await supabase
      .from("assets")
      .select("id, name, next_maintenance_date")
      .gt("next_maintenance_date", todayStr)
      .lte("next_maintenance_date", sevenDaysStr);

    if (fetchError) {
      console.error("Error fetching assets:", fetchError.message);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    if (!assets || assets.length === 0) {
      return NextResponse.json({
        message: "Tidak ada aset yang mendekati jadwal maintenance",
        notificationsCreated: 0,
      });
    }

    // Build notification records
    const notifications = assets.map((asset) => {
      const nextDate = new Date(asset.next_maintenance_date);
      const diffTime = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        asset_id: asset.id,
        title: "Aset mendekati jadwal maintenance",
        message: `Asset ${asset.name} harus dimaintenance dalam ${diffDays} hari, jatuh tempo ${asset.next_maintenance_date}`,
        is_read: false,
      };
    });

    // Insert all notifications in a single batch
    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertError) {
      console.error("Error inserting notifications:", insertError.message);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Reminder notifications created successfully",
      notificationsCreated: notifications.length,
      assets: assets.map((a) => a.name),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
