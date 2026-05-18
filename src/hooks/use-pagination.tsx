import { useState } from "react";

export default function usePagination() {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setLimit(limit);
    setPage(1);
  };

  return {
    page,
    limit,
    handlePageChange,
    handleLimitChange,
  };
}
