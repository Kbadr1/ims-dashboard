"use client";

import { Dictionary } from "@/dictionaries";
import { Locale } from "@/i18n-config";
import { PlusIcon, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useAuthStore } from "@/auth.store";
import { useCountriesForAdding, useAddCompany } from "@/hooks/use-countries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddCountryDialogProps {
  dict: Dictionary;
  params: { lang: Locale };
  onSuccess?: (message: string) => void;
}

interface FormData {
  providers: Provider[];
  countryCode: string;
}

interface Provider {
  name: string;
  price: number;
  companies: { name: string }[];
}

interface CompanyToAdd {
  name: string;
}

export function AddCountryDialog({
  dict,
  params,
  onSuccess,
}: AddCountryDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCountrySelected, setIsCountrySelected] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [providerName, setProviderName] = useState("");
  const [providerPrice, setProviderPrice] = useState(0);
  const [companiesToAdd, setCompaniesToAdd] = useState<CompanyToAdd[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  const { token } = useAuthStore();

  // React Query hooks
  const { data: countries, isLoading } = useCountriesForAdding();
  const addCompanyMutation = useAddCompany();

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const selectedCountryCode = watch("countryCode");

  const addCompanyToList = () => {
    if (!companyName.trim()) return;

    const newCompany: CompanyToAdd = {
      name: companyName.trim(),
    };

    setCompaniesToAdd((prev) => [...prev, newCompany]);
    setCompanyName("");
  };

  const removeCompanyFromList = (index: number) => {
    setCompaniesToAdd((prev) => prev.filter((_, i) => i !== index));
  };

  const addProviderToList = () => {
    if (
      !providerName.trim() ||
      providerPrice <= 0 ||
      companiesToAdd.length === 0
    )
      return;

    const newProvider: Provider = {
      name: providerName.trim(),
      price: providerPrice,
      companies: [...companiesToAdd],
    };

    setProviders((prev) => [...prev, newProvider]);
    setProviderName("");
    setProviderPrice(0);
    setCompaniesToAdd([]);
  };

  const removeProviderFromList = (index: number) => {
    setProviders((prev) => prev.filter((_, i) => i !== index));
  };

  const submitAllProviders = async () => {
    if (!selectedCountryCode || providers.length === 0) return;

    addCompanyMutation.mutate(
      {
        countryCode: selectedCountryCode,
        providers: providers,
        token: token || "",
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            const totalCompanies = providers.reduce(
              (sum, provider) => sum + provider.companies.length,
              0
            );
            const message = `${providers.length} providers with ${totalCompanies} companies added successfully!`;
            onSuccess?.(message);
            console.log("Providers added successfully:", result.data);

            // Clear everything and close dialog
            setProviders([]);
            setCompaniesToAdd([]);
            setCompanyName("");
            setProviderName("");
            setProviderPrice(0);
            setIsDialogOpen(false);
            reset();
            setIsCountrySelected(false);
            addCompanyMutation.reset();
          } else {
            console.error("Error adding providers:", result.error);
          }
        },
        onError: (error) => {
          console.error("Error adding providers:", error);
        },
      }
    );
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes
      reset();
      setIsCountrySelected(false);
      setCompanyName("");
      setProviderName("");
      setProviderPrice(0);
      setCompaniesToAdd([]);
      setProviders([]);
      addCompanyMutation.reset();
    }
  };

  const handleResetCountry = () => {
    setIsCountrySelected(false);
    setValue("countryCode", "");
    setCompanyName("");
    setProviderName("");
    setProviderPrice(0);
    setCompaniesToAdd([]);
    setProviders([]);
    addCompanyMutation.reset();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className="bg-[#7d287e] hover:bg-[#6a1f6b] text-white">
          {dict.home.add_country} <PlusIcon className="w-4 h-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Providers and Companies</DialogTitle>
          <DialogDescription>
            Select a country and add providers with their companies and prices.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(() => {})} className="space-y-4">
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="country-select" className="text-sm font-medium">
                Country *
              </Label>
              {isCountrySelected && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetCountry}
                  className="text-gray-500 hover:text-gray-700 p-1 h-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
            {isLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 mt-1">
                Loading countries...
              </div>
            ) : (
              <SearchableSelect
                options={
                  countries?.map((country) => ({
                    value: country.country || "Unknown", // Use country name as value for search
                    label: `${
                      params.lang === "ar"
                        ? country.country_ar || country.country || "Unknown"
                        : country.country || "Unknown"
                    } (${country.code?.toUpperCase() || "N/A"})`,
                    flag: country.flag,
                    code: country.code, // Store the code separately
                  })) || []
                }
                value={
                  countries?.find((c) => c.code === selectedCountryCode)
                    ?.country || ""
                }
                onValueChange={(selectedCountryName) => {
                  // Find the country by name and get its code
                  const selectedCountry = countries?.find(
                    (c) => c.country === selectedCountryName
                  );
                  if (selectedCountry) {
                    setValue("countryCode", selectedCountry.code);
                    setIsCountrySelected(true);
                  }
                }}
                placeholder="Select a country"
                disabled={isCountrySelected}
                className="mt-1 w-full"
              />
            )}
            {errors.countryCode && (
              <p className="text-red-500 text-sm mt-1">
                {errors.countryCode.message}
              </p>
            )}
            {addCompanyMutation.error && (
              <p className="text-red-500 text-sm mt-1">
                {addCompanyMutation.error instanceof Error
                  ? addCompanyMutation.error.message
                  : "Failed to add company. Please try again."}
              </p>
            )}
          </div>

          {/* Provider and Companies Input - Only show after country selection */}
          {isCountrySelected && (
            <div className="space-y-4">
              {/* Provider Name and Price */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label
                    htmlFor="provider-name"
                    className="text-sm font-medium"
                  >
                    Provider Name *
                  </Label>
                  <Input
                    id="provider-name"
                    placeholder="Enter provider name"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="provider-price"
                    className="text-sm font-medium"
                  >
                    Provider Price *
                  </Label>
                  <Input
                    id="provider-price"
                    type="number"
                    placeholder="Enter price"
                    value={providerPrice}
                    onChange={(e) => setProviderPrice(Number(e.target.value))}
                    className="mt-1"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Company Name Input */}
              <div>
                <Label htmlFor="company-name" className="text-sm font-medium">
                  Company Name *
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="company-name"
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addCompanyToList();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addCompanyToList}
                    disabled={!companyName.trim()}
                    className="bg-[#7d287e] hover:bg-[#6a1f6b] text-white px-4"
                  >
                    Add to List
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Companies List */}
          {companiesToAdd.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">
                Companies for {providerName || "Current Provider"} (
                {companiesToAdd.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {companiesToAdd.map((company, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{company.name}</div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCompanyFromList(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={addProviderToList}
                  disabled={
                    !providerName.trim() ||
                    providerPrice <= 0 ||
                    companiesToAdd.length === 0
                  }
                  className="w-full bg-[#6A1F6B] hover:bg-[#6a1f6bb6] text-white"
                >
                  Add Provider to List
                </Button>
              </div>
            </div>
          )}

          {/* Providers List */}
          {providers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">
                Providers to Add ({providers.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {providers.map((provider, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#6a1f6b1e] rounded-md border border-[#6a1f6b2f]"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{provider.name}</div>
                      <div className="text-xs text-gray-600">
                        ${provider.price} - {provider.companies.length}{" "}
                        companies
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProviderFromList(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {providers.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <Button
                type="button"
                onClick={submitAllProviders}
                disabled={addCompanyMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {addCompanyMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding {providers.length} providers...
                  </div>
                ) : (
                  `Submit ${providers.length} Providers`
                )}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
