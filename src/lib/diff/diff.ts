import type { DiffNode, DiffOptions } from "./types";
import { isObject, isEqualNumber } from "./utils";

const typeOf = (v: unknown): DiffNode["type"] =>
  Array.isArray(v) ? "array" : isObject(v) ? "object" : "value";

const join = (base: string, key: string) => (base ? `${base}.${key}` : key);
const joinIdx = (base: string, idx: number) => `${base}[${idx}]`;

export function diffObjects(
  left: any,
  right: any,
  opt: DiffOptions,
  basePath = "",
): DiffNode {
  const lt = typeOf(left),
    rt = typeOf(right);
  const node: DiffNode = {
    path: basePath || "$",
    type: lt === rt ? lt : "value",
    state: "equal",
  };

  if (lt !== rt) {
    node.state = "changed";
    node.left = left;
    node.right = right;
    return node;
  }

  if (lt === "value") {
    const equal =
      (typeof left === "number" && isEqualNumber(left, right, opt.epsilon)) ||
      left === right;
    node.state = equal ? "equal" : "changed";
    node.left = left;
    node.right = right;
    return node;
  }

  if (lt === "array") {
    const a: DiffNode[] = [];
    const min = Math.min(left.length, right.length);
    for (let i = 0; i < min; i++) {
      a.push(diffObjects(left[i], right[i], opt, joinIdx(basePath || "$", i)));
    }
    for (let i = min; i < left.length; i++) {
      a.push({
        path: joinIdx(basePath || "$", i),
        type: typeOf(left[i]),
        state: "removed",
        left: left[i],
      });
    }
    for (let i = min; i < right.length; i++) {
      a.push({
        path: joinIdx(basePath || "$", i),
        type: typeOf(right[i]),
        state: "added",
        right: right[i],
      });
    }
    node.children = a;
    node.state = a.every((c) => c.state === "equal") ? "equal" : "changed";
    return node;
  }

  const keys = Array.from(
    new Set([...Object.keys(left), ...Object.keys(right)]),
  );
  if (opt.keySort) keys.sort((a, b) => a.localeCompare(b));
  const children: DiffNode[] = [];

  for (const k of keys) {
    const l = left[k],
      r = right[k];
    const hasL = k in left,
      hasR = k in right;
    const p = join(basePath || "$", k);

    if (hasL && !hasR) {
      children.push({
        path: p,
        key: k,
        type: typeOf(l),
        state: "removed",
        left: l,
      });
    } else if (!hasL && hasR) {
      children.push({
        path: p,
        key: k,
        type: typeOf(r),
        state: "added",
        right: r,
      });
    } else {
      children.push(diffObjects(l, r, opt, p));
    }
  }

  node.children = children;
  node.state = children.every((c) => c.state === "equal") ? "equal" : "changed";
  return node;
}
