"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  rightSlot?: React.ReactNode;
  status?: "active" | "waiting" | "alert";
  statusLabel?: string;
}

export function PageHeader({
  title,
  subtitle,
  rightSlot,
  status = "active",
  statusLabel,
}: PageHeaderProps) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      setClock(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const statusConfig = {
    active:  { dot: "bg-primary animate-pulse", text: "text-primary",           label: statusLabel ?? "SISTEMA ACTIVO"  },
    waiting: { dot: "bg-amber-400 animate-pulse",text: "text-amber-400",         label: statusLabel ?? "EN ESPERA"       },
    alert:   { dot: "bg-rose-500 animate-pulse", text: "text-rose-400",          label: statusLabel ?? "ALERTA"          },
  };
  const sc = statusConfig[status];

  return (
    <header className="px-5 py-3 border-b border-border shrink-0 flex items-center justify-between gap-4 bg-sidebar/50 backdrop-blur-sm">
      <div className="flex items-center gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-[13px] font-semibold text-foreground tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-[10px] text-muted-foreground/60 leading-tight mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5 shrink-0">
        {rightSlot}

        {/* Clock */}
        <div className="text-right hidden sm:block">
          <p className="text-[15px] font-mono font-bold text-foreground/80 leading-none tracking-wide tabular-nums">
            {clock}
          </p>
          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest mt-0.5">
            Rosario · UTC-3
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 pl-5 border-l border-border">
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", sc.dot)} />
          <span className={cn("text-[10px] font-mono font-semibold tracking-widest", sc.text)}>
            {sc.label}
          </span>
        </div>
      </div>
    </header>
  );
}
