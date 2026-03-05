import { ReactNode } from "react";
import SharedCalendar from "@/components/SharedCalendar";

export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <SharedCalendar role="vendor" />
    </div>
  );
}
