import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { categorySchema } from "./";

export default function CategoryForm({ initialValues, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(categorySchema), defaultValues: initialValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Название" error={errors.name?.message} {...register("name")} />

      <Select label="Тип" error={errors.kind?.message} {...register("kind")}>
        <option value="expense">Расход</option>
        <option value="income">Доход</option>
      </Select>

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
