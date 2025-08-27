"use client";

import { SWRConfig } from "swr";

export default function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        // simple retry/backoff for transient network hiccups
        errorRetryCount: 2,
        errorRetryInterval: 2000,
        // keep cache small & fresh for your use case
        dedupingInterval: 500,
        revalidateOnFocus: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}