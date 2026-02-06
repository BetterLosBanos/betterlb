'use strict';
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const e = require('../jsx-runtime-KWq1EBG2.cjs'),
  t = require('../utils-GVl92sVg.cjs'),
  f = require('../button/index.tsx.cjs'),
  v = ({
    title: n,
    description: x,
    type: m = 'default',
    icon: p = !1,
    cta: l,
    className: c,
    onDismiss: o,
    titleSize: d = 'lg',
  }) => {
    const h = {
        success: {
          container: 'bg-green-50 border border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          description: 'text-green-700',
          iconSvg: e.jsxRuntimeExports.jsx('svg', {
            className: 'h-6 w-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            children: e.jsxRuntimeExports.jsx('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            }),
          }),
        },
        error: {
          container: 'bg-red-50 border border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          description: 'text-red-700',
          iconSvg: e.jsxRuntimeExports.jsx('svg', {
            className: 'h-6 w-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            children: e.jsxRuntimeExports.jsx('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            }),
          }),
        },
        warning: {
          container: 'bg-yellow-50 border border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          description: 'text-yellow-700',
          iconSvg: e.jsxRuntimeExports.jsx('svg', {
            className: 'h-6 w-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            children: e.jsxRuntimeExports.jsx('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            }),
          }),
        },
        info: {
          container: 'bg-blue-50 border border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          description: 'text-blue-700',
          iconSvg: e.jsxRuntimeExports.jsx('svg', {
            className: 'h-6 w-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            children: e.jsxRuntimeExports.jsx('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            }),
          }),
        },
        default: {
          container: 'bg-gray-50 border border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-900',
          description: 'text-gray-800',
          iconSvg: e.jsxRuntimeExports.jsx('svg', {
            className: 'h-6 w-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            children: e.jsxRuntimeExports.jsx('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            }),
          }),
        },
      },
      u = { sm: 'text-base', md: 'text-lg', lg: 'text-xl' },
      j = (r = 'primary', i = 'lg') => {
        const a = {
            primary:
              'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
            secondary:
              'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
            outline:
              'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
            ghost:
              'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
          },
          b = {
            sm: 'text-sm px-3 py-1.5 h-8',
            md: 'text-base px-4 py-2 h-10',
            lg: 'text-lg px-6 py-3 h-12',
          };
        return t.cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus:outline-hidden focus:ring-2 focus:ring-offset-2',
          a[r],
          b[i],
          'shadow-xs'
        );
      },
      s = h[m],
      g = (r, i) =>
        r.href
          ? e.jsxRuntimeExports.jsx(
              'a',
              {
                href: r.href,
                className: j(r.variant, r.size),
                children: r.label,
              },
              i
            )
          : e.jsxRuntimeExports.jsx(
              f.Button,
              {
                onClick: r.onClick,
                variant: r.variant || 'primary',
                size: r.size || 'md',
                children: r.label,
              },
              i
            );
    if (l) {
      const r = Array.isArray(l) ? l : [l];
      return e.jsxRuntimeExports.jsx('div', {
        className: t.cn('relative rounded-lg p-4', s.container, c),
        children: e.jsxRuntimeExports.jsxs('div', {
          className: 'md:flex items-center',
          children: [
            e.jsxRuntimeExports.jsxs('div', {
              className: t.cn(
                'mb-6 md:mb-0 md:w-2/3 md:pr-8',
                o ? 'pr-10 md:pr-8' : ''
              ),
              children: [
                n &&
                  e.jsxRuntimeExports.jsx('h3', {
                    className: t.cn('font-semibold mb-2', s.title, u[d]),
                    children: n,
                  }),
                e.jsxRuntimeExports.jsx('p', {
                  className: s.description,
                  children: x,
                }),
              ],
            }),
            e.jsxRuntimeExports.jsx('div', {
              className: 'md:w-1/3 flex justify-center md:justify-end',
              children: e.jsxRuntimeExports.jsxs('div', {
                className: 'flex space-x-2 items-center',
                children: [
                  r.map((i, a) => g(i, a)),
                  o &&
                    e.jsxRuntimeExports.jsx('button', {
                      onClick: o,
                      className:
                        'absolute top-2 right-2 md:relative md:top-auto md:right-auto rounded-md p-2 transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                      'aria-label': 'Dismiss banner',
                      children: e.jsxRuntimeExports.jsx('svg', {
                        className: 'w-4 h-4 opacity-60',
                        fill: 'currentColor',
                        viewBox: '0 0 20 20',
                        children: e.jsxRuntimeExports.jsx('path', {
                          fillRule: 'evenodd',
                          d: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z',
                          clipRule: 'evenodd',
                        }),
                      }),
                    }),
                ],
              }),
            }),
          ],
        }),
      });
    }
    return e.jsxRuntimeExports.jsxs('div', {
      className: t.cn(
        'relative flex justify-between rounded-lg p-4',
        s.container,
        c
      ),
      children: [
        o &&
          e.jsxRuntimeExports.jsx('button', {
            onClick: o,
            className:
              'absolute top-2 right-2 md:relative md:top-auto md:right-auto md:flex md:items-center md:justify-end md:ml-3 flex-shrink-0 rounded-md p-2 transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
            'aria-label': 'Dismiss banner',
            children: e.jsxRuntimeExports.jsx('svg', {
              className: 'w-4 h-4 opacity-60',
              fill: 'currentColor',
              viewBox: '0 0 20 20',
              children: e.jsxRuntimeExports.jsx('path', {
                fillRule: 'evenodd',
                d: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z',
                clipRule: 'evenodd',
              }),
            }),
          }),
        e.jsxRuntimeExports.jsxs('div', {
          className: t.cn(
            'flex items-center',
            n ? 'items-start' : 'items-center',
            o ? 'pr-10 md:pr-0' : ''
          ),
          children: [
            p &&
              e.jsxRuntimeExports.jsx('div', {
                className: t.cn('mr-3', n ? 'mt-1' : '', s.icon),
                children: s.iconSvg,
              }),
            e.jsxRuntimeExports.jsxs('div', {
              className: 'flex-1',
              children: [
                n &&
                  e.jsxRuntimeExports.jsx('h3', {
                    className: t.cn('font-semibold', s.title, u[d]),
                    children: n,
                  }),
                e.jsxRuntimeExports.jsx('p', {
                  className: t.cn(s.description, 'text-sm'),
                  children: x,
                }),
              ],
            }),
          ],
        }),
      ],
    });
  };
exports.Banner = v;
//# sourceMappingURL=index.tsx.cjs.map
