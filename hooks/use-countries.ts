import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/services/http.service";

interface Provider {
  name: string;
  price: number;
  companies: { name: string }[];
}

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
  providers: Provider[];
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
  providers: Provider[];
  token: string;
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
      const { countryCode, providers } = payload;
      
      const response = await httpClient.patch(
        `countries/${countryCode}`,
        {
          providers: providers,
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
        providers: []
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
