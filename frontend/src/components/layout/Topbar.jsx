"use client";

import { LogOut } from "lucide-react";
import useAuth from "@/src/hooks/useAuth";

const Topbar = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-600">
            {user.name} · {user.role}
          </span>
        )}
        <button
          type="button"
          onClick={logout}
          aria-label="Log out"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
