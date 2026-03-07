"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AutoHeightIframeProps = {
  frameClassName?: string;
  minHeight?: number;
  src: string;
  title: string;
};

export function AutoHeightIframe({ frameClassName, minHeight = 480, src, title }: AutoHeightIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerCleanupRef = useRef<(() => void) | null>(null);
  const [frameHeight, setFrameHeight] = useState(minHeight);

  const bindFrameMeasurement = useCallback(() => {
    const iframe = iframeRef.current;
    const documentElement = iframe?.contentDocument?.documentElement;
    const body = iframe?.contentDocument?.body;

    if (!iframe || !documentElement || !body) {
      return false;
    }

    const syncHeight = () => {
      const nextHeight = Math.max(documentElement.scrollHeight, body.scrollHeight, minHeight);
      setFrameHeight(nextHeight);
    };

    syncHeight();
    const timer = window.setTimeout(syncHeight, 48);
    const observer = new ResizeObserver(syncHeight);
    observer.observe(documentElement);
    observer.observe(body);
    const fonts = iframe.contentDocument?.fonts;

    fonts?.ready.then(syncHeight).catch(() => {});
    observerCleanupRef.current?.();
    observerCleanupRef.current = () => {
      window.clearTimeout(timer);
      observer.disconnect();
      observerCleanupRef.current = null;
    };

    return true;
  }, [minHeight]);

  useEffect(() => {
    setFrameHeight(minHeight);
    observerCleanupRef.current?.();

    return () => {
      observerCleanupRef.current?.();
    };
  }, [minHeight, src]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      className={frameClassName}
      src={src}
      style={{ height: `${frameHeight}px` }}
      onLoad={bindFrameMeasurement}
    />
  );
}
