

I built a print-on-demand ecommerce project with Claude, on the side. A customer sends what the AI needs, a model makes the product from it, and it gets printed and shipped.

If you'd asked me what I spent the build on, I'd have said the AI. Sincerely. Then I counted my log, where I'd written down every change the day I shipped it.

<p class="stat">4 of 25</p>

Twenty-five changes, and four were about the AI. It was good enough to sell within the first handful. The other twenty-one were orders, revisions, refunds, legal wording, print quality, and stopping the same order going to the printer twice.

In an AI product, the AI is the easy part. Running the business around it is the work. There are no revenue figures here: the point doesn't need them, and I won't make them up.

**What you'll have at the end:** a simple build log you fill in two minutes at a time, the habit of counting it so you see where your work really goes, and a checklist of the unglamorous work to plan for before you build anything with AI in it.

## What you need

- **Notion** (free), or any spreadsheet. One table, four columns.
- **Claude or ChatGPT**, only for the planning checklist in step 5. Optional.
- **Time:** a few minutes to set up. After that, under two minutes each time you change something.
- **Skill:** none. If you can fill in a table, you can do this.
- **Money:** nothing.

## How it works

Think of a food diary.

Most people are sure they know what they eat. Then they write down every meal for a month, and the diary tells a different story. Memory tidies things up.

A build log is a food diary for your business. Every time you change something, you add one row: a number, one category, what you changed, and why. Every ten rows, you count the categories. No single row teaches you much. The count does.

The timing is the whole trick. Written on the day, the "why" holds the real reason: the order that broke, the customer who asked. Written a month later, it's a neat story where everything was part of a plan. More flattering, and useless.

## My full log, all 25 changes

In the order they shipped. <span class="hl">The highlighted rows are the four AI ones.</span> The categories are explained in step 2.

<table>
<thead>
<tr><th>#</th><th>Category</th><th>What changed</th><th>Why</th></tr>
</thead>
<tbody>
<tr><td>01</td><td>UX</td><td>Landing page launch</td><td>Somewhere to send visitors and test demand.</td></tr>
<tr><td>02</td><td>UX</td><td>Design polish for readability</td><td>Readable to me and nobody else. Line length and contrast, not looks.</td></tr>
<tr><td>03</td><td>Legal/IP</td><td>Rewrote the copy in its own words</td><td>It leaned on terms the business had no right to use.</td></tr>
<tr><td>04</td><td>UX</td><td>Step-by-step order form</td><td>One long form asked for everything at once. People gave up.</td></tr>
<tr><td>05</td><td>Integration</td><td>Connected Shopify</td><td>Stop building checkout. Shopify already handles payment, tax and refunds.</td></tr>
<tr><td>06</td><td>Integration</td><td>Connected Printify</td><td>Stop being the printer. Orders go into a print network.</td></tr>
<tr><td>07</td><td>UX</td><td>Offer a second and third art style</td><td>People who had already paid wanted another version.</td></tr>
<tr><td>08</td><td>Fulfilment</td><td>Fixed the shipping address step</td><td>Wrong moment, wrong shape: the surest way to an undeliverable parcel.</td></tr>
<tr><td>09</td><td>Order state</td><td>A proper process for revisions</td><td>Change requests lived in email and in my head.</td></tr>
<tr><td>10</td><td>UX</td><td>Admin screen sorted by stage</td><td>I needed to see where each order was stuck.</td></tr>
<tr class="hl"><td>11</td><td><span class="hl">AI</span></td><td>AI review layer</td><td>A technically fine image can still be obviously wrong.</td></tr>
<tr class="hl"><td>12</td><td><span class="hl">AI</span></td><td>Input quality check</td><td>Bad input, bad result, and the customer blames the result.</td></tr>
<tr><td>13</td><td>Order state</td><td>Approval freezes a copy</td><td>The approved version must be exactly what prints.</td></tr>
<tr class="hl"><td>14</td><td><span class="hl">AI</span></td><td>Print-ready file after approval</td><td>Fine on a screen, not good enough in print.</td></tr>
<tr><td>15</td><td>Edge case</td><td>Stopped double orders to the printer</td><td>A retry or a double click could send the same order twice. Each duplicate is a real object that costs money.</td></tr>
<tr class="hl"><td>16</td><td><span class="hl">AI</span></td><td>Known-defect detection</td><td>One specific mistake in the generated images kept repeating.</td></tr>
<tr><td>17</td><td>Integration</td><td>One-click Shopify status sync</td><td>Two systems disagreeing on "fulfilled" is how you get a support ticket.</td></tr>
<tr><td>18</td><td>UX</td><td>Group orders for 3–4 people</td><td>Asked for repeatedly. A product decision, not a prompt change.</td></tr>
<tr><td>19</td><td>UX</td><td>New collections</td><td>More reasons to choose, and to come back.</td></tr>
<tr><td>20</td><td>Fulfilment</td><td>48-hour delivery promise, revised down from 24</td><td>The 24-hour promise was true on a good day and a liability on a normal one.</td></tr>
<tr><td>21</td><td>Order state</td><td>A refund exit</td><td>Some orders should end, not sit in the queue forever.</td></tr>
<tr><td>22</td><td>Fulfilment</td><td>Personalised insert card</td><td>Feels made for the buyer, not generated. Cheap to add, big effect.</td></tr>
<tr><td>23</td><td>UX</td><td>Better emails</td><td>While the customer waits, the emails are the product.</td></tr>
<tr><td>24</td><td>Fulfilment</td><td>Switched to a cheaper print provider</td><td>Same output, better margins. New sizes, colours and lead times to learn.</td></tr>
<tr><td>25</td><td>Print quality</td><td>Print edge settings</td><td>The difference between a finished product and a cropped one.</td></tr>
</tbody>
</table>

