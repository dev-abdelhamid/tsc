# مهارة: خطة مشروع "Talent Seeker" — SKILL

الوصف

هذه المهارة تُحوّل المحادثة/المخطط التفصيلي لمشروع "Talent Seeker" إلى مجموعة خطوات قابلة للتنفيذ، قوالب برومبت جاهزة، ومعايير جودة وقائمة تحقق (checklist) قابلة لإعادة الاستخدام داخل مساحة العمل.

النطاق

- Workspace-scoped: مخصصة لهذا الريبو. تَستخدم الملفّات التالية كمراجع: ملفات الـ UI الموجودة، مجلد `lib/`, وملفات الترجمة `messages/*.json`.
- الهدف: توليد مهام هندسية محددة (مثل: بناء API Layer، ربط Auth، صفحات Public، داشبوردات المستخدم/شركة/أدمن، SEO وتحسين الأداء).

متى تُستخدم

- عند الرغبة في تنفيذ أي من المراحل الموضّحة في وثيقة الخطة (المرحلة 1..6).
- عند طلب تهيئة طبقة API أو ربط الـ front-end بالـ backend.
- عند توليد برومبتات جاهزة لاستخدامها في محادثات مع وكيل آخر (مثل Claude أو Copilot).

المخرجات المتوقعة

- ملف `lib/api/*` (client, types, services) جاهز وموثق.
- Route handlers في `app/api/auth/*` متوافقة مع `lib/session.ts`.
- صفحات Dashboard skeletons في `app/[locale]/dashboard/...` مع auth-guard.
- ملفات SEO: `app/sitemap.ts`, `app/robots.ts`, Structured Data components.
- ملف نصّي يحتوي على برومبتات جاهزة وأمثلة استخدام.

المدخلات المطلوبة (Placeholders)

- `API_URL` — رابط الـ Backend (NEXT_PUBLIC_API_URL)
- `AUTH_SECRET` — مفتاح الجلسة (min 32 chars)
- Locales المطلوبة: `ar`, `en`, `de`

الخطوة-بخطوة (Workflow)

1. تحضير البيئة
   - تأكّد من وجود `NEXT_PUBLIC_API_URL` و `AUTH_SECRET` في `.env.local`.
   - تثبيت الحزم: `iron-session`, `@tanstack/react-query`, `zod`, `react-hook-form`, `@next/bundle-analyzer`.

2. بناء طبقة API (Server & Client)
   - أضف `lib/api/client.ts` (fetch wrapper مع ApiError).
   - أضف `lib/api/types.ts` (أنواع TypeScript الشاملة).
   - أنشئ service files تحت `lib/api/services/*` لكل module (auth, jobs, news, categories, home, company, admin, tickets, notifications, contact).
   - إضافة اختبارات نوعية بسيطة (type-only checks).

3. المصادقة والجلسات
   - إعداد `lib/session.ts` باستخدام `iron-session`.
   - Route handlers في `app/api/auth/` (login, register, logout, refresh).
   - Hook للعميل `hooks/use-auth.ts` للتعامل مع جلسة المستخدم.
   - Middleware لحماية `dashboard/*` وتحويل المسارات بحسب الدور.

4. ربط صفحات Public
   - تحويل Sections في الصفحة الرئيسية لاستخدام services (server components + suspense + skeletons).
   - Jobs Page: Server component مع ISR + client filters (react-query).

5. بناء داشبوردات المستخدم/الشركة/الأدمن
   - إضافة layout عام للداشبورد مع Sidebar والتحقّق من الصلاحيات.
   - لكل Dashboard: pages و APIs الخاصة بالـ CRUD والـ mutations بالـ react-query.

6. SEO وPerformance
   - `app/sitemap.ts` ديناميكي، `app/robots.ts`, OG generator route، Structured Data components.
   - تكوين `next.config.ts` لتحسين الصور وCSS.

نقاط القرار (Decision Points)

- اختيار آلية الجلسات: `iron-session` (مقترح) مقابل `next-auth` أو JWT فقط.
- الاستراتيجية للـ ISR والـ caching: أي صفحات تُعاد كل 5 دقائق مقابل كل ساعة.
- طريقة حفظ الملفات كبيرة الحجم (CVs): تخزين محلي vs. remote (S3/API storage).

معايير الجودة (Acceptance Criteria)

- TypeScript strict بدون أخطاء في الملفات الجديدة.
- End-to-end flow: تسجيل دخول → الحصول على session → الوصول إلى `/dashboard/user`.
- Jobs page يعرض بيانات من API حقيقية (مُحاكاة أو حقيقية) مع فلترة تعمل وتحدث الـ URL.
- Sitemap يتولّد دون أخطاء ويحتوي الصفحات والديناميكية.
- Lighthouse score هدف > 90 (قابلة للتحقّق لاحقًا).

حالات الحافة (Edge Cases)

- Backend غير متاح: كل service يجب أن يتعامل مع الأخطاء ويرجع رسائل قابلة للعرض.
- ملفات FormData (uploads) يجب أن تُعالج header Content-Type بشكل صحيح.
- Refresh token فشل: يجب إعادة توجيه المستخدم لتسجيل الدخول.

قائمة التحقق لكل مرحلة (Quick Checklist)

- [ ] .env.local مضاف
- [ ] `lib/api/client.ts` موجود
- [ ] `lib/api/services/auth.service.ts` و `jobs.service.ts` موجودان
- [ ] `lib/session.ts` مهيأ
- [ ] Route handlers auth في `app/api/auth/`
- [ ] Dashboard layout مع auth-guard
- [ ] Sitemap و robots مُعرّفة
- [ ] برومبتات جاهزة في نهاية الوثيقة

نماذج برومبت جاهزة (Examples)

- "أنشئ `lib/api/client.ts` مع fetch wrapper وApiError class، أدعم Accept-Language وAuthorization header، وادعم FormData بدون Content-Type."
- "حوّل صفحة `app/ar/jobs/page.tsx` لتستخدم `getPublicJobs` من `lib/api/services/jobs.service.ts` مع ISR revalidate=300."
- "أنشئ route `app/api/auth/login/route.ts` الذي يستدعي `auth.service.login`، يخزن الـ tokens في iron-session، ويعيد بيانات المستخدم."

كيفية التكرار (Iterate)

1. Draft: إنشاؤها كـ PR صغير يغيّر ملف/ملفات محددة (مثلاً: فقط `lib/api/client.ts`).
2. Review: تشغيل TypeScript و ESLint محليًا، تشغيل صفحات متعلّقة للتأكد من عدم كسر الـ UI.
3. Expand: تنفيذ services إضافية وخطوات البنية الأخرى.
4. Finalize: تحديث الوثائق، إضافة اختبارات إذا لزم.

ماذا نسأل المستخدم بعد ذلك؟ (Clarifying Questions)

- هل تريد أن أبدأ بإنشاء `lib/api/client.ts` في هذه المساحة الآن؟
- هل هناك API حقيقي يمكنني استخدامه لاختبار endpoints أم تريد mocks؟
- هل تفضّل `iron-session` حقًا أم تريد `next-auth`؟

أين أخزن هذه المهارة

ملف هذه المهارة مخزّن هنا: `skills/talent-seeker/SKILL.md` داخل الريبو — استخدمه كقالب لإصدار برومبتات أصغر أو لتهيئة PRs.

نهايات

- إصدار برومبتات جاهزة مرفقة أعلاه.
- إذا رغبت، أستطيع الآن:
   - تنفيذ الخطوة الأولى (إنشاء `lib/api/client.ts`) تلقائيًا.
   - أو فتح نقاش لتهيئة تفاصيل الـ env وقرارات التصميم.
