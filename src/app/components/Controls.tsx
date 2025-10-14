"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  showOnlyDiff: boolean;
  onToggleOnlyDiff: () => void;
  epsilon: number;
  onEpsilon: (n: number) => void;
  keySort: boolean;
  onKeySort: (b: boolean) => void;
  onReset: () => void;
};

// 文字列 → 数値
function parseSci(input: string): number {
  const s = input.trim();
  if (!s) return 0;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

// 10倍 / 10分の1（指数を±1）
function stepEps(eps: number, deltaExp: 1 | -1) {
  const MIN_EXP = -12;
  const MAX_EXP = 0;
  if (eps === 0) {
    return deltaExp === 1 ? 1e-12 : 0;
  }
  const exp = Math.floor(Math.log10(eps));
  const nextExp = Math.min(MAX_EXP, Math.max(MIN_EXP, exp + deltaExp));
  return Math.pow(10, nextExp);
}

export default function Controls(p: Props) {
  const [display, setDisplay] = useState<string>(
    p.epsilon ? String(p.epsilon) : "",
  );

  useEffect(() => {
    setDisplay(p.epsilon ? String(p.epsilon) : "");
  }, [p.epsilon]);

  const expValue = useMemo(() => {
    if (!p.epsilon) return -12; // スライダーの最小端
    return Math.floor(Math.log10(p.epsilon));
  }, [p.epsilon]);

  const onChangeText = (val: string) => {
    setDisplay(val);
    const n = Math.max(0, parseSci(val));
    p.onEpsilon(n);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = stepEps(p.epsilon, e.key === "ArrowUp" ? 1 : -1);
      p.onEpsilon(next);
      setDisplay(next ? String(next) : "");
    }
  };

  return (
    <div className="card">
      <div className="card-body toolbar">
        {/* ε */}
        <label className="grid gap-1">
          <span className="text-[11px] text-slate-600">
            誤差の許容範囲（ε）
          </span>
          <input
            className="input w-44"
            type="text"
            inputMode="decimal"
            placeholder="0 / 1e-6 / 0.001"
            value={display}
            onChange={(e) => onChangeText(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="誤差の許容範囲（ε）"
          />

          <input
            className="mt-1 w-56"
            type="range"
            min={-12}
            max={0}
            step={1}
            value={expValue}
            onChange={(e) => {
              const exp = Number(e.target.value);
              const next = exp <= -12 ? 1e-12 : Math.pow(10, exp);
              p.onEpsilon(next);
              setDisplay(String(next));
            }}
            disabled={p.epsilon === 0 && display === "0"}
            title="指数（-12 〜 0）"
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

        <button className="btn ml-auto" onClick={p.onReset}>
          初期化
        </button>
      </div>
    </div>
  );
}
