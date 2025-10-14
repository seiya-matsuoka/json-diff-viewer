"use client";

import type { DiffNode } from "@/lib/diff/types";

function collectDiffs(root: DiffNode) {
  const out: Array<{
    path: string;
    state: DiffNode["state"];
    left?: unknown;
    right?: unknown;
  }> = [];
  const walk = (n: DiffNode) => {
    if (n.state !== "equal") {
      const item: any = { path: n.path, state: n.state };
      if ("left" in n && n.left !== undefined) item.left = n.left;
      if ("right" in n && n.right !== undefined) item.right = n.right;
      out.push(item);
    }
    n.children?.forEach(walk);
  };
  walk(root);
  return out;
}

function downloadJson(obj: unknown, name: string) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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
    <div className="space-y-3 rounded-2xl bg-white p-3 shadow">
      <div className="text-sm font-medium">サマリ</div>
      <div className="text-xs">
        追加: {added} / 削除: {removed} / 変更: {changed}
      </div>

      <div className="flex gap-2">
        <button
          className="rounded-md border px-3 py-1.5 text-xs"
          onClick={() => downloadJson(collectDiffs(root), "diff-list.json")}
        >
          差分一覧をダウンロード
        </button>
        <button
          className="rounded-md border px-3 py-1.5 text-xs"
          onClick={() => downloadJson(patch, "patch.json")}
        >
          Patchをダウンロード
        </button>
      </div>
    </div>
  );
}
