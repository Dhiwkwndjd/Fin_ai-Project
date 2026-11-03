import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="py-16 text-center">
      <ShieldAlert className="mx-auto text-red-500" size={48} />
      <h1 className="mt-4 text-2xl font-bold">Нет доступа</h1>
      <p className="mt-2 text-slate-500">Эта страница доступна только администратору.</p>
      <Link to="/dashboard" className="mt-4 inline-block text-emerald-700 hover:underline">
        Вернуться на дашборд
      </Link>
    </div>
  );
}
