import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import dayjs from "dayjs";

import Card from "../components/ui/Card";
import DataState from "../components/ui/DataState";
import PageTitle from "../components/ui/PageTitle";
import useFetch from "../hooks/useFetch";
import { formatMoney } from "../utils/formatMoney";

export default function TransactionDetailPage() {
  const { id } = useParams();
  const { data: transaction, isLoading, error } = useFetch(`/transactions/${id}`);

  return (
    <div>
      <Link to="/transactions" className="mb-4 inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline">
        <ArrowLeft size={16} />
        Ко всем транзакциям
      </Link>

      <PageTitle title={`Транзакция №${id}`} />

      <DataState isLoading={isLoading} error={error}>
        {transaction && (
          <Card className="max-w-lg space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Описание: </span>
              {transaction.description || "Без описания"}
            </p>
            <p>
              <span className="text-slate-500">Тип: </span>
              {transaction.kind === "income" ? "Доход" : "Расход"}
            </p>
            <p>
              <span className="text-slate-500">Сумма: </span>
              {formatMoney(transaction.amount)}
            </p>
            <p>
              <span className="text-slate-500">Категория: </span>
              {transaction.category.name}
            </p>
            <p>
              <span className="text-slate-500">Счёт: </span>
              {transaction.account.name}
            </p>
            <p>
              <span className="text-slate-500">Дата: </span>
              {dayjs(transaction.date).format("DD.MM.YYYY")}
            </p>
          </Card>
        )}
      </DataState>
    </div>
  );
}
