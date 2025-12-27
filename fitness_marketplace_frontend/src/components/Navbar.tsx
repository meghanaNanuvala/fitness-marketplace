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
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    navigate(`/AllItemsPage?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
        
        {/* Brand */}
        <Link to="/AllItemsPage" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
            FM
          </span>
          <span className="font-semibold tracking-tight">Fitness Marketplace</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink
            to="/AllItemsPage"
            className={({ isActive }) =>
              `text-sm ${isActive ? "text-indigo-600 font-medium" : "text-slate-700 hover:text-slate-900"}`
            }
          >
            All items
          </NavLink>

          <NavLink
            to="/sell"
            className={({ isActive }) =>
              `text-sm ${isActive ? "text-indigo-600 font-medium" : "text-slate-700 hover:text-slate-900"}`
            }
          >
            Sell an item
          </NavLink>

          {/* 🛒 CART LINK */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `text-sm ${isActive ? "text-indigo-600 font-medium" : "text-slate-700 hover:text-slate-900"}`
            }
          >
            🛒 Cart
          </NavLink>

          {/* 🛍 BOUGHT / PURCHASED ITEMS LINK */}
          <NavLink
            to="/bought-items"
            className={({ isActive }) =>
              `text-sm ${isActive ? "text-indigo-600 font-medium" : "text-slate-700 hover:text-slate-900"}`
            }
          >
            🛍 Bought Items
          </NavLink>
        </div>

        {/* --- Search Bar (AFTER LINKS HERE) --- */}
        <div className="hidden md:flex flex-grow justify-center min-w-0">
          <form onSubmit={handleSearchSubmit} className="max-w-md w-full">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items..."
                className="w-full h-9 rounded-full border border-slate-300 py-1 pl-4 pr-10 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* User */}
        <div className="relative ml-auto flex-shrink-0">
          <button
            onClick={() => setOpen((o) => !o)}
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
              <span className="block -mt-0.5 text-[11px] text-slate-500">{user.email}</span>
            </span>

            <svg width="16" height="16" viewBox="0 0 20 20" className="text-slate-500">
              <path d="M5 7l5 6 5-6H5z" fill="currentColor" />
            </svg>
          </button>

          {/* Dropdown */}
          {open && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg p-1"
              onMouseLeave={() => setOpen(false)}
            >
              <Link
                to="/cart"
                className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                🛒 Cart
              </Link>

              <Link
                to="/bought-items"
                className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                🛍 Bought Items
              </Link>

              <Link
                to="/profile"
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
