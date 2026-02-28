import type { CSSProperties } from "react";
import { Badge, Card, Code, Container, Flex, Heading, Section, Separator, Text } from "@radix-ui/themes";
import type { TokenCategory } from "@/lib/design-tokens";
import type { TokenRecord } from "@/features/token-visualizer/document";
import { SAMPLE_DOCUMENT } from "@/features/token-visualizer/sample-workspace";
import { formatScopeLabel, groupTokens, tokenValueForWidth } from "@/features/token-visualizer/utils";
import styles from "@/features/token-catalogue/styles.module.css";

const groupedTokens = groupTokens(SAMPLE_DOCUMENT.tokens);

const categoryDefinitions: Array<{ key: Exclude<TokenCategory, "all">; label: string }> = [
  { key: "color", label: "Color" },
  { key: "spacing", label: "Spacing" },
  { key: "typography", label: "Typography" },
  { key: "radius", label: "Radius" },
  { key: "shadow", label: "Shadow" },
  { key: "sizing", label: "Sizing" },
  { key: "motion", label: "Motion" },
  { key: "z-index", label: "Z Index" },
  { key: "opacity", label: "Opacity" },
  { key: "breakpoint", label: "Breakpoint" },
  { key: "other", label: "Other" },
];

const categoryDescriptions: Record<(typeof categoryDefinitions)[number]["key"], string> = {
  color: "Core brand, surface, and content colors as direct reference swatches.",
  spacing: "Layout spacing primitives rendered as simple measurable bars.",
  typography: "Type scale and weight decisions presented as display-ready samples.",
  radius: "Corner treatments used by components, tiles, and interactive surfaces.",
  shadow: "Elevation tokens shown as static, package-friendly surface previews.",
  sizing: "Reusable size primitives for icons, containers, and layout constraints.",
  motion: "Duration tokens represented as slim animation timings rather than controls.",
  "z-index": "Layering tokens for overlays, popovers, and compositional depth.",
  opacity: "Transparency utilities displayed as compositing examples.",
  breakpoint: "Responsive thresholds presented as widths for docs and Storybook.",
  other: "Reference tokens that still belong in a package, even without a richer visual.",
};

const sections = categoryDefinitions.map((definition) => ({
  ...definition,
  tokens: groupedTokens[definition.key],
})).filter((section) => section.tokens.length > 0);

export function TokenCataloguePage() {
  return (
    <main className={styles.page}>
      <Container size="4" className={styles.frame}>
        <Flex direction="column" gap="6">
          <Card className={styles.hero}>
            <Flex direction="column" gap="4">
              <div>
                <Heading size="8" mt="2">
                  Token Catalogue
                </Heading>
              </div>
              <Text size="3" color="gray" style={{ maxWidth: "48rem" }}>
                This route strips away editing, parsing, and inspector concerns so the token set reads like a documentation surface you could
                later lift into Storybook or publish as a lightweight npm package.
              </Text>
              <div className={styles.anchorRow}>
                {sections.map((section) => (
                  <a key={section.key} href={`#${section.key}`} className={styles.anchor}>
                    <Badge size="2" variant="surface" color="gray">
                      {section.label}
                    </Badge>
                  </a>
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
                          {categoryDescriptions[section.key]}
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
                            <div className={styles.previewWrap}>{renderPreview(token)}</div>
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

function renderPreview(token: TokenRecord) {
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
            <div className={styles.breakpointFill} style={{ width: tokenValueForWidth(token.value) }} />
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
