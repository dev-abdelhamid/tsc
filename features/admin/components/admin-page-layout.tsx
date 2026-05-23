type AdminPageLayoutProps = {
  title: string
  description?: string
  children: React.ReactNode
}

export function AdminPageLayout({ title, description, children }: AdminPageLayoutProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="rounded-[8px] bg-white p-6 shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)] sm:p-8">
        <h1 className="bg-gradient-to-l from-[#032C44] to-[#41A0CA] bg-clip-text text-[24px] font-bold leading-[1.16] text-transparent">
          {title}
        </h1>
        {description && <p className="mt-2 text-sm text-[#525252]">{description}</p>}
      </div>
      {children}
    </div>
  )
}
