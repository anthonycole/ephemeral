"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { SquaresFour } from "@phosphor-icons/react";
import styles from "@/features/token-visualizer/styles.module.css";

type RailItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: string | number; weight?: "regular" | "bold" | "fill" | "duotone" | "light" | "thin" }>;
  isActive: (pathname: string) => boolean;
};

const RAIL_ITEMS: RailItem[] = [
  {
    href: "/workspace",
    label: "Workspace",
    icon: SquaresFour,
    isActive: (pathname) => pathname === "/workspace"
  }
];

export function WorkspaceSideRail() {
  const pathname = usePathname();

  return (
    <nav className={styles.workspaceSideRail} aria-label="Workspace navigation">
      <ul className={styles.workspaceSideRailList}>
        {RAIL_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(pathname);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
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
