"use client";

import { useEffect } from "react";

import { FAVICON_DARK, FAVICON_LIGHT } from "@/lib/favicon";

function osPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

type WebkitWindow = Window & {
  webkitRequestFileSystem?: (
    type: number,
    size: number,
    success: () => void,
    error: () => void,
  ) => void;
};

/** Incognito chrome is dark even when the OS reports light. */
async function isLikelyIncognito() {
  const webkitFs = (window as WebkitWindow).webkitRequestFileSystem;
  if (typeof webkitFs === "function") {
    const TEMPORARY = 0;
    const fromFs = await new Promise<boolean>((resolve) => {
      webkitFs(TEMPORARY, 1, () => resolve(false), () => resolve(true));
    });
    if (fromFs) return true;
  }

  try {
    const { quota } = await navigator.storage.estimate();
    // Regular Chrome quota is usually many GB; Incognito is ~120MB or less.
    return quota !== undefined && quota < 180 * 1024 * 1024;
  } catch {
    return false;
  }
}

function setFavicon(href: string) {
  let link = document.querySelector<HTMLLinkElement>("link[data-frame-favicon]");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.sizes = "32x32";
    link.dataset.frameFavicon = "true";
    document.head.appendChild(link);
  }
  link.href = href;
}

export function ThemeFavicon() {
  useEffect(() => {
    let cancelled = false;

    const apply = async () => {
      const darkTab = osPrefersDark() || (await isLikelyIncognito());
      if (!cancelled) setFavicon(darkTab ? FAVICON_DARK : FAVICON_LIGHT);
    };

    void apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => {
      cancelled = true;
      mq.removeEventListener("change", apply);
    };
  }, []);

  return null;
}
