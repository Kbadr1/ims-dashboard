"use client";

import { Dictionary } from "@/dictionaries";
import { Locale } from "@/i18n-config";
import { useEffect, useState } from "react";
import { AddCountryDialog } from "./AddCountryDialog";
import { CountriesTable } from "./CountriesTable";
import { useAuthStore } from "@/auth.store";
import { useRouter } from "next/navigation";

interface HomeProps {
  dict: Dictionary;
  params: { lang: Locale };
}

export function Home({ dict, params }: HomeProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const { token, isAuthenticated, logout, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token || !isAuthenticated) {
      logout();
      router.replace(`/${params.lang}/login`);
    }
  }, [_hasHydrated, token, isAuthenticated, logout, router, params.lang]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap justify-between">
        <div>
          <h1 className="text-2xl font-bold">{dict.home.title}</h1>
          <p className="text-gray-500">{dict.home.subtitle}</p>
        </div>
        <AddCountryDialog
          dict={dict}
          params={params}
          onSuccess={(message) => {
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />
      </div>

      {/* Countries Table */}
      <CountriesTable dict={dict} params={params} />
    </div>
  );
}
