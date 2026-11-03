import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

import { registerUser } from "../api/authApi";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { registerSchema } from "../schemas/authSchemas";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function RegisterPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  async function onSubmit(formValues) {
    try {
      await registerUser(formValues);
      toast.success("Аккаунт создан! Теперь войдите");
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-emerald-600">
          <Wallet size={28} />
          FinAi
        </div>

        <h1 className="mb-4 text-center text-lg font-semibold">Регистрация</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Имя" error={errors.fullName?.message} {...register("fullName")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Пароль" type="password" error={errors.password?.message} {...register("password")} />
          <Input
            label="Повторите пароль"
            type="password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Создаём..." : "Создать аккаунт"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="font-medium text-emerald-600 hover:underline">
            Войти
          </Link>
        </p>
      </Card>
    </div>
  );
}
