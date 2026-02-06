import * as l from 'react';

import 'react-dom';

import { j as f } from '../jsx-runtime-DdAyboqB.js';
import { c as b, a as v } from '../utils-BWXuiikn.js';

function p(e, n) {
  if (typeof e == 'function') return e(n);
  e != null && (e.current = n);
}
function x(...e) {
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
// @__NO_SIDE_EFFECTS__
function R(e) {
  const n = /* @__PURE__ */ E(e),
    t = l.forwardRef((o, r) => {
      const { children: i, ...a } = o,
        s = l.Children.toArray(i),
        c = s.find(w);
      if (c) {
        const u = c.props.children,
          g = s.map(d =>
            d === c
              ? l.Children.count(u) > 1
                ? l.Children.only(null)
                : l.isValidElement(u)
                  ? u.props.children
                  : null
              : d
          );
        return /* @__PURE__ */ f.jsx(n, {
          ...a,
          ref: r,
          children: l.isValidElement(u) ? l.cloneElement(u, void 0, g) : null,
        });
      }
      return /* @__PURE__ */ f.jsx(n, { ...a, ref: r, children: i });
    });
  return ((t.displayName = `${e}.Slot`), t);
}
// @__NO_SIDE_EFFECTS__
function E(e) {
  const n = l.forwardRef((t, o) => {
    const { children: r, ...i } = t;
    if (l.isValidElement(r)) {
      const a = N(r),
        s = C(i, r.props);
      return (
        r.type !== l.Fragment && (s.ref = o ? x(o, a) : a),
        l.cloneElement(r, s)
      );
    }
    return l.Children.count(r) > 1 ? l.Children.only(null) : null;
  });
  return ((n.displayName = `${e}.SlotClone`), n);
}
var h = Symbol('radix.slottable');
function w(e) {
  return (
    l.isValidElement(e) &&
    typeof e.type == 'function' &&
    '__radixId' in e.type &&
    e.type.__radixId === h
  );
}
function C(e, n) {
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
function N(e) {
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
var S = [
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
  j = S.reduce((e, n) => {
    const t = /* @__PURE__ */ R(`Primitive.${n}`),
      o = l.forwardRef((r, i) => {
        const { asChild: a, ...s } = r,
          c = a ? t : n;
        return (
          typeof window < 'u' && (window[Symbol.for('radix-ui')] = !0),
          /* @__PURE__ */ f.jsx(c, { ...s, ref: i })
        );
      });
    return ((o.displayName = `Primitive.${n}`), { ...e, [n]: o });
  }, {}),
  P = 'Label',
  m = l.forwardRef((e, n) =>
    /* @__PURE__ */ f.jsx(j.label, {
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
m.displayName = P;
var y = m;
const D = v,
  V = (e, n) => t =>
    D(e, t == null ? void 0 : t.class, t == null ? void 0 : t.className),
  O = V(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
  ),
  A = l.forwardRef(({ className: e, ...n }, t) =>
    /* @__PURE__ */ f.jsx(y, {
      ref: t,
      className: b(O(), e),
      ...n,
    })
  );
A.displayName = y.displayName;
export { A as Label };
//# sourceMappingURL=index.tsx.js.map
