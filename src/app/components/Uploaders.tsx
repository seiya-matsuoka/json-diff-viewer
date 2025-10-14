"use client";

import { useEffect, useMemo, useState } from "react";
import ApiGuide from "./ApiGuide";

type ParseResult<T> = { data: T | null; error: string | null };
function safeParse<T = any>(text: string): ParseResult<T> {
  try {
    return { data: JSON.parse(text), error: null };
  } catch (e: any) {
    return {
      data: null,
      error: e?.message ? String(e.message) : "JSON の解析に失敗しました",
    };
  }
}

// サンプルセットの定義
const SAMPLE_SETS: Array<{ id: number; dir: string; label: string }> = [
  { id: 1, dir: "01_basic_add_remove", label: "01 基本: 追加/削除" },
  { id: 2, dir: "02_nested_object_update", label: "02 ネスト更新+配列追加" },
  { id: 3, dir: "03_array_of_objects_mutations", label: "03 配列の要素変更" },
  { id: 4, dir: "04_numeric_epsilon", label: "04 数値の微差" },
  { id: 5, dir: "05_type_changes", label: "05 型の変更" },
  { id: 6, dir: "06_null_missing_boolean", label: "06 null/missing/boolean" },
  { id: 7, dir: "07_deep_nested", label: "07 深いネスト" },
];

type PanelState = {
  text: string;
  url: string;
  loading: boolean;
  parseError: string | null;
  fetchError: string | null;
  lastLoadedUrl: string | null;
};

