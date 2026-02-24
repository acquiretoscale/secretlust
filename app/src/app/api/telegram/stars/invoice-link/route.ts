import { NextResponse } from "next/server";
import { createStarsInvoiceLink } from "@/lib/telegram/botApi";
import { getPlan } from "@/lib/telegram/creditPlans";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as null | { planId?: string; templateTitle?: string };
    const planId = body?.planId;
    if (!planId) return NextResponse.json({ error: "Missing planId" }, { status: 400 });

    const plan = getPlan(planId);
    if (!plan) return NextResponse.json({ error: "Unknown planId" }, { status: 400 });

    const payload = `sl:${plan.id}:${Date.now()}`; // <= 128 bytes
    const title = "SecretLust Credits";
    const description = body?.templateTitle
      ? `Buy ${plan.credits.toLocaleString()} credits (template: ${body.templateTitle})`
      : `Buy ${plan.credits.toLocaleString()} credits`;

    const url = await createStarsInvoiceLink({
      title,
      description,
      payload,
      prices: [{ label: `${plan.credits.toLocaleString()} credits`, amount: plan.stars }],
    });

    return NextResponse.json({ url, stars: plan.stars, credits: plan.credits });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

