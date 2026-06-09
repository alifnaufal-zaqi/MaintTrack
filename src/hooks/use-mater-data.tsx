import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type UseMasterDataType = {
  table: string;
  select?: string;
  offset?: { from: number; to: number };
  keyword?: string;
  where?: { col: string; value: string };
  key: unknown[];
};

export function useMasterData<T>({
  table,
  select = "*",
  keyword,
  where,
  offset,
  key,
}: UseMasterDataType) {
  const supabase = createClient();
  const { data, isLoading } = useQuery<{
    data: T | null;
    count: number | null;
  }>({
    queryKey: [...key],
    queryFn: async () => {
      const query = supabase
        .from(table)
        .select(select, { count: "exact" })
        .order("created_at");

      if (offset) {
        query.range(offset.from, offset.to);
        query.ilike(
          table === "user_profiles" ? "fullname" : "name",
          `%${keyword}%`
        );
      }

      if (where) {
        query.eq(where.col, where.value).single();
      }

      const { data, error, count } = await query;

      if (error) {
        toast.error("Gagal", {
          description: error.message,
        });
      }

      return { data: data as T, count };
    },
  });

  return {
    data,
    isLoading,
  };
}
