import Card from "../components/ui/Card";
import DataState from "../components/ui/DataState";
import PageTitle from "../components/ui/PageTitle";
import useFetch from "../hooks/useFetch";

export default function AdminUsersPage() {
  const { data, isLoading, error } = useFetch("/admin/users");
  const users = data || [];

  return (
    <div>
      <PageTitle title="Пользователи" description="Раздел админа: все пользователи системы" />

      <DataState isLoading={isLoading} error={error} isEmpty={users.length === 0}>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Имя</th>
                <th className="py-2">Email</th>
                <th className="py-2">Роль</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100">
                  <td className="py-2">{user.full_name}</td>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </DataState>
    </div>
  );
}
