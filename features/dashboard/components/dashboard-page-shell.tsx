type DashboardPageShellProps = {
  title: string
  description?: string
  children?: React.ReactNode
}

export function DashboardPageShell({ title, description, children }: DashboardPageShellProps) {
  return (
    <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-[#111827] sm:text-2xl">{title}</h1>
      {description && <p className="mt-2 text-sm text-[#6B7280] sm:text-base">{description}</p>}
      <div className="mt-6">{children}</div>
    </div>
  )
}
