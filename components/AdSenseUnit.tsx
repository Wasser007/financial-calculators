"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdSenseProps {
  /** AdSense 客户端发布商 ID */
  client?: string;
  /** 广告单元 ID (Ad Slot) */
  slot: string;
  /** 广告格式 */
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  /** 是否启用响应式广告 */
  responsive?: boolean;
  /** 预估广告最小高度（单位 px），用于防止 CLS 页面跳动 */
  minHeight?: number;
  /** 自定义外层容器样式类名 */
  className?: string;
}

export const AdSenseUnit: React.FC<AdSenseProps> = ({
  client = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-XXXXXXXXXXXXXXXX",
  slot,
  format = "auto",
  responsive = true,
  minHeight = 280,
  className = "",
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const isPushed = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !isPushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
        setIsLoaded(true);
      } catch (error) {
        console.error("AdSense script execution error:", error);
      }
    }
  }, []);

  return (
    <div
      className={`relative w-full my-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-300 ${className}`}
      style={{ minHeight: `${minHeight}px` }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 pointer-events-none select-none">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-sans tracking-wide">
            广告加载中...
          </span>
        </div>
      )}

      <ins
        className="adsbygoogle w-full block text-center"
        style={{ display: "block", minHeight: `${minHeight}px` }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdSenseUnit;
