import { Loader2 } from "lucide-react";

export default function DataState({ isLoading, error, isEmpty, emptyText = "Пока здесь пусто", children }) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  }

  if (isEmpty) {
    return <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">{emptyText}</p>;
  }

  return children;
}
