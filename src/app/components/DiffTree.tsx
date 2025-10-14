"use client";

import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
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

function hasChildren(n: DiffNode) {
  return Array.isArray(n.children) && n.children.length > 0;
}

function isValueNode(n: DiffNode) {
  return n.type === "value";
}

function Badge({ state }: { state: DiffNode["state"] }) {
  const cls =
    state === "added"
      ? "badge badge-added"
      : state === "removed"
        ? "badge badge-removed"
        : state === "changed"
          ? "badge badge-changed"
          : "badge badge-equal";
  return <span className={cls}>{state}</span>;
}

function Caret({
  expanded,
  onToggle,
  visible,
}: {
  expanded: boolean;
  onToggle: () => void;
  visible: boolean;
}) {
  if (!visible) return <span className="inline-block w-4" />;
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex w-4 items-center justify-center text-slate-600 hover:text-slate-900"
      aria-label={expanded ? "折りたたむ" : "展開する"}
      title={expanded ? "折りたたむ" : "展開する"}
    >
      <span className="text-xs leading-none">{expanded ? "▼" : "▶"}</span>
    </button>
  );
}

function Row({
  n,
  depth,
  expanded,
  onToggle,
}: {
  n: DiffNode;
  depth: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const info =
    isValueNode(n) && n.state === "changed"
      ? `${stringifyShort((n as any).left)} → ${stringifyShort((n as any).right)}`
      : isValueNode(n) && n.state === "added"
        ? `→ ${stringifyShort((n as any).right)}`
        : isValueNode(n) && n.state === "removed"
          ? `${stringifyShort((n as any).left)} →`
          : "";

  const onCopy = async () =>
    navigator.clipboard.writeText(n.path).catch(() => void 0);

  return (
    <div className="grid grid-cols-[18px_110px_1fr_auto] items-center gap-2 border-b px-2 py-1 hover:bg-slate-50">
      <div style={{ paddingLeft: depth * 12 }}>
        <Caret
          visible={hasChildren(n)}
          expanded={expanded}
          onToggle={onToggle}
        />
      </div>

      <Badge state={n.state} />

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
  const allPaths = useMemo(() => {
    if (!root) return [];
    const acc: string[] = [];
    const walk = (n: DiffNode) => {
      acc.push(n.path);
      n.children?.forEach(walk);
    };
    walk(root);
    return acc;
  }, [root]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!root) {
      setExpanded({});
      return;
    }
    const init: Record<string, boolean> = {};
    const walk = (n: DiffNode) => {
      if (hasChildren(n)) init[n.path] = true;
      n.children?.forEach(walk);
    };
    walk(root);
    setExpanded(init);
  }, [root]);

  const toggle = (path: string) =>
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));

  const setAll = (open: boolean) =>
    setExpanded((prev) => {
      const next: Record<string, boolean> = { ...prev };
      for (const p of allPaths) next[p] = open;
      return next;
    });

  const renderNode = (n: DiffNode, depth: number): JSX.Element[] => {
    if (showOnlyDiff && n.state === "equal") return [];
    const rows: JSX.Element[] = [];
    const isOpen = expanded[n.path] ?? false;
    rows.push(
      <Row
        key={n.path}
        n={n}
        depth={depth}
        expanded={isOpen}
        onToggle={() => hasChildren(n) && toggle(n.path)}
      />,
    );
    if (hasChildren(n) && isOpen) {
      for (const child of n.children!) {
        rows.push(...renderNode(child, depth + 1));
      }
    }
    return rows;
  };

  return (
    <div className="rounded-2xl bg-white shadow">
      <div className="flex items-center justify-end gap-2 border-b p-2">
        <button
          className="rounded-md border px-2 py-1 text-xs"
          onClick={() => setAll(true)}
          title="すべて展開"
          disabled={!root}
        >
          すべて展開
        </button>
        <button
          className="rounded-md border px-2 py-1 text-xs"
          onClick={() => setAll(false)}
          title="すべて折りたたみ"
          disabled={!root}
        >
          すべて折りたたみ
        </button>
      </div>

      <div className="divide-y">
        {root ? (
          renderNode(root, 0)
        ) : (
          <div className="p-3 text-sm text-slate-500">
            左/右にJSONを入れてください。
          </div>
        )}
      </div>
    </div>
  );
}
