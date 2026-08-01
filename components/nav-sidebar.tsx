"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Camera,
  BarChart3,
  Smartphone,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "Centro de Control",
    icon: Activity,
  },
  {
    href: "/ambulancia",
    label: "App Ambulancia",
    icon: Smartphone,
  },
  {
    href: "/camaras",
    label: "Cámaras",
    icon: Camera,
  },
  {
    href: "/resultados",
    label: "Resultados",
    icon: BarChart3,
  },
];

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-sidebar border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-primary/15 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">
              Código Verde
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Municipalidad de Rosario
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                active
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Demo badge */}
      <div className="px-3 py-3 border-t border-border">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1.5 text-center">
          <p className="text-[10px] text-amber-400 font-medium uppercase tracking-wide">
            Demostración simulada
          </p>
          <p className="text-[9px] text-amber-400/60 mt-0.5">
            No conectado a infraestructura real
          </p>
        </div>
      </div>
    </aside>
  );
}
