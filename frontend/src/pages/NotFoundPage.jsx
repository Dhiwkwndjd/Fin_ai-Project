import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-emerald-600">404</p>
      <h1 className="mt-2 text-xl font-semibold">Страница не найдена</h1>
      <p className="mt-2 text-slate-500">Проверьте адрес или вернитесь на главную.</p>
      <Link to="/dashboard" className="mt-4 text-emerald-700 hover:underline">
        На главную
      </Link>
    </div>
  );
}
