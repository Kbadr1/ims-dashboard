"use client";

import { Dictionary } from "@/dictionaries";
import { Locale } from "@/i18n-config";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCountries, useDeleteCountry } from "@/hooks/use-countries";
import { EditCountryDialog } from "./EditCountryDialog";
import { DeleteCountryDialog } from "./DeleteCountryDialog";
import { useAuthStore } from "@/auth.store";
import { useState } from "react";

interface CountriesTableProps {
  dict: Dictionary;
  params: { lang: Locale };
}

export function CountriesTable({ dict, params }: CountriesTableProps) {
  const { data: countries, isLoading, error } = useCountries();
  const { token } = useAuthStore();
  const deleteCountryMutation = useDeleteCountry();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    countryName: string;
    countryCode: string;
  }>({
    isOpen: false,
    countryName: "",
    countryCode: "",
  });

  console.log("CountriesTable - Countries data:", countries);
  console.log("CountriesTable - Countries count:", countries?.length);

  const handleDeleteClick = (countryName: string, countryCode: string) => {
    setDeleteDialog({
      isOpen: true,
      countryName,
      countryCode,
    });
  };

  const handleDeleteConfirm = () => {
    if (!token) {
      console.error("No authentication token available");
      return;
    }

    deleteCountryMutation.mutate(
      {
        countryCode: deleteDialog.countryCode,
        token,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            console.log("Country reset successfully:", result.data);
            setDeleteDialog({
              isOpen: false,
              countryName: "",
              countryCode: "",
            });
          } else {
            console.error("Error resetting country:", result.error);
          }
        },
        onError: (error) => {
          console.error("Error resetting country:", error);
        },
      }
    );
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, countryName: "", countryCode: "" });
  };

  if (
    isLoading ||
    !countries ||
    countries.length === 0 ||
    error ||
    countries.length === 0
  ) {
    return <></>;
  }

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Countries</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                Flag
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                Country (EN)
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                Country (AR)
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                Price
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                Companies
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {countries.map((country) => (
              <tr key={country.code} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3">
                  <div className="flex items-center">
                    <img
                      src={country.flag}
                      alt={`${country.country} flag`}
                      className="w-8 h-6 object-cover rounded-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                  {country.country}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                  {country.country_ar}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                  ${country.price}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#7d287e33] text-[#7d287e]">
                    {country.companiesCount}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <EditCountryDialog
                      dict={dict}
                      params={params}
                      country={country}
                      onSuccess={(message) => {
                        console.log("Success:", message);
                        // You can add a toast notification here
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDeleteClick(country.country, country.code)
                      }
                      disabled={deleteCountryMutation.isPending}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteCountryDialog
        countryName={deleteDialog.countryName}
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteCountryMutation.isPending}
      />
    </div>
  );
}
