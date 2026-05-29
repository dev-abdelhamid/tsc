"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PrimaryButton } from "@/components/ui/primary-button";
import type { HomePageContent } from "@/lib/api/services/home-page.service";
import { saveHomeContentAction } from "@/features/admin/actions/admin-actions";

type SectionKey = "categories" | "jobs" | "success_stories" | "news" | "footer";
type TabKey = "hero" | SectionKey | "process";

const LOCALES = ["ar", "en", "de"] as const;

type LocaleKey = (typeof LOCALES)[number];

type LocalizedString = Record<LocaleKey, string>;

type SectionForm = {
  title: LocalizedString;
  description: LocalizedString;
};

type StepForm = {
  id?: number;
  title: LocalizedString;
  description: LocalizedString;
  icon?: string;
  order: number;
};

type FormState = {
  heroTitle: LocalizedString;
  heroDescription: LocalizedString;
  sections: Record<SectionKey, SectionForm>;
  steps: StepForm[];
};

type FallbackCopy = {
  heroTitle: LocalizedString;
  heroDescription: LocalizedString;
  sections: Record<SectionKey, SectionForm>;
  steps: StepForm[];
};

function emptyLocale(): LocalizedString {
  return { ar: "", en: "", de: "" };
}

function emptySection(): SectionForm {
  return { title: emptyLocale(), description: emptyLocale() };
}

function emptyStep(): StepForm {
  return { title: emptyLocale(), description: emptyLocale(), order: 1 };
}

const SECTION_KEYS: SectionKey[] = [
  "categories",
  "jobs",
  "success_stories",
  "news",
  "footer",
];
const MAX_STEPS = 3;
const DEFAULT_STEP_ICONS = [
  "/process/profile.svg",
  "/process/info.svg",
  "/process/job.svg",
];

function getSectionOverride(content: HomePageContent | null, key: SectionKey) {
  if (!content) {
    return undefined;
  }

  if (key === "success_stories") {
    return content.sections.testimonials;
  }

  return content.sections[
    key as Exclude<keyof HomePageContent["sections"], "testimonials">
  ];
}

function resolveSectionValue(value: string | undefined, fallback: string) {
  return value?.trim() ? value : fallback;
}

function buildFallbackCopy(
  heroT: ReturnType<typeof useTranslations>,
  categoriesT: ReturnType<typeof useTranslations>,
  jobsT: ReturnType<typeof useTranslations>,
  testimonialsT: ReturnType<typeof useTranslations>,
  newsT: ReturnType<typeof useTranslations>,
  supportT: ReturnType<typeof useTranslations>,
  processT: ReturnType<typeof useTranslations>,
): FallbackCopy {
  const heroTitle = heroT("title");
  const heroDescription = heroT("description");

  return {
    heroTitle: { ar: heroTitle, en: heroTitle, de: heroTitle },
    heroDescription: { ar: heroDescription, en: heroDescription, de: heroDescription },
    sections: {
      categories: {
        title: { ar: categoriesT("title"), en: categoriesT("title"), de: categoriesT("title") },
        description: { ar: categoriesT("description"), en: categoriesT("description"), de: categoriesT("description") },
      },
      jobs: {
        title: { ar: jobsT("title"), en: jobsT("title"), de: jobsT("title") },
        description: { ar: jobsT("description"), en: jobsT("description"), de: jobsT("description") },
      },
      success_stories: {
        title: { ar: testimonialsT("title"), en: testimonialsT("title"), de: testimonialsT("title") },
        description: { ar: testimonialsT("description"), en: testimonialsT("description"), de: testimonialsT("description") },
      },
      news: {
        title: { ar: newsT("title"), en: newsT("title"), de: newsT("title") },
        description: { ar: newsT("description"), en: newsT("description"), de: newsT("description") },
      },
      footer: {
        title: { ar: supportT("title"), en: supportT("title"), de: supportT("title") },
        description: { ar: supportT("description"), en: supportT("description"), de: supportT("description") },
      },
    },
    steps: [
      {
        title: { ar: processT("steps.createAccount.title"), en: processT("steps.createAccount.title"), de: processT("steps.createAccount.title") },
        description: { ar: processT("steps.createAccount.description"), en: processT("steps.createAccount.description"), de: processT("steps.createAccount.description") },
        order: 1,
      },
      {
        title: { ar: processT("steps.completeProfile.title"), en: processT("steps.completeProfile.title"), de: processT("steps.completeProfile.title") },
        description: { ar: processT("steps.completeProfile.description"), en: processT("steps.completeProfile.description"), de: processT("steps.completeProfile.description") },
        order: 2,
      },
      {
        title: { ar: processT("steps.apply.title"), en: processT("steps.apply.title"), de: processT("steps.apply.title") },
        description: { ar: processT("steps.apply.description"), en: processT("steps.apply.description"), de: processT("steps.apply.description") },
        order: 3,
      },
    ],
  };
}

