"use client";

import { useDeferredValue, useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Button, Dialog, Flex, Kbd, ScrollArea, Separator, Text, TextField, VisuallyHidden } from "@radix-ui/themes";
import type { TokenCategory } from "@/lib/design-tokens";
import { CATEGORY_DEFINITIONS } from "@/features/token-visualizer/config";
import type { TokenRecord } from "@/features/token-visualizer/document";
import { categoryLabel, formatScopeLabel } from "@/features/token-visualizer/utils";
import styles from "@/features/token-visualizer/styles.module.css";

export type CommandAction = {
  id: string;
  title: string;
  subtitle: string;
  keywords?: string[];
  disabled?: boolean;
  run: () => void;
};

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokens: TokenRecord[];
  actions: CommandAction[];
  onSelectToken: (token: TokenRecord) => void;
  onSelectCategory: (category: TokenCategory) => void;
};

type CommandItem =
  | {
      id: string;
      kind: "action";
      title: string;
      subtitle: string;
      disabled?: boolean;
      run: () => void;
    }
  | {
      id: string;
      kind: "category";
      title: string;
      subtitle: string;
      run: () => void;
    }
  | {
      id: string;
      kind: "token";
      title: string;
      subtitle: string;
      value: string;
      run: () => void;
    };

function includesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query);
}

export function CommandPalette({ open, onOpenChange, tokens, actions, onSelectToken, onSelectCategory }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const actionItems = useMemo<CommandItem[]>(() => {
    return actions
      .filter((action) => {
        if (!normalizedQuery) {
          return true;
        }

        const haystack = [action.title, action.subtitle, ...(action.keywords ?? [])].join(" ").toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .map((action) => ({
        id: action.id,
        kind: "action",
        title: action.title,
        subtitle: action.subtitle,
        disabled: action.disabled,
        run: action.run
      }));
  }, [actions, normalizedQuery]);

  const categoryItems = useMemo<CommandItem[]>(() => {
    return CATEGORY_DEFINITIONS.filter((definition) => {
      if (!normalizedQuery) {
        return true;
      }

      return includesQuery(definition.label, normalizedQuery) || includesQuery(definition.key, normalizedQuery);
    }).map((definition) => ({
      id: `category:${definition.key}`,
      kind: "category",
      title: definition.label,
      subtitle: `Show ${definition.label.toLowerCase()} tokens`,
      run: () => onSelectCategory(definition.key)
    }));
  }, [normalizedQuery, onSelectCategory]);

  const tokenItems = useMemo<CommandItem[]>(() => {
    const matchingTokens = tokens.filter((token) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        includesQuery(token.name, normalizedQuery) ||
        includesQuery(token.value, normalizedQuery) ||
        includesQuery(token.scope, normalizedQuery) ||
        token.atRules.some((atRule) => includesQuery(atRule, normalizedQuery))
      );
    });

    return matchingTokens.slice(0, normalizedQuery ? 18 : 8).map((token) => ({
      id: `token:${token.id}`,
      kind: "token",
      title: token.name,
      subtitle: `${categoryLabel(token.category)} · ${formatScopeLabel(token.scope)}`,
      value: token.value,
      run: () => onSelectToken(token)
    }));
  }, [normalizedQuery, onSelectToken, tokens]);

  const items = useMemo(() => [...actionItems, ...categoryItems, ...tokenItems], [actionItems, categoryItems, tokenItems]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
      return;
    }

    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [normalizedQuery]);

  useEffect(() => {
    if (activeIndex > items.length - 1) {
      setActiveIndex(Math.max(0, items.length - 1));
    }
  }, [activeIndex, items.length]);

  function runItem(item: CommandItem) {
    if ("disabled" in item && item.disabled) {
      return;
    }

    item.run();
    onOpenChange(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (items.length === 0 ? 0 : (current + 1) % items.length));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (items.length === 0 ? 0 : (current - 1 + items.length) % items.length));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const item = items[activeIndex];

      if (item) {
        runItem(item);
      }
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className={styles.commandPaletteContent} onKeyDown={handleKeyDown}>
        <VisuallyHidden>
          <Dialog.Title>Command palette</Dialog.Title>
          <Dialog.Description>Search tokens, jump between categories, and run workspace actions.</Dialog.Description>
        </VisuallyHidden>
        <Flex direction="column" gap="0">
          <div className={styles.commandPaletteSearchRow}>
            <TextField.Root
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Jump to a token, category, or action"
              autoFocus
              size="3"
              className={styles.commandPaletteInput}
            />
          </div>
          <Separator size="4" />
          <ScrollArea type="auto" scrollbars="vertical" className={styles.commandPaletteList}>
            <Flex direction="column" gap="4" p="3">
              {actionItems.length > 0 ? (
                <CommandGroup
                  title="Actions"
                  items={actionItems}
                  activeIndex={activeIndex}
                  allItems={items}
                  onHighlight={setActiveIndex}
                  onSelect={runItem}
                />
              ) : null}
              {categoryItems.length > 0 ? (
                <CommandGroup
                  title="Categories"
                  items={categoryItems}
                  activeIndex={activeIndex}
                  allItems={items}
                  onHighlight={setActiveIndex}
                  onSelect={runItem}
                />
              ) : null}
              {tokenItems.length > 0 ? (
                <CommandGroup
                  title="Tokens"
                  items={tokenItems}
                  activeIndex={activeIndex}
                  allItems={items}
                  onHighlight={setActiveIndex}
                  onSelect={runItem}
                />
              ) : null}
              {items.length === 0 ? (
                <Flex align="center" justify="center" className={styles.commandPaletteEmpty}>
                  <Text size="2" color="gray">
                    No matching commands.
                  </Text>
                </Flex>
              ) : null}
            </Flex>
          </ScrollArea>
          <Separator size="4" />
          <Flex align="center" justify="between" px="3" py="2" className={styles.commandPaletteFooter}>
            <Text size="1" color="gray">
              <Kbd>Enter</Kbd> run
            </Text>
            <Text size="1" color="gray">
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> move
            </Text>
            <Text size="1" color="gray">
              <Kbd>Esc</Kbd> close
            </Text>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

