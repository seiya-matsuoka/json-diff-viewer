"use client";

import type { DiffNode } from "../../lib/diff/types";

function Row({ n }: { n: DiffNode }) {
  const badgeClass =
    n.state === "added"
      ? "badge badge-added"
      : n.state === "removed"
        ? "badge badge-removed"
        : n.state === "changed"
          ? "badge badge-changed"
          : "badge badge-equal";

  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 border-b py-1">
      <span className={badgeClass}>{n.state}</span>
      <div className="break-all font-mono text-xs">{n.path}</div>
    </div>
  );
}

export default function DiffTree({
  root,
  showOnlyDiff,
  query,
}: {
  root: DiffNode | null;
  showOnlyDiff: boolean;
  query: string;
}) {
  if (!root)
    return (
      <div className="text-sm text-slate-500">
        左/右にJSONを入れてください。
      </div>
    );
  const flat: DiffNode[] = [];
  const walk = (n: DiffNode) => {
    flat.push(n);
    n.children?.forEach(walk);
  };
  walk(root);

  const filtered = flat.filter((n) => {
    if (showOnlyDiff && n.state === "equal") return false;
    if (query && !n.path.includes(query)) return false;
    return true;
  });

  return (
    <div className="divide-y rounded-2xl bg-white shadow">
      {filtered.map((n, i) => (
        <Row key={n.path + ":" + i} n={n} />
      ))}
    </div>
  );
}