function mapContentToForm(
  content: HomePageContent | null,
  fallback: FallbackCopy,
): FormState {
  const sections = SECTION_KEYS.reduce<Record<SectionKey, SectionForm>>(
    (acc, key) => {
      const override = getSectionOverride(content, key);
      acc[key] = {
        title: {
          ar: resolveSectionValue(override?.title, fallback.sections[key].title.ar),
          en: resolveSectionValue(override?.title, fallback.sections[key].title.en),
          de: resolveSectionValue(override?.title, fallback.sections[key].title.de),
        },
        description: {
          ar: resolveSectionValue(override?.description, fallback.sections[key].description.ar),
          en: resolveSectionValue(override?.description, fallback.sections[key].description.en),
          de: resolveSectionValue(override?.description, fallback.sections[key].description.de),
        },
      };
      return acc;
    },
    {
      categories: emptySection(),
      jobs: emptySection(),
      success_stories: emptySection(),
      news: emptySection(),
      footer: emptySection(),
    },
  );

  const steps = (
    content?.processSteps?.length ? content.processSteps : fallback.steps
  )
    .slice(0, MAX_STEPS)
    .map((step, index) => {
      const titleSource = typeof step.title === "string" ? step.title : step.title;
      const descriptionSource =
        typeof step.description === "string" ? step.description : step.description;

      return {
        ...step,
        title: {
          ar: resolveSectionValue(
            typeof titleSource === "string" ? titleSource : titleSource.ar,
            fallback.steps[index].title.ar,
          ),
          en: resolveSectionValue(
            typeof titleSource === "string" ? titleSource : titleSource.en,
            fallback.steps[index].title.en,
          ),
          de: resolveSectionValue(
            typeof titleSource === "string" ? titleSource : titleSource.de,
            fallback.steps[index].title.de,
          ),
        },
        description: {
          ar: resolveSectionValue(
            typeof descriptionSource === "string"
              ? descriptionSource
              : descriptionSource.ar,
            fallback.steps[index].description.ar,
          ),
          en: resolveSectionValue(
            typeof descriptionSource === "string"
              ? descriptionSource
              : descriptionSource.en,
            fallback.steps[index].description.en,
          ),
          de: resolveSectionValue(
            typeof descriptionSource === "string"
              ? descriptionSource
              : descriptionSource.de,
            fallback.steps[index].description.de,
          ),
        },
        icon: step.icon?.trim() ? step.icon : DEFAULT_STEP_ICONS[index],
        order: step.order ?? index + 1,
      };
    });

  while (steps.length < MAX_STEPS) {
    steps.push({ ...emptyStep(), icon: DEFAULT_STEP_ICONS[steps.length] });
  }

  return {
    heroTitle: {
      ar: resolveSectionValue(content?.hero.title, fallback.heroTitle.ar),
      en: resolveSectionValue(content?.hero.title, fallback.heroTitle.en),
      de: resolveSectionValue(content?.hero.title, fallback.heroTitle.de),
    },
    heroDescription: {
      ar: resolveSectionValue(content?.hero.description, fallback.heroDescription.ar),
      en: resolveSectionValue(content?.hero.description, fallback.heroDescription.en),
      de: resolveSectionValue(content?.hero.description, fallback.heroDescription.de),
    },
    sections,
    steps,
  };
}

function appendLocalized(
  formData: FormData,
  key: string,
  values: LocalizedString,
) {
  for (const lang of LOCALES) {
    const trimmed = values[lang].trim();
    if (trimmed) {
      formData.append(`${key}[${lang}]`, trimmed);
    }
  }
}

function InputLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm text-[#374151]">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
    </label>
  );
}

