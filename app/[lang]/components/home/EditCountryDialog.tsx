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
  };
  onSuccess?: (message: string) => void;
}

interface FormData {
  price: number;
  companies: { name: string }[];
  countryCode: string;
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
  const [price, setPrice] = useState(country.price);
  const [companiesToManage, setCompaniesToManage] = useState<CompanyToManage[]>(
    []
  );

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
      console.log("EditCountryDialog - Companies:", country.companies);
      setValue("countryCode", country.code);
      setPrice(country.price);
      // Initialize companies to manage with existing companies
      setCompaniesToManage(
        country.companies.map((company) => ({
          id: company.id,
          name: company.name,
          isNew: false,
          isRemoved: false,
        }))
      );
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
    const company = companiesToManage[index];
    if (company.isNew) {
      // If it's a new company, just remove it from the list
      setCompaniesToManage((prev) => prev.filter((_, i) => i !== index));
    } else {
      // If it's an existing company, mark it as removed
      setCompaniesToManage((prev) =>
        prev.map((comp, i) =>
          i === index ? { ...comp, isRemoved: true } : comp
        )
      );
    }
  };

  const submitAllChanges = async () => {
    if (!selectedCountryCode || price <= 0) return;

    // Get all active companies (both existing and new)
    const allActiveCompanies = companiesToManage
      .filter((comp) => !comp.isRemoved)
      .map((comp) => ({ name: comp.name }));

    if (allActiveCompanies.length === 0) {
      // If no companies, just show a message
      onSuccess?.("No companies to submit");
      setIsDialogOpen(false);
      return;
    }

    addCompanyMutation.mutate(
      {
        countryCode: selectedCountryCode,
        price: price,
        companyName: "",
        token: token || "",
        companies: allActiveCompanies,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            const message = `${allActiveCompanies.length} companies updated successfully!`;
            onSuccess?.(message);
            console.log("Companies updated successfully:", result.data);

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["countries"] });
            queryClient.invalidateQueries({
              queryKey: ["countries-for-adding"],
            });

            // Clear everything and close dialog
            setCompaniesToManage([]);
            setCompanyName("");
            setPrice(country.price);
            setIsDialogOpen(false);
            reset();
            addCompanyMutation.reset();
          } else {
            console.error("Error updating companies:", result.error);
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
      setCompanyName("");
      setPrice(country.price);
      setCompaniesToManage([]);
      addCompanyMutation.reset();
    }
  };

  // Filter companies for display
  const activeCompanies = companiesToManage.filter((comp) => !comp.isRemoved);
  const hasChanges =
    activeCompanies.length !== country.companies.length ||
    price !== country.price ||
    companiesToManage.some((comp) => comp.isNew);

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Country - {country.country}</DialogTitle>
          <DialogDescription>
            Manage companies for {country.country} and update the price.
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

          {/* Price Input */}
          <div>
            <Label htmlFor="price" className="text-sm font-medium">
              Price * (Current: ${country.price})
            </Label>
            <Input
              id="price"
              type="number"
              placeholder="Enter new price"
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

          {/* Add New Companies */}
          <div>
            <Label htmlFor="company-name" className="text-sm font-medium">
              Add New Companies
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
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Companies List */}
          {activeCompanies.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">
                Companies ({activeCompanies.length}) - Price: ${price}
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {activeCompanies.map((company, index) => (
                  <div
                    key={company.id || index}
                    className="flex items-center justify-between p-3 rounded-md border bg-blue-50 border-blue-200"
                  >
                    <div className="flex-1">
                      {company.isNew ? (
                        <div>
                          <div className="font-medium text-sm">
                            {company.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {company.id ? "Existing" : "New"}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-sm">
                            {company.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {company.id ? "Existing" : "New"}
                          </div>
                        </div>
                      )}
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
                    Updating {activeCompanies.length} companies...
                  </div>
                ) : (
                  `Submit Changes (${activeCompanies.length} companies)`
                )}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
