import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Card from "../components/ui/Card";
import PageTitle from "../components/ui/PageTitle";

export default function TransactionDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <Link to="/transactions" className="mb-4 inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline">
        <ArrowLeft size={16} />
        Ко всем транзакциям
      </Link>

      <PageTitle title={`Транзакция №${id}`} />
    </div>
  );
}
