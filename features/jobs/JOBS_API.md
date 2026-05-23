# Jobs API — حقول الباكند المطلوبة للواجهة

الـ API الحالي: `NEXT_PUBLIC_API_URL` → مثال: `https://cv.subcodeco.com/api/v1`

## Endpoints المستخدمة

| Method | Path | الاستخدام |
|--------|------|-----------|
| GET | `/public/jobs` | قائمة الوظائف |
| GET | `/public/jobs/{id}` | تفاصيل وظيفة + `related[]` |

## شكل الاستجابة الفعلي (موجود اليوم)

```json
{
  "success": true,
  "data": {
    "job": { "...": "..." },
    "related": [ { "...": "..." } ]
  }
}
```

قائمة الوظائف: `data` مصفوفة مباشرة + `meta`.

## حقول Job — موجودة في الباكند

| حقل API (camelCase) | يُخزَّن في الواجهة كـ | UI |
|---------------------|----------------------|-----|
| `id` | `id` | روابط `/jobs/{id}` |
| `title` (ar/en/de) | `title` | العنوان |
| `description` | `description` | Description |
| `responsibilities` | `responsibilities` | Responsibilities |
| `requirements` | `requirements` | Requirements |
| `image` | `image` | بانر صفحة التفاصيل |
| `category` | `category` | شارة القسم / Industry |
| `subCategory` | `sub_category` | — |
| `company` (name, logo) | `company` | الشركة |
| `state` | `state` | الموقع |
| `vacancy` | `vacancy` | الشواغر |
| `gender` | `gender` | **تفاصيل فقط** (ليس على بطاقة القائمة) |
| `applicationDeadline` | `application_deadline` | آخر موعد |
| `salary.from` / `salary.to` | `salary_from` / `salary_to` | الراتب |
| `age.from` / `age.to` | `age_from` / `age_to` | العمر |
| `createdAt` | `created_at` | — |
| `createdAtHuman` | `created_at_human` | "منذ …" على البطاقات |
| `related[]` (في تفاصيل الوظيفة) | — | Related Jobs |

## حقول موجودة في UI/Figma وغير موجودة في الباكند حالياً

| الحقل المطلوب | أين يظهر في التصميم | ملاحظة |
|---------------|---------------------|--------|
| `employmentType` (مثل Full-time) | بطاقة القائمة (بدل الجنس) + تفاصيل | **غير موجود** — الباكند يرسل `gender` فقط |
| `employment_type` أو `job_type` | نفس ما سبق | يُفضّل إضافته منفصلًا عن `gender` |
| `company.company_type` أو `industry` | Industry في الشريط الجانبي | حاليًا نستخدم `category.name` كبديل |
| `slug` | روابط SEO اختيارية | حاليًا `id` رقمي فقط: `/jobs/3` |

## بيانات تجريبية (Seed)

تُفعَّل فقط عند:

`NEXT_PUBLIC_USE_JOBS_SEED_DATA=true`

بدونها: لا تُعرض وظائف وهمية؛ إن فشل الـ API تظهر القائمة فارغة أو `404` للتفاصيل.
