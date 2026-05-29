const { createNavigation } = require('next-intl/navigation');
const { defineRouting } = require('next-intl/routing');
const routing = defineRouting({ locales:['en','ar','de'], defaultLocale:'en' });
const { getPathname } = createNavigation(routing);
['/','/about','/ar','/ar/dashboard/admin/home','/de/dashboard/admin/about'].forEach(h => console.log('href=', h, '->', getPathname({ href: h, locale: 'ar' })));