"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentType } from "react";
import { Eye, Code, SquaresFour } from "@phosphor-icons/react";
import styles from "@/features/token-visualizer/styles.module.css";

type RailItem = {
  key: string;
  label: string;
  icon: ComponentType<{ size?: string | number; weight?: "regular" | "bold" | "fill" | "duotone" | "light" | "thin" }>;
  href: (search: URLSearchParams) => string;
  isActive: (pathname: string) => boolean;
};

const RAIL_ITEMS: RailItem[] = [
  {
    key: "workspace",
    label: "Workspace",
    icon: SquaresFour,
    href: (search) => (search.size > 0 ? `/workspace?${search.toString()}` : "/workspace"),
    isActive: (pathname) => pathname === "/workspace"
  },
  {
    key: "css",
    label: "CSS",
    icon: Code,
    href: (search) => (search.size > 0 ? `/workspace/css?${search.toString()}` : "/workspace/css"),
    isActive: (pathname) => pathname === "/workspace/css"
  },
  {
    key: "playground",
    label: "Playground",
    icon: Eye,
    href: (search) => (search.size > 0 ? `/workspace/playground?${search.toString()}` : "/workspace/playground"),
    isActive: (pathname) => pathname === "/workspace/playground"
  }
];

export function WorkspaceSideRail() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className={styles.workspaceSideRail} aria-label="Workspace navigation">
      <ul className={styles.workspaceSideRailList}>
        {RAIL_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(pathname);
          const href = item.href(new URLSearchParams(searchParams.toString()));

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
