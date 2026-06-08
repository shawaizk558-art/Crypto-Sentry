import { MarketExplorer } from "@/components/market/market-explorer";
import { Suspense } from "react";

// Market explorer page route for browsing top coins.
export default function MarketPage() {
  return (
    <Suspense fallback={<p className="page-container font-mono text-sm text-muted">Loading market…</p>}>
      <MarketExplorer />
    </Suspense>
  );
}