export function AdminHomePanel({
  content,
  locale,
  loadError,
}: {
  content: HomePageContent | null;
  locale: string;
  loadError?: string | null;
}) {
  const t = useTranslations("Admin.home");
  const heroT = useTranslations("Landing.hero");
  const categoriesT = useTranslations("Landing.categories");
  const jobsT = useTranslations("Landing.jobs");
  const testimonialsT = useTranslations("Landing.testimonials");
  const newsT = useTranslations("Landing.news");
  const supportT = useTranslations("Landing.support");
  const processT = useTranslations("Landing.process");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("hero");
  const [form, setForm] = useState<FormState>(() =>
    mapContentToForm(
      content,
      buildFallbackCopy(
        heroT,
        categoriesT,
        jobsT,
        testimonialsT,
        newsT,
        supportT,
        processT,
      ),
    ),
  );

  function updateSection(
    key: SectionKey,
    field: "title" | "description",
    lang: LocaleKey,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: {
          ...prev.sections[key],
          [field]: {
            ...prev.sections[key][field],
            [lang]: value,
          },
        },
      },
    }));
  }

  function updateStep(
    index: number,
    field: "title" | "description" | "icon",
    lang: LocaleKey | null,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((step, currentIndex) =>
        currentIndex === index
          ? {
              ...step,
              [field]:
                field === "icon"
                  ? value
                  : {
                      ...step[field],
                      [lang as LocaleKey]: value,
                    },
            }
          : step,
      ),
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    appendLocalized(formData, "title", form.heroTitle);
    appendLocalized(formData, "description", form.heroDescription);

    SECTION_KEYS.forEach((key, index) => {
      const entry = form.sections[key];
      const hasTitle = LOCALES.some((lang) => entry.title[lang].trim());
      const hasDescription = LOCALES.some((lang) => entry.description[lang].trim());

      if (!hasTitle && !hasDescription) {
        return;
      }

      formData.append(`sections[${index}][section_key]`, key);
      appendLocalized(formData, `sections[${index}][title]`, entry.title);
      appendLocalized(formData, `sections[${index}][description]`, entry.description);
    });

    form.steps.forEach((step, index) => {
      const hasTitle = LOCALES.some((lang) => step.title[lang].trim());
      const hasDescription = LOCALES.some((lang) => step.description[lang].trim());
      const hasContent = Boolean(hasTitle || hasDescription || step.icon?.trim());
      if (!hasContent) {
        return;
      }

      if (step.id) {
        formData.append(`steps[${index}][id]`, String(step.id));
      }
      if (step.order !== undefined && step.order !== null) {
        formData.append(`steps[${index}][order]`, String(step.order));
      }

      appendLocalized(formData, `steps[${index}][title]`, step.title);
      appendLocalized(formData, `steps[${index}][description]`, step.description);

      if (step.icon?.trim()) {
        formData.append(`steps[${index}][icon]`, step.icon.trim());
      }
    });

    startTransition(async () => {
      const result = await saveHomeContentAction(formData, locale);
      if (!result.ok) {
        setError(result.message ?? t("error"));
        return;
      }

      setSuccess(t("success"));
      router.refresh();
    });
  }

  const tabs: Array<{ key: TabKey; label: string; note: string }> = [
    { key: "hero", label: t("sectionLabels.hero"), note: t("helper.hero") },
    {
      key: "categories",
      label: t("sectionLabels.categories"),
      note: t("helper.categories"),
    },
    {
      key: "process",
      label: t("sectionLabels.process"),
      note: t("helper.process"),
    },
    { key: "jobs", label: t("sectionLabels.jobs"), note: t("helper.jobs") },
    {
      key: "success_stories",
      label: t("sectionLabels.successStories"),
      note: t("helper.successStories"),
    },
    { key: "news", label: t("sectionLabels.news"), note: t("helper.news") },
    {
      key: "footer",
      label: t("sectionLabels.footer"),
      note: t("helper.footer"),
    },
  ];

  const sectionContent = (
    <div className="space-y-6">
      {activeTab === "hero" && (
        <div className="grid gap-4 lg:grid-cols-3">
          {LOCALES.map((lang) => (
            <div
              key={lang}
              className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] p-4"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#006EA8]">
                {lang.toUpperCase()}
              </p>
              <InputLabel label={t("fields.heroTitle")}> 
                <input
                  value={form.heroTitle[lang]}
                  placeholder={t("fields.heroTitle")}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      heroTitle: { ...prev.heroTitle, [lang]: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
                />
              </InputLabel>
              <InputLabel label={t("fields.heroDescription")}> 
                <textarea
                  rows={4}
                  value={form.heroDescription[lang]}
                  placeholder={t("fields.heroDescription")}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      heroDescription: {
                        ...prev.heroDescription,
                        [lang]: e.target.value,
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
                />
              </InputLabel>
            </div>
          ))}
        </div>
      )}

      {activeTab === "categories" && (
        <div className="grid gap-4 lg:grid-cols-3">
          {LOCALES.map((lang) => (
            <div
              key={lang}
              className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] p-4"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#006EA8]">
                {lang.toUpperCase()}
              </p>
              <InputLabel label={t("fields.sectionCategoriesTitle")}>
                <input
                  value={form.sections.categories.title[lang]}
                  placeholder={t("fields.sectionCategoriesTitle")}
                  onChange={(e) =>
                    updateSection("categories", "title", lang, e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
                />
              </InputLabel>
              <InputLabel label={t("fields.sectionCategoriesDescription")}>
                <textarea
                  rows={4}
                  value={form.sections.categories.description[lang]}
                  placeholder={t("fields.sectionCategoriesDescription")}
                  onChange={(e) =>
                    updateSection("categories", "description", lang, e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
                />
              </InputLabel>
            </div>
          ))}
        </div>
      )}

      {activeTab === "process" && (
        <div className="space-y-4">
          {form.steps.map((step, index) => (
            <div
              key={`${step.id ?? index}-${index}`}
              className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] p-4"
            >
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <Image
                    src={step.icon?.trim() || DEFAULT_STEP_ICONS[index]}
                    alt=""
                    width={24}
                    height={24}
                    className="object-contain"
                    unoptimized={Boolean(step.icon?.trim()?.startsWith("http"))}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    {t("labels.processStep")} {index + 1}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {t("helper.processIcon")}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {LOCALES.map((lang) => (
                  <div key={lang} className="rounded-[10px] border border-[#E5E7EB] bg-white p-3">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#006EA8]">
                      {lang.toUpperCase()}
                    </p>
                    <InputLabel label={t("fields.stepTitle")}>
                      <input
                        value={step.title[lang]}
                        placeholder={t("fields.stepTitle")}
                        onChange={(e) =>
                          updateStep(index, "title", lang, e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
                      />
                    </InputLabel>
                    <InputLabel label={t("fields.stepDescription")}>
                      <textarea
                        rows={3}
                        value={step.description[lang]}
                        placeholder={t("fields.stepDescription")}
                        onChange={(e) =>
                          updateStep(index, "description", lang, e.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
                      />
                    </InputLabel>
                  </div>
                ))}
              </div>

              <InputLabel label={t("fields.stepIcon")}>
                <input
                  value={step.icon ?? ""}
                  placeholder="/process/profile.svg"
                  onChange={(e) => updateStep(index, "icon", null, e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
                />
              </InputLabel>
            </div>
          ))}
        </div>
      )}

      {(activeTab === "jobs" ||
        activeTab === "success_stories" ||
        activeTab === "news" ||
        activeTab === "footer") && (
        <div className="grid gap-4 lg:grid-cols-3">
          {LOCALES.map((lang) => {
            const sectionKey = activeTab === "success_stories" ? "success_stories" : activeTab;
            return (
              <div
                key={lang}
                className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] p-4"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#006EA8]">
                  {lang.toUpperCase()}
                </p>
                <InputLabel label={
                  activeTab === "jobs"
                    ? t("fields.sectionJobsTitle")
                    : activeTab === "success_stories"
                    ? t("fields.sectionTestimonialsTitle")
                    : activeTab === "news"
                    ? t("fields.sectionNewsTitle")
                    : t("fields.sectionFooterTitle")
                }>
                  <input
                    value={form.sections[sectionKey].title[lang]}
                    placeholder={
                      activeTab === "jobs"
                        ? t("fields.sectionJobsTitle")
                        : activeTab === "success_stories"
                        ? t("fields.sectionTestimonialsTitle")
                        : activeTab === "news"
                        ? t("fields.sectionNewsTitle")
                        : t("fields.sectionFooterTitle")
                    }
                    onChange={(e) =>
                      updateSection(sectionKey, "title", lang, e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
                  />
                </InputLabel>
                <InputLabel label={
                  activeTab === "jobs"
                    ? t("fields.sectionJobsDescription")
                    : activeTab === "success_stories"
                    ? t("fields.sectionTestimonialsDescription")
                    : activeTab === "news"
                    ? t("fields.sectionNewsDescription")
                    : t("fields.sectionFooterDescription")
                }>
                  <textarea
                    rows={4}
                    value={form.sections[sectionKey].description[lang]}
                    placeholder={
                      activeTab === "jobs"
                        ? t("fields.sectionJobsDescription")
                        : activeTab === "success_stories"
                        ? t("fields.sectionTestimonialsDescription")
                        : activeTab === "news"
                        ? t("fields.sectionNewsDescription")
                        : t("fields.sectionFooterDescription")
                    }
                    onChange={(e) =>
                      updateSection(sectionKey, "description", lang, e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
                  />
                </InputLabel>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6  "
    >
     
     

      {loadError && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {success}
        </p>
      )}

      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-white text-[#006EA8] shadow-sm"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5E7EB] pb-4">
          <div>
            <p className="text-base font-semibold text-[#111827]">
              {tabs.find((tab) => tab.key === activeTab)?.label}
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {tabs.find((tab) => tab.key === activeTab)?.note}
            </p>
          </div>
        </div>

        <div className="pt-4">{sectionContent}</div>
      </div>

      <div className="flex items-center justify-end">
        <PrimaryButton
          type="submit"
          disabled={pending}
          className="h-10 rounded-lg px-4 text-sm"
        >
          {pending ? t("saving") : t("save")}
        </PrimaryButton>
      </div>
    </form>
  );
}
