# ملف تحقق الربط بين الواجهة والـ API

## الغرض
هذا الملف يقوم بمراجعة نقاط الربط الموجودة حاليًا، يحدد ما هو متصل فعليًا، ويحدد ما يحتاج باك‌اند جديد أو تعديل قبل اكتمال العمل.

## مصادر المراجعة
- واجهة الويب: ملفات الواجهة في app و features
- الخدمات الخلفية للواجهة: lib/api/services
- Route handlers المحليين: app/api
- Postman collection: cv.postman_collection.json

## ملخص سريع
- بعض المسارات متصلة بالكامل مثل auth، profile، company jobs، notifications.
- بعض صفحات الإدارة مرتبطة على الواجهة لكن تعتمد على endpoints غير موثقة/غير موجودة في الـ API الحالي.
- أغلب حالات الـ dashboard الخاصة بالشركات والـ admin تحتاج توافق واضح بين شكل البيانات المتوقع من الباك‌اند وشكل الرد الحالي.

## 1) ما هو متصل بالفعل

### Auth
- الواجهة تستخدم تسجيل الدخول والتسجيل والتحديث والتحقق وإعادة التعيين.
- الملفات:
  - app/api/auth/login/route.ts
  - app/api/auth/session/route.ts
  - app/api/auth/profile/route.ts
  - lib/api/services/auth.service.ts

### Profile و Settings
- تحديث الملف الشخصي والباور والفيتشرز مرتبط.
- الملف الشخصي للشركة مرتبط جزئيًا.
- الملفات:
  - app/api/auth/profile/route.ts
  - features/company-profile/components/company-profile-form.tsx
  - lib/api/services/auth.service.ts
  - lib/api/services/settings.service.ts

### Company jobs
- إنشاء وتعديل وحذف وإيقاف الوظائف مرتبط.
- جلب stats وحالات الطلبات المرتبطة بالشركة مرتبط.
- الملفات:
  - app/api/company/jobs/route.ts
  - lib/api/services/company.service.ts
  - app/[locale]/dashboard/company/page.tsx
  - app/[locale]/dashboard/company/jobs/page.tsx

### Notifications
- إشعارات الهيدر والعدّاد المرتبط.
- الملفات:
  - app/api/notifications/route.ts
  - app/api/notifications/unread-count/route.ts
  - app/api/notifications/[id]/read/route.ts
  - lib/api/services/notifications.service.ts
  - features/shared-home/components/site-header.tsx

### Home و legal pages
- صفحة الهوم تعتمد على home content.
- صفحات faqs و terms و privacy مرتبطة جزئيًا.
- الملفات:
  - app/[locale]/page.tsx
  - lib/api/services/home-page.service.ts
  - app/[locale]/faqs/page.tsx
  - app/[locale]/terms/page.tsx
  - app/[locale]/privacy/page.tsx
  - features/legal/services/legal-content.service.ts

## 2) نقاط الربط التي تحتاج تحقق فوري

### A) admin/users و admin/companies
الواجهة تعتمد على endpoint التالي:
- lib/api/services/admin.service.ts => getAdminUsers(token, role, page, locale)
- app/[locale]/dashboard/admin/users/page.tsx
- app/[locale]/dashboard/admin/companies/page.tsx

لكن الواجهة تستدعي:
- /admin/users?role=company&page=1
- /admin/users?page=1

المشكلة:
- ملف Postman يحتوي على مجموعة User وليس Admin.
- في Postman توجد endpoints مثل /users و /users/:user
- لا يوجد endpoint واضح في Postman باسم /admin/users
- لذلك هذا الربط على الأرجح غير كامل أو غير موثق في الباك‌اند الحالي.

### B) admin/stats
الواجهة تعتمد على:
- lib/api/services/admin.service.ts => getAdminStats(token, locale)
- app/[locale]/dashboard/admin/page.tsx

الواجهة تستدعي:
- /admin/stats

المشكلة:
- Postman لا يحتوي على endpoint واضح باسم /admin/stats
- إذا لم يكن موجودًا، فصفحة الإحصائيات في dashboard/admin ستعود صفر دائمًا بسبب catch.

### C) admin/job-applications
الواجهة تعتمد على:
- lib/api/services/admin.service.ts => getAdminJobApplications(jobId, token, page, locale)

المشكلة:
- هذا endpoint غير موثق في Postman بشكل واضح.
- إذا لم يكن موجودًا، فصفحات التطبيقات الإدارية ستعاني.

### D) admin/home, admin/about, admin/news, admin/success-stories, admin/settings
الواجهة تجعل صفحات إدارة لهذه المناطق، لكن يجب التأكد أن الباك‌اند يدعمها بنفس الشكل الذي تتوقعه الواجهة.
- lib/api/services/home-page.service.ts
- lib/api/services/about.service.ts
- lib/api/services/news.service.ts
- lib/api/services/success-stories.service.ts
- lib/api/services/settings.service.ts

المطلوب تحقق من:
- أسماء الحقول
- صيغ البيانات المترجمة
- شكل الرد المتوقع
- دعم الحذف والتعديل والإضافة

### E) FAQ و Terms و Privacy
الواجهة تحتوي على صفحات جديدة تعتمد على:
- features/legal/services/legal-content.service.ts
- app/[locale]/faqs/page.tsx
- app/[locale]/terms/page.tsx
- app/[locale]/privacy/page.tsx

الواجهة تتوقع أن يكون هناك محتوى API مرن، لكن في الباك‌اند الحالي يوجد:
- /faqs
- لا توجد صفحات معلومات قانونية عامة واضحة كـ terms/privacy في الواجهات الحالية

