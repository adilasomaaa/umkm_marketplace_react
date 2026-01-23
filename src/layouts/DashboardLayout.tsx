import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useLocalStorage } from "../context/LocalStorageContext";
import Sidebar from "../components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useLocalStorage<boolean>("admin.sidebar.collapsed", false);
  const [openMobile, setOpenMobile] = useState(false);

  return (
        <div className="min-h-dvh w-full flex bg-background">
        <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((v) => !v)}
        />

        <div className="flex-1 flex flex-col">
            <Header setOpenMobile={setOpenMobile} />
            <main className="p-4">
                <Outlet />
            </main>
        </div>

        {openMobile && (
            <div className="fixed inset-0 z-50 md:hidden">
                <div className="absolute inset-0 bg-black/30" onClick={() => setOpenMobile(false)} />
                <div className="absolute inset-y-0 left-0">
                <Sidebar
                    mobile
                    collapsed={false}
                    onToggle={() => {}}
                    onCloseMobile={() => setOpenMobile(false)}
                />
                </div>
            </div>
            )}
        </div>
  );
}
