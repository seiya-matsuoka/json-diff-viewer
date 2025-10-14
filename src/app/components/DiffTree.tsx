"use client";

import type { DiffNode } from "@/lib/diff/types";

function stringifyShort(v: unknown, max = 60) {
  try {
    const s = JSON.stringify(v);
    return s.length > max ? s.slice(0, max - 1) + "…" : s;
  } catch {
    const s = String(v);
    return s.length > max ? s.slice(0, max - 1) + "…" : s;
  }
}

function Row({ n }: { n: DiffNode }) {
  const badgeClass =
    n.state === "added"
      ? "badge badge-added"
      : n.state === "removed"
        ? "badge badge-removed"
        : n.state === "changed"
          ? "badge badge-changed"
          : "badge badge-equal";

  const info =
    n.state === "changed"
      ? `${stringifyShort((n as any).left)} → ${stringifyShort((n as any).right)}`
      : n.state === "added"
        ? `→ ${stringifyShort((n as any).right)}`
        : n.state === "removed"
          ? `${stringifyShort((n as any).left)} →`
          : "";

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(n.path);
    } catch {
      return;
    }
  };

  return (
    <div className="grid grid-cols-[110px_1fr_auto] items-center gap-2 border-b px-2 py-1 hover:bg-slate-50">
      <span className={badgeClass}>{n.state}</span>
      <div className="min-w-0">
        <div className="break-all font-mono text-xs">{n.path}</div>
        {info && (
          <div className="mt-0.5 break-all text-[11px] text-slate-600">
            {info}
          </div>
        )}
      </div>
      <button
        className="rounded-md border px-2 py-1 text-xs"
        title="パスをコピー"
        onClick={onCopy}
      >
        Copy
      </button>
    </div>
  );
}

export default function DiffTree({
  root,
  showOnlyDiff,
}: {
  root: DiffNode | null;
  showOnlyDiff: boolean;
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
