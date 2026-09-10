"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  client?: string;
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal";
  responsive?: boolean;
  className?: string;
}

export function AdSlot({
  client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-xxxxxxxxxxxxxxxx",
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // 仅在浏览器端且包含 slot ID 时尝试推入广告队列
    if (typeof window !== "undefined" && slot && !pushed.current) {
      try {
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
        pushed.current = true;
      } catch (err) {
        console.error("AdSense push error:", err);
      }
    }
  }, [slot]);

  // 如果尚未配置具体广告单元 slot，显示轻量级开发占位
  if (!slot) {
    return (
      <div
        className={`ad-slot-container ad-slot-container--placeholder ${className}`}
        style={{
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(241, 245, 249, 0.6)",
          border: "1px dashed #cbd5e1",
          borderRadius: "8px",
          margin: "1.5rem 0",
          color: "#94a3b8",
          fontSize: "0.75rem",
        }}
      >
        <span style={{ textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
          Advertisement Area
        </span>
        <span>(Ad Slot Pending Configuration)</span>
      </div>
    );
  }

  return (
    <div
      className={`ad-slot-container ${className}`}
      style={{
        minHeight: "250px",
        margin: "1.5rem 0",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.4rem",
        }}
      >
        Advertisement
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
