"use client";

import { useEffect, useRef } from "react";
import "asciinema-player/dist/bundle/asciinema-player.css";

export type AsciinemaProps = {
  /** Path to a `.cast` file (asciicast v2 JSON). */
  src: string;
  /**
   * Description used as a fallback in feeds and as the player's accessible
   * label. Required — treat it like `alt` text on an image.
   */
  alt: string;
  cols?: number;
  rows?: number;
  autoPlay?: boolean;
  loop?: boolean | number;
  startAt?: number | string;
  speed?: number;
  idleTimeLimit?: number;
  /**
   * Frame to render behind the play button. Defaults to `"npt:1"` (one
   * second in) so a TUI's initial draw is visible instead of a black square.
   * Override per-recording if your cast needs a different moment.
   */
  poster?: string;
  /**
   * Whether to fetch the cast upfront. Defaults to `true` so the player can
   * size to the cast's actual dimensions before play instead of resizing
   * mid-stream.
   */
  preload?: boolean;
  theme?: string;
};

type PlayerHandle = { dispose: () => void };

type AsciinemaPlayerModule = {
  create: (
    src: string,
    container: HTMLElement,
    opts?: Record<string, unknown>,
  ) => PlayerHandle;
};

export function Asciinema({
  src,
  alt,
  cols,
  rows,
  autoPlay,
  loop,
  startAt,
  speed,
  idleTimeLimit,
  poster = "npt:1",
  preload = true,
  theme,
}: AsciinemaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let handle: PlayerHandle | undefined;
    let cancelled = false;

    void (async () => {
      const mod = (await import("asciinema-player")) as AsciinemaPlayerModule;
      if (cancelled || !containerRef.current) return;
      handle = mod.create(src, containerRef.current, {
        cols,
        rows,
        autoPlay,
        loop,
        startAt,
        speed,
        idleTimeLimit,
        poster,
        preload,
        theme,
      });
    })();

    return () => {
      cancelled = true;
      handle?.dispose();
    };
  }, [src, cols, rows, autoPlay, loop, startAt, speed, idleTimeLimit, poster, preload, theme]);

  return (
    <div className="my-6" role="figure" aria-label={alt}>
      <div ref={containerRef} />
    </div>
  );
}
