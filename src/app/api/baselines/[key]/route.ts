import { NextResponse } from "next/server";
import { getBaselineSource, type BaselineKey } from "@/features/token-catalogue/workspace-baseline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    key: string;
  }>;
};

function isBaselineKey(value: string): value is BaselineKey {
  return value === "tailwind-default";
}

export async function GET(_request: Request, context: RouteContext) {
  const { key } = await context.params;

  if (!isBaselineKey(key)) {
    return NextResponse.json({ error: "Baseline not found." }, { status: 404 });
  }

  const baseline = await getBaselineSource(key);

  if (!baseline) {
    return NextResponse.json({ error: "Baseline unavailable." }, { status: 404 });
  }

  return NextResponse.json({
    baseline: {
      key: baseline.key,
      label: baseline.label,
      document: baseline.document
    }
  });
}
