import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { accountSchema } from "../../schemas/financeSchemas";

export default function AccountForm({ initialValues, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(accountSchema), defaultValues: initialValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Название" error={errors.name?.message} {...register("name")} />

      <Select label="Тип счёта" error={errors.type?.message} {...register("type")}>
        <option value="card">Карта</option>
        <option value="cash">Наличные</option>
      </Select>

      <Input label="Баланс, тенге" type="number" error={errors.balance?.message} {...register("balance")} />

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
