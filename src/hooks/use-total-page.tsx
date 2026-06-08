import { useMemo } from "react";

export default function useTotalPage<T>(
  data: T[] | null | undefined,
  limit: number
) {
  const totalPage = useMemo(() => {
    return data && data.length !== 0 ? Math.ceil(data.length / limit) : 0;
  }, [data]);

  return { totalPage };
}
