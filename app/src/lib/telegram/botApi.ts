import "server-only";

type TelegramApiResult<T> = { ok: true; result: T } | { ok: false; error_code: number; description: string };

export type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; username?: string; first_name?: string; last_name?: string };
    chat: { id: number; type: string };
    successful_payment?: {
      currency: string;
      total_amount: number;
      invoice_payload: string;
      telegram_payment_charge_id: string;
      provider_payment_charge_id?: string;
    };
  };
  pre_checkout_query?: {
    id: string;
    from: { id: number; username?: string; first_name?: string; last_name?: string };
    currency: string;
    total_amount: number;
    invoice_payload: string;
  };
};

export type TelegramLabeledPrice = { label: string; amount: number };

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function tgCall<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const token = requireEnv("TELEGRAM_BOT_TOKEN");
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as TelegramApiResult<T>;
  if (!("ok" in json) || !json.ok) {
    const err = json as Exclude<typeof json, { ok: true; result: T }>;
    throw new Error(`Telegram API error calling ${method}: ${err.error_code} ${err.description}`);
  }
  return json.result;
}

export async function createStarsInvoiceLink(args: {
  title: string;
  description: string;
  payload: string;
  prices: TelegramLabeledPrice[];
}): Promise<string> {
  // Stars payments: currency must be XTR, provider_token must be omitted.
  return tgCall<string>("createInvoiceLink", {
    title: args.title,
    description: args.description,
    payload: args.payload,
    currency: "XTR",
    prices: args.prices,
  });
}

export async function answerPreCheckoutQuery(args: { preCheckoutQueryId: string; ok: boolean; errorMessage?: string }) {
  return tgCall<boolean>("answerPreCheckoutQuery", {
    pre_checkout_query_id: args.preCheckoutQueryId,
    ok: args.ok,
    error_message: args.errorMessage,
  });
}

export async function sendMessage(args: { chatId: number; text: string }) {
  return tgCall<{ message_id: number }>("sendMessage", {
    chat_id: args.chatId,
    text: args.text,
    disable_web_page_preview: true,
  });
}

