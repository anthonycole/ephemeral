"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { TokenCategory } from "@/lib/design-tokens";
import { importCssDocument, normalizeTokenDocument, serializeDocumentToCss, updateDocumentToken, type TokenDocument } from "@/features/token-visualizer/document";

const SAMPLE_CSS = `:root {
  --color-primary-500: #2563eb;
  --color-surface: #ffffff;
  --color-text: #101828;
  --space-1: 0.25rem;
  --space-4: 1rem;
  --radius-md: 0.5rem;
  --shadow-card: 0 8px 24px rgba(16, 24, 40, 0.12);
  --font-size-body: 1rem;
  --font-weight-semibold: 600;
  --size-container-md: 48rem;
  --motion-fast: 150ms;
  --z-index-popover: 1200;
  --opacity-muted: 0.64;
  --breakpoint-lg: 1024px;
}`;

const SAMPLE_DOCUMENT = importCssDocument(SAMPLE_CSS);

type TokenStoreState = {
  document: TokenDocument;
  editorCss: string;
  generatedCss: string;
  activeCategory: TokenCategory;
  searchQuery: string;
  selectedTokenId: string | null;
  replaceWorkspace: (workspace: { document: TokenDocument; editorCss: string }) => void;
  setEditorCss: (value: string) => void;
  importEditorCss: () => void;
  setActiveCategory: (value: TokenCategory) => void;
  setSearchQuery: (value: string) => void;
  setSelectedTokenId: (value: string | null) => void;
  updateToken: (tokenId: string, updates: Partial<{ name: string; value: string; category: Exclude<TokenCategory, "all"> }>) => void;
  resetToSample: () => void;
};

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

export const useTokenStore = create<TokenStoreState>()(
  persist(
    (set, get) => ({
      document: SAMPLE_DOCUMENT,
      editorCss: SAMPLE_CSS,
      generatedCss: serializeDocumentToCss(SAMPLE_DOCUMENT),
      activeCategory: "all",
      searchQuery: "",
      selectedTokenId: null,
      replaceWorkspace: ({ document: rawDocument, editorCss }) => {
        const document = normalizeTokenDocument(rawDocument);
        set({
          document,
          editorCss,
          generatedCss: serializeDocumentToCss(document),
          selectedTokenId: null
        });
      },
      setEditorCss: (value) => {
        set({ editorCss: value });
      },
      importEditorCss: () => {
        const document = importCssDocument(get().editorCss);
        set({
          document,
          generatedCss: serializeDocumentToCss(document),
          selectedTokenId: null
        });
      },
      setActiveCategory: (value) => {
        set({ activeCategory: value });
      },
      setSearchQuery: (value) => {
        set({ searchQuery: value });
      },
      setSelectedTokenId: (value) => {
        set({ selectedTokenId: value });
      },
      updateToken: (tokenId, updates) => {
        const document = updateDocumentToken(get().document, tokenId, updates);
        set({
          document,
          generatedCss: serializeDocumentToCss(document)
        });
      },
      resetToSample: () => {
        set({
          document: SAMPLE_DOCUMENT,
          editorCss: SAMPLE_CSS,
          generatedCss: serializeDocumentToCss(SAMPLE_DOCUMENT),
          activeCategory: "all",
          searchQuery: "",
          selectedTokenId: null
        });
      }
    }),
    {
      name: "token-visualizer-session",
      version: 3,
      storage: createJSONStorage(() => (typeof window === "undefined" ? noopStorage : sessionStorage)),
      partialize: (state) => ({
        activeCategory: state.activeCategory,
        searchQuery: state.searchQuery
      }),
      migrate: (persistedState) => {
        const state = persistedState as Partial<TokenStoreState> | undefined;

        if (!state) {
          return {} as Partial<TokenStoreState>;
        }

        return {
          activeCategory: state.activeCategory ?? "all",
          searchQuery: state.searchQuery ?? ""
        } as Partial<TokenStoreState>;
      }
    }
  )
);
