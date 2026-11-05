import { Link } from "react-router-dom";
import { ArrowRightLeft, PiggyBank, Tags, Wallet } from "lucide-react";

import Card from "../components/ui/Card";
import DataState from "../components/ui/DataState";
import PageTitle from "../components/ui/PageTitle";
import useAuth from "../hooks/useAuth";
import { useReferenceStore } from "../store/referenceStore";
import { formatMoney } from "../utils/formatMoney";

const quickLinks = [
  { to: "/transactions", label: "Транзакции", Icon: ArrowRightLeft },
  { to: "/accounts", label: "Счета", Icon: Wallet },
  { to: "/categories", label: "Категории", Icon: Tags },
  { to: "/budgets", label: "Бюджеты", Icon: PiggyBank },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const accounts = useReferenceStore((state) => state.accounts);
  const isLoading = useReferenceStore((state) => state.isLoading);
  const error = useReferenceStore((state) => state.error);
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div>
      <PageTitle title={`Привет, ${user.full_name}!`} description="Обзор ваших финансов" />

      <DataState isLoading={isLoading} error={error}>
        <Card className="mb-6">
          <p className="text-sm text-slate-500">Общий баланс по всем счетам</p>
          <p className="mt-1 text-3xl font-bold text-emerald-600">{formatMoney(totalBalance)}</p>
        </Card>
      </DataState>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickLinks.map(({ to, label, Icon }) => (
          <Link key={to} to={to}>
            <Card className="flex flex-col items-center gap-2 text-center hover:border-emerald-400">
              <Icon className="text-emerald-600" />
              <span className="text-sm font-medium">{label}</span>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <p className="text-sm text-slate-500">Графики расходов и доходов появятся здесь на 3 неделе проекта.</p>
      </Card>
    </div>
  );
}
