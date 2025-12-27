import { Link, useNavigate, NavLink } from "react-router-dom";
import { useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join("");
}

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
//   const navigate = useNavigate(); 
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
        {/* Brand */}
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
            FM
        </span>
        <span className="font-semibold tracking-tight">Fitness Marketplace</span>

        {/* User */}
        <div className="relative ml-auto flex-shrink-0">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 rounded-full border px-2.5 py-1.5 hover:bg-slate-50"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="h-7 w-7 rounded-full bg-indigo-600 text-white text-xs grid place-items-center">
                {initials(user.name)}
              </span>
            )}

            <span className="hidden sm:block text-sm">
              <span className="font-medium">{user.name}</span>
              <span className="block -mt-0.5 text-[11px] text-slate-500">
                {user.email}
              </span>
            </span>

            <svg width="16" height="16" viewBox="0 0 20 20" className="text-slate-500">
              <path d="M5 7l5 6 5-6H5z" fill="currentColor" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg p-1"
              onMouseLeave={() => setOpen(false)}
            >

              <Link
                to="/adminprofile"
                className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>

              <Link
                to="/"
                className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                onClick={() => {
                  localStorage.removeItem("currentUser");
                  setOpen(false);
                }}
              >
                Sign out
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}