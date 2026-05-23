"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function CreateJobStepper({
  currentStep,
  labels,
}: {
  currentStep: number
  labels: [string, string, string]
}) {
  const steps = [1, 2, 3] as const

  return (
    <div className="flex w-full max-w-[639px] flex-col items-center gap-3 px-2 sm:px-0">
      <div className="relative w-full max-w-[566px]">
        <div
          className="absolute top-[15px] h-0.5 bg-[#E5E5E5] sm:top-[15.5px]"
          style={{ left: "15.5px", right: "15.5px" }}
          aria-hidden
        />
        <div
          className="absolute top-[15px] h-0.5 bg-gradient-to-r from-[#006EA8] to-[#005685] transition-all duration-300 sm:top-[15.5px]"
          style={{
            left: "15.5px",
            width:
              currentStep <= 1
                ? "0%"
                : currentStep === 2
                  ? "calc(50% - 15.5px)"
                  : "calc(100% - 31px)",
          }}
          aria-hidden
        />

        <div className="relative grid grid-cols-3 items-start">
          {steps.map((stepNum) => {
            const done = stepNum < currentStep
            const active = stepNum === currentStep
            const completed = done || active

            return (
              <div key={stepNum} className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-[31px] w-[31px] items-center justify-center rounded-full border transition-all",
                    completed
                      ? "border-transparent bg-gradient-to-b from-[#006EA8] to-[#005685] text-white shadow-[0_0_0_2px_#E8F2FF,0_0_0_2.5px_#fff,0_5px_7px_rgba(0,86,133,0.22),0_21px_54px_rgba(123,190,255,0.34)]"
                      : "border-[#D4D4D4] bg-white"
                  )}
                >
                  {completed ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid w-full max-w-[639px] grid-cols-3 gap-2 sm:gap-4">
        {labels.map((label, index) => {
          const stepNum = index + 1
          const highlighted = stepNum <= currentStep
          return (
            <p
              key={label}
              className={cn(
                "text-center text-xs leading-[150%] sm:text-sm",
                highlighted
                  ? "bg-gradient-to-b from-[#006EA8] to-[#005685] bg-clip-text font-normal text-transparent"
                  : "text-[#D4D4D4]"
              )}
            >
              {label}
            </p>
          )
        })}
      </div>
    </div>
  )
}
