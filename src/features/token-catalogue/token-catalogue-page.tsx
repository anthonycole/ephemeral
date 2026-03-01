"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge, Card, Code, Container, Flex, Heading, Section, Separator, Text } from "@radix-ui/themes";
import type { TokenDocument, TokenRecord } from "@/features/token-visualizer/document";
import { isTokenCategoryFilter, tokenCategoryDefinitions, tokenCategoryDescriptions, type TokenCategoryFilter } from "@/features/token-catalogue/categories";
import { formatScopeLabel, groupTokens, tokenValueForWidth } from "@/features/token-visualizer/utils";
import styles from "@/features/token-catalogue/styles.module.css";

type TokenCataloguePageProps = {
  document: TokenDocument;
  source: "workspace" | "sample";
  updatedAt: string | null;
};

function resolveCategoryFilter(value: string | null): TokenCategoryFilter {
  return isTokenCategoryFilter(value) ? value : "all";
}

export function TokenCataloguePage({ document, source, updatedAt }: TokenCataloguePageProps) {
  const searchParams = useSearchParams();
  const activeCategory = resolveCategoryFilter(searchParams.get("category"));
  const groupedTokens = groupTokens(document.tokens);
  const sections = tokenCategoryDefinitions.map((definition) => ({
    ...definition,
    tokens: groupedTokens[definition.key],
  }))
    .filter((section) => section.tokens.length > 0)
    .filter((section) => activeCategory === "all" || section.key === activeCategory);
  const tokenValueMap = new Map(document.tokens.map((token) => [token.name, token.value]));

  return (
    <main className={styles.page}>
      <Container size="4" className={styles.frame}>
        <Flex direction="column" gap="6">
          <Card className={styles.hero}>
            <Flex direction="column" gap="4">
              <Flex align="center" gap="2" wrap="wrap">
                <Badge size="2" color={source === "workspace" ? "green" : "gray"} variant="soft">
                  {source === "workspace" ? "Saved workspace" : "Sample fallback"}
                </Badge>
                {updatedAt ? (
                  <Badge size="2" color="gray" variant="soft">
                    Updated {new Date(updatedAt).toLocaleString()}
                  </Badge>
                ) : null}
              </Flex>
              <div>
                <Heading size="8" mt="2">
                  Token Catalogue
                </Heading>
              </div>
              <Text size="3" color="gray" style={{ maxWidth: "48rem" }}>
                This route strips away editing, parsing, and inspector concerns so the token set reads like a documentation surface you could
                later lift into Storybook or publish as a lightweight npm package.
              </Text>
              <div className={styles.routeRow}>
                <Link href="/tokens" className={styles.routeLink} aria-current="page">
                  <Badge size="2" color="blue" variant="soft">
                    Catalogue
                  </Badge>
                </Link>
                <Link href="/tokens/playground" className={styles.routeLink}>
                  <Badge size="2" color="gray" variant="surface">
                    Playground
                  </Badge>
                </Link>
              </div>
              <div className={styles.anchorRow}>
                <Link href="/tokens" className={styles.anchor} aria-current={activeCategory === "all" ? "page" : undefined}>
                  <Badge size="2" variant={activeCategory === "all" ? "soft" : "surface"} color={activeCategory === "all" ? "blue" : "gray"}>
                    All
                  </Badge>
                </Link>
                {tokenCategoryDefinitions.map((section) => (
                  <Link
                    key={section.key}
                    href={`/tokens?category=${section.key}`}
                    className={styles.anchor}
                    aria-current={activeCategory === section.key ? "page" : undefined}
                  >
                    <Badge size="2" variant={activeCategory === section.key ? "soft" : "surface"} color={activeCategory === section.key ? "blue" : "gray"}>
                      {section.label}
                    </Badge>
                  </Link>
                ))}
              </div>
            </Flex>
          </Card>

          <div className={styles.sectionGrid}>
            {sections.map((section) => (
              <Card key={section.key} id={section.key} className={styles.sectionCard}>
                <Section size="2">
                  <Flex direction="column" gap="4">
                    <Flex justify="between" align="start" gap="3" wrap="wrap">
                      <div>
                        <Heading size="6">{section.label}</Heading>
                        <Text size="2" color="gray">
                          {tokenCategoryDescriptions[section.key]}
                        </Text>
                      </div>
                      <Badge size="2" variant="soft">
                        {section.tokens.length} tokens
                      </Badge>
                    </Flex>
                    <Separator size="4" />
                    <div className={styles.tokenGrid}>
                      {section.tokens.map((token) => (
                        <Card key={token.id} className={styles.tokenCard}>
                          <Flex direction="column" gap="3">
                            <div className={styles.previewWrap}>{renderPreview(token, tokenValueMap)}</div>
                            <Flex direction="column" gap="2" className={styles.metaStack}>
                              <div>
                                <Text size="2" weight="medium" className={styles.tokenName}>
                                  {token.name}
                                </Text>
                                <Text size="1" className={styles.scopeLabel}>
                                  {formatScopeLabel(token.scope)}
                                </Text>
                              </div>
                              <Code size="2" variant="soft" className={styles.tokenValue}>
                                {token.value}
                              </Code>
                            </Flex>
                          </Flex>
                        </Card>
                      ))}
                    </div>
                  </Flex>
                </Section>
              </Card>
            ))}
          </div>
        </Flex>
      </Container>
    </main>
  );
}

