import type { DashboardAdmin, DashboardClient } from "@/models";
import { http } from "../lib/fetcher";

export const dashboardService = {
  async dashboardClient() {
    return await http<DashboardClient>("dashboard/client", {
      method: "GET",
      auth: true,
    });
  },
  async dashboardAdmin() {
    return await http<DashboardAdmin>("dashboard/admin", {
      method: "GET",
      auth: true,
    });
  },
};
