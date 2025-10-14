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
  testFile,
  onApply,
  fillUrl,
}: {
  label: string;
  testFile: string;
  onApply: (v: any) => void;
  fillUrl?: string | null;
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

  const loadSample = async () => {
    try {
      const res = await fetch(testFile);
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
    <div className="rounded-2xl bg-white p-3 shadow">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <button className="text-xs underline" onClick={loadSample}>
          サンプル読込
        </button>
      </div>

      <div className="mb-2 flex gap-2">
        <input
          className="flex-1 rounded-md border px-2 py-1.5 text-xs"
          placeholder="https://example.com/data.json"
          value={s.url}
          onChange={(e) =>
            setS((p) => ({ ...p, url: e.target.value, fetchError: null }))
          }
        />
        <button
          className="rounded-md border px-2 py-1.5 text-xs"
          onClick={fetchFromUrl}
          disabled={!s.url || s.loading}
        >
          {s.loading ? "取得中…" : "URL取得"}
        </button>
      </div>
      {s.lastLoadedUrl && (
        <div className="mb-1 break-all text-[11px] text-slate-500">
          取得元: {s.lastLoadedUrl}
        </div>
      )}
      {s.fetchError && (
        <div className="mb-1 text-[11px] text-red-600">{s.fetchError}</div>
      )}

      <textarea
        className="h-48 w-full rounded-md border p-2 font-mono text-xs"
        value={s.text}
        onChange={(e) =>
          setS((p) => ({ ...p, text: e.target.value, parseError: null }))
        }
        placeholder='{"a":1}'
      />

      {s.parseError && (
        <div className="mt-1 text-[11px] text-red-600">{s.parseError}</div>
      )}

      <div className="mt-2 flex gap-2">
        <button className="rounded-md border px-3 py-1.5" onClick={apply}>
          反映
        </button>
        <input
          type="file"
          accept=".json,application/json"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const t = await f.text();
            setS((p) => ({ ...p, text: t, parseError: null }));
          }}
        />
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

  const [showGuide, setShowGuide] = useState(false);
  const [fillLeftUrl, setFillLeftUrl] = useState<string | null>(null);
  const [fillRightUrl, setFillRightUrl] = useState<string | null>(null);

  return (
    <>
      {hasGuide && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="rounded-md border px-2 py-1 text-xs text-slate-600 hover:text-slate-900"
            title="取得が有効な外部API"
          >
            取得が有効な外部API
          </button>
        </div>
      )}

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
          testFile="/samples/01_basic_add_remove/left.json"
          onApply={onLeft}
          fillUrl={fillLeftUrl}
        />
        <Panel
          label="右JSON"
          testFile="/samples/01_basic_add_remove/right.json"
          onApply={onRight}
          fillUrl={fillRightUrl}
        />
      </div>
    </>
  );
}