## What the count showed

<pre class="flow">UX            <b>████████</b>  8
Fulfilment    <b>████</b>      4
<i>AI</i>            <b>████</b>      4
Integration   <b>███</b>       3
Order state   <b>███</b>       3
Legal/IP      <b>█</b>         1
Print quality <b>█</b>         1
Edge case     <b>█</b>         1
</pre>

The AI is 16% of the work on an AI product.

Add up fulfilment, order state, integration, print quality and the edge case, and you get 12 of 25. Nearly half the log is getting an order safely from A to B. Even the UX pile isn't soft work: the order form, the admin screen and group orders changed how the business runs, not how it looks.

What's missing says even more. There's no "switched the AI model" row. No "rewrote the prompt" row. I expected those to fill the log. They're not there.

The "build an AI business in 30 days" plans aren't lying. They describe changes 01 to 06 accurately and then stop, because that's where the interesting-looking part ends. You can't see change 15 from change 06.

One honest caveat: this is one product, one person, one year, and the categories are mine. Move the boundaries and the percentages move. The plumbing outweighing the AI doesn't.

## The four AI changes, in plain words

I counted a change as AI only if it changed what the model does or what reaches it. Two calls are debatable: group orders (18) and the provider switch (24). Count those differently and you get five or three. The point survives.

**The review layer (11).** "Generated" and "good enough" are different questions. An image can be clean and on-brief and still look wrong to a person in half a second. So a model checks every result first, and each bad one it catches is a revision that never happens. It's the only one of the four that makes the AI better, not just safer to run. It has [its own article](/blog/ai-review-layer).

**The input check (12).** Bad input, bad result, and the customer blames the result. So what they send gets checked, and if it won't work, the customer is asked for something better. People take that far better before they've seen a disappointing result.

**The print-ready file (14).** What looks perfect on screen isn't ready for print, and no better prompt fixes that. So a separate step prepares the print file. It runs after approval, so only the approved version gets prepared.

**The known-defect check (16).** One specific mistake in the images came back often enough to get a name. Now the system catches it before a customer sees it. That's where AI work goes as a product grows up: not "make the model better" but "list the known failures and catch each one". It looks like quality control, not machine learning.

<div class="callout">
  <p>Three of the four AI changes are checks around the AI. Only one improves the AI itself.</p>
</div>

## Step 1: make the table

Make a table in Notion or a spreadsheet with four columns: the number, the category, what changed, and why. Or paste this whole block into a Notion page and build from it:

<pre><code><b>ITERATION LOG</b>

