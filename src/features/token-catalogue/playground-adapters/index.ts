import { getPlaygroundTailwindCss } from "@/features/token-catalogue/playground-tailwind";

export type PlaygroundAdapterKey = "tailwind";
export type PlaygroundAdapterOptionKey = PlaygroundAdapterKey | "radix" | "mantine" | "shadcn";

export type PlaygroundAdapterDefinition = {
  key: PlaygroundAdapterOptionKey;
  label: string;
  status: "available" | "planned";
  getRuntimeCss: () => Promise<string>;
};

const EMPTY_RUNTIME_CSS = "";

const playgroundAdapters: Record<PlaygroundAdapterOptionKey, PlaygroundAdapterDefinition> = {
  tailwind: {
    key: "tailwind",
    label: "Tailwind v4",
    status: "available",
    getRuntimeCss: getPlaygroundTailwindCss
  },
  radix: {
    key: "radix",
    label: "Radix",
    status: "planned",
    getRuntimeCss: async () => EMPTY_RUNTIME_CSS
  },
  mantine: {
    key: "mantine",
    label: "Mantine",
    status: "planned",
    getRuntimeCss: async () => EMPTY_RUNTIME_CSS
  },
  shadcn: {
    key: "shadcn",
    label: "shadcn/ui",
    status: "planned",
    getRuntimeCss: async () => EMPTY_RUNTIME_CSS
  }
};

export function getPlaygroundAdapterDefinition(key: PlaygroundAdapterKey) {
  return playgroundAdapters[key];
}

export function listPlaygroundAdapters() {
  return Object.values(playgroundAdapters);
}

export function isPlaygroundAdapterKey(value: string | null | undefined): value is PlaygroundAdapterKey {
  return value === "tailwind";
}