function CommandGroup({
  title,
  items,
  allItems,
  activeIndex,
  onHighlight,
  onSelect
}: {
  title: string;
  items: CommandItem[];
  allItems: CommandItem[];
  activeIndex: number;
  onHighlight: (index: number) => void;
  onSelect: (item: CommandItem) => void;
}) {
  return (
    <Flex direction="column" gap="2">
      <Text size="1" weight="medium" className={styles.commandPaletteGroupLabel}>
        {title}
      </Text>
      <Flex direction="column" gap="1">
        {items.map((item) => {
          const itemIndex = allItems.findIndex((candidate) => candidate.id === item.id);
          const isActive = itemIndex === activeIndex;
          const isDisabled = "disabled" in item && Boolean(item.disabled);

          return (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              color="gray"
              onMouseEnter={() => {
                if (itemIndex >= 0) {
                  onHighlight(itemIndex);
                }
              }}
              onFocus={() => {
                if (itemIndex >= 0) {
                  onHighlight(itemIndex);
                }
              }}
              onClick={() => onSelect(item)}
              disabled={isDisabled}
              className={`${styles.commandPaletteItem} ${isActive ? styles.commandPaletteItemActive : ""}`}
            >
              <Flex direction="column" align="start" gap="1" className={styles.commandPaletteItemBody}>
                <Flex align="center" justify="between" width="100%" gap="3">
                  <Text size="2" weight="medium">
                    {item.title}
                  </Text>
                  {"value" in item ? (
                    <Text size="1" color="gray" className={styles.commandPaletteValue}>
                      {item.value}
                    </Text>
                  ) : null}
                </Flex>
                <Text size="1" color="gray">
                  {item.subtitle}
                </Text>
              </Flex>
            </Button>
          );
        })}
      </Flex>
    </Flex>
  );
}
