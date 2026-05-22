import { XCircle } from "lucide-react"
import { FilterSection } from "./filter-section"
import { FilterChipGrid } from "./filter-chip-grid"

type FilterPanelProps = {
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
  return (
    <div className="rounded-[16px] border border-[#78a3be] bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[36px] leading-[1.16] font-bold text-[#262626]">{filterPanelTitle}</h3>
        <button type="button" onClick={onClearAll} className="inline-flex items-center gap-1 text-[16px] text-[#262626]">
          <XCircle className="h-4 w-4 text-[#7db5ce]" />
          {clearAllLabel}
        </button>
      </div>

      <div className="mt-8 space-y-6">
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
            <div className="border-b border-[#a3a3a3] pb-2 text-[16px] text-[#a3a3a3]">{salaryFromLabel}</div>
            <div className="border-b border-[#a3a3a3] pb-2 text-[16px] text-[#a3a3a3]">{salaryToLabel}</div>
          </div>
        </FilterSection>
      </div>
    </div>
  )
}
