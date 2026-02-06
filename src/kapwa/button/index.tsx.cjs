'use strict';
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const r = require('../jsx-runtime-KWq1EBG2.cjs'),
  y = require('../utils-GVl92sVg.cjs'),
  g = ({
    children: i,
    className: a,
    variant: t = 'primary',
    size: c = 'md',
    fullWidth: l = !1,
    isLoading: e = !1,
    leftIcon: s,
    rightIcon: n,
    disabled: u,
    ...m
  }) => {
    const x = {
        primary:
          'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
        secondary:
          'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
        outline:
          'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
        ghost:
          'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        link: 'bg-transparent text-primary-500 hover:underline p-0 h-auto focus:ring-0',
      },
      p = {
        sm: 'text-sm px-3 py-1.5 h-8',
        md: 'text-base px-4 py-2 h-10',
        lg: 'text-lg px-6 py-3 h-12',
      },
      o = u || e;
    return r.jsxRuntimeExports.jsxs('button', {
      className: y.cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus:outline-hidden focus:ring-2 focus:ring-offset-2',
        x[t],
        p[c],
        l ? 'w-full' : '',
        o ? 'opacity-60 cursor-not-allowed' : '',
        t !== 'link' && 'shadow-xs',
        a
      ),
      disabled: o,
      ...m,
      children: [
        e &&
          r.jsxRuntimeExports.jsxs('svg', {
            className: 'animate-spin -ml-1 mr-2 h-4 w-4 text-current',
            xmlns: 'http://www.w3.org/2000/svg',
            fill: 'none',
            viewBox: '0 0 24 24',
            children: [
              r.jsxRuntimeExports.jsx('circle', {
                className: 'opacity-25',
                cx: '12',
                cy: '12',
                r: '10',
                stroke: 'currentColor',
                strokeWidth: '4',
              }),
              r.jsxRuntimeExports.jsx('path', {
                className: 'opacity-75',
                fill: 'currentColor',
                d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
              }),
            ],
          }),
        !e &&
          s &&
          r.jsxRuntimeExports.jsx('span', { className: 'mr-2', children: s }),
        i,
        !e &&
          n &&
          r.jsxRuntimeExports.jsx('span', { className: 'ml-2', children: n }),
      ],
    });
  };
exports.Button = g;
//# sourceMappingURL=index.tsx.cjs.map
