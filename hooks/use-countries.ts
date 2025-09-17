import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/services/http.service";

interface Country {
  flag: string;
  country: string;
  country_ar: string;
  code: string;
  price: number;
  companiesCount: number;
  companies: Array<{
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CountriesResponse {
  success: boolean;
  data: Country[];
  error?: string;
}

interface AddCompanyRequest {
  countryCode: string;
  price: number;
  companyName: string;
  token: string;
  companies?: { name: string }[];
}

interface AddCompanyResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Fetch countries with companiesCount > 0 (for displaying countries with companies)
export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async (): Promise<Country[]> => {
      const response = await httpClient.get<CountriesResponse>("countries");
      const data = response.data;

      if (data.success && Array.isArray(data.data)) {
        // Filter countries with companiesCount > 0 (countries that have companies) and ensure they have required properties
        const filteredCountries = data.data.filter(
          (country: Country) =>
            country &&
            country.code &&
            country.country &&
            country.companiesCount > 0
        );
        return filteredCountries;
      } else {
        throw new Error("Failed to load countries");
      }
    },
  });
}

// Fetch countries with companiesCount === 0 (for adding companies to countries that don't have any yet)
export function useCountriesForAdding() {
  return useQuery({
    queryKey: ["countries-for-adding"],
    queryFn: async (): Promise<Country[]> => {
      const response = await httpClient.get<CountriesResponse>("countries");
      const data = response.data;

      if (data.success && Array.isArray(data.data)) {
        // Filter countries with companiesCount === 0 (countries that don't have companies yet) and ensure they have required properties
        const filteredCountries = data.data.filter(
          (country: Country) =>
            country &&
            country.code &&
            country.country &&
            country.companiesCount === 0
        );
        return filteredCountries;
      } else {
        throw new Error("Failed to load countries");
      }
    },
  });
}

// Add company to a country
export function useAddCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddCompanyRequest): Promise<AddCompanyResponse> => {
      const { countryCode, price, companyName, companies } = payload;
      // If companies array is provided, use it; otherwise use single company
      const companiesToSend = companies || [{ name: companyName.trim() }];
      
      const response = await httpClient.patch(
        `countries/${countryCode}`,
        {
          price: price,
          companies: companiesToSend,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch both country queries after successful mutation
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      queryClient.invalidateQueries({ queryKey: ["countries-for-adding"] });
    },
  });
}

// Delete country (reset companies and price)
export function useDeleteCountry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { countryCode: string; token: string }) => {
      const { countryCode } = payload;
      const response = await httpClient.patch(`countries/${countryCode}`, {
        price: 0,
        companies: [],
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch both country queries after successful mutation
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      queryClient.invalidateQueries({ queryKey: ["countries-for-adding"] });
    },
  });
}
