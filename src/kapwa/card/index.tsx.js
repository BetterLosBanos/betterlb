import { j as o } from '../jsx-runtime-DdAyboqB.js';
import { c as d } from '../utils-BWXuiikn.js';

const i = ({ children: e, className: r, hoverable: a = !1, ...l }) =>
    /* @__PURE__ */ o.jsx('div', {
      className: d(
        'bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden',
        a && 'transition-all duration-300 hover:shadow-md hover:-translate-y-1',
        r
      ),
      role: 'article',
      'aria-label': 'Service card',
      ...l,
      children: e,
    }),
  n = ({ children: e, className: r, ...a }) =>
    /* @__PURE__ */ o.jsx('div', {
      className: d('p-4 md:p-6 border-b border-gray-200', r),
      role: 'heading',
      'aria-level': 2,
      ...a,
      children: e,
    }),
  c = ({ children: e, className: r, ...a }) =>
    /* @__PURE__ */ o.jsx('div', {
      className: d('p-4 md:p-6', r),
      role: 'region',
      'aria-label': 'Service details',
      ...a,
      children: e,
    }),
  m = ({ children: e, className: r, ...a }) =>
    /* @__PURE__ */ o.jsx('div', {
      className: d('p-4 md:p-6 border-t border-gray-200 bg-gray-50', r),
      ...a,
      children: e,
    }),
  v = ({ className: e, ...r }) =>
    /* @__PURE__ */ o.jsx('div', {
      className: 'relative w-full h-48 overflow-hidden',
      children: /* @__PURE__ */ o.jsx('img', {
        className: d('w-full h-full object-cover', e),
        ...r,
        alt: r.alt || 'Card image',
      }),
    });
export {
  i as Card,
  c as CardContent,
  m as CardFooter,
  n as CardHeader,
  v as CardImage,
};
//# sourceMappingURL=index.tsx.js.map
