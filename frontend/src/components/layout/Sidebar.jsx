"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileQuestion, ClipboardList, BarChart3, Tags , UserRoundPen} from "lucide-react";
import useAuth from "@/src/hooks/useAuth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/questions", label: "Questions", icon: FileQuestion },
  { href: "/dashboard/categories", label: "Categories", icon: Tags, staffOnly: true },
  { href: "/dashboard/tests", label: "Tests", icon: ClipboardList },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, staffOnly: true },
  { href: "/dashboard/users", label: "Users", icon: UserRoundPen, staffOnly: true },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "teacher";

  return (
    <aside className="flex h-screen w-64 flex-col gap-2 border-r border-gray-200 bg-white p-4">
      <div className="mb-6 px-2 text-lg font-bold text-primary-600">Question Hub</div>
      <nav className="flex flex-col gap-1" aria-label="Main navigation">
        {NAV_ITEMS.filter((item) => !item.staffOnly || isStaff).map(
          ({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          }
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
