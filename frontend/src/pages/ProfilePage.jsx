import { LogOut } from "lucide-react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageTitle from "../components/ui/PageTitle";
import useAuth from "../hooks/useAuth";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <PageTitle title="Профиль" />

      <Card className="max-w-lg space-y-2 text-sm">
        <p>
          <span className="text-slate-500">Имя: </span>
          {user.full_name}
        </p>
        <p>
          <span className="text-slate-500">Email: </span>
          {user.email}
        </p>
        <p>
          <span className="text-slate-500">Роль: </span>
          {user.role === "admin" ? "Администратор" : "Пользователь"}
        </p>

        <div className="pt-4">
          <Button variant="danger" onClick={logout}>
            <LogOut size={16} />
            Выйти
          </Button>
        </div>
      </Card>
    </div>
  );
}
