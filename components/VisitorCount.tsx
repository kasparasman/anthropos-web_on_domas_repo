"use client";

import { useVisitorCount } from "@/hooks/useVisitorCount";

export default function VisitorCount() {
  const { count, isLoading, error } = useVisitorCount();

  let content;
  if (isLoading) {
    content = "…";
  } else if (error) {
    content = "Failed to load";
  } else {
    content = count;
  }

  return (
    <span className="text-yellow-400 font-semibold">
      {content}
    </span>
  );
}