Columns:
  #            sequential number
  Category     one of: UX | integration | fulfilment | legal/IP |
               print quality | order state | edge case | AI
               (swap the middle ones for your product's reality)
  What it was  one line, plain language
  Why          the trigger. What broke, who asked, what it cost.

Rule:  log it the day you ship it. Never reconstruct.
Rule:  one category per row. Force the choice.
Rule:  if it needs two lines to describe, it was two iterations.

Review:  every 10 rows, count the categories.
         The shape is the insight, not any single row.

---
#   | Category      | What it was              | Why
--- | ------------- | ------------------------ | ------------------------
01  |               |                          |
02  |               |                          |
03  |               |                          |
04  |               |                          |
05  |               |                          |
06  |               |                          |
07  |               |                          |
08  |               |                          |
09  |               |                          |
10  |               |                          |
---

<b>At row 10, 20, 30:</b> tally categories. Ask two questions.
  1. Which category is bigger than you assumed?
  2. Which thing you believed was the product isn't in the log much?
</code></pre>

Number the rows instead of dating them. The order matters more than the date: you want to see what came after what.

**Done when:** the empty table exists and you know where it lives.

## Step 2: pick your categories

These are mine:

- **UX** (user experience): how the site feels to use.
- **Integration:** two tools passing orders to each other.
- **Fulfilment:** getting the product made and delivered.
- **Legal/IP:** names and wording you're allowed to use. IP is intellectual property.
- **Print quality:** how the product looks when it arrives.
- **Order state:** where each order is, and how it ends.
- **Edge case:** the rare failure that costs real money.
- **AI:** anything that changes what the model does or what reaches it.

Swap fulfilment and print quality for whatever your business has to get right physically. Keep AI separate even if you expect it to be huge: finding out that it isn't is the point. And keep the list under ten. A list long enough to fit everything comfortably tells you nothing.

**Done when:** you have one fixed list, and AI is on it.

## Step 3: log it the day you ship it

Every time you change something, add one row before you close the laptop. One line for what changed. For why, the trigger: what broke, who asked, what it cost.

Give each row one category only. Forcing the choice is the point. If a change needs two lines to describe, it was two changes.

The entry should take under two minutes. If it takes longer, your template is too heavy and you'll stop.

**Done when:** your next change is in the table on the same day you made it.

## Step 4: count every ten rows

At rows 10, 20 and 30, count how many rows each category has. Then ask yourself two questions:

1. Which category is bigger than you assumed?
2. What did you believe was the product, and how often does it actually show up?

A food diary you never read back changes nothing. Same here: the counting is what produced this article.

**Done when:** you've counted your first ten rows and one number surprised you.

## Step 5: before you build, plan for the boring work

Assume the AI will work sooner than you expect and be a smaller share of the work than anyone told you. Plan for orders, exceptions and delivery from day one.

Paste this into Claude or ChatGPT before you build anything:

```
I'm planning a small business with AI in it. Here it is in two sentences:
[describe what you sell and how the AI is involved]

Before I build anything, help me plan the work that ISN'T the AI.
Go through this list one item at a time. For each one, ask me one
question, wait for my answer, then tell me what I still need to decide.

- Orders: where is each order, what is it waiting on, and how does it end?
- Changes: when a customer asks for a change, how many are included,
  and what counts as "done"?
- Doubles: what happens if the same action fires twice
  (a double click, a retry, two open tabs)?
- Legal wording: am I using any names or terms I have no right to use?
- The real world: what looks fine on a screen but fails once it's
  made or delivered?
- Promises: what delivery time can I keep on a normal day, not a good one?
- Exceptions: refunds, undeliverable addresses, unusable uploads.
- My own view: how will I see which orders are stuck?

At the end, give me the list of decisions I still haven't made.
```

**Done when:** you have a written list of decisions about orders, refunds and delivery, before the first line of your product exists.

## Where it goes wrong

- **Promising your good days.** My 24-hour delivery promise held most of the time, so it came with a queue of exceptions, each costing an apology and some trust. Moving to 48 hours made the product sound worse and work better.
- **Check, then act.** "See if this order already went to the printer, then send it" sounds safe. It isn't: the duplicate slips through the gap between the two. Your developer needs a proper lock, explained below.
- **Changes with no finish line.** Before change 09, "one more small tweak" had no natural end, and neither did the order. The system never said what "done" means.
- **Writing the log at the end of the month.** You'll remember a plan. You won't remember the trigger.
- **Expecting the log to make you faster.** It won't. Change 15 wasn't predicted by change 14. What it does is stop you misremembering what you built. Without it, I'd have told you I spent the year on the AI.

## Start here today

Make the table from step 1 and fill in the last few things you changed in your business, from memory. Notice how hard the "why" column already is. That's the reason to log the next one on the day you do it.

And if you're about to build something new, save your worry for the second order that goes to the printer while the first one is still on its way.

<details>
<summary>For your developer: the plumbing behind changes 09, 13, 14, 15 and 21</summary>

### The breakdown, with shares

<table>
<thead><tr><th>Category</th><th>Count</th><th>Iterations</th><th>Share</th></tr></thead>
<tbody>
<tr><td>UX</td><td>8</td><td>01, 02, 04, 07, 10, 18, 19, 23</td><td>32%</td></tr>
<tr><td>Fulfilment</td><td>4</td><td>08, 20, 22, 24</td><td>16%</td></tr>
<tr class="hl"><td><span class="hl">AI</span></td><td>4</td><td>11, 12, 14, 16</td><td>16%</td></tr>
<tr><td>Integration</td><td>3</td><td>05, 06, 17</td><td>12%</td></tr>
<tr><td>Order state</td><td>3</td><td>09, 13, 21</td><td>12%</td></tr>
<tr><td>Legal/IP</td><td>1</td><td>03</td><td>4%</td></tr>
<tr><td>Print quality</td><td>1</td><td>25</td><td>4%</td></tr>
<tr><td>Edge case</td><td>1</td><td>15</td><td>4%</td></tr>
</tbody>
</table>

<div class="callout callout--cyan">
  <p><b>What is missing from the chart is more interesting than what is on it.</b> There is no "model change" category. No "prompt engineering" category. No retraining, no fine-tuning, no evaluation harness rebuild. Those are the things I expected to dominate a log like this, and they are simply not here.</p>
</div>

### 15 · The duplicate push with an atomic lock

An order gets pushed to the printer. The request is slow. Someone clicks again, or a retry fires, or a second browser tab is open, or a webhook is redelivered. Now the same order exists twice in the fulfilment system.

In a software product a duplicate record is an annoyance you clean up. In print-on-demand it is a physical object that gets manufactured, boxed and shipped, and someone pays for it. The failure has mass.

The thing that makes this expensive is that the naive fix does not work. "Check whether it was already pushed, then push" is two operations with a gap between them, and the entire failure mode lives in that gap. The correct fix is an atomic lock: claim the right to push in a single indivisible operation, and only the claim-winner proceeds. Everything else is theatre.

<div class="callout">
  <p>If your AI product touches money, inventory or anything physical, work out where the duplicate can happen and lock it properly. This is the least glamorous paragraph in this article and possibly the most valuable.</p>
</div>

**Idempotency:** the same action firing twice. In a physical product this manufactures a real object. Locks, not checks.

### 09 · The revision lifecycle

Before iteration 09, revisions existed — customers asked for changes and got them. What did not exist was a *lifecycle*: defined states, defined transitions, defined limits, defined endings.

Without that, "one more small change" has no natural stopping point and the order never closes. The customer is not being unreasonable; the system simply never told either party what "done" means. Giving revisions explicit states makes the boundary a property of the product rather than a conversation I have to have.

### 09, 13, 21 · Order state as a whole

Three separate iterations are really one long realisation: **the order is the product.**

Not the image — the order. An order needs to know what it is waiting on, who it is waiting on, what version was approved, whether that version is frozen, and how it can end without being fulfilled. Once approval creates an immutable snapshot (13), "print the approved thing" stops being ambiguous. Once refunds are a real path (21), orders can end deliberately rather than by exhaustion.

Every hour I spent on order state bought back hours of manual attention. Every hour I did not spend on it, I paid for later at a worse exchange rate.

### 14 · Where the print-file step sits

The print-file step sits between approval and print, which is a deliberate position: the customer approves what they saw, and the system then produces the print-ready version of exactly that. Putting it earlier means preparing work that gets revised away. Putting it later means it is not part of the frozen snapshot.

</details>
