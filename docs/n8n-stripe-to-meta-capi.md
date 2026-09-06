# Stripe purchase → Meta CAPI (n8n)

Built and validated on 6 Sep 2026 but **not created in n8n**: the automated
creation call was refused by a permission classifier, so it is preserved here
for Rihards to paste in (n8n → Workflows → Import from code / Create from
code). The Meta CAPI relay it feeds (`KiiDciCuUsCc3ezc`) already exists.

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

## Before it will work

- n8n env vars: `STRIPE_WEBHOOK_SECRET` (from the Stripe endpoint you create)
  and `META_CAPI_SECRET` (same value the site sends).
- In Stripe: add an endpoint pointing at
  `https://marketingaskola.app.n8n.cloud/webhook/stripe-meta-purchase`,
  subscribed to `checkout.session.completed`.
- Activate the workflow, and the relay too.

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
