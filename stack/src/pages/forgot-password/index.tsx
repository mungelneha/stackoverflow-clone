import { useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";

export default function ForgotPassword() {
  const router = useRouter();
  const t = useTranslations("ForgotPassword");

  const [form, setForm] = useState({
    email: "",
    phone: "",
  });

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.email && !form.phone) {
      toast.error(t("enterEmailOrPhone"));
      return;
    }
    try {
      const res = await axiosInstance.post(
        "/user/forgot-password",
        form
      );
      toast.success(res.data.message);
      router.push("/auth", undefined, {
        locale: router.locale,
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("somethingWentWrong")
      );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t("forgotPassword")}
        </h2>

        <input
          id="email"
          type="email"
          placeholder={t("enterEmail")}
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-4"
        />

        <div className="text-center mb-4">
          {t("or")}
        </div>

        <input
          id="phone"
          type="text"
          placeholder={t("enterPhone")}
          value={form.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-6"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {t("resetPassword")}
        </button>

        <div className="text-center mt-4">
          <Link
            href="/auth"
            locale={router.locale}
            className="text-blue-600"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </form>
    </div>
  );
}