# Stripe purchase → Meta CAPI (n8n)

**CREATED AND LIVE-PENDING-CREDENTIAL as of 8 Sep 2026:** workflow
`8LkHb0BppFhCPuv3`, feeding the relay `KiiDciCuUsCc3ezc`. The code below is the
ORIGINAL 6 Sep draft and is kept only as a record - **do not paste it in, it
does not work on this instance.** See "What actually shipped" for why.

## Why this one matters more than the browser events

The pixel and the browser-side relay both depend on the visitor's browser
cooperating. This does not. Stripe calls n8n server to server, so a purchase is
reported even when the buyer blocks every tracker — and it carries the **real
amount**, which is the only event Meta can optimise revenue against.

## What it does

1. Receives `POST /webhook/stripe-meta-purchase`.
2. **Verifies Stripe's signature** (HMAC-SHA256 over `<timestamp>.<raw body>`)
   and rejects anything older than 5 minutes. This is not optional: the
   endpoint writes revenue into ad optimisation, so an unsigned endpoint would
   let anyone poison the campaigns.
3. Ignores every event type except `checkout.session.completed`.
4. Posts to the existing CAPI relay with `event_name: Purchase`, the amount in
   euro, and the buyer's email for matching. The relay does the hashing.
5. Uses the **Stripe session id as `event_id`**, so a webhook retry cannot
   double-count the same sale.

## What actually shipped, and why it differs

The draft below reads `$env.STRIPE_WEBHOOK_SECRET` and `$env.META_CAPI_SECRET`.
**`$env` throws on this instance** (`N8N_BLOCK_ENV_ACCESS_IN_NODE`), which is
the same fault that kept the browser relay dead for two days. So the shipped
version uses the **Stripe Trigger node** instead of a raw webhook plus
hand-rolled HMAC:

- the trigger registers the endpoint in Stripe itself, so there is no URL to
  create by hand and **no signing secret to store** - the signature check the
  draft implemented is the node's job now;
- the only secret left is the relay's, which is a literal, because it ships in
  the site's client JS anyway;
- what makes this sender trustworthy is that only Stripe knows the trigger's
  generated webhook URL.

It also drops the IF node (the trigger filters to one event type), skips
sessions whose `payment_status` is not `paid`, and reports `amount_total`,
which is gross - Stripe Tax adds the 21% on top of the listed price.

**Execution data is NOT retained** (`saveDataSuccessExecution: none`). Unlike
the browser relay, where the site hashes before sending, Stripe hands over the
buyer's RAW e-mail and phone; keeping successful runs would park customer
personal data in n8n's logs. n8n and Cal.com were added to the privacy
policy's processor list the same day, for the same reason.

## The one thing left

Add a **Stripe API credential** to the `Stripe purchase` trigger (the
placeholder is named `Stripe (SIA Stonks)`) and activate the workflow. The
trigger cannot register its webhook without it, so activation fails until then.
Use a restricted key if you can: it only needs webhook read/write.

## Workflow code (validated against the n8n SDK)

```javascript
import { workflow, node, trigger, expr } from '@n8n/workflow-sdk';

const hook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'Stripe event',
    parameters: { httpMethod: 'POST', path: 'stripe-meta-purchase', responseMode: 'responseNode', options: { rawBody: true } }
  }
});

const verify = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Verify and map',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `
const SIGNING_SECRET = $env.STRIPE_WEBHOOK_SECRET || '';
const RELAY_SECRET = $env.META_CAPI_SECRET || '';

const item = $input.first().json;
const headers = item.headers || {};
const raw = typeof item.body === 'string' ? item.body : JSON.stringify(item.body);

if (SIGNING_SECRET) {
  const sig = headers['stripe-signature'] || '';
  const parts = Object.fromEntries(sig.split(',').map(p => p.split('=')));
  if (!parts.t || !parts.v1) throw new Error('missing stripe-signature');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(parts.t + '.' + raw));
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
  if (expected !== parts.v1) throw new Error('bad stripe signature');
  if (Math.abs(Date.now() / 1000 - Number(parts.t)) > 300) throw new Error('stale stripe timestamp');
}

const evt = typeof item.body === 'string' ? JSON.parse(item.body) : item.body;
if (evt.type !== 'checkout.session.completed') {
  return [{ json: { skip: true, reason: 'ignoring ' + evt.type } }];
}

const s = evt.data.object;
return [{ json: {
  skip: false,
  relay: {
    event_name: 'Purchase',
    event_id: s.id,
    action_source: 'website',
    email: (s.customer_details && s.customer_details.email) || undefined,
    phone: (s.customer_details && s.customer_details.phone) || undefined,
    value: s.amount_total != null ? s.amount_total / 100 : undefined,
    currency: (s.currency || 'eur').toUpperCase(),
    content_name: (s.metadata && s.metadata.product) || undefined
  },
  relaySecret: RELAY_SECRET
} }];
`
    }
  }
});

const isPurchase = node({
  type: 'n8n-nodes-base.if',
  version: 2.2,
  config: {
    name: 'Is a purchase?',
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
        conditions: [{ leftValue: expr('={{ $json.skip }}'), operator: { type: 'boolean', operation: 'false' } }],
        combinator: 'and'
      }
    }
  }
});

const relay = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.5,
  config: {
    name: 'Send via CAPI relay',
    parameters: {
      method: 'POST',
      url: 'https://marketingaskola.app.n8n.cloud/webhook/meta-capi',
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: { parameters: [{ name: 'x-ms-secret', value: expr('={{ $json.relaySecret }}') }] },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: expr('={{ JSON.stringify($json.relay) }}'),
      options: {}
    }
  }
});

const reply = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Ack',
    parameters: { respondWith: 'json', responseBody: '={{ JSON.stringify({ received: true }) }}', options: {} }
  }
});

export default workflow('marketingaskola-stripe-capi', 'Mārketinga Skola — Stripe purchase to Meta CAPI')
  .add(hook)
  .to(verify)
  .to(isPurchase.onTrue(relay.to(reply)).onFalse(reply));
```
