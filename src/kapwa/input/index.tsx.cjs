'use strict';
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const i = require('../jsx-runtime-KWq1EBG2.cjs'),
  s = require('react'),
  u = require('../utils-GVl92sVg.cjs');
function l(e) {
  const r = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
  if (e) {
    for (const t in e)
      if (t !== 'default') {
        const n = Object.getOwnPropertyDescriptor(e, t);
        Object.defineProperty(
          r,
          t,
          n.get ? n : { enumerable: !0, get: () => e[t] }
        );
      }
  }
  return ((r.default = e), Object.freeze(r));
}
const a = l(s),
  o = a.forwardRef(({ className: e, type: r, ...t }, n) =>
    i.jsxRuntimeExports.jsx('input', {
      type: r,
      className: u.cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        e
      ),
      ref: n,
      ...t,
    })
  );
o.displayName = 'Input';
exports.Input = o;
//# sourceMappingURL=index.tsx.cjs.map
