"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { useDashboardChartLoading } from "./chart-loading-context";

interface OperatorStatisticsFilterProps {
  operators: Array<{ id: number; name: string }>;
  selectedOperatorId: number | null;
  disabled?: boolean;
}

export function OperatorStatisticsFilter({
  operators,
  selectedOperatorId,
  disabled = false,
}: OperatorStatisticsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setChartLoading } = useDashboardChartLoading();

  const placeholder = "Operatore";

  const options = useMemo<SearchableSelectOption[]>(
    () =>
      operators.map((operator) => ({
        label: operator.name,
        value: operator.id.toString(),
      })),
    [operators],
  );

  // Controlled value for the `SearchableSelect`.
  const [value, setValue] = useState<string>(
    selectedOperatorId != null ? selectedOperatorId.toString() : placeholder,
  );

  // Keep local state in sync with URL-driven selection.
  useEffect(() => {
    setValue(
      selectedOperatorId != null ? selectedOperatorId.toString() : placeholder,
    );
  }, [selectedOperatorId]);

  // RSC finished refreshing: new props (selectedOperatorId) match the URL — hide chart loading.
  useEffect(() => {
    setChartLoading(false);
  }, [selectedOperatorId, setChartLoading]);

  function handleValueChange(nextValue: string) {
    // Defensive: ensure we always persist an operator *id* in the URL.
    // `SearchableSelect` should emit `option.value`, but if a future refactor (or a consumer)
    // accidentally sends the label, we map it back to the option value here.
    const mappedValue =
      nextValue === placeholder
        ? placeholder
        : (options.find((option) => option.label === nextValue)?.value ??
          nextValue);

    setValue(mappedValue);

    const params = new URLSearchParams(searchParams.toString());
    if (mappedValue === placeholder) {
      params.delete("operator_id");
    } else {
      params.set("operator_id", mappedValue);
    }

    const query = params.toString();
    // Show loading on the bar chart until the server page re-renders with new stats.
    setChartLoading(true);
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    // Ensure Server Components re-render with the new `searchParams`
    // (so the chart can react to the selected operator).
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end">
      <SearchableSelect
        placeholder={placeholder}
        value={value}
        onValueChange={handleValueChange}
        options={options}
        searchPlaceholder="Cerca operatore..."
        showAllOption={true}
        allOptionLabel="Tutti gli operatori"
        disabled={disabled}
        // Keep it compact like the `Pratiche` header controls.
        triggerClassName="bg-background text-sm pl-4.25"
      />
    </div>
  );
}
