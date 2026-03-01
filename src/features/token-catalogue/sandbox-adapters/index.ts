import { getSandboxTailwindCss } from "@/features/token-catalogue/sandbox-tailwind";

export type SandboxAdapterKey = "tailwind";
export type SandboxAdapterOptionKey = SandboxAdapterKey | "radix" | "mantine" | "shadcn";

export type SandboxAdapterDefinition = {
  key: SandboxAdapterOptionKey;
  label: string;
  status: "available" | "planned";
  getRuntimeCss: () => Promise<string>;
};

const EMPTY_RUNTIME_CSS = "";

const sandboxAdapters: Record<SandboxAdapterOptionKey, SandboxAdapterDefinition> = {
  tailwind: {
    key: "tailwind",
    label: "Tailwind v4",
    status: "available",
    getRuntimeCss: getSandboxTailwindCss
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

export function getSandboxAdapterDefinition(key: SandboxAdapterKey) {
  return sandboxAdapters[key];
}

export function listSandboxAdapters() {
  return Object.values(sandboxAdapters);
}

export function isSandboxAdapterKey(value: string | null | undefined): value is SandboxAdapterKey {
  return value === "tailwind";
}
