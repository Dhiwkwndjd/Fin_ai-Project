import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { budgetSchema } from "../../schemas/financeSchemas";
import { useReferenceStore } from "../../store/referenceStore";

export default function BudgetForm({ initialValues, onSubmit, onCancel }) {
  const categories = useReferenceStore((state) => state.categories);
  const expenseCategories = categories.filter((category) => category.kind === "expense");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(budgetSchema), defaultValues: initialValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select label="Категория" error={errors.categoryId?.message} {...register("categoryId")}>
        <option value="">Выберите категорию</option>
        {expenseCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      <Input label="Месяц" type="month" error={errors.month?.message} {...register("month")} />
      <Input label="Лимит, ₸" type="number" error={errors.limitAmount?.message} {...register("limitAmount")} />

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
