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
  price: number;
  companies: { name: string }[];
  countryCode: string;
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
  const [price, setPrice] = useState(0);
  const [companiesToAdd, setCompaniesToAdd] = useState<CompanyToAdd[]>([]);

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

  const submitAllCompanies = async () => {
    if (!selectedCountryCode || companiesToAdd.length === 0 || price <= 0)
      return;

    addCompanyMutation.mutate(
      {
        countryCode: selectedCountryCode,
        price: price, // Single price for all companies
        companyName: "", // Not used in this case
        token: token || "",
        companies: companiesToAdd, // Send all companies at once
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            const message = `${companiesToAdd.length} companies added successfully!`;
            onSuccess?.(message);
            console.log("Companies added successfully:", result.data);

            // Clear everything and close dialog
            setCompaniesToAdd([]);
            setCompanyName("");
            setPrice(0);
            setIsDialogOpen(false);
            reset();
            setIsCountrySelected(false);
            addCompanyMutation.reset();
          } else {
            console.error("Error adding companies:", result.error);
          }
        },
        onError: (error) => {
          console.error("Error adding companies:", error);
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
      setPrice(0);
      setCompaniesToAdd([]);
      addCompanyMutation.reset();
    }
  };

  const handleResetCountry = () => {
    setIsCountrySelected(false);
    setValue("countryCode", "");
    setCompanyName("");
    setPrice(0);
    setCompaniesToAdd([]);
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
          <DialogTitle>Add New Company</DialogTitle>
          <DialogDescription>
            Select a country and add a new company to the system.
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

          {/* Price Input - Only show after country selection */}
          {isCountrySelected && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="price" className="text-sm font-medium">
                  Price *
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="mt-1"
                  min="0"
                  step="0.01"
                  required
                />
                {price <= 0 && (
                  <p className="text-red-500 text-sm mt-1">
                    Price is required and must be greater than 0
                  </p>
                )}
              </div>

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
                    disabled={!companyName.trim() || price <= 0}
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
                Companies to Add ({companiesToAdd.length}) - Price: ${price}
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
            </div>
          )}

          {/* Submit Button */}
          {companiesToAdd.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <Button
                type="button"
                onClick={submitAllCompanies}
                disabled={addCompanyMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {addCompanyMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding {companiesToAdd.length} companies...
                  </div>
                ) : (
                  `Submit ${companiesToAdd.length} Companies`
                )}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
