import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Имя должно быть не короче 2 символов"),
    email: z.string().min(1, "Введите email").email("Некорректный email"),
    password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
    confirmPassword: z.string().min(1, "Повторите пароль"),
  })
  .refine((formValues) => formValues.password === formValues.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"], 
  });
