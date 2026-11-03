import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LogOut, Menu, User, Wallet, X } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const userLinks = [
  { to: "/dashboard", label: "Дашборд" },
  { to: "/transactions", label: "Транзакции" },
  { to: "/accounts", label: "Счета" },
  { to: "/categories", label: "Категории" },
  { to: "/budgets", label: "Бюджеты" },
];

const adminLinks = [
  { to: "/admin/categories", label: "Общие категории" },
  { to: "/admin/users", label: "Пользователи" },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const links = isAdmin ? [...userLinks, ...adminLinks] : userLinks;

  function getLinkClasses({ isActive }) {
    return `rounded-lg px-3 py-2 text-sm font-medium ${
      isActive ? "bg-emerald-100 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
    }`;
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold text-emerald-600">
          <Wallet size={24} />
          FinAi
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={getLinkClasses}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/profile" className="flex items-center gap-1 text-sm text-slate-600 hover:text-emerald-700">
            <User size={16} />
            {user.full_name}
          </Link>
          <button onClick={logout} className="text-slate-500 hover:text-red-600" title="Выйти">
            <LogOut size={20} />
          </button>
        </div>

        <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} title="Меню">
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 lg:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={getLinkClasses} onClick={() => setIsMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/profile" className={getLinkClasses} onClick={() => setIsMenuOpen(false)}>
            Профиль ({user.full_name})
          </NavLink>
          <button onClick={logout} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">
            Выйти
          </button>
        </nav>
      )}
    </header>
  );
}
