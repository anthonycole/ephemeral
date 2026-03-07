"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentType } from "react";
import { Code, SquaresFour } from "@phosphor-icons/react";
import styles from "@/features/token-visualizer/styles.module.css";

type RailItem = {
  key: string;
  label: string;
  icon: ComponentType<{ size?: string | number; weight?: "regular" | "bold" | "fill" | "duotone" | "light" | "thin" }>;
  href: (pathname: string, search: URLSearchParams) => string;
  isActive: (pathname: string, panel: string | null) => boolean;
};

const RAIL_ITEMS: RailItem[] = [
  {
    key: "workspace",
    label: "Workspace",
    icon: SquaresFour,
    href: (pathname, search) => {
      const nextSearch = new URLSearchParams(search.toString());
      nextSearch.delete("panel");
      return nextSearch.size > 0 ? `${pathname}?${nextSearch.toString()}` : pathname;
    },
    isActive: (pathname, panel) => pathname === "/workspace" && panel !== "css"
  },
  {
    key: "css",
    label: "CSS",
    icon: Code,
    href: (pathname, search) => {
      const nextSearch = new URLSearchParams(search.toString());
      nextSearch.set("panel", "css");
      return `${pathname}?${nextSearch.toString()}`;
    },
    isActive: (pathname, panel) => pathname === "/workspace" && panel === "css"
  }
];

export function WorkspaceSideRail() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activePanel = searchParams.get("panel");

  return (
    <nav className={styles.workspaceSideRail} aria-label="Workspace navigation">
      <ul className={styles.workspaceSideRailList}>
        {RAIL_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(pathname, activePanel);
          const href = item.href(pathname, new URLSearchParams(searchParams.toString()));

          return (
            <li key={item.key}>
              <Link
                href={href}
                className={styles.workspaceSideRailLink}
                data-active={active}
                aria-label={item.label}
                title={item.label}
              >
                <Icon size={18} weight={active ? "fill" : "regular"} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
