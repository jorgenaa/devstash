"use client";

import { useEffect, useRef } from "react";
import {
  GitBranch,
  Globe,
  Terminal,
  FileCode,
  Bookmark,
  MessageSquare,
  Code2,
  FolderOpen,
} from "lucide-react";

const ICONS = [
  { Icon: GitBranch, bg: "#24292e", color: "#ffffff" },
  { Icon: Globe, bg: "#1565c0", color: "#90caf9" },
  { Icon: Terminal, bg: "#141414", color: "#22c55e" },
  { Icon: FileCode, bg: "#374151", color: "#e5e7eb" },
  { Icon: Bookmark, bg: "#b45309", color: "#fde68a" },
  { Icon: MessageSquare, bg: "#4a154b", color: "#e879f9" },
  { Icon: Code2, bg: "#1e293b", color: "#60a5fa" },
  { Icon: FolderOpen, bg: "#064e3b", color: "#34d399" },
];

const ICON_SIZE = 48;

interface IconState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
}

export default function ChaosAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefsRef = useRef<(HTMLDivElement | null)[]>([]);
  const stateRef = useRef<IconState[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getSize = () => ({
      w: container.clientWidth,
      h: container.clientHeight,
    });

    let { w, h } = getSize();
    mouseRef.current = { x: w / 2, y: h / 2 };

    stateRef.current = ICONS.map(() => ({
      x: Math.random() * (w - ICON_SIZE),
      y: Math.random() * (h - ICON_SIZE),
      vx: (Math.random() - 0.5) * 1.4,
      vy: (Math.random() - 0.5) * 1.4,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.2,
    }));

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: w / 2, y: h / 2 };
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    function tick() {
      const { x: mx, y: my } = mouseRef.current;
      stateRef.current.forEach((s, i) => {
        const el = iconRefsRef.current[i];
        if (!el) return;

        const cx = s.x + ICON_SIZE / 2;
        const cy = s.y + ICON_SIZE / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80 && dist > 0) {
          const force = ((80 - dist) / 80) * 0.9;
          s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
        }

        const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        if (speed > 2.2) {
          s.vx = (s.vx / speed) * 2.2;
          s.vy = (s.vy / speed) * 2.2;
        }
        if (speed < 0.4) {
          s.vx += (Math.random() - 0.5) * 0.3;
          s.vy += (Math.random() - 0.5) * 0.3;
        }

        s.vx *= 0.975;
        s.vy *= 0.975;
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.rotSpeed;

        if (s.x <= 0) { s.x = 0; s.vx = Math.abs(s.vx); }
        if (s.x >= w - ICON_SIZE) { s.x = w - ICON_SIZE; s.vx = -Math.abs(s.vx); }
        if (s.y <= 0) { s.y = 0; s.vy = Math.abs(s.vy); }
        if (s.y >= h - ICON_SIZE) { s.y = h - ICON_SIZE; s.vy = -Math.abs(s.vy); }

        el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.rot}deg)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    tick();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const size = getSize();
        w = size.w;
        h = size.h;
        mouseRef.current = { x: w / 2, y: h / 2 };
        stateRef.current.forEach((s) => {
          if (s.x > w - ICON_SIZE) s.x = w - ICON_SIZE;
          if (s.y > h - ICON_SIZE) s.y = h - ICON_SIZE;
        });
      }, 150);
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      <p className="text-xs text-white/40 text-center font-mono">Your knowledge today...</p>
      <div
        className="relative w-full max-w-85 rounded-xl overflow-hidden"
        style={{
          height: 280,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        ref={containerRef}
      >
        {ICONS.map(({ Icon, bg, color }, i) => (
          <div
            key={i}
            ref={(el) => { iconRefsRef.current[i] = el; }}
            className="absolute flex items-center justify-center rounded-xl"
            style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              background: bg,
              border: "1px solid rgba(255,255,255,0.1)",
              willChange: "transform",
            }}
          >
            <Icon size={22} color={color} />
          </div>
        ))}
      </div>
    </div>
  );
}