بالتالي:
- FAQ يمكن ربطه مباشرة
- Terms و Privacy تحتاج endpoint واضح أو تعديل الباك‌اند لإتاحة محتواها

## 3) مسارات متاحة حاليًا من Postman

### موجودة فعليًا
- auth/login
- auth/register
- auth/profile
- auth/profile/avatar
- auth/profile/password
- auth/profile/preferences
- settings
- settings/:key
- notifications
- notifications/:id/read
- notifications/read-all
- notifications/unread-count
- jobs
- jobs/:id
- jobs/:id/stop
- company/applications
- company/applications/:id/status
- company/dashboard/stats
- faqs
- faqs/:id
- home
- home/update
- users
- users/:user

### غير موجودة أو غير واضحة
- admin/users
- admin/stats
- admin/job-applications
- admin/jobs/:id/approve
- admin/jobs/:id/reject
- admin/settings
- admin/home
- admin/about
- admin/news
- admin/success-stories

## 4) نقاط خطر قد تسبب مشاكل في الداشبورد

### 1. بيانات الصفات في company profile
الواجهة في features/company-profile/components/company-profile-form.tsx ترسل حقول مثل:
- name
- ceo_name
- website
- country_id
- city_id
- company_type_id
- description
- avatar

المشكلة المحتملة:
- الباك‌اند قد يتوقع أسماء مختلفة أو nested fields مختلفة.
- يجب التأكد من دعم company_name و ceo_name بالعناصر المترجمة.

### 2. اختلاف نموذج بيانات المستخدم
الواجهة تفترض أن user.role يمكن أن يكون user/company/admin.
- lib/api/types.ts
- app/api/auth/login/route.ts
- app/api/auth/session/route.ts

إذا كان الرد من الباك‌اند يعيد role أو roles بشكل مختلف، فسيحدث redirect خاطئ إلى dashboard غير الصحيح.

### 3. بيانات الإحصائيات في admin dashboard
الواجهة تعتمد على getAdminStats، ويعرض أرقام صفر في حال الفشل.
- app/[locale]/dashboard/admin/page.tsx

هذا يعني أن أي خلل في endpoint سيبدو كأن dashboard فشل وغير مرتبط، حتى لو الباقي صحيح.

### 4. اختلاف شكل الردات
الكثير من الخدمات تفترض أن response يمكن أن يكون:
- data مباشرة
- data داخل object
- array مباشرة

هذه المرونة موجودة في الخدمة، لكن يجب التحقق أن الباك‌اند يعيد شكل متوقع ليمنع الفشل الصامت.

## 5) توصيات واجبة (Mandatory)

### 1. إضافة endpoints الإدارية إلى الباك‌اند
هذه هي الأولويات الأعلى:
1. /admin/users
2. /admin/stats
3. /admin/job-applications
4. /admin/jobs/:id/approve
5. /admin/jobs/:id/reject

### 2. توحيد شكل الرد
كل endpoint يجب أن يعيد نفس الشكل:
- data
- meta عند وجود pagination

### 3. توحيد أسماء الحقول
خصوصًا في:
- company profile
- user role mapping
- legal content

### 4. إضافة كولكشن Postman جديدة للأدمن
بما في ذلك:
- admin/users
- admin/stats
- admin/jobs
- admin/job-applications
- admin/jobs/:id/approve
- admin/jobs/:id/reject

### 5. إضافة اختبار بسيط لكل endpoint مهم
على الأقل:
- login
- profile
- company jobs
- company applications
- admin/users
- admin/stats
- notifications
- faqs

## 6) توصيات اختيارية (Optional)

1. إضافة endpoints عامة للـ Terms و Privacy بدل الاعتماد على settings فقط.
2. إضافة endpoint موحد لعرض محتوى legal content.
3. إضافة response schema موثق لكل endpoint.
4. إضافة versioning واضح في response.
5. إضافة test data ثابت للاستخدام في Postman.
6. إضافة حالة واضحة لرسائل أخطاء السجلات.

## 7) خطة تنفيذ مقترحة

### المرحلة 1: الباك‌اند
- إضافة /admin/users
- إضافة /admin/stats
- إضافة /admin/job-applications
- توثيق /admin/jobs/:id/approve و /admin/jobs/:id/reject
- توحيد response schema

### المرحلة 2: Postman
- إضافة مجموعة Admin كاملة
- تحديث متغيرات token
- إضافة حالات نجاح وفشل لكل endpoint

### المرحلة 3: الواجهة
- اختبار admin/users و admin/companies
- اختبار admin dashboard stats
- اختبار company profile save
- اختبار FAQ + legal pages

### المرحلة 4: التحقق النهائي
- npx tsc --noEmit
- اختبار الصفحات الرئيسية في المتصفح
- اختبار كل endpoint المهم

## 8) خلاصة
الواجهة الحالية في معظمها مرتبطة جيدًا، لكن نقاط admin/users و admin/stats و admin/job-applications هي أعلى أولويات الكسر لأنها على الأرجح غير متوفرة أو غير موثقة بالكامل في الباك‌اند الحالي.

إذا عايز، في الخطوة التالية أقدر أعمل لك واحد مما يلي:
1. تحويل هذا الملف إلى خطة تنفيذية جاهزة للـ backend
2. إضافة endpoints الـ admin المطلوبة في Postman بشكل كامل
3. إصلاح أي نقاط الربط التي تظهر كأولوية عالية في الكود الحالي
