import type { DiffNode } from "./types";

const toPointer = (path: string) =>
  path
    .replace(/^\$/, "")
    .replace(/\.(\w+)/g, "/$1")
    .replace(/\[(\d+)\]/g, "/$1") || "/";

export function buildPatch(root: DiffNode) {
  const ops: Array<{
    op: "add" | "remove" | "replace";
    path: string;
    value?: unknown;
  }> = [];
  const walk = (n: DiffNode) => {
    if (n.state === "added")
      ops.push({ op: "add", path: toPointer(n.path), value: n.right });
    else if (n.state === "removed")
      ops.push({ op: "remove", path: toPointer(n.path) });
    else if (n.state === "changed" && n.type === "value") {
      ops.push({ op: "replace", path: toPointer(n.path), value: n.right });
    }
    n.children?.forEach(walk);
  };
  walk(root);
  return ops;
}
