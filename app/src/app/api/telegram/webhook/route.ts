import { NextResponse } from "next/server";
import { answerPreCheckoutQuery, sendMessage, type TelegramUpdate } from "@/lib/telegram/botApi";
import { getPlan } from "@/lib/telegram/creditPlans";

declare global {
  // eslint-disable-next-line no-var
  var __secretlustProcessedPayments: Set<string> | undefined;
}

const processed = globalThis.__secretlustProcessedPayments ?? new Set<string>();
globalThis.__secretlustProcessedPayments = processed;

function isAuthorized(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return true; // allow local/dev if not configured
  const got = req.headers.get("x-telegram-bot-api-secret-token");
  return got === secret;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const update = (await req.json().catch(() => null)) as TelegramUpdate | null;
  if (!update) return NextResponse.json({ ok: true });

  if (update.pre_checkout_query) {
    await answerPreCheckoutQuery({ preCheckoutQueryId: update.pre_checkout_query.id, ok: true });
    return NextResponse.json({ ok: true });
  }

  const sp = update.message?.successful_payment;
  if (sp && update.message?.chat?.id) {
    const paymentId = sp.telegram_payment_charge_id;
    if (!processed.has(paymentId)) {
      processed.add(paymentId);

      const parts = sp.invoice_payload.split(":");
      const planId = parts.length >= 2 ? parts[1] : "";
      const plan = getPlan(planId);

      const credits = plan?.credits ?? 0;
      const note =
        credits > 0
          ? `Payment received. Added ${credits.toLocaleString()} credits to your Telegram account.\n\n(Website sync will be added next.)`
          : `Payment received. (Could not parse plan from payload: ${sp.invoice_payload})`;

      await sendMessage({ chatId: update.message.chat.id, text: note });
      // TODO: Persist credits & processed payment IDs in a DB (Mongo/Supabase) for real idempotency across serverless instances.
    }
  }

  return NextResponse.json({ ok: true });
}

