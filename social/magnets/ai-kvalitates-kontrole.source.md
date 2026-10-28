
In my print-on-demand ecommerce project, the customer pays before the AI has made anything. They upload photos, write what they want, pay, and a printed product arrives in the post.

In a normal shop you see the picture and you get the picture. Here there's no picture until the money has moved, and the AI in the middle never does the same thing twice.

So a second AI marks the first one's homework, checking every result against the customer's own photos and brief. Below 85%, the work gets redone. After three failed tries, the money goes back on its own, **before the customer has written a single email.**

It works for anything an AI makes for customers: images, copy, transcripts, translations, tasks.

**What you'll have at the end:** a written definition of "good", a second AI that marks every result against it, a pass mark, a retry limit and a refund that fires by itself.

## What you need

- **The AI you already use** to make your product.
- **A second AI for the marking.** Any chat AI that reads images and text, like Claude or ChatGPT, will do for a test by hand.
- **A shop that takes payment first.** Mine runs on Shopify.
- **A spreadsheet** for the marks.
- **Time:** a weekend to set it up, then a week of watching.
- **Skill:** the checklist, prompts and pass mark need no coding. Running it on every order and the automatic refund need a developer (their notes are at the bottom).
- **Money:** each order runs the AI several times instead of once. That's why my customers pay first.

## How it works

Think of a classroom. The first AI is the student, the second is the teacher, and your definition of "good" is the marking sheet. Every piece of work gets a mark and a red-pen note saying exactly what's wrong. Below the pass mark, it goes back for another try. Three fails and the customer is refunded without asking.

The teacher isn't trusted on its own either. A person looks at the winner before anything moves, then the customer approves it, and a saved copy of what they said yes to can never be changed. **Every step that can get it wrong has a step after it that can catch it.**

<pre class="flow">  photos checked  ──▶  customer pays
         │
         ▼
  first AI makes several versions
         │
         ▼
  second AI marks each one against the photos and the brief
         │
         ├─ <b>85% or more</b> ──▶ a person looks ──▶ customer approves ──▶ print
         │
         └─ <b>below 85%</b> ──▶ try again with the red-pen notes, up to 3 times
                               │
                               ▼
                        still failing ──▶ <b>automatic refund</b>
</pre>

## Step 1: decide who pays when the AI gets it wrong

Most AI products give the making away (a free tier, a watermark, an upgrade button) and charge later. That works when the AI costs next to nothing.

Mine costs real money on every order. An AI reads every uploaded photo, the first AI makes several versions, the second marks each one, and the winner is blown up to four times its size, because print is far less forgiving than a screen.

Giving that away is a gift to people who'll never buy. So **the customer pays through Shopify before anything runs.** Free first, I'd pay for 100% of the people who click and win it back from the few who buy. Pay first, I pay for 100% of paying customers and 0% of everyone else. Every order pays for itself from the first one, with no investors needed.

<table>
  <tr><th></th><th>Free first (usual)</th><th>Pay first (mine)</th></tr>
  <tr><td>Who pays for the AI</td><td>You, for everyone</td><td>The customer, for themselves</td></tr>
  <tr><td>Cost of someone just looking</td><td>A full run</td><td>Nothing</td></tr>
  <tr><td>How hard it is to buy</td><td>Easy: try, then buy</td><td>Hard: buy, then see</td></tr>
  <tr><td>Where the work goes</td><td>More visitors</td><td>The order form and the guarantee</td></tr>
  <tr><td>What has to be excellent</td><td>The first wow</td><td>The reasons to trust you</td></tr>
  <tr><td>How it goes wrong</td><td>You run out of money</td><td>Refunds and reputation</td></tr>
</table>

The catch: buying before you see is a big ask, so the order form has to set expectations and collect enough for the AI to deliver. Take the money first and you owe a guarantee. The next seven steps are that guarantee.

**Done when:** you can say in one sentence who pays for a bad result.

## Step 2: write down what "good" means

"An AI checks the work" sounds solved. Checks it against what? Mine asks two separate questions, because the two ways this fails are unrelated.

<div class="cards">
  <div class="card"><h4>Does it match what they gave you?</h4><p>Does the person in the result match the customer's photos? There's evidence, so there's a right answer.</p></div>
  <div class="card"><h4>Does it do what they asked?</h4><p>Does the result include everything the brief asked for? This checks their words, and what they meant by them.</p></div>
</div>

A faithful likeness can ignore half the brief. A result can follow every instruction and look like somebody else. Different problems, different fixes, and one blended "quality score" can't tell you which to fix.

No photos in your product? The first question checks whatever evidence the customer gave you instead: their text, their recording, their notes.

**Done when:** you have two short lists, one per question, of what a result must get right.