1 — Session + Auth Route Handlers
أول حاجة
بيعمل: lib/session.ts + app/api/auth/(login/register/logout/refresh)/route.ts
استخدم القالب التالي كنقطة بداية
أنا بشتغل على مشروع Next.js 16.2 App Router اسمه Talent Seeker. الـ Stack: Next.js 16, React 19, TypeScript strict, next-intl (ar/en/de). عندي lib/api/services/auth.service.ts جاهز فيه: login(), register(), logout(), refreshToken(). كل function بترجع ApiResponse مع access_token و refresh_token و user object. المطلوب: 1. lib/session.ts — باستخدام iron-session: - SessionData interface: { user?: {id,name,email,role,avatar}, accessToken?, refreshToken?, isLoggedIn: boolean } - sessionOptions: cookieName="ts_session", secure في production, maxAge = 7 days - getSession() function 2. app/api/auth/login/route.ts — POST: - تاخد { email, password } من request.json() - تستدعي auth.service.ts login() - تحفظ في session وترجع { user } 3. app/api/auth/register/route.ts — POST: - تاخد { name, email, phone, password, password_confirmation, role } - role = "user" أو "company" → roles[] = [role] - تستدعي register() وتحفظ session 4. app/api/auth/logout/route.ts — POST: - تستدعي logout() وتعمل session.destroy() 5. app/api/auth/refresh/route.ts — POST: - تستدعي refreshToken() وتعمل update للـ session حافظ على نفس الهوية: Primary #40A0CA, Dark #001222. TypeScript strict بدون any.
نسخ
برومبت 2 — تحديث middleware.ts + Sign-In/Sign-Up
تاني
بيعمل: middleware مع auth guard + تحويل صفحتي الدخول لـ Client Components حقيقية
استخدم القالب التالي كنقطة بداية
أنا بشتغل على Talent Seeker — Next.js 16 App Router. الـ middleware الحالي (proxy.ts) يعمل next-intl routing فقط للـ locales [ar, en, de]. عندي lib/session.ts مع getSession() و iron-session. عندي app/api/auth/login/route.ts جاهز. المطلوب: 1. تحديث middleware.ts: - يحافظ على i18n routing الحالي بالكامل - يضيف: لو المسار فيه /dashboard → check session → لو مش logged in redirect لـ /sign-in - لو logged in وحاول يفتح /sign-in أو /sign-up → redirect لـ /dashboard - matcher يشمل المسارات دي 2. تحويل app/[locale]/(auth)/sign-in/page.tsx من Server Component لـ Client Component: - نفس الـ UI الموجود بالظبط (AuthCardWrapper + AuthFieldRow + AuthPrimaryCta + AuthUserCompanyTabs) - إضافة react-hook-form + zod validation - schema: { email: z.string().email(), password: z.string().min(6) } - onSubmit: POST /api/auth/login → success: router.push("/dashboard") + router.refresh() - عرض errors بالعربية من الـ API - loading state على الزرار 3. تحويل app/[locale]/(auth)/sign-up/page.tsx: - نفس الـ UI الموجود - AuthUserCompanyTabs يحدد role - للشركة: إظهار company name field إضافي - زod validation كامل مع password confirmation - POST /api/auth/register ثم redirect لـ /verify-email page 4. app/[locale]/(auth)/forgot-password/page.tsx — 3 steps في نفس الصفحة: - Step 1: email → POST /api/auth/forgot-password - Step 2: 6-digit OTP (input-otp موجود في المشروع) → POST /api/auth/verify-reset-code - Step 3: new password + confirm → POST /api/auth/reset-password احتفظ بنفس الـ colors والـ animations الموجودة.
نسخ
برومبت 3 — ربط Homepage بالـ API
استبدال كل الـ hardcoded data بـ server-side API calls مع Suspense + loading skeletons
استخدم القالب التالي كنقطة بداية
أنا بشتغل على Talent Seeker — Next.js 16 App Router. الـ API endpoints الجاهزة: - GET /home → { title, description, image, steps[], sections[] } - GET /public/jobs?per_page=6 → { data: Job[], meta: {...} } - GET /news?per_page=4 → { data: NewsItem[], meta: {...} } - GET /categories → { data: Category[] } - GET /success-stories?per_page=3 → { data: SuccessStory[] } كل request محتاج header: Accept-Language: [locale] ISR: revalidate=300 للـ jobs, revalidate=3600 للباقي. المطلوب — تعديل كل section في features/: 1. features/hero/components/hero-section.tsx: - جلب /home من API - عرض title و description من الـ API مش من translations فقط - احتفظ بنفس visual design بالكامل 2. features/jobs/components/jobs-section.tsx: - استبدال getJobKeys() بـ server-side fetch من /public/jobs?per_page=6 - Job cards تعرض: title, category.name, salary_from-salary_to, company.name, status - زرار "سجل الآن" → redirect لـ /sign-in لو مش logged in · أو apply للـ API لو logged in - فلتر الـ categories يجي من /categories endpoint مش hardcoded - Loading skeleton لكل card 3. features/news/components/news-section.tsx: - استبدال static news بـ /news?per_page=4 - كل خبر: title, description, image, created_at - لو مفيش صورة: placeholder 4. features/testimonials/components/testimonials-section.tsx: - استبدال static testimonials بـ /success-stories?per_page=3 - كل story: name, role, location, quote, image 5. features/categories/components/categories-section.tsx: - استبدال static categories بـ /categories - كل category: name + icon + jobs_count لكل section: أضف Suspense wrapper مع skeleton بنفس أبعاد الـ cards الموجودة. احتفظ بكل الـ animations (StaggerInView, StaggerItem) زي ما هي.
نسخ
برومبت 4 — User Dashboard الكامل
استخدم القالب التالي كنقطة بداية
أنا بشتغل على Talent Seeker — Next.js 16 App Router. عندي: lib/session.ts (getSession), lib/api/services/jobs.service.ts, auth.service.ts, index.ts الـ API base: process.env.NEXT_PUBLIC_API_URL هوية المشروع: Primary #40A0CA, Dark #001222, font Cairo للعربية. المطلوب: بناء app/[locale]/dashboard/ الكامل: 1. dashboard/layout.tsx: - Server component: يجيب session، لو مش logged in → redirect /sign-in - DashboardSidebar component (على الشمال، عرض 240px) - Sidebar links حسب role: user له navigation معينة، company لها تانية - Header: user avatar + name + notification bell + logout button - Mobile: hamburger → sheet drawer للـ sidebar 2. dashboard/page.tsx: redirect حسب role لـ /dashboard/user أو /dashboard/company أو /dashboard/admin 3. dashboard/user/page.tsx: - جلب /user/dashboard/stats (total/pending/accepted/rejected/favourite) - 4 stat cards بنفس هوية المشروع - قائمة آخر 3 applications من /my-applications?per_page=3 - Profile completion percentage 4. dashboard/user/profile/page.tsx: - جلب /auth/profile - Form لتعديل: name, phone, country_id, city_id, gender, date_of_birth - Avatar upload مع preview (drag & drop) - قسم منفصل لتغيير كلمة المرور (current + new + confirm) 5. dashboard/user/applications/page.tsx: - DataTable من /my-applications مع pagination - Columns: Job Title, Company, Applied Date, Status badge - Status colors: pending=yellow, accepted=green, rejected=red 6. dashboard/user/favorites/page.tsx: - Grid من /favourite-jobs - زرار remove (toggle favourite) - Empty state لو مفيش 7. dashboard/user/portfolio/page.tsx: - GET /portfolio ثم form لتعديله - Sections: CV upload + Education[] + Work Experience[] + Skills[] + Languages[] - كل section فيها add/remove items dynamically 8. dashboard/user/tickets/page.tsx + [id]/page.tsx: - قائمة tickets + create new (modal) - صفحة تفاصيل: conversation thread + reply form 9. dashboard/user/notifications/page.tsx: - قائمة notifications مع mark read / mark all read / delete - Badge في الـ sidebar بالعدد غير المقروء استخدم sonner (موجود في المشروع) للـ toast notifications. استخدم shadcn/ui components الموجودة. Server Components للـ data fetching, Client Components للـ interactions.
نسخ
برومبت 5 — Company Dashboard
استخدم القالب التالي كنقطة بداية
أنا بشتغل على Talent Seeker — Next.js 16. عندي نفس الـ setup: lib/api/services/jobs.service.ts فيها: getCompanyJobs, createJob, updateJob, deleteJob, stopJob, getCompanyApplications, updateApplicationStatus, getCompanyDashboardStats. المطلوب: بناء dashboard/company/ الكامل: 1. dashboard/company/page.tsx: - Stats من /company/dashboard/stats - Chart: applications per week باستخدام recharts (موجود في المشروع) - Recent applications list 2. dashboard/company/jobs/page.tsx: - DataTable: Title, Status badge, Applications count, Deadline, Actions - Status: pending=yellow, approved=green, rejected=red, stopped=gray - Actions: Edit, View Applications, Stop/Activate (PATCH /jobs/:id/stop), Delete 3. dashboard/company/jobs/create/page.tsx: - Multi-step form (3 steps) مع progress indicator: Step 1: title (ar/en/de) + category_id + sub_category_id + state (full_time/part_time/remote) Step 2: vacancy + gender + age_from/to + salary_from/to + application_deadline Step 3: description (ar/en/de) + responsibilities (ar/en/de) + requirements (ar/en/de) + image upload - كل الـ multilingual fields: tabs للـ 3 لغات - Submit → POST /jobs مع FormData 4. dashboard/company/jobs/[id]/page.tsx: - نفس الـ form بـ current data (GET /jobs/:id ثم edit) 5. dashboard/company/jobs/[id]/applications/page.tsx: - DataTable المتقدمين من /company/applications?job_id=:id - Columns: Name, Email, Applied Date, Status - Actions per row: Accept, Reject (POST /company/applications/:id/status { status: accepted/rejected }) - Bulk actions checkbox - Export CSV button 6. dashboard/company/profile/page.tsx: - Form لتعديل ملف الشركة: company_name (ar/en/de), description (ar/en/de), logo upload, website, company_type_id استخدم recharts للـ charts وsonner للـ toasts.
نسخ
برومبت 6 — Admin Dashboard
استخدم القالب التالي كنقطة بداية
أنا بشتغل على Talent Seeker — Next.js 16. عندي: admin jobs endpoints: GET /admin/jobs?status=pending, PATCH /admin/jobs/:id/approve, PATCH /admin/jobs/:id/reject. عندي: GET /admin/job-applications/stats, GET /users, GET /news, GET /categories, GET /settings. المطلوب: بناء dashboard/admin/ الكامل: 1. dashboard/admin/page.tsx — Overview: - 4 KPI cards: Total Jobs · Pending Jobs · Total Users · Total Applications - recharts LineChart: applications trend last 7 days - recharts PieChart: jobs by category 2. dashboard/admin/jobs/page.tsx: - Tabs: Pending | Approved | Rejected | All - DataTable: Title, Company, Category, Salary, Created, Status, Actions - Approve button ✓ (PATCH /admin/jobs/:id/approve) - Reject button ✗ (PATCH /admin/jobs/:id/reject) - Bulk approve/reject selected rows 3. dashboard/admin/users/page.tsx: - DataTable: Name, Email, Role badge, Created, Actions - Filter by role: all/user/company - Delete user action 4. dashboard/admin/news/page.tsx: - DataTable مع Create/Edit/Delete - Create/Edit: modal مع title (ar/en/de) + description (ar/en/de) + image upload - POST /news, POST /news/:id, DELETE /news/:id 5. dashboard/admin/categories/page.tsx: - CRUD categories + sub_categories - icon upload 6. dashboard/admin/settings/page.tsx: - GET /settings → قائمة key-value settings - كل setting: input field + save button (POST /settings/:key) لكل admin page: check session.user.role === "admin" لو مش admin → redirect.
نسخ
برومبت 7 — Jobs Page مع فلتر حقيقي
استخدم القالب التالي كنقطة بداية
أنا بشتغل على Talent Seeker — Next.js 16. الـ endpoint: GET /public/jobs?salary_from=X&salary_to=Y&category_id=X&page=X&per_page=12 ISR revalidate=300. المطلوب: تحديث app/[locale]/jobs/page.tsx: 1. Server Component يجيب initial data + categories + countries للـ filters 2. URL-based filtering: /jobs?category=1&salary_from=2000&page=1 3. Sidebar filters (على الشمال): - Category checkboxes (من /categories) - Salary range slider (0 - 10000 EUR) - Job type: full_time/part_time/remote/internship - Country (من /countries) 4. Job Cards Grid: - Title, Company name + logo, Location (city + country), Salary range, Category badge - ❤️ favourite toggle (لو logged in) - "تقدم الآن" button → لو مش logged in: redirect /sign-in · لو logged in: POST /jobs/:id/apply 5. Pagination numbered (مش infinite scroll) 6. Empty state لما مفيش نتايج 7. Mobile: filters في bottom drawer 8. SEO metadata كامل للصفحة أيضاً: app/[locale]/jobs/[id]/page.tsx: - Server component يجيب /public/jobs/:id - عرض: title, description, responsibilities, requirements, salary, deadline, company info - JobPosting JSON-LD structured data - "تقدم الآن" button مع Apply flow
نسخ
برومبت 8 — SEO + Performance
استخدم القالب التالي كنقطة بداية
أنا بشتغل على Talent Seeker — Next.js 16. منصة توظيف تستهدف مصر + السعودية (عربي) وألمانيا (ألماني). المطلوب: SEO + Performance كامل: 1. app/sitemap.ts: - Static pages: / /about /contact /jobs /news × 3 locales (ar/en/de) - Dynamic: /jobs/[id] من /public/jobs?per_page=100 - Dynamic: /news/[id] من /news?per_page=100 - hreflang alternates لكل URL 2. app/robots.ts: - Allow: / · Disallow: /dashboard/ /api/ /_next/ 3. Metadata لكل صفحة بـ 3 لغات في messages files: - ar: "وظائف في ألمانيا · بوابتك للعمل في أوروبا · فرص عمل للمصريين والسعوديين في ألمانيا" - de: "Jobs für Araber in Deutschland · Arbeitsvermittlung" - en: "Jobs in Germany for Arabs · Work in Germany" 4. Structured Data components: - components/seo/job-structured-data.tsx → JobPosting schema - components/seo/org-structured-data.tsx → Organization schema للـ homepage 5. next.config.ts: - images: { formats: ["image/avif", "image/webp"], remotePatterns للـ API domain } - compress: true - experimental.optimizePackageImports: ["lucide-react", "recharts"] - Security headers: X-Frame-Options, X-Content-Type-Options, etc. 6. ISR لكل صفحة: - /jobs: revalidate=300 (5 min) - /jobs/[id]: revalidate=3600 (1h) - /news: revalidate=600 (10 min) - /: revalidate=3600 7. OG Image: app/og/route.tsx - يقبل: ?title=X&description=Y&locale=ar - Background: #001222, text أبيض، Primary: #40A0CA - مقاس 1200×630