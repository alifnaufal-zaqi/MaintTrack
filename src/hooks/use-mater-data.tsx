import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import usePagination from "./use-pagination";
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
  const { data, isLoading } = useQuery<T | null>({
    queryKey: [...key],
    queryFn: async () => {
      const query = supabase.from(table).select(select).order("created_at");

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

      const { data, error } = await query;

      if (error) {
        toast.error("Gagal", {
          description: error.message,
        });
      }

      return data as T;
    },
  });

  return {
    data,
    isLoading,
  };
}
