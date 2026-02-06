'use strict';
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const t = require('../jsx-runtime-KWq1EBG2.cjs'),
  s = require('../utils-GVl92sVg.cjs'),
  d = ({ children: r, className: e, hoverable: a = !1, ...o }) =>
    t.jsxRuntimeExports.jsx('div', {
      className: s.cn(
        'bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden',
        a && 'transition-all duration-300 hover:shadow-md hover:-translate-y-1',
        e
      ),
      role: 'article',
      'aria-label': 'Service card',
      ...o,
      children: r,
    }),
  n = ({ children: r, className: e, ...a }) =>
    t.jsxRuntimeExports.jsx('div', {
      className: s.cn('p-4 md:p-6 border-b border-gray-200', e),
      role: 'heading',
      'aria-level': 2,
      ...a,
      children: r,
    }),
  l = ({ children: r, className: e, ...a }) =>
    t.jsxRuntimeExports.jsx('div', {
      className: s.cn('p-4 md:p-6', e),
      role: 'region',
      'aria-label': 'Service details',
      ...a,
      children: r,
    }),
  i = ({ children: r, className: e, ...a }) =>
    t.jsxRuntimeExports.jsx('div', {
      className: s.cn('p-4 md:p-6 border-t border-gray-200 bg-gray-50', e),
      ...a,
      children: r,
    }),
  c = ({ className: r, ...e }) =>
    t.jsxRuntimeExports.jsx('div', {
      className: 'relative w-full h-48 overflow-hidden',
      children: t.jsxRuntimeExports.jsx('img', {
        className: s.cn('w-full h-full object-cover', r),
        ...e,
        alt: e.alt || 'Card image',
      }),
    });
exports.Card = d;
exports.CardContent = l;
exports.CardFooter = i;
exports.CardHeader = n;
exports.CardImage = c;
//# sourceMappingURL=index.tsx.cjs.map
