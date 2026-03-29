import type { Metadata } from "next";
import  DashboardOverview from "@/components/dashboard/DashboardOverview";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Overview of the CTSE system",
};

export default function Dashboard() {
  return (
    <div className="space-y-4 md:space-y-6">
      <DashboardOverview />
    </div>
  );
}
