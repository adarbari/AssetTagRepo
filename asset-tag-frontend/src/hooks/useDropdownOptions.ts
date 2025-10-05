import { useState, useEffect } from "react";
import type { DropdownOption } from "../data/dropdownOptions";
import * as dropdownOptions from "../data/dropdownOptions";

/**
 * Hook to fetch dropdown options
 * 
 * Currently returns static data, but can be easily extended to fetch from API.
 * 
 * Usage:
 * const { options, loading, error } = useDropdownOptions('assetTypes');
 */
export function useDropdownOptions(optionType: keyof typeof dropdownOptions) {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Currently just returns static data
    // In the future, this would be an API call:
    // 
    // const fetchOptions = async () => {
    //   setLoading(true);
    //   try {
    //     const response = await fetch(`/api/dropdown-options/${optionType}`);
    //     const data = await response.json();
    //     setOptions(data);
    //   } catch (err) {
    //     setError(err as Error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchOptions();

    const data = dropdownOptions[optionType];
    
    if (Array.isArray(data)) {
      setOptions(data as DropdownOption[]);
    } else {
      setOptions([]);
    }
  }, [optionType]);

  return { options, loading, error };
}

/**
 * Hook to get multiple dropdown options at once
 * 
 * Usage:
 * const { assetTypes, assetStatuses } = useMultipleDropdownOptions(['assetTypes', 'assetStatuses']);
 */
export function useMultipleDropdownOptions(optionTypes: Array<keyof typeof dropdownOptions>) {
  const result: Record<string, DropdownOption[]> = {};

  optionTypes.forEach(type => {
    const data = dropdownOptions[type];
    if (Array.isArray(data)) {
      result[type] = data as DropdownOption[];
    }
  });

  return result;
}
