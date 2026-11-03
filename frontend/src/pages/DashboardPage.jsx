import { Link } from "react-router-dom";
import { ArrowRightLeft, PiggyBank, Tags, Wallet } from "lucide-react";

import Card from "../components/ui/Card";
import PageTitle from "../components/ui/PageTitle";
import useAuth from "../hooks/useAuth";

const quickLinks = [
  { to: "/transactions", label: "Транзакции", Icon: ArrowRightLeft },
  { to: "/accounts", label: "Счета", Icon: Wallet },
  { to: "/categories", label: "Категории", Icon: Tags },
  { to: "/budgets", label: "Бюджеты", Icon: PiggyBank },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageTitle title={`Привет, ${user.full_name}!`} description="Обзор ваших финансов" />

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
    </div>
  );
}
