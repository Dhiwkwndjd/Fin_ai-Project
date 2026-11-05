import { useState } from "react";
import { Banknote, CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createAccount, deleteAccount, updateAccount } from "../api/financeApi";
import AccountForm from "../components/forms/AccountForm";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ConfirmModal from "../components/ui/ConfirmModal";
import DataState from "../components/ui/DataState";
import Modal from "../components/ui/Modal";
import PageTitle from "../components/ui/PageTitle";
import { useReferenceStore } from "../store/referenceStore";
import { formatMoney } from "../utils/formatMoney";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function AccountsPage() {
  const accounts = useReferenceStore((state) => state.accounts);
  const isLoading = useReferenceStore((state) => state.isLoading);
  const error = useReferenceStore((state) => state.error);
  const loadReferenceData = useReferenceStore((state) => state.loadReferenceData);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openCreateForm() {
    setEditingAccount(null);
    setIsFormOpen(true);
  }

  function openEditForm(account) {
    setEditingAccount(account);
    setIsFormOpen(true);
  }

  async function handleSave(values) {
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, values);
        toast.success("Счёт обновлён");
      } else {
        await createAccount(values);
        toast.success("Счёт добавлен");
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
      await deleteAccount(accountToDelete.id);
      toast.success("Счёт удалён");
      setAccountToDelete(null);
      await loadReferenceData();
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
      setAccountToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const formInitialValues = editingAccount
    ? { name: editingAccount.name, type: editingAccount.type, balance: editingAccount.balance }
    : { name: "", type: "card", balance: 0 };

  return (
    <div>
      <PageTitle title="Счета" description="Карты и наличные">
        <Button onClick={openCreateForm}>
          <Plus size={16} />
          Добавить
        </Button>
      </PageTitle>

      <DataState isLoading={isLoading} error={error} isEmpty={accounts.length === 0} emptyText="Счетов пока нет. Добавьте первый.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <div className="flex items-center gap-4">
                {account.type === "card" ? (
                  <CreditCard className="text-emerald-600" size={32} />
                ) : (
                  <Banknote className="text-emerald-600" size={32} />
                )}
                <div className="flex-1">
                  <p className="font-medium">{account.name}</p>
                  <p className="text-lg font-bold">{formatMoney(account.balance)}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => openEditForm(account)} className="text-slate-500 hover:text-emerald-600" title="Изменить">
                  <Pencil size={16} />
                </button>
                <button onClick={() => setAccountToDelete(account)} className="text-slate-500 hover:text-red-600" title="Удалить">
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </DataState>

      <Modal isOpen={isFormOpen} title={editingAccount ? "Изменить счёт" : "Новый счёт"} onClose={() => setIsFormOpen(false)}>
        <AccountForm initialValues={formInitialValues} onSubmit={handleSave} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <ConfirmModal
        isOpen={accountToDelete !== null}
        title="Удалить счёт?"
        message={accountToDelete ? `Счёт «${accountToDelete.name}» будет удалён.` : ""}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setAccountToDelete(null)}
      />
    </div>
  );
}
