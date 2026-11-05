import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";

import { createTransaction, deleteTransaction, updateTransaction } from "../api/financeApi";
import TransactionForm from "../components/forms/TransactionForm";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ConfirmModal from "../components/ui/ConfirmModal";
import DataState from "../components/ui/DataState";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import PageTitle from "../components/ui/PageTitle";
import Pagination from "../components/ui/Pagination";
import Select from "../components/ui/Select";
import useDebounce from "../hooks/useDebounce";
import useFetch from "../hooks/useFetch";
import { useReferenceStore } from "../store/referenceStore";
import { formatMoney } from "../utils/formatMoney";
import { getErrorMessage } from "../utils/getErrorMessage";

const PAGE_SIZE = 10;

function getEmptyTransaction() {
  return {
    kind: "expense",
    amount: "",
    accountId: "",
    categoryId: "",
    date: dayjs().format("YYYY-MM-DD"),
    description: "",
  };
}

export default function TransactionsPage() {
  const accounts = useReferenceStore((state) => state.accounts);
  const categories = useReferenceStore((state) => state.categories);
  const loadReferenceData = useReferenceStore((state) => state.loadReferenceData);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const kind = searchParams.get("kind") || "";
  const categoryId = searchParams.get("category") || "";
  const accountId = searchParams.get("account") || "";
  const sort = searchParams.get("sort") || "date_desc";
  const page = Number(searchParams.get("page")) || 1;

  function updateParams(changes) {
    const nextParams = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    }
    setSearchParams(nextParams);
  }

  const [searchText, setSearchText] = useState(search);
  const debouncedSearch = useDebounce(searchText, 500);

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateParams({ search: debouncedSearch, page: "" }); 
    }
  }, [debouncedSearch]);

  const apiQuery = new URLSearchParams({ page, page_size: PAGE_SIZE, sort });
  if (search) apiQuery.set("search", search);
  if (kind) apiQuery.set("kind", kind);
  if (categoryId) apiQuery.set("category_id", categoryId);
  if (accountId) apiQuery.set("account_id", accountId);

  const { data, isLoading, error, reload } = useFetch(`/transactions?${apiQuery.toString()}`);
  const transactions = data ? data.items : [];
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); 
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openCreateForm() {
    setEditingTransaction(null);
    setIsFormOpen(true);
  }

  function openEditForm(transaction) {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  }

  async function handleSave(values) {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, values);
        toast.success("Транзакция обновлена");
      } else {
        await createTransaction(values);
        toast.success("Транзакция добавлена");
      }
      setIsFormOpen(false);
      reload(); 
      loadReferenceData(); 
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteTransaction(transactionToDelete.id);
      toast.success("Транзакция удалена");
      setTransactionToDelete(null);
      loadReferenceData();

      if (transactions.length === 1 && page > 1) {
        updateParams({ page: String(page - 1) });
      } else {
        reload();
      }
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  }

  const formInitialValues = editingTransaction
    ? {
        kind: editingTransaction.kind,
        amount: editingTransaction.amount,
        accountId: editingTransaction.account.id,
        categoryId: editingTransaction.category.id,
        date: editingTransaction.date,
        description: editingTransaction.description,
      }
    : getEmptyTransaction();

  return (
    <div>
      <PageTitle title="Транзакции" description="Все ваши доходы и расходы">
        <Button onClick={openCreateForm}>
          <Plus size={16} />
          Добавить
        </Button>
      </PageTitle>

      <Card className="mb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            label="Поиск"
            placeholder="Описание..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />

          <Select label="Тип" value={kind} onChange={(event) => updateParams({ kind: event.target.value, page: "" })}>
            <option value="">Все</option>
            <option value="expense">Расходы</option>
            <option value="income">Доходы</option>
          </Select>

          <Select
            label="Категория"
            value={categoryId}
            onChange={(event) => updateParams({ category: event.target.value, page: "" })}
          >
            <option value="">Все</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          <Select
            label="Счёт"
            value={accountId}
            onChange={(event) => updateParams({ account: event.target.value, page: "" })}
          >
            <option value="">Все</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </Select>

          <Select label="Сортировка" value={sort} onChange={(event) => updateParams({ sort: event.target.value, page: "" })}>
            <option value="date_desc">Сначала новые</option>
            <option value="date_asc">Сначала старые</option>
            <option value="amount_desc">Сумма: по убыванию</option>
            <option value="amount_asc">Сумма: по возрастанию</option>
          </Select>
        </div>
      </Card>
      <DataState
        isLoading={isLoading}
        error={error}
        isEmpty={transactions.length === 0}
        emptyText="Ничего не найдено. Измените фильтры или добавьте транзакцию."
      >

        <Card className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Дата</th>
                <th className="py-2">Описание</th>
                <th className="py-2">Категория</th>
                <th className="py-2">Счёт</th>
                <th className="py-2 text-right">Сумма</th>
                <th className="py-2 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2">{dayjs(transaction.date).format("DD.MM.YYYY")}</td>
                  <td className="py-2">
                    <Link to={`/transactions/${transaction.id}`} className="text-emerald-700 hover:underline">
                      {transaction.description || "Без описания"}
                    </Link>
                  </td>
                  <td className="py-2">{transaction.category.name}</td>
                  <td className="py-2">{transaction.account.name}</td>
                  <td
                    className={`py-2 text-right font-medium ${
                      transaction.kind === "income" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {transaction.kind === "income" ? "+" : "-"}
                    {formatMoney(transaction.amount)}
                  </td>
                  <td className="py-2">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openEditForm(transaction)}
                        className="text-slate-500 hover:text-emerald-600"
                        title="Изменить"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setTransactionToDelete(transaction)}
                        className="text-slate-500 hover:text-red-600"
                        title="Удалить"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Pagination page={page} totalPages={totalPages} onPageChange={(newPage) => updateParams({ page: String(newPage) })} />
      </DataState>
      <Modal
        isOpen={isFormOpen}
        title={editingTransaction ? "Изменить транзакцию" : "Новая транзакция"}
        onClose={() => setIsFormOpen(false)}
      >
        <TransactionForm initialValues={formInitialValues} onSubmit={handleSave} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <ConfirmModal
        isOpen={transactionToDelete !== null}
        title="Удалить транзакцию?"
        message="Транзакция будет удалена, а сумма вернётся на счёт. Это действие нельзя отменить."
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setTransactionToDelete(null)}
      />
    </div>
  );
}
