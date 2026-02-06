'use strict';
const K = require('react');
var P = { exports: {} },
  R = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var F;
function ee() {
  if (F) return R;
  F = 1;
  var l = Symbol.for('react.transitional.element'),
    _ = Symbol.for('react.fragment');
  function f(d, a, s) {
    var m = null;
    if (
      (s !== void 0 && (m = '' + s),
      a.key !== void 0 && (m = '' + a.key),
      'key' in a)
    ) {
      s = {};
      for (var E in a) E !== 'key' && (s[E] = a[E]);
    } else s = a;
    return (
      (a = s.ref),
      { $$typeof: l, type: d, key: m, ref: a !== void 0 ? a : null, props: s }
    );
  }
  return ((R.Fragment = _), (R.jsx = f), (R.jsxs = f), R);
}
var b = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var $;
function re() {
  return (
    $ ||
      (($ = 1),
      process.env.NODE_ENV !== 'production' &&
        (function () {
          function l(e) {
            if (e == null) return null;
            if (typeof e == 'function')
              return e.$$typeof === H ? null : e.displayName || e.name || null;
            if (typeof e == 'string') return e;
            switch (e) {
              case T:
                return 'Fragment';
              case U:
                return 'Profiler';
              case W:
                return 'StrictMode';
              case G:
                return 'Suspense';
              case J:
                return 'SuspenseList';
              case B:
                return 'Activity';
            }
            if (typeof e == 'object')
              switch (
                (typeof e.tag == 'number' &&
                  console.error(
                    'Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.'
                  ),
                e.$$typeof)
              ) {
                case M:
                  return 'Portal';
                case V:
                  return (e.displayName || 'Context') + '.Provider';
                case z:
                  return (e._context.displayName || 'Context') + '.Consumer';
                case q:
                  var r = e.render;
                  return (
                    (e = e.displayName),
                    e ||
                      ((e = r.displayName || r.name || ''),
                      (e = e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')),
                    e
                  );
                case X:
                  return (
                    (r = e.displayName || null),
                    r !== null ? r : l(e.type) || 'Memo'
                  );
                case x:
                  ((r = e._payload), (e = e._init));
                  try {
                    return l(e(r));
                  } catch {}
              }
            return null;
          }
          function _(e) {
            return '' + e;
          }
          function f(e) {
            try {
              _(e);
              var r = !1;
            } catch {
              r = !0;
            }
            if (r) {
              r = console;
              var t = r.error,
                n =
                  (typeof Symbol == 'function' &&
                    Symbol.toStringTag &&
                    e[Symbol.toStringTag]) ||
                  e.constructor.name ||
                  'Object';
              return (
                t.call(
                  r,
                  'The provided key is an unsupported type %s. This value must be coerced to a string before using it here.',
                  n
                ),
                _(e)
              );
            }
          }
          function d(e) {
            if (e === T) return '<>';
            if (typeof e == 'object' && e !== null && e.$$typeof === x)
              return '<...>';
            try {
              var r = l(e);
              return r ? '<' + r + '>' : '<...>';
            } catch {
              return '<...>';
            }
          }
          function a() {
            var e = p.A;
            return e === null ? null : e.getOwner();
          }
          function s() {
            return Error('react-stack-top-frame');
          }
          function m(e) {
            if (h.call(e, 'key')) {
              var r = Object.getOwnPropertyDescriptor(e, 'key').get;
              if (r && r.isReactWarning) return !1;
            }
            return e.key !== void 0;
          }
          function E(e, r) {
            function t() {
              y ||
                ((y = !0),
                console.error(
                  '%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)',
                  r
                ));
            }
            ((t.isReactWarning = !0),
              Object.defineProperty(e, 'key', { get: t, configurable: !0 }));
          }
          function D() {
            var e = l(this.type);
            return (
              N[e] ||
                ((N[e] = !0),
                console.error(
                  'Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.'
                )),
              (e = this.props.ref),
              e !== void 0 ? e : null
            );
          }
          function L(e, r, t, n, c, u, O, A) {
            return (
              (t = u.ref),
              (e = { $$typeof: g, type: e, key: r, props: u, _owner: c }),
              (t !== void 0 ? t : null) !== null
                ? Object.defineProperty(e, 'ref', { enumerable: !1, get: D })
                : Object.defineProperty(e, 'ref', {
                    enumerable: !1,
                    value: null,
                  }),
              (e._store = {}),
              Object.defineProperty(e._store, 'validated', {
                configurable: !1,
                enumerable: !1,
                writable: !0,
                value: 0,
              }),
              Object.defineProperty(e, '_debugInfo', {
                configurable: !1,
                enumerable: !1,
                writable: !0,
                value: null,
              }),
              Object.defineProperty(e, '_debugStack', {
                configurable: !1,
                enumerable: !1,
                writable: !0,
                value: O,
              }),
              Object.defineProperty(e, '_debugTask', {
                configurable: !1,
                enumerable: !1,
                writable: !0,
                value: A,
              }),
              Object.freeze && (Object.freeze(e.props), Object.freeze(e)),
              e
            );
          }
          function j(e, r, t, n, c, u, O, A) {
            var o = r.children;
            if (o !== void 0)
              if (n)
                if (Z(o)) {
                  for (n = 0; n < o.length; n++) w(o[n]);
                  Object.freeze && Object.freeze(o);
                } else
                  console.error(
                    'React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.'
                  );
              else w(o);
            if (h.call(r, 'key')) {
              o = l(e);
              var i = Object.keys(r).filter(function (Q) {
                return Q !== 'key';
              });
              ((n =
                0 < i.length
                  ? '{key: someKey, ' + i.join(': ..., ') + ': ...}'
                  : '{key: someKey}'),
                I[o + n] ||
                  ((i =
                    0 < i.length ? '{' + i.join(': ..., ') + ': ...}' : '{}'),
                  console.error(
                    `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
                    n,
                    o,
                    i,
                    o
                  ),
                  (I[o + n] = !0)));
            }
            if (
              ((o = null),
              t !== void 0 && (f(t), (o = '' + t)),
              m(r) && (f(r.key), (o = '' + r.key)),
              'key' in r)
            ) {
              t = {};
              for (var S in r) S !== 'key' && (t[S] = r[S]);
            } else t = r;
            return (
              o &&
                E(
                  t,
                  typeof e == 'function'
                    ? e.displayName || e.name || 'Unknown'
                    : e
                ),
              L(e, o, u, c, a(), t, O, A)
            );
          }
          function w(e) {
            typeof e == 'object' &&
              e !== null &&
              e.$$typeof === g &&
              e._store &&
              (e._store.validated = 1);
          }
          var v = K,
            g = Symbol.for('react.transitional.element'),
            M = Symbol.for('react.portal'),
            T = Symbol.for('react.fragment'),
            W = Symbol.for('react.strict_mode'),
            U = Symbol.for('react.profiler'),
            z = Symbol.for('react.consumer'),
            V = Symbol.for('react.context'),
            q = Symbol.for('react.forward_ref'),
            G = Symbol.for('react.suspense'),
            J = Symbol.for('react.suspense_list'),
            X = Symbol.for('react.memo'),
            x = Symbol.for('react.lazy'),
            B = Symbol.for('react.activity'),
            H = Symbol.for('react.client.reference'),
            p =
              v.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
            h = Object.prototype.hasOwnProperty,
            Z = Array.isArray,
            k = console.createTask
              ? console.createTask
              : function () {
                  return null;
                };
          v = {
            'react-stack-bottom-frame': function (e) {
              return e();
            },
          };
          var y,
            N = {},
            C = v['react-stack-bottom-frame'].bind(v, s)(),
            Y = k(d(s)),
            I = {};
          ((b.Fragment = T),
            (b.jsx = function (e, r, t, n, c) {
              var u = 1e4 > p.recentlyCreatedOwnerStacks++;
              return j(
                e,
                r,
                t,
                !1,
                n,
                c,
                u ? Error('react-stack-top-frame') : C,
                u ? k(d(e)) : Y
              );
            }),
            (b.jsxs = function (e, r, t, n, c) {
              var u = 1e4 > p.recentlyCreatedOwnerStacks++;
              return j(
                e,
                r,
                t,
                !0,
                n,
                c,
                u ? Error('react-stack-top-frame') : C,
                u ? k(d(e)) : Y
              );
            }));
        })()),
    b
  );
}
process.env.NODE_ENV === 'production' ? (P.exports = ee()) : (P.exports = re());
var te = P.exports;
exports.jsxRuntimeExports = te;
//# sourceMappingURL=jsx-runtime-KWq1EBG2.cjs.map
