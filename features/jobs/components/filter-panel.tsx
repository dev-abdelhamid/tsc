import Image from "next/image"
import { FilterSection } from "./filter-section"
import { FilterChipGrid } from "./filter-chip-grid"
import {
  formatFilterSalaryAmount,
  salaryFromSliderPercent,
} from "@/features/jobs/lib/job-display"

export type FilterPanelProps = {
  variant?: "sidebar" | "drawer"
  filterPanelTitle: string
  clearAllLabel: string
  stateLabel: string
  categoriesLabel: string
  salaryLabel: string
  salaryMinLabel: string
  salaryMaxLabel: string
  salaryFromLabel: string
  salaryToLabel: string
  stateOptions: string[]
  categoryOptions: string[]
  activeStates: number[]
  activeCategories: number[]
  salaryValue: number
  onClearAll: () => void
  onToggleState: (index: number) => void
  onToggleCategory: (index: number) => void
  onSalaryChange: (value: number) => void
}

export function FilterPanel({
  variant = "sidebar",
  filterPanelTitle,
  clearAllLabel,
  stateLabel,
  categoriesLabel,
  salaryLabel,
  salaryMinLabel,
  salaryMaxLabel,
  salaryFromLabel,
  salaryToLabel,
  stateOptions,
  categoryOptions,
  activeStates,
  activeCategories,
  salaryValue,
  onClearAll,
  onToggleState,
  onToggleCategory,
  onSalaryChange,
}: FilterPanelProps) {
  const isDrawer = variant === "drawer"

  return (
    <div
      className={
        isDrawer
          ? "bg-white"
          : "rounded-[16px] border border-[#78a3be] bg-white p-5 sm:p-6"
      }
    >
      <div className={`flex items-center justify-between ${isDrawer ? "pb-6" : ""}`}>
        <h3
          className={
            isDrawer
              ? "text-[24px] leading-[1.16] font-bold text-[#262626] sm:text-[28px]"
              : "text-[28px] leading-[1.16] font-bold text-[#262626] lg:text-[32px]"
          }
        >
          {filterPanelTitle}
        </h3>
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 text-[16px] text-[#262626] hover:text-[#006EA8]"
        >
          <Image
            src="/jobs/icon-close-circle.svg"
            alt=""
            width={16}
            height={16}
            className="shrink-0"
            aria-hidden
          />
          {clearAllLabel}
        </button>
      </div>

      <div className={`space-y-6 ${isDrawer ? "pt-0" : "mt-8"}`}>
        <FilterSection title={stateLabel}>
          <FilterChipGrid options={stateOptions} activeIndices={activeStates} onToggle={onToggleState} />
        </FilterSection>

        <FilterSection title={categoriesLabel}>
          <FilterChipGrid options={categoryOptions} activeIndices={activeCategories} onToggle={onToggleCategory} />
        </FilterSection>

        <FilterSection title={salaryLabel}>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[16px] text-[#a3a3a3]">
              <span>{salaryMinLabel}</span>
              <span>{salaryMaxLabel}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={salaryValue}
              onChange={(event) => onSalaryChange(Number(event.target.value))}
              className="h-6 w-full accent-[#63b2da]"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="border-b border-[#a3a3a3] pb-2 text-[16px] text-[#525252]">
              €{formatFilterSalaryAmount(salaryFromSliderPercent(salaryValue))}
            </div>
            <div className="border-b border-[#a3a3a3] pb-2 text-end text-[16px] text-[#a3a3a3]">
              {salaryToLabel}
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  )
}
