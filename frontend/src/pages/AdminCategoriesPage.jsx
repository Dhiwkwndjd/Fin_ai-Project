import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createCommonCategory, deleteCommonCategory, updateCommonCategory } from "../api/financeApi";
import CategoryForm from "../components/forms/CategoryForm";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ConfirmModal from "../components/ui/ConfirmModal";
import DataState from "../components/ui/DataState";
import Modal from "../components/ui/Modal";
import PageTitle from "../components/ui/PageTitle";
import { useReferenceStore } from "../store/referenceStore";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function AdminCategoriesPage() {
  const categories = useReferenceStore((state) => state.categories);
  const isLoading = useReferenceStore((state) => state.isLoading);
  const error = useReferenceStore((state) => state.error);
  const loadReferenceData = useReferenceStore((state) => state.loadReferenceData);
  const commonCategories = categories.filter((category) => category.user_id === null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        await updateCommonCategory(editingCategory.id, values);
        toast.success("Категория обновлена");
      } else {
        await createCommonCategory(values);
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
      await deleteCommonCategory(categoryToDelete.id);
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

  return (
    <div>
      <PageTitle title="Общие категории" description="Раздел админа: эти категории видят все пользователи">
        <Button onClick={openCreateForm}>
          <Plus size={16} />
          Добавить
        </Button>
      </PageTitle>

      <DataState isLoading={isLoading} error={error} isEmpty={commonCategories.length === 0}>
        <Card>
          <ul className="divide-y divide-slate-100 text-sm">
            {commonCategories.map((category) => (
              <li key={category.id} className="flex items-center justify-between py-3">
                <div>
                  <span>{category.name}</span>
                  <span className="ml-3 text-slate-500">{category.kind === "income" ? "Доход" : "Расход"}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => openEditForm(category)} className="text-slate-500 hover:text-emerald-600" title="Изменить">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setCategoryToDelete(category)} className="text-slate-500 hover:text-red-600" title="Удалить">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </DataState>

      <Modal isOpen={isFormOpen} title={editingCategory ? "Изменить категорию" : "Новая общая категория"} onClose={() => setIsFormOpen(false)}>
        <CategoryForm initialValues={formInitialValues} onSubmit={handleSave} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <ConfirmModal
        isOpen={categoryToDelete !== null}
        title="Удалить категорию?"
        message={categoryToDelete ? `Общая категория «${categoryToDelete.name}» будет удалена.` : ""}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}
