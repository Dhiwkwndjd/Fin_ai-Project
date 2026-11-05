import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";

import { createBudget, deleteBudget, updateBudget } from "../api/financeApi";
import BudgetForm from "../components/forms/BudgetForm";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ConfirmModal from "../components/ui/ConfirmModal";
import DataState from "../components/ui/DataState";
import Modal from "../components/ui/Modal";
import PageTitle from "../components/ui/PageTitle";
import useFetch from "../hooks/useFetch";
import { formatMoney } from "../utils/formatMoney";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function BudgetsPage() {
  const { data, isLoading, error, reload } = useFetch("/budgets");
  const budgets = data || [];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openCreateForm() {
    setEditingBudget(null);
    setIsFormOpen(true);
  }

  function openEditForm(budget) {
    setEditingBudget(budget);
    setIsFormOpen(true);
  }

  async function handleSave(values) {
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, values);
        toast.success("Бюджет обновлён");
      } else {
        await createBudget(values);
        toast.success("Бюджет добавлен");
      }
      setIsFormOpen(false);
      reload();
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteBudget(budgetToDelete.id);
      toast.success("Бюджет удалён");
      setBudgetToDelete(null);
      reload();
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  }

  const formInitialValues = editingBudget
    ? { categoryId: editingBudget.category.id, month: editingBudget.month, limitAmount: editingBudget.limit_amount }
    : { categoryId: "", month: dayjs().format("YYYY-MM"), limitAmount: "" };

  return (
    <div>
      <PageTitle title="Бюджеты" description="Лимиты расходов на месяц">
        <Button onClick={openCreateForm}>
          <Plus size={16} />
          Добавить
        </Button>
      </PageTitle>

      <DataState isLoading={isLoading} error={error} isEmpty={budgets.length === 0} emptyText="Бюджетов пока нет. Добавьте первый.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const percent = Math.min(100, Math.round((budget.spent / budget.limit_amount) * 100));
            const isOverLimit = budget.spent > budget.limit_amount;

            return (
              <Card key={budget.id}>
                <p className="text-sm text-slate-500">{dayjs(budget.month + "-01").format("MM.YYYY")}</p>
                <p className="font-medium">{budget.category.name}</p>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full ${isOverLimit ? "bg-red-500" : "bg-emerald-500"}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className={`mt-2 text-sm ${isOverLimit ? "text-red-600" : "text-slate-600"}`}>
                  {formatMoney(budget.spent)} из {formatMoney(budget.limit_amount)}
                </p>

                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => openEditForm(budget)} className="text-slate-500 hover:text-emerald-600" title="Изменить">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setBudgetToDelete(budget)} className="text-slate-500 hover:text-red-600" title="Удалить">
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </DataState>

      <Modal isOpen={isFormOpen} title={editingBudget ? "Изменить бюджет" : "Новый бюджет"} onClose={() => setIsFormOpen(false)}>
        <BudgetForm initialValues={formInitialValues} onSubmit={handleSave} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <ConfirmModal
        isOpen={budgetToDelete !== null}
        title="Удалить бюджет?"
        message="Бюджет будет удалён. Транзакции останутся."
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setBudgetToDelete(null)}
      />
    </div>
  );
}
