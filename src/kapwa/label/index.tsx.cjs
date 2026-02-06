'use strict';
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const f = require('../jsx-runtime-KWq1EBG2.cjs'),
  R = require('react');
require('react-dom');
const m = require('../utils-GVl92sVg.cjs');
function v(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
  if (e) {
    for (const t in e)
      if (t !== 'default') {
        const o = Object.getOwnPropertyDescriptor(e, t);
        Object.defineProperty(
          n,
          t,
          o.get ? o : { enumerable: !0, get: () => e[t] }
        );
      }
  }
  return ((n.default = e), Object.freeze(n));
}
const l = v(R);
function p(e, n) {
  if (typeof e == 'function') return e(n);
  e != null && (e.current = n);
}
function j(...e) {
  return n => {
    let t = !1;
    const o = e.map(r => {
      const i = p(r, n);
      return (!t && typeof i == 'function' && (t = !0), i);
    });
    if (t)
      return () => {
        for (let r = 0; r < o.length; r++) {
          const i = o[r];
          typeof i == 'function' ? i() : p(e[r], null);
        }
      };
  };
}
function E(e) {
  const n = S(e),
    t = l.forwardRef((o, r) => {
      const { children: i, ...a } = o,
        s = l.Children.toArray(i),
        c = s.find(N);
      if (c) {
        const u = c.props.children,
          x = s.map(d =>
            d === c
              ? l.Children.count(u) > 1
                ? l.Children.only(null)
                : l.isValidElement(u)
                  ? u.props.children
                  : null
              : d
          );
        return f.jsxRuntimeExports.jsx(n, {
          ...a,
          ref: r,
          children: l.isValidElement(u) ? l.cloneElement(u, void 0, x) : null,
        });
      }
      return f.jsxRuntimeExports.jsx(n, { ...a, ref: r, children: i });
    });
  return ((t.displayName = `${e}.Slot`), t);
}
function S(e) {
  const n = l.forwardRef((t, o) => {
    const { children: r, ...i } = t;
    if (l.isValidElement(r)) {
      const a = C(r),
        s = h(i, r.props);
      return (
        r.type !== l.Fragment && (s.ref = o ? j(o, a) : a),
        l.cloneElement(r, s)
      );
    }
    return l.Children.count(r) > 1 ? l.Children.only(null) : null;
  });
  return ((n.displayName = `${e}.SlotClone`), n);
}
var w = Symbol('radix.slottable');
function N(e) {
  return (
    l.isValidElement(e) &&
    typeof e.type == 'function' &&
    '__radixId' in e.type &&
    e.type.__radixId === w
  );
}
function h(e, n) {
  const t = { ...n };
  for (const o in n) {
    const r = e[o],
      i = n[o];
    /^on[A-Z]/.test(o)
      ? r && i
        ? (t[o] = (...s) => {
            const c = i(...s);
            return (r(...s), c);
          })
        : r && (t[o] = r)
      : o === 'style'
        ? (t[o] = { ...r, ...i })
        : o === 'className' && (t[o] = [r, i].filter(Boolean).join(' '));
  }
  return { ...e, ...t };
}
function C(e) {
  var o, r;
  let n =
      (o = Object.getOwnPropertyDescriptor(e.props, 'ref')) == null
        ? void 0
        : o.get,
    t = n && 'isReactWarning' in n && n.isReactWarning;
  return t
    ? e.ref
    : ((n =
        (r = Object.getOwnPropertyDescriptor(e, 'ref')) == null
          ? void 0
          : r.get),
      (t = n && 'isReactWarning' in n && n.isReactWarning),
      t ? e.props.ref : e.props.ref || e.ref);
}
var P = [
    'a',
    'button',
    'div',
    'form',
    'h2',
    'h3',
    'img',
    'input',
    'label',
    'li',
    'nav',
    'ol',
    'p',
    'select',
    'span',
    'svg',
    'ul',
  ],
  O = P.reduce((e, n) => {
    const t = E(`Primitive.${n}`),
      o = l.forwardRef((r, i) => {
        const { asChild: a, ...s } = r,
          c = a ? t : n;
        return (
          typeof window < 'u' && (window[Symbol.for('radix-ui')] = !0),
          f.jsxRuntimeExports.jsx(c, { ...s, ref: i })
        );
      });
    return ((o.displayName = `Primitive.${n}`), { ...e, [n]: o });
  }, {}),
  D = 'Label',
  y = l.forwardRef((e, n) =>
    f.jsxRuntimeExports.jsx(O.label, {
      ...e,
      ref: n,
      onMouseDown: t => {
        var r;
        t.target.closest('button, input, select, textarea') ||
          ((r = e.onMouseDown) == null || r.call(e, t),
          !t.defaultPrevented && t.detail > 1 && t.preventDefault());
      },
    })
  );
y.displayName = D;
var b = y;
const _ = m.clsx,
  V = (e, n) => t =>
    _(e, t == null ? void 0 : t.class, t == null ? void 0 : t.className),
  L = V(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
  ),
  g = l.forwardRef(({ className: e, ...n }, t) =>
    f.jsxRuntimeExports.jsx(b, { ref: t, className: m.cn(L(), e), ...n })
  );
g.displayName = b.displayName;
exports.Label = g;
//# sourceMappingURL=index.tsx.cjs.map
