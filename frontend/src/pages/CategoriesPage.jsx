import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createCategory, deleteCategory, updateCategory } from "../api/financeApi";
import CategoryForm from "../components/forms/CategoryForm";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ConfirmModal from "../components/ui/ConfirmModal";
import DataState from "../components/ui/DataState";
import Modal from "../components/ui/Modal";
import PageTitle from "../components/ui/PageTitle";
import { useReferenceStore } from "../store/referenceStore";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function CategoriesPage() {
  const categories = useReferenceStore((state) => state.categories);
  const isLoading = useReferenceStore((state) => state.isLoading);
  const error = useReferenceStore((state) => state.error);
  const loadReferenceData = useReferenceStore((state) => state.loadReferenceData);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const expenseCategories = categories.filter((category) => category.kind === "expense");
  const incomeCategories = categories.filter((category) => category.kind === "income");

  function openCreateForm() {
    setEditingCategory(null);
    setIsFormOpen(true);
  }

  function openEditForm(category) {
    setEditingCategory(category);
    setIsFormOpen(true);
  }

  async function handleSave(values) {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
        toast.success("Категория обновлена");
      } else {
        await createCategory(values);
        toast.success("Категория добавлена");
      }
      setIsFormOpen(false);
      await loadReferenceData();
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      toast.success("Категория удалена");
      setCategoryToDelete(null);
      await loadReferenceData();
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
      setCategoryToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const formInitialValues = editingCategory
    ? { name: editingCategory.name, kind: editingCategory.kind }
    : { name: "", kind: "expense" };

  function renderCategory(category) {
    const isCommon = category.user_id === null;
    return (
      <li key={category.id} className="flex items-center justify-between">
        <span>{category.name}</span>
        {isCommon ? (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">общая</span>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => openEditForm(category)} className="text-slate-500 hover:text-emerald-600" title="Изменить">
              <Pencil size={16} />
            </button>
            <button onClick={() => setCategoryToDelete(category)} className="text-slate-500 hover:text-red-600" title="Удалить">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </li>
    );
  }

  return (
    <div>
      <PageTitle title="Категории" description="На что вы тратите и откуда получаете деньги">
        <Button onClick={openCreateForm}>
          <Plus size={16} />
          Добавить
        </Button>
      </PageTitle>

      <DataState isLoading={isLoading} error={error} isEmpty={categories.length === 0} emptyText="Категорий пока нет">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h2 className="mb-3 font-semibold text-red-600">Расходы</h2>
            <ul className="space-y-3 text-sm">{expenseCategories.map(renderCategory)}</ul>
          </Card>
          <Card>
            <h2 className="mb-3 font-semibold text-emerald-600">Доходы</h2>
            <ul className="space-y-3 text-sm">{incomeCategories.map(renderCategory)}</ul>
          </Card>
        </div>
      </DataState>

      <Modal isOpen={isFormOpen} title={editingCategory ? "Изменить категорию" : "Новая категория"} onClose={() => setIsFormOpen(false)}>
        <CategoryForm initialValues={formInitialValues} onSubmit={handleSave} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <ConfirmModal
        isOpen={categoryToDelete !== null}
        title="Удалить категорию?"
        message={categoryToDelete ? `Категория «${categoryToDelete.name}» будет удалена.` : ""}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}
