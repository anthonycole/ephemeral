"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { Button } from "@radix-ui/themes";
import styles from "@/features/token-visualizer/styles.module.css";

type HeaderIconWeight = "regular" | "bold" | "fill" | "duotone" | "light" | "thin";

type WorkspaceHeaderIconControlProps = {
  label: string;
  title?: string;
  icon: ComponentType<{ size?: string | number; weight?: HeaderIconWeight }>;
  href?: string;
  onClick?: () => void;
  active?: boolean;
};

export function WorkspaceHeaderIconControl({ label, title, icon: Icon, href, onClick, active = false }: WorkspaceHeaderIconControlProps) {
  const accessibleTitle = title ?? label;
  const iconContent = (
    <>
      <Icon size={16} weight="regular" />
      <span className={styles.srOnly}>{label}</span>
    </>
  );

  if (href) {
    return (
      <Button asChild variant="soft" color="gray" className={styles.headerIconControl} data-active={active ? "true" : undefined}>
        <Link href={href} aria-label={label} title={accessibleTitle}>
          {iconContent}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="soft"
      color="gray"
      onClick={onClick}
      className={styles.headerIconControl}
      aria-label={label}
      title={accessibleTitle}
      data-active={active ? "true" : undefined}
    >
      {iconContent}
    </Button>
  );
}