function renderPreview(token: TokenRecord, tokenValueMap: Map<string, string>) {
  switch (token.category) {
    case "color":
      return <div className={styles.swatch} style={{ background: token.value }} />;
    case "spacing":
      return (
        <div className={styles.measureTrack}>
          <div className={styles.measureBar} style={{ width: tokenValueForWidth(token.value) }} />
        </div>
      );
    case "typography":
      return <TypographyPreview token={token} />;
    case "radius":
      return <div className={styles.radiusPreview} style={{ borderRadius: token.value }} />;
    case "shadow":
      return <div className={styles.shadowPreview} style={{ boxShadow: token.value }} />;
    case "sizing":
      return (
        <div className={styles.sizePreview}>
          <div className={styles.sizeBlock} style={{ width: tokenValueForWidth(token.value) }} />
        </div>
      );
    case "motion":
      return (
        <div className={styles.motionPreview}>
          <span className={styles.motionOrb} style={{ animationDuration: token.value }} />
        </div>
      );
    case "z-index":
      return (
        <div className={styles.stackPreview}>
          <div className={styles.stackLayerBack} />
          <div className={styles.stackLayerMid} />
          <div className={styles.stackLayerFront} />
        </div>
      );
    case "opacity":
      return (
        <div className={styles.opacityPreview}>
          <div className={styles.opacityBase} />
          <div className={styles.opacityOverlay} style={{ opacity: normalizeOpacity(token.value) }} />
        </div>
      );
    case "breakpoint":
      return (
        <div className={styles.breakpointPreview}>
          <div className={styles.breakpointFrame}>
            <div className={styles.breakpointFill} style={{ width: breakpointWidth(tokenValueMap, token.name, token.value) }} />
          </div>
          <Text size="1" color="gray">
            min-width {token.value}
          </Text>
        </div>
      );
    case "other":
      return <div className={styles.otherPreview}>{token.value}</div>;
    default:
      return null;
  }
}

function TypographyPreview({ token }: { token: TokenRecord }) {
  const style: CSSProperties = {};

  if (token.name.includes("font-size")) {
    style.fontSize = token.value;
    style.lineHeight = 1.15;
  }

  if (token.name.includes("font-weight")) {
    style.fontWeight = Number.parseInt(token.value, 10) || token.value;
  }

  return (
    <div className={styles.typePreview} style={style}>
      Ag
    </div>
  );
}

function normalizeOpacity(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 1 : Math.max(0.1, Math.min(1, parsed));
}

function breakpointWidth(tokenValueMap: Map<string, string>, name: string, fallback: string) {
  const value = tokenValueMap.get(name) ?? fallback;
  const parsed = Number.parseFloat(value);

  if (Number.isNaN(parsed)) {
    return "50%";
  }

  const maxBreakpoint = Math.max(
    Number.parseFloat(tokenValueMap.get("--breakpoint-sm") ?? "640px") || 0,
    Number.parseFloat(tokenValueMap.get("--breakpoint-lg") ?? "1024px") || 0,
  );

  if (maxBreakpoint <= 0) {
    return "50%";
  }

  return `${Math.max(28, (parsed / maxBreakpoint) * 100)}%`;
}