## Step 3: make two versions and have a second AI mark them

Make at least two versions of every order (mine makes several). One result from an AI that never does the same thing twice is a coin flip you're asking the customer to accept.

Give each version, with the customer's photos and brief, to the second AI with this prompt. It isn't my production prompt word for word, but it asks for the same three things: two separate marks and a critique.

```
You are checking another AI's work before a paying customer sees it.

You get:
- THE CUSTOMER'S PHOTOS
- THE CUSTOMER'S BRIEF, in their own words
- THE RESULT the other AI made

Answer two questions separately. Never blend them into one score.

MATCHES THE PHOTOS: does the result match what is in the customer's photos?
Give a percentage, where 100% is a perfect match.

FOLLOWS THE BRIEF: does the result do everything the brief asked for?
Give a percentage, where 100% means nothing was missed or ignored.

Then write a short critique in plain language: what exactly is wrong,
and under which question. Be specific enough that the next attempt
can fix it. Do not tell me whether you like it.
```

Log both marks and the critique next to the order. **Don't act on them yet.**

**Done when:** every new order has two marks and a critique in the spreadsheet.

## Step 4: watch the marks for a week, then pick your pass mark

For a week, judge every result yourself next to its marks. That's where your pass mark comes from, not from a blog post, mine included.

Mine is 85%. It didn't come from a formula. I chose it for what it does:

- **Too low,** say 60, and mediocre work passes on its own. The person at the end becomes the only real filter, and you've built an expensive diary.
- **Too high,** say 97, and almost nothing passes. You burn three tries on fine orders, refund customers who'd have been happy, and the retries eat the margin charging first was meant to protect.
- **At 85,** I can show a passing result to a person without hedging, and a retry stays the exception.

<div class="callout">
  <p><b>The pass mark is a business decision dressed up as a technical one.</b> It sets how much risk lands on the customer and how much you'll spend to avoid it. Change it when reality argues.</p>
</div>

**Done when:** your pass mark and your reason are written down.

## Step 5: send failures back with the red-pen notes

A failing mark is more useful than a passing one, because it comes with a reason. So don't just press the button again. Hand the AI its own marked homework:

```
Make this again. Your last attempt was marked below the pass mark.

What the customer gave you:
[the photos and the brief]

The critique of your last attempt:
[paste the critique]

What has scored well and badly on similar orders before:
[paste your notes, if you have them]

Fix exactly what the critique names.
```

A useful critique sounds like "missing element X from the spec; likeness drifts on the upper face". Specific enough to fix.

Keep every attempt, good and bad, with its mark. Mine feeds that record into future prompts automatically, so the next similar order doesn't repeat the failure. The no-code version is a running note you paste in. A bad result stops being money on fire and becomes a lesson. The AI models will be replaced. That record only gets more valuable.

**Done when:** failed results go back with their critique, and your notes grow after every order.

## Step 6: stop at three tries and refund automatically

<p class="stat">3 failed tries → automatic refund</p>

Not a support ticket. Not "contact us within 14 days". After three tries below the pass mark, the money goes back by itself, before the customer has to email anyone.

Charging before you deliver is only fair if you build the way out. If every refund runs through a person with a reason to say no, you haven't built a business, you've built a complaint queue.

<table>
  <tr><th>Refund</th><th>Who has to act</th><th>What the customer feels</th></tr>
  <tr><td>Standard policy</td><td>The customer notices, writes in and argues</td><td>Friction, exactly when they're already unhappy</td></tr>
  <tr><td>Generous policy</td><td>The customer still asks, you say yes quickly</td><td>Better, but it's still their job</td></tr>
  <tr class="hl"><td>Automatic</td><td>The system, on its own, at the third try</td><td>Refunded before they thought to ask</td></tr>
</table>

The cap also limits what one broken order can cost: three tries and it stops. It keeps you honest too: if the refund fires often, the AI is bad, and no reassuring copy will fix that.

Switch the refund on **before** you tell anyone the guarantee exists. Your developer builds this one.

**Done when:** a test order that fails three times refunds itself, and nobody touched it.

## Step 7: check the photos before they pay

The cheapest failure is the one that never starts. No marking turns a blurry photo taken from behind into a good result, so my shop checks photos **before the customer pays**:

- **The angle.** Can the AI actually work from it? If not, the photo is turned away early, with a reason.
- **The face.** Is it clearly visible? Without it, "does it match" can't be answered.
- **The one-tap question.** One detail is spotted and then asked about: keep it or not?

That last one is my favourite part, and it isn't technical at all. The detail changes whether the person in the result reads as themselves, and there's no right default. Guessing gets it wrong roughly half the time. Asking gets it right every time and costs one tap. **When the customer can answer better than the system can guess, ask.**

