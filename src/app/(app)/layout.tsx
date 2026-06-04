import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-bg-deep pl-[220px]">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-col">
        <TopBar />
        <main className="min-w-0 flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}
