import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Sidebar />
      <div className="ml-60 p-5">
        <TopHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}
