"use client";

import { Dictionary } from "@/dictionaries";
import { Locale } from "@/i18n-config";
import { Edit, X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/auth.store";
import { useAddCompany } from "@/hooks/use-countries";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EditCountryDialogProps {
  dict: Dictionary;
  params: { lang: Locale };
  country: {
    code: string;
    country: string;
    country_ar?: string;
    flag: string;
    price: number;
    companiesCount: number;
    companies: Array<{
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
    }>;
    providers: Provider[];
  };
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

interface CompanyToManage {
  id?: string;
  name: string;
  isNew?: boolean;
  isRemoved?: boolean;
}

export function EditCountryDialog({
  params,
  country,
  onSuccess,
}: EditCountryDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [providerName, setProviderName] = useState("");
  const [providerPrice, setProviderPrice] = useState(0);
  const [companiesToManage, setCompaniesToManage] = useState<CompanyToManage[]>(
    []
  );
  const [providers, setProviders] = useState<Provider[]>([]);
  const [currentProviderIndex, setCurrentProviderIndex] = useState<
    number | null
  >(null);

  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  // React Query hooks
  const addCompanyMutation = useAddCompany();

  const { handleSubmit, reset, setValue, watch } = useForm<FormData>();

  const selectedCountryCode = watch("countryCode");

  // Initialize form with country data
  useEffect(() => {
    if (isDialogOpen) {
      console.log("EditCountryDialog - Country data:", country);
      console.log("EditCountryDialog - Providers:", country.providers);
      setValue("countryCode", country.code);
      // Initialize providers with existing providers
      setProviders(country.providers || []);
      setCompaniesToManage([]);
      setCurrentProviderIndex(null);
    }
  }, [isDialogOpen, country, setValue]);

  const addCompanyToList = () => {
    if (!companyName.trim()) return;

    const newCompany: CompanyToManage = {
      name: companyName.trim(),
      isNew: true,
      isRemoved: false,
    };

    setCompaniesToManage((prev) => [...prev, newCompany]);
    setCompanyName("");
  };

  const removeCompanyFromList = (index: number) => {
    setCompaniesToManage((prev) => prev.filter((_, i) => i !== index));
  };

  const addProviderToList = () => {
    if (
      !providerName.trim() ||
      providerPrice <= 0 ||
      companiesToManage.length === 0
    )
      return;

    const newProvider: Provider = {
      name: providerName.trim(),
      price: providerPrice,
      companies: companiesToManage.map((comp) => ({ name: comp.name })),
    };

    setProviders((prev) => [...prev, newProvider]);
    setProviderName("");
    setProviderPrice(0);
    setCompaniesToManage([]);
    setCurrentProviderIndex(null);
  };

  const removeProviderFromList = (index: number) => {
    setProviders((prev) => prev.filter((_, i) => i !== index));
  };

  const editProvider = (index: number) => {
    const provider = providers[index];
    setProviderName(provider.name);
    setProviderPrice(provider.price);
    setCompaniesToManage(
      provider.companies.map((comp) => ({
        name: comp.name,
        isNew: false,
        isRemoved: false,
      }))
    );
    setCurrentProviderIndex(index);
  };

  const updateProvider = () => {
    if (
      !providerName.trim() ||
      providerPrice <= 0 ||
      companiesToManage.length === 0 ||
      currentProviderIndex === null
    )
      return;

    const updatedProvider: Provider = {
      name: providerName.trim(),
      price: providerPrice,
      companies: companiesToManage.map((comp) => ({ name: comp.name })),
    };

    setProviders((prev) =>
      prev.map((provider, i) =>
        i === currentProviderIndex ? updatedProvider : provider
      )
    );
    setProviderName("");
    setProviderPrice(0);
    setCompaniesToManage([]);
    setCurrentProviderIndex(null);
  };

  const submitAllChanges = async () => {
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
            const message = `${providers.length} providers with ${totalCompanies} companies updated successfully!`;
            onSuccess?.(message);
            console.log("Providers updated successfully:", result.data);

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["countries"] });
            queryClient.invalidateQueries({
              queryKey: ["countries-for-adding"],
            });

            // Clear everything and close dialog
            setProviders([]);
            setCompaniesToManage([]);
            setCompanyName("");
            setProviderName("");
            setProviderPrice(0);
            setCurrentProviderIndex(null);
            setIsDialogOpen(false);
            reset();
            addCompanyMutation.reset();
          } else {
            console.error("Error updating providers:", result.error);
          }
        },
        onError: (error) => {
          console.error("Error updating providers:", error);
        },
      }
    );
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes
      reset();
      setCompanyName("");
      setProviderName("");
      setProviderPrice(0);
      setCompaniesToManage([]);
      setProviders([]);
      setCurrentProviderIndex(null);
      addCompanyMutation.reset();
    }
  };

  // Check if there are changes
  const hasChanges = providers.length > 0;

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Providers - {country.country}</DialogTitle>
          <DialogDescription>
            Manage providers and their companies for {country.country}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(() => {})} className="space-y-4">
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="country-display" className="text-sm font-medium">
                Country *
              </Label>
            </div>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 mt-1 flex items-center gap-2">
              <img
                src={country.flag}
                alt={`${country.country} flag`}
                className="w-5 h-4 object-cover rounded-sm"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="text-sm">
                {params.lang === "ar"
                  ? country.country_ar || country.country || "Unknown"
                  : country.country || "Unknown"}{" "}
                ({country.code?.toUpperCase() || "N/A"})
              </span>
            </div>
            {addCompanyMutation.error ? (
              <p className="text-red-500 text-sm mt-1">
                {addCompanyMutation.error instanceof Error
                  ? addCompanyMutation.error.message
                  : "Failed to add company. Please try again."}
              </p>
            ) : null}
          </div>

          {/* Provider Name and Price */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="provider-name" className="text-sm font-medium">
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
              <Label htmlFor="provider-price" className="text-sm font-medium">
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

          {/* Add Companies to Current Provider */}
          <div>
            <Label htmlFor="company-name" className="text-sm font-medium">
              Add Companies to Current Provider
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
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Companies List for Current Provider */}
          {companiesToManage.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">
                Companies for {providerName || "Current Provider"} (
                {companiesToManage.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {companiesToManage.map((company, index) => (
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
              <div className="mt-3 flex gap-2">
                {currentProviderIndex === null ? (
                  <Button
                    type="button"
                    onClick={addProviderToList}
                    disabled={
                      !providerName.trim() ||
                      providerPrice <= 0 ||
                      companiesToManage.length === 0
                    }
                    className="flex-1 bg-[#6A1F6B] hover:bg-[#6a1f6bdc] text-white"
                  >
                    Add Provider to List
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={updateProvider}
                    disabled={
                      !providerName.trim() ||
                      providerPrice <= 0 ||
                      companiesToManage.length === 0
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Update Provider
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => {
                    setProviderName("");
                    setProviderPrice(0);
                    setCompaniesToManage([]);
                    setCurrentProviderIndex(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Providers List */}
          {providers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">
                Providers ({providers.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {providers.map((provider, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#6a1f6b18] rounded-md border border-[#6a1f6b2f]"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{provider.name}</div>
                      <div className="text-xs text-gray-600">
                        ${provider.price} - {provider.companies.length}{" "}
                        companies
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editProvider(index)}
                        className="text-[#6A1F6B] hover:text-[#6A1F6B] hover:bg-[#6a1f6b31] p-1 h-auto"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {hasChanges && (
            <div className="mt-6 pt-4 border-t">
              <Button
                type="button"
                onClick={submitAllChanges}
                disabled={addCompanyMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {addCompanyMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating {providers.length} providers...
                  </div>
                ) : (
                  `Submit Changes (${providers.length} providers)`
                )}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
