import { useState } from "react";

export default function useSearch() {
  const [keyword, setKeyword] = useState<string>("");
  const handleKeywordChange = (value: string) => setKeyword(value);

  return { keyword, handleKeywordChange };
}
