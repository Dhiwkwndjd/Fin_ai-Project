import { z } from "zod";

export const transactionSchema = z.object({
  kind: z.enum(["income", "expense"]),
  amount: z.coerce
    .number({ invalid_type_error: "Введите сумму числом" })
    .int("Введите целое число")
    .positive("Сумма должна быть больше 0"),
  accountId: z.coerce.number().min(1, "Выберите счёт"),
  categoryId: z.coerce.number().min(1, "Выберите категорию"),
  date: z.string().min(1, "Выберите дату"),
  description: z.string().max(100, "Не длиннее 100 символов"),
});

export const accountSchema = z.object({
  name: z.string().min(1, "Введите название счёта"),
  type: z.enum(["card", "cash"]),
  balance: z.coerce
    .number({ invalid_type_error: "Введите число" })
    .int("Введите целое число")
    .min(0, "Баланс не может быть отрицательным"),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Название не короче 2 символов"),
  kind: z.enum(["income", "expense"]),
});

export const budgetSchema = z.object({
  categoryId: z.coerce.number().min(1, "Выберите категорию"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Выберите месяц"),
  limitAmount: z.coerce
    .number({ invalid_type_error: "Введите лимит числом" })
    .int("Введите целое число")
    .positive("Лимит должен быть больше 0"),
});
