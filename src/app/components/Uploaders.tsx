"use client";

import { useState } from "react";

function safeParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function Uploaders({
  onLeft,
  onRight,
}: {
  onLeft: (v: any) => void;
  onRight: (v: any) => void;
}) {
  const [lText, setLText] = useState("");
  const [rText, setRText] = useState("");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[
        {
          label: "左JSON",
          text: lText,
          set: setLText,
          on: onLeft,
          testFile: "/samples/01_basic_add_remove/left.json",
        },
        {
          label: "右JSON",
          text: rText,
          set: setRText,
          on: onRight,
          testFile: "/samples/01_basic_add_remove/right.json",
        },
      ].map(({ label, text, set, on, testFile }) => (
        <div key={label} className="rounded-2xl bg-white p-3 shadow">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">{label}</span>
            <button
              className="text-xs underline"
              onClick={async () => {
                const res = await fetch(testFile);
                set(await res.text());
              }}
            >
              サンプル読込
            </button>
          </div>
          <textarea
            className="h-48 w-full rounded-md border p-2 font-mono text-xs"
            value={text}
            onChange={(e) => set(e.target.value)}
            placeholder='{"a":1}'
          />
          <div className="mt-2 flex gap-2">
            <button
              className="rounded-md border px-3 py-1.5"
              onClick={() => on(safeParse(text))}
            >
              反映
            </button>
            <input
              type="file"
              accept=".json"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const t = await f.text();
                set(t);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
