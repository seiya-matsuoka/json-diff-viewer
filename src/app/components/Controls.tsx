"use client";

type Props = {
  showOnlyDiff: boolean;
  onToggleOnlyDiff: () => void;
  epsilon: number;
  onEpsilon: (n: number) => void;
  keySort: boolean;
  onKeySort: (b: boolean) => void;
  onReset: () => void;
};

export default function Controls(p: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-3 shadow">
      <label className="grid gap-1">
        <span className="text-xs text-slate-600">ε（数値許容差）</span>
        <input
          className="w-32 rounded-md border px-3 py-2"
          type="number"
          step="any"
          value={p.epsilon}
          onChange={(e) => p.onEpsilon(Number(e.target.value))}
        />
      </label>

      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={p.keySort}
          onChange={(e) => p.onKeySort(e.target.checked)}
        />
        <span className="text-sm">キーソート</span>
      </label>

      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={p.showOnlyDiff}
          onChange={p.onToggleOnlyDiff}
        />
        <span className="text-sm">差分のみ</span>
      </label>

      <button
        className="ml-auto rounded-md border px-3 py-2"
        onClick={p.onReset}
      >
        初期化
      </button>
    </div>
  );
}
