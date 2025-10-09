"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Dictionary } from "@/dictionaries";
import { Locale } from "../../../i18n-config";
import { useAuthStore } from "@/auth.store";

interface LoginFormProps {
  dict: Dictionary;
  lang: Locale;
}

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginForm({ dict, lang }: LoginFormProps) {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(""); // Clear previous errors

    try {
      // const response = await axios.post(
      //   "http://localhost:3000/api/auth/login",
      //   {
      //     username: data.username,
      //     password: data.password,
      //   }
      // );
      const response = await axios.post(
        "https://ims-sms.com/api/auth/login",
        {
          username: data.username,
          password: data.password,
        }
      );

      const loginResponse = response.data;

      if (loginResponse.success && loginResponse.data) {
        // Save the login response to the auth store
        login(loginResponse.data);

        // Redirect to dashboard or home page
        router.replace("/");
      } else {
        // Handle login error
        setApiError(
          loginResponse.error || dict.login.errors.invalid_credentials
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setApiError(error.response.data.error);
      } else {
        setApiError(dict.login.errors.invalid_credentials);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = lang === "ar";

  if (isAuthenticated) router.replace("/");

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-[#7d287e1a]">
            <svg
              className="h-6 w-6 text-[#7D287E]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2
            className={`mt-6 text-3xl font-extrabold text-gray-900 ${
              isRTL ? "font-almarai" : "font-dm-sans"
            }`}
          >
            {dict.login.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{dict.login.subtitle}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                {dict.login.username}
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder={dict.login.placeholders.username}
                  {...register("username", {
                    required: dict.login.errors.required,
                  })}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    errors.username ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#7D287E] focus:border-[#7D287E] focus:z-10 sm:text-sm ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                {dict.login.password}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={dict.login.placeholders.password}
                  {...register("password", {
                    required: dict.login.errors.required,
                  })}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#7D287E] focus:border-[#7D287E] focus:z-10 sm:text-sm ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{apiError}</div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#7D287E] hover:bg-[#7d287ea7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7D287E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isRTL ? "جاري التحميل..." : "Loading..."}
                </div>
              ) : (
                dict.login.sign_in
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
