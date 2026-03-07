"use client";

import { useEffect, useMemo } from "react";
import { parseGoogleFontImports } from "@/model/tokens/font-utils";

type GoogleFontLinksProps = {
  directives: string[];
};

const MANAGED_FONT_ATTR = "data-ephemeral-google-font";

export function GoogleFontLinks({ directives }: GoogleFontLinksProps) {
  const hrefs = useMemo(() => parseGoogleFontImports(directives).map((font) => font.href), [directives]);

  useEffect(() => {
    const managedLinks = [...document.head.querySelectorAll<HTMLLinkElement>(`link[${MANAGED_FONT_ATTR}="true"]`)];
    const nextHrefs = new Set(hrefs);
    const stylesheetLinks = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')];

    for (const link of managedLinks) {
      if (!nextHrefs.has(link.href)) {
        link.remove();
      }
    }

    for (const href of hrefs) {
      const existingLink = managedLinks.find((link) => link.href === href) ?? stylesheetLinks.find((link) => link.href === href);

      if (existingLink) {
        existingLink.setAttribute(MANAGED_FONT_ATTR, "true");
        continue;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute(MANAGED_FONT_ATTR, "true");
      document.head.append(link);
    }

    return () => {
      for (const link of [...document.head.querySelectorAll<HTMLLinkElement>(`link[${MANAGED_FONT_ATTR}="true"]`)]) {
        if (!nextHrefs.has(link.href)) {
          link.remove();
        }
      }
    };
  }, [hrefs]);

  return null;
}
