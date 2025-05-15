"use client";

import { useState, useEffect } from "react";

export default function VisitorCount() {
  const [count, setCount] = useState<string | number>("…");

  useEffect(() => {
    fetch(
      "https://anthroposcity-tokens.anthroposcity.workers.dev/visitorCount",
      { method: "GET" }
    )
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data: { count: number }) => setCount(data.count))
      .catch(() => setCount("Failed to load"));
  }, []);

  return (
    <span className="text-yellow-400 font-semibold">
      {count}
    </span>
  );
}
