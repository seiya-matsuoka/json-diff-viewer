"use client";

import type { DiffNode } from "../../lib/diff/types";

export default function Summary({
  root,
  patch,
}: {
  root: DiffNode | null;
  patch: Array<any>;
}) {
  if (!root) return null;
  let added = 0,
    removed = 0,
    changed = 0;
  const walk = (n: DiffNode) => {
    if (n.state === "added") added++;
    else if (n.state === "removed") removed++;
    else if (n.state === "changed") changed++;
    n.children?.forEach(walk);
  };
  walk(root);
  return (
    <div className="space-y-2 rounded-2xl bg-white p-3 shadow">
      <div className="text-sm font-medium">サマリ</div>
      <div className="text-xs">
        追加: {added} / 削除: {removed} / 変更: {changed}
      </div>
      <details className="text-xs">
        <summary className="cursor-pointer">JSON Patch風（preview）</summary>
        <pre className="mt-2 max-h-64 overflow-auto">
          {JSON.stringify(patch, null, 2)}
        </pre>
      </details>
    </div>
  );
}
