import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { transactionSchema } from "../../schemas/financeSchemas";
import { useReferenceStore } from "../../store/referenceStore";

export default function TransactionForm({ initialValues, onSubmit, onCancel }) {
  const accounts = useReferenceStore((state) => state.accounts);
  const categories = useReferenceStore((state) => state.categories);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(transactionSchema), defaultValues: initialValues });

  const selectedKind = watch("kind");
  const availableCategories = categories.filter((category) => category.kind === selectedKind);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Тип"
        error={errors.kind?.message}
        {...register("kind", { onChange: () => setValue("categoryId", "") })}
      >
        <option value="expense">Расход</option>
        <option value="income">Доход</option>
      </Select>

      <Input label="Сумма, тенге" type="number" error={errors.amount?.message} {...register("amount")} />

      <Select label="Счёт" error={errors.accountId?.message} {...register("accountId")}>
        <option value="">Выберите счёт</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </Select>

      <Select label="Категория" error={errors.categoryId?.message} {...register("categoryId")}>
        <option value="">Выберите категорию</option>
        {availableCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      <Input label="Дата" type="date" error={errors.date?.message} {...register("date")} />
      <Input label="Описание" error={errors.description?.message} {...register("description")} />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохраняем..." : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}
