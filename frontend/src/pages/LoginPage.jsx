import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

import { getCurrentUser, loginUser } from "../api/authApi";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { loginSchema } from "../schemas/authSchemas";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(formValues) {
    try {
      const tokens = await loginUser(formValues);
      setTokens(tokens.access_token, tokens.refresh_token);
      const user = await getCurrentUser();
      setUser(user);

      toast.success(`Добро пожаловать, ${user.full_name}!`);
      navigate("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-emerald-600">
          <Wallet size={28} />
          FinAi
        </div>

        <h1 className="mb-4 text-center text-lg font-semibold">Вход в аккаунт</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Пароль" type="password" error={errors.password?.message} {...register("password")} />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Входим..." : "Войти"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Нет аккаунта?{" "}
          <Link to="/register" className="font-medium text-emerald-600 hover:underline">
            Зарегистрироваться
          </Link>
        </p>

        <p className="mt-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
          Тестовые логины: user@finai.kz / user123 и admin@finai.kz / admin123
        </p>
      </Card>
    </div>
  );
}