function Panel({
  label,
  side,
  sampleDir,
  onApply,
  fillUrl,
  fillText,
}: {
  label: string;
  side: "left" | "right";
  sampleDir: string;
  onApply: (v: any) => void;
  fillUrl?: string | null;
  fillText?: string | null;
}) {
  const [s, setS] = useState<PanelState>({
    text: "",
    url: "",
    loading: false,
    parseError: null,
    fetchError: null,
    lastLoadedUrl: null,
  });

  useEffect(() => {
    if (fillUrl) setS((p) => ({ ...p, url: fillUrl, fetchError: null }));
  }, [fillUrl]);

  useEffect(() => {
    if (typeof fillText === "string") {
      setS((p) => ({ ...p, text: fillText, parseError: null }));
    }
  }, [fillText]);

  // 選択中のサンプルセットからパネル用のファイルを取得
  const loadSample = async () => {
    const file = side === "left" ? "left.json" : "right.json";
    const path = `/samples/${sampleDir}/${file}`;
    try {
      const res = await fetch(path);
      const t = await res.text();
      setS((p) => ({ ...p, text: t, parseError: null }));
    } catch {
      setS((p) => ({ ...p, fetchError: "サンプルの取得に失敗しました" }));
    }
  };

  const fetchFromUrl = async () => {
    if (!s.url || s.loading) return;
    setS((p) => ({ ...p, loading: true, fetchError: null }));
    try {
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(s.url)}`);
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `取得に失敗しました (HTTP ${res.status})`);
      }
      const t = await res.text();
      setS((p) => ({
        ...p,
        text: t,
        loading: false,
        fetchError: null,
        parseError: null,
        lastLoadedUrl: s.url,
      }));
    } catch (e: any) {
      setS((p) => ({
        ...p,
        loading: false,
        fetchError: e?.message ? String(e.message) : "取得に失敗しました",
      }));
    }
  };

  const apply = () => {
    const { data, error } = safeParse(s.text);
    if (error) {
      setS((p) => ({ ...p, parseError: error }));
      return;
    }
    setS((p) => ({ ...p, parseError: null }));
    onApply(data);
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="text-sm font-medium">{label}</span>
        <button
          className="btn-primary"
          onClick={loadSample}
          title="選択中のサンプルセットから読込"
        >
          サンプル読込
        </button>
      </div>
      <div className="card-body space-y-2">
        <div className="toolbar">
          <input
            className="input flex-1"
            placeholder="https://example.com/data.json"
            value={s.url}
            onChange={(e) =>
              setS((p) => ({ ...p, url: e.target.value, fetchError: null }))
            }
          />
          <button
            className="btn-primary"
            onClick={fetchFromUrl}
            disabled={!s.url || s.loading}
          >
            {s.loading ? "取得中…" : "URL取得"}
          </button>
        </div>

        {s.lastLoadedUrl && (
          <div className="break-all text-[11px] text-slate-500">
            取得元: {s.lastLoadedUrl}
          </div>
        )}
        {s.fetchError && (
          <div className="text-[11px] text-rose-600">{s.fetchError}</div>
        )}

        <textarea
          className="textarea h-48"
          value={s.text}
          onChange={(e) =>
            setS((p) => ({ ...p, text: e.target.value, parseError: null }))
          }
          placeholder='{"a":1}'
        />
        {s.parseError && (
          <div className="text-[11px] text-rose-600">{s.parseError}</div>
        )}

        <div className="toolbar">
          <input
            className="ml-2 text-[11px]"
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const t = await f.text();
              setS((p) => ({ ...p, text: t, parseError: null }));
            }}
          />
          <button className="btn-indigo ml-auto mr-2" onClick={apply}>
            反映
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Uploaders({
  onLeft,
  onRight,
}: {
  onLeft: (v: any) => void;
  onRight: (v: any) => void;
}) {
  // ガイドの有無だけチェック
  const hasGuide = useMemo(() => {
    try {
      const sRaw = process.env.NEXT_PUBLIC_API_SAMPLES ?? "[]";
      const pRaw = process.env.NEXT_PUBLIC_API_PAIRS ?? "[]";
      const s = JSON.parse(sRaw);
      const p = JSON.parse(pRaw);
      return (
        (Array.isArray(s) && s.length > 0) || (Array.isArray(p) && p.length > 0)
      );
    } catch {
      return false;
    }
  }, []);

  // サンプルセット選択（1〜7）
  const [sampleId, setSampleId] = useState<number>(1);
  const sampleDir = useMemo(() => {
    return (
      SAMPLE_SETS.find((x) => x.id === sampleId)?.dir ?? SAMPLE_SETS[0].dir
    );
  }, [sampleId]);

  const [showGuide, setShowGuide] = useState(false);

  // ガイドや一括読込からの挿入データ
  const [fillLeftUrl, setFillLeftUrl] = useState<string | null>(null);
  const [fillRightUrl, setFillRightUrl] = useState<string | null>(null);
  const [fillLeftText, setFillLeftText] = useState<string | null>(null);
  const [fillRightText, setFillRightText] = useState<string | null>(null);

  // 選択中のサンプルを両側に一括読込
  const loadBothSamples = async () => {
    const base = `/samples/${sampleDir}`;
    try {
      const [lt, rt] = await Promise.all([
        fetch(`${base}/left.json`).then((r) => r.text()),
        fetch(`${base}/right.json`).then((r) => r.text()),
      ]);
      setFillLeftText(lt);
      setFillRightText(rt);
    } catch {
      // 片方だけでも失敗したら明示的なUIエラーは出さず、各パネル内で編集できるようにする
    }
  };

  return (
    <>
      {/* 上部ツールバー：サンプル選択 + 一括読込 + 外部APIガイド */}
      <div className="card">
        <div className="card-body toolbar">
          <label className="text-xs text-slate-600">サンプルセット</label>
          <select
            className="select"
            value={sampleId}
            onChange={(e) => setSampleId(Number(e.target.value))}
          >
            {SAMPLE_SETS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button className="btn-primary ml-2" onClick={loadBothSamples}>
            サンプル両方読込
          </button>

          {hasGuide && (
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="btn-zinc ml-auto"
              title="取得が有効な外部API"
            >
              取得が有効な外部API
            </button>
          )}
        </div>
      </div>

      <ApiGuide
        open={showGuide}
        onClose={() => setShowGuide(false)}
        onSetLeft={(url) => setFillLeftUrl(url)}
        onSetRight={(url) => setFillRightUrl(url)}
        onSetBoth={(left, right) => {
          setFillLeftUrl(left);
          setFillRightUrl(right);
        }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel
          label="左JSON"
          side="left"
          sampleDir={sampleDir}
          onApply={onLeft}
          fillUrl={fillLeftUrl}
          fillText={fillLeftText}
        />
        <Panel
          label="右JSON"
          side="right"
          sampleDir={sampleDir}
          onApply={onRight}
          fillUrl={fillRightUrl}
          fillText={fillRightText}
        />
      </div>
    </>
  );
}
