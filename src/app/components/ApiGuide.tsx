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
      <div className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">取得が有効な外部API</div>
          <button
            className="rounded-md border px-2 py-1 text-xs"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-auto">
          {pairRows.length > 0 && (
            <section>
              <div className="mb-1 text-sm font-medium">比較セット</div>
              <div className="divide-y">
                {pairRows.map((p) => {
                  const allAllowed = p.leftAllowed && p.rightAllowed;
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
                          <span className={p.leftAllowed ? "" : "text-red-600"}>
                            {p.leftHost || "-"}
                          </span>
                          {" / "}
                          右ホスト:{" "}
                          <span
                            className={p.rightAllowed ? "" : "text-red-600"}
                          >
                            {p.rightHost || "-"}
                          </span>
                          {!allAllowed && "（ALLOWED_ORIGINS に未登録あり）"}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          className="rounded-md border px-2 py-1 text-xs"
                          onClick={() => {
                            onSetBoth(p.leftUrl, p.rightUrl);
                            onClose();
                          }}
                          disabled={!allAllowed}
                          title={
                            allAllowed
                              ? "左右にセット"
                              : "ALLOWED_ORIGINS に未登録あり"
                          }
                        >
                          両方セット
                        </button>
                        <button
                          className="rounded-md border px-2 py-1 text-xs"
                          onClick={() => {
                            onSetLeft(p.leftUrl);
                            onClose();
                          }}
                          disabled={!p.leftAllowed}
                          title={
                            p.leftAllowed
                              ? "左にセット"
                              : "ALLOWED_ORIGINS に未登録"
                          }
                        >
                          左にだけ
                        </button>
                        <button
                          className="rounded-md border px-2 py-1 text-xs"
                          onClick={() => {
                            onSetRight(p.rightUrl);
                            onClose();
                          }}
                          disabled={!p.rightAllowed}
                          title={
                            p.rightAllowed
                              ? "右にセット"
                              : "ALLOWED_ORIGINS に未登録"
                          }
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
                        {s.name}
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
                        <span className={s.allowed ? "" : "text-red-600"}>
                          {s.host || "-"}
                        </span>
                        {!s.allowed && "（ALLOWED_ORIGINS に未登録）"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        className="rounded-md border px-2 py-1 text-xs"
                        onClick={() => {
                          onSetLeft(s.url);
                          onClose();
                        }}
                        disabled={!s.allowed}
                        title={
                          s.allowed ? "左にセット" : "ALLOWED_ORIGINS に未登録"
                        }
                      >
                        左にセット
                      </button>
                      <button
                        className="rounded-md border px-2 py-1 text-xs"
                        onClick={() => {
                          onSetRight(s.url);
                          onClose();
                        }}
                        disabled={!s.allowed}
                        title={
                          s.allowed ? "右にセット" : "ALLOWED_ORIGINS に未登録"
                        }
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
