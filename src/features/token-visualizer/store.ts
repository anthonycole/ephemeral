"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { TokenCategory } from "@/lib/design-tokens";
import { addDocumentToken, importCssDocument, normalizeTokenDocument, serializeDocumentToCss, updateDocumentToken, type TokenDocument } from "@/features/token-visualizer/document";
import {
  addGoogleFontImportToDocument,
  normalizeGoogleFontFamily,
  removeGoogleFontImportFromDocument,
  removeGoogleFontImportFromCss,
  upsertGoogleFontImportInCss
} from "@/features/token-visualizer/font-utils";
import { SAMPLE_CSS, SAMPLE_DOCUMENT } from "@/features/token-visualizer/sample-workspace";

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
  createToken: (token?: Partial<{ name: string; value: string; category: Exclude<TokenCategory, "all"> }>) => string;
  addGoogleFontImport: (family: string) => void;
  removeGoogleFontImport: (family: string) => void;
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
        const document = importCssDocument(get().editorCss, get().document);
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
      createToken: (tokenInput) => {
        const currentDocument = get().document;
        const { document, token } = addDocumentToken(currentDocument, tokenInput);
        const nextCss = serializeDocumentToCss(document);

        set({
          document,
          editorCss: nextCss,
          generatedCss: nextCss,
          activeCategory: token.category,
          selectedTokenId: token.sourceId
        });

        return token.sourceId;
      },
      addGoogleFontImport: (family) => {
        const normalizedFamily = normalizeGoogleFontFamily(family);

        if (!normalizedFamily) {
          return;
        }

        const document = addGoogleFontImportToDocument(get().document, normalizedFamily);
        const editorCss = upsertGoogleFontImportInCss(get().editorCss, normalizedFamily);

        set({
          document,
          editorCss,
          generatedCss: serializeDocumentToCss(document)
        });
      },
      removeGoogleFontImport: (family) => {
        const normalizedFamily = normalizeGoogleFontFamily(family);

        if (!normalizedFamily) {
          return;
        }

        const document = removeGoogleFontImportFromDocument(get().document, normalizedFamily);
        const editorCss = removeGoogleFontImportFromCss(get().editorCss, normalizedFamily);

        set({
          document,
          editorCss,
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
