"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Camera, BarChart3, Smartphone, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",                label: "Control",        sublabel: "Centro de control",   icon: Activity   },
  { href: "/ambulancia",      label: "Ambulancia",     sublabel: "App de campo",        icon: Smartphone },
  { href: "/camaras",         label: "Cámaras",        sublabel: "Monitor de video",    icon: Camera     },
  { href: "/resultados",      label: "Resultados",     sublabel: "Análisis de misión",  icon: BarChart3  },
  { href: "/infraestructura", label: "Infraestructura",sublabel: "Arquitectura",        icon: Layers     },
];

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0 flex flex-col bg-sidebar border-r border-border h-screen sticky top-0">

      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img
            src="/nexo-logo.png"
            alt="NEXO"
            className="h-6 w-auto object-contain"
          />
          <div className="leading-tight">
            <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
              Rosario · MR
            </p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 pt-4 pb-1.5">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Módulos
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 flex flex-col gap-px">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150",
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors",
                active ? "bg-primary/20" : "bg-white/[0.04] group-hover:bg-white/[0.07]"
              )}>
                <Icon className="w-3.5 h-3.5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <div className="min-w-0 leading-tight">
                <p className={cn("text-[12.5px] font-medium", active ? "text-primary" : "")}>
                  {item.label}
                </p>
                <p className={cn(
                  "text-[9.5px] truncate transition-colors",
                  active ? "text-primary/60" : "text-muted-foreground/50 group-hover:text-muted-foreground/70"
                )}>
                  {item.sublabel}
                </p>
              </div>
              {active && (
                <div className="ml-auto w-1 h-4 rounded-full bg-primary shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* System status */}
      <div className="px-3 py-3 border-t border-border space-y-2">
        <div className="flex items-center gap-2 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
          <p className="text-[10px] text-primary font-mono font-medium tracking-wide">
            SISTEMA EN LÍNEA
          </p>
        </div>
        <div className="bg-amber-500/8 border border-amber-500/15 rounded px-2.5 py-2">
          <p className="text-[10px] text-amber-400/80 font-medium uppercase tracking-wide leading-tight">
            Modo demo
          </p>
          <p className="text-[9px] text-amber-400/40 mt-0.5 leading-tight">
            Datos simulados
          </p>
        </div>
      </div>
    </aside>
  );
}
