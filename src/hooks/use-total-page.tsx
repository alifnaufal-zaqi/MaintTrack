import { useMemo } from "react";

export default function useTotalPage<T>(
  data: { data: T[] | null; count: number | null } | undefined,
  limit: number
) {
  const totalPage = useMemo(() => {
    return data?.data && data.count !== null
      ? Math.ceil(data.count / limit)
      : 0;
  }, [data]);

  return { totalPage };
}