"This photo won't work, here's why" feels like care before paying, and like a bait and switch after.

No photos? Check whatever makes a good result impossible, like missing information, while the customer can still fix it for free.

**Done when:** a bad photo is turned away, with a reason, before the checkout.

## Step 8: keep a person, and the customer, at the end

The marking catches wrong. It doesn't catch tasteless. So a person looks at the winner before anything moves. That isn't a step waiting to be automated away. It's where the judgement comes from.

Then the customer approves it through a private link that stops working after a while, no account, no password. Their yes saves a copy of exactly what they approved, which can never be edited. That settles "that's not what I signed off on" before it starts. Their photos are deleted automatically once the order no longer needs them.

**Done when:** nothing is printed without a person's look and the customer's yes, and you can show any customer exactly what they approved.

## Where it goes wrong

- **Checking a machine that doesn't work.** A filter can't add quality that was never made. If the first AI is weak, you've built an expensive way to learn that three times per order. Make it good first, then add the checker.
- **Mistaking the mark for taste.** An 85 stands in for quality, it isn't quality. There will be results that score 90 and look lifeless, and ones that score 80 and are the best thing the system made that week.
- **Sending the same order twice.** Retries and impatient double clicks will eventually try to send one order to the print company twice. Without a lock, that's two products shipped for one payment.
- **Promising the ambitious number.** My delivery promise launched at 24 hours and is now 48. Nothing got slower. The honest number was 48, the ambitious one 24, and reality voted.
- **Faking the proof.** My reviews section stays empty until there are real reviews. Fake one, and every other guarantee on the page becomes something to take on faith.

## Start here today

Don't build anything yet. Write the two lists from step 2. Paste one result you've already delivered into Claude or ChatGPT, with its brief and the prompt from step 3, and log the marks next to your own opinion. Do it for every order this week, and you'll know whether the marks agree with you, and roughly where your pass mark sits.

How the product itself was built, change by change, is in [the full log of iterations on this AI product](/blog/ecommerce-business-built-with-claude).

<details>
<summary>For your developer: the pipeline, the scoring and the trust mechanics</summary>

### The whole path, from card charged to print file

<pre class="flow">  <b>SHOPIFY CHECKOUT</b>   money moves first
       │            order webhook · customer photos · written spec
       ▼
  <b>PHOTO QUALITY GATE</b>   <i>(runs pre-purchase)</i>
       │            angle · face visibility · one-tap question
       ▼
  <b>GENERATE × N</b>   several candidate renders per order
       │            prompt assembled from: spec + photo analysis
       │            + <i>prompt learning history for this product line</i>
       ▼
  <b>REVIEW LAYER</b>   a second model marks each candidate
       │            ├─ compare render ⟷ uploaded photos   → likeness score
       │            ├─ compare render ⟷ written spec      → adherence score
       │            └─ write a critique in plain language
       │
       ├─ score <b>&lt; 85%</b> ──▶ <i>REGENERATE</i>, feeding the model its own
       │                        critique back in as correction
       │                        ↑                            │
       │                        └────── up to 3 attempts ─────┘
       │                                      │
       │                                      ▼
       │                            <b>AUTO-REFUND</b>  no email required
       │
       └─ score <b>≥ 85%</b> ──▶ best render <i>auto-flagged as winner</i>
       │
       ▼
  <b>HUMAN CURATION</b>   a person looks at it before anything moves
       │            the model has no taste; this step supplies it
       ▼
  <b>CUSTOMER APPROVAL</b>   HMAC-signed expiring link
       │            approval writes an <i>immutable snapshot</i>
       ▼
  <b>4× UPSCALE → PRINT PROVIDER</b>
                  atomic lock: one order can never be pushed twice
</pre>

Read that top to bottom and you can see the design principle: **every step that can produce a wrong answer has a step after it that can catch the wrong answer.** Generation is checked by review. Review is checked by a human. The human is checked by the customer. The customer's approval is checked by an immutable record of exactly what they approved.

### The scoring rubric

<table>
  <tr><th>Axis</th><th>Compared against</th><th>Failure it catches</th><th>Correction it implies</th></tr>
  <tr><td>Likeness</td><td>Customer's uploaded photos</td><td>Wrong face, drifted features, lost identity</td><td>Strengthen photo conditioning, re-weight reference</td></tr>
  <tr><td>Adherence</td><td>Customer's written spec</td><td>Missing or ignored requested elements</td><td>Restate the spec explicitly in the next prompt</td></tr>
</table>

### What happens below threshold

<pre class="flow">  attempt 1  ──▶  score: <b>below threshold</b>
                  critique: <i>"missing element X from the spec;
                             likeness drifts on the upper face"</i>
                       │
                       ▼
  attempt 2  ◀── prompt = original spec
                       + photo analysis
                       + <b>critique of attempt 1</b>
                       + <i>prompt learning history</i>
                       │
                       ▼
                  score: <b>below threshold</b> ──▶ attempt 3
                       │
                       ▼
                  still failing ──▶ <b>AUTOMATIC REFUND</b>
</pre>

### Immutable approval snapshots

When a customer approves a render, the system writes a record of exactly what they approved and that record does not change afterwards. Not the current state of the order — the state at the moment of approval, frozen.

This resolves the single nastiest dispute class in custom manufacturing: *"that is not what I signed off on."* With a mutable order record, that argument is unwinnable by either side, because the record now reflects everything that happened since. With a snapshot, there is one artifact both parties agreed on and it still exists in the form it had when they agreed.

### HMAC-signed expiring links

The approval step happens over a link. That link shows someone's photos and their render, so it cannot be a guessable URL sitting on the open internet for ever.

- **Signed** — the link carries an HMAC, so a tampered or invented URL fails verification instead of loading someone else's order.
- **Expiring** — access is bounded in time. A link that leaks a year from now is already dead.

No accounts, no passwords, no login flow standing between a customer and approving their own order — and still not a public URL. That combination is why signed expiring links are worth the small amount of work they take.

### Photos are auto-deleted

Customer photos are inputs, not inventory. Once the pipeline no longer needs them, they are deleted automatically. Nobody has to remember to run a cleanup, and the retention window is not a promise in a privacy policy that depends on somebody's diligence — it is behaviour of the system.

### The duplicate-push guard

A duplicate-push guard: an atomic lock ensuring the same order can never be pushed to the print provider twice. Retries, webhook replays and impatient clicks all try to do this eventually. Without the lock, the failure mode is two physical objects manufactured and shipped for one payment — an error that costs real money and cannot be undone with a database rollback.

### The full trust checklist

It applies to anything you sell that can fail in front of a customer — generated media, generated copy, transcription, translation, agents acting on someone's behalf.

1. **Decide who pays for failure before you launch.** Free-first puts the cost of every bad output on you. Purchase-first puts it on the customer unless you build a way out. Both are valid. Choosing by accident is not.
2. **Gate the inputs before you take the money.** Check the things that make good output impossible — resolution, angle, visibility, missing information — while the customer can still fix them for free.
3. **Ask about ambiguities instead of guessing.** Any detail where you would be right about half the time, and the customer would be right every time, is a question, not a default.
4. **Generate more than one candidate.** A single sample from a non-deterministic process is a coin flip you are asking the customer to accept.
5. **Score every candidate against the customer's own inputs.** Not against a vibe. Against the evidence they uploaded and the words they wrote.
6. **Split the score into independent axes.** Fidelity to evidence and adherence to instructions fail separately and are fixed separately. A blended number tells you nothing actionable.
7. **Pick an auto-pass threshold on purpose, and write down why.** It is a risk decision, not a measurement. Revisit it when reality argues.
8. **Make failures produce a critique, not just a rejection.** A score without a reason cannot drive a correction.
9. **Feed the critique back into the retry.** The cheapest improvement available is the model reading its own marked homework.
10. **Store good and bad attempts and use them on future work.** This is what turns a cost centre into a compounding asset.
11. **Cap the retry loop with a number, not with judgement.** Unbounded retries are an unbounded compute bill and an unbounded wait for the customer.
12. **Automate the refund at the cap.** Before the customer asks. The burden of a failure belongs on the system that failed.
13. **Keep a human before fulfilment.** Scoring catches wrongness. It does not catch tastelessness.
14. **Get explicit customer approval before anything irreversible.** Printing, sending, publishing, purchasing — anything you cannot take back.
15. **Snapshot the approval immutably.** Store what they agreed to, exactly as it was, so no dispute turns on memory.
16. **Sign and expire every link that shows private content.** Unguessable is not the same as unauthorised.
17. **Delete customer inputs automatically once you are done with them.** Retention should be a system behaviour, not a good intention.
18. **Put an atomic lock on every irreversible external action.** Retries and replays will eventually fire it twice. Assume they will.
19. **Do not fake social proof.** Empty is more credible than invented, and it costs you nothing but patience.
20. **Promise the timeline you can actually hit.** Mine launched at 24 hours and was revised to 48 once reality voted. Changing the promise to match the truth is cheaper than missing it repeatedly.

<div class="callout">
  <p><b>If you implement three of these, implement 5, 9 and 12.</b> Score the output against the customer's own inputs, feed the critique back into the retry, and refund automatically at the cap. That is the minimum viable version of everything above.</p>
</div>

</details>
