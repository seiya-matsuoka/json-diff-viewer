"use client";

import { useMemo } from "react";

type Sample = { name: string; url: string; note?: string };
type PairSample = {
  name: string;
  leftUrl: string;
  rightUrl: string;
  note?: string;
};

export default function ApiGuide({
  open,
  onClose,
  onSetLeft,
  onSetRight,
  onSetBoth,
}: {
  open: boolean;
  onClose: () => void;
  onSetLeft: (url: string) => void;
  onSetRight: (url: string) => void;
  onSetBoth: (leftUrl: string, rightUrl: string) => void;
}) {
  const samples: Sample[] = useMemo(() => {
    try {
      const raw = process.env.NEXT_PUBLIC_API_SAMPLES ?? "[]";
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return arr
          .filter((x) => x && typeof x.url === "string")
          .map((x) => ({ name: x.name ?? x.url, url: x.url, note: x.note }));
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  const pairs: PairSample[] = useMemo(() => {
    try {
      const raw = process.env.NEXT_PUBLIC_API_PAIRS ?? "[]";
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return arr
          .filter(
            (x) =>
              x &&
              typeof x.leftUrl === "string" &&
              typeof x.rightUrl === "string",
          )
          .map((x) => ({
            name: x.name ?? `${x.leftUrl} vs ${x.rightUrl}`,
            leftUrl: x.leftUrl,
            rightUrl: x.rightUrl,
            note: x.note,
          }));
      }
      return [];
    } catch {
      return [];
    }
  }, []);

  // クライアント側の許可ホスト
  const allowedHosts = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS ?? "";
    return new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }, []);

  // 単品
  const sampleRows = samples.map((s) => {
    let host = "";
    try {
      host = new URL(s.url).host;
    } catch {
      host = "";
    }
    const allowed = host && allowedHosts.has(host);
    return { ...s, host, allowed };
  });

  // ペア
  const pairRows = pairs.map((p) => {
    let leftHost = "",
      rightHost = "";
    try {
      leftHost = new URL(p.leftUrl).host;
    } catch {
      leftHost = "";
    }
    try {
      rightHost = new URL(p.rightUrl).host;
    } catch {
      rightHost = "";
    }
    const leftAllowed = leftHost && allowedHosts.has(leftHost);
    const rightAllowed = rightHost && allowedHosts.has(rightHost);
    return { ...p, leftHost, rightHost, leftAllowed, rightAllowed };
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="card w-full max-w-3xl">
        <div className="card-header">
          <div className="text-sm font-medium">取得が有効な外部API</div>
          <button className="btn" onClick={onClose}>
            閉じる
          </button>
        </div>

        <div className="card-body max-h-[70vh] space-y-4 overflow-auto">
          {pairRows.length > 0 && (
            <section>
              <div className="mb-1 text-sm font-medium">比較セット</div>
              <div className="divide-y">
                {pairRows.map((p) => {
                  const ok = p.leftAllowed && p.rightAllowed;
                  return (
                    <div
                      key={p.name + p.leftUrl}
                      className="flex items-start gap-3 px-1 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="break-all text-sm font-medium">
                          {p.name}
                        </div>
                        <div className="break-all text-xs text-slate-700">
                          左: {p.leftUrl}
                        </div>
                        <div className="break-all text-xs text-slate-700">
                          右: {p.rightUrl}
                        </div>
                        {p.note && (
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            {p.note}
                          </div>
                        )}
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          左ホスト:{" "}
                          <span
                            className={p.leftAllowed ? "" : "text-rose-600"}
                          >
                            {p.leftHost || "-"}
                          </span>
                          {" / "}
                          右ホスト:{" "}
                          <span
                            className={p.rightAllowed ? "" : "text-rose-600"}
                          >
                            {p.rightHost || "-"}
                          </span>
                          {!ok && "（ALLOWED_ORIGINS に未登録あり）"}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          className="btn-slate"
                          onClick={() => {
                            onSetBoth(p.leftUrl, p.rightUrl);
                            onClose();
                          }}
                          disabled={!ok}
                        >
                          両方セット
                        </button>
                        <button
                          className="btn-slate"
                          onClick={() => {
                            onSetLeft(p.leftUrl);
                            onClose();
                          }}
                          disabled={!p.leftAllowed}
                        >
                          左にだけ
                        </button>
                        <button
                          className="btn-slate"
                          onClick={() => {
                            onSetRight(p.rightUrl);
                            onClose();
                          }}
                          disabled={!p.rightAllowed}
                        >
                          右にだけ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {sampleRows.length > 0 && (
            <section>
              <div className="mb-1 text-sm font-medium">単体エンドポイント</div>
              <div className="divide-y">
                {sampleRows.map((s) => (
                  <div key={s.url} className="flex items-start gap-3 px-1 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="break-all text-sm font-medium">
                        {s.name ?? s.url}
                      </div>
                      <div className="break-all text-xs text-slate-700">
                        {s.url}
                      </div>
                      {s.note && (
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          {s.note}
                        </div>
                      )}
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        ホスト:{" "}
                        <span className={s.allowed ? "" : "text-rose-600"}>
                          {s.host || "-"}
                        </span>
                        {!s.allowed && "（ALLOWED_ORIGINS に未登録）"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        className="btn-slate"
                        onClick={() => {
                          onSetLeft(s.url);
                          onClose();
                        }}
                        disabled={!s.allowed}
                      >
                        左にセット
                      </button>
                      <button
                        className="btn-slate"
                        onClick={() => {
                          onSetRight(s.url);
                          onClose();
                        }}
                        disabled={!s.allowed}
                      >
                        右にセット
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {pairRows.length === 0 && sampleRows.length === 0 && (
            <div className="text-sm text-slate-600">
              サンプルが設定されていません。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
