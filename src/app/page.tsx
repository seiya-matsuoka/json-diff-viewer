"use client";

import { useMemo, useState } from "react";
import Controls from "./components/Controls";
import Uploaders from "./components/Uploaders";
import DiffTree from "./components/DiffTree";
import Summary from "./components/Summary";
import type { DiffNode } from "@/lib/diff/types";
import { diffObjects } from "@/lib/diff/diff";
import { buildPatch } from "@/lib/diff/patch";

export default function Page() {
  const [left, setLeft] = useState<any>(null);
  const [right, setRight] = useState<any>(null);
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);
  const [epsilon, setEpsilon] = useState(1e-9);
  const [keySort, setKeySort] = useState(false);

  const root = useMemo<DiffNode | null>(() => {
    if (left === null || right === null) return null;
    return diffObjects(left, right, { epsilon, keySort });
  }, [left, right, epsilon, keySort]);

  const patch = useMemo(() => (root ? buildPatch(root) : []), [root]);

  return (
    <main className="mx-auto max-w-screen-2xl space-y-6 p-6">
      <header className="flex items-center justify-between border-b pb-3">
        <h1 className="text-lg font-semibold tracking-tight">
          JSON Diff Viewer
        </h1>
      </header>

      <Uploaders onLeft={setLeft} onRight={setRight} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <section className="lg:col-span-3">
          <DiffTree root={root} showOnlyDiff={showOnlyDiff} />
        </section>
        <aside className="space-y-4 lg:col-span-1">
          <Controls
            showOnlyDiff={showOnlyDiff}
            onToggleOnlyDiff={() => setShowOnlyDiff((v) => !v)}
            epsilon={epsilon}
            onEpsilon={setEpsilon}
            keySort={keySort}
            onKeySort={setKeySort}
            onReset={() => {
              setLeft(null);
              setRight(null);
            }}
          />
          <Summary root={root} patch={patch} />
        </aside>
      </div>
    </main>
  );
}
