---
title: Black Friday Meta ads audit: seven prompts, one account check, before 27 November
description: Seven read-only prompts that check your Meta ads against real orders before Black Friday, then plan a safe budget ramp and your stop rules.
date: 2026-11-12
topic: Ads
drawing: rules
order: 8
---

The first week I put my Meta ads next to my shop's real orders, Meta claimed 68 purchases. The shop had recorded 54.

Nobody was lying. Meta counts sales that happen days after someone saw an ad, and sales it estimates rather than sees. Both push its number up, in Meta's favour, every time.

On a normal week that gap blurs your judgement a little. The week before Black Friday it costs money, because that's when budgets get doubled on the ads that look best in Ads Manager. If "best" rests on purchases that never happened, the extra money goes to the wrong ads.

So before Black Friday on 27 November 2026, run an audit: seven prompts, one account check. I've bought ads for 12 years, and the numbers in these prompts are the ones I use on my test account, a print-on-demand ecommerce project I own.

<div class="callout">
  <p><b>What these prompts can't do.</b> None of the seven prompts changes anything in your account. They only read and report, and you decide.</p>
</div>

**What you'll have at the end:** a written check of your Meta ads against your real orders, a dated plan for raising the budget safely before 27 November, and stop rules written down before the sale starts.

## What you need

- **Claude**, with a connection that can read your Meta ads account. I use Windsor.ai, a service that passes your Meta numbers to Claude. Reading is enough.
- **Your shop's real orders**: a connection to your shop, or the last 14 days of orders downloaded as a spreadsheet and attached to the chat.
- **Your break-even**, the most you can pay in ads for one new customer without losing money. If you don't have it, step 2 of [my seven rules](/blog/meta-ads-seven-rules) shows how to work it out.
- **Money:** nothing beyond Claude and the connection. The audit spends no ad money.
- **Time:** an hour or two for all seven, once Claude can see the data.
- **Skill:** no coding. You copy prompts and fill in the curly brackets. Connecting Claude to your shop is where a developer may help.

## How it works

Pilots walk round the plane with a checklist before every flight. Not because the plane is probably broken, but because a loose panel is cheap to find on the ground and expensive to find in the air. Same items, same order, every time, however confident anyone feels.

The seven prompts are that walk-round for your ad account, and Black Friday is the flight. Each one checks one thing and reports what passed and what failed.

<pre class="flow"><b>Are the numbers real?</b>     1  real orders vs Meta's count
<b>Which ads earn?</b>            2  rank by what pays
                           3  too early or already dead
                           4  tired ads
                           5  checkout leak
<b>How the money goes in</b>     6  the budget ramp
                           7  stop rules, written before the sale
</pre>

The order matters. If Meta's count is 20% high, the ranking in prompt 2 is built on the wrong numbers until you know that. If the checkout leaks, more budget just pours more people into the leak.

Every prompt starts with the same line: read and report only. Leave it in even if your connection could make changes. You decide, and you make any change yourself in Ads Manager.

A few words come up in every step:

- **Link clicks** are clicks that went to your website. Meta's plain "clicks" also counts likes, comments and taps on your page name.
- **CTR** is the share of people who saw the ad and clicked. **Link CPC** is what one click to your website cost. **CPM** is what 1,000 views of the ad cost.
- **Checkouts started** are people who reached your checkout and began filling it in.
- **Frequency** is how many times the average person has seen the ad.

## Step 1: check Meta's count against your real orders

**What it checks:** Meta's purchase count against the orders your shop actually recorded, day by day, for the last 14 days.

On my account Meta's count runs 15 to 20% high, and in that first week it was 26%. Every cost per purchase in Ads Manager is worked out from that count, so when it's high, every ad looks cheaper than it is.

**A bad result** is a gap bigger than you thought, a gap that grows week by week, or days where Meta shows sales and your shop shows none.

**What to do:** you can't close the gap, so write it down and use it. If Meta says a sale cost $20 and its count is 20% high, the real cost is nearer $24.

```
Compare what Meta says I sold with what my shop actually sold, day by day, for the last 14 full days.

Read only. Do not change anything in my ad account or my shop. Report, and I decide.

1. From my Meta ad account {AD ACCOUNT NAME}: purchases and purchase value per day for the last 14 full days. Tell me which timezone the ad account reports in and which attribution setting the numbers use.
2. From my shop: real paid orders and revenue per day for the same 14 days. Leave out test orders and cancelled or refunded orders. If the shop uses a different timezone, convert so both count the same day.
3. Show a table: date, Meta purchases, real orders, difference. Then the 14-day totals and the gap as a percentage: (Meta purchases minus real orders) divided by real orders.
4. Flag any day where Meta shows sales and the shop shows none, or the other way round. That is usually a timezone or tracking problem, not a sales problem.
5. End with one sentence: "Meta over-reports by X%, so multiply Meta's cost per purchase by Y to get the real cost."

If a source is unreachable or a number is missing, say so. Never guess a number.
```

**Done when:** one number is written down with today's date: how far Meta's count is off on your account.

## Step 2: rank your ads by what pays

**What it checks:** which ads bring money, judged by how close each number sits to a sale. Cost per purchase first, then checkouts started, then link CPC, and only then CTR and CPM.

The early numbers look great on ads that never sell, because plain clicks and CTR also count likes and taps on your page name. An ad can win on attention and lose on money.

**A bad result** is an ad near the top on CTR or plain clicks and near the bottom on purchases and checkouts. That's exactly the ad you'd be tempted to give Black Friday money.

**What to do:** put extra money only on ads that rank well on purchases and checkouts. An ad that wins only on clicks is unproven.

```
Rank every ad in my Meta ad account {AD ACCOUNT NAME} that spent money in the last 14 full days by what actually pays.

Read only. Do not change anything in my ad account or my shop. Report, and I decide.

1. For each ad: spend, purchases, cost per purchase, checkouts started, cost per checkout started, link clicks, link CPC, link CTR, CPM, and all clicks.
2. Rank in this order of importance: cost per purchase (lowest first), then checkouts started, then link CPC, and only then CTR and CPM. Ads with no purchases go below every ad that has some.
3. Meta's purchase count runs about {GAP FROM PROMPT 1}% high on my account. Use cost per purchase to rank, not as the true cost, and show the real cost next to it using that gap.
4. Flag any ad that looks like a winner only on all clicks or CTR: high CTR or many clicks, but few or no checkouts and purchases. Say in one line why it is not a winner. All clicks include likes, comments and taps on the page name.
5. End with two short lists: the ads I could give more money, and the ads that only look good.

If a number is missing, say so. Never guess a number.
```

**Done when:** you have the ranked list, and every winner on it has checkouts and sales behind it.

## Step 3: separate the ads that are too early from the ones already dead

**What it checks:** whether each ad has had enough time and clicks to judge at all.

Two opposite mistakes cost money. Judging an ad after a day or two kills ads that might have worked. Keeping an ad with plenty of clicks and not one checkout pays for visitors who don't want to buy.

My lines: an ad under 3 days old or under 30 link clicks is untested. An ad with zero checkouts started after 30 link clicks is dead, whatever its age.

**A bad result** is a Black Friday plan that leans on untested ads, or a dead ad still spending.

**What to do:** leave untested ads alone, and don't pour Black Friday money into them either. Pause the dead ones yourself.

```
Sort the active ads in my Meta ad account {AD ACCOUNT NAME} into untested, dead and ready to judge.

Read only. Do not change anything in my ad account or my shop. Report, and I decide.

1. For every active ad: the date it started delivering, days live, spend, link clicks, checkouts started and purchases, from its start to yesterday.
2. UNTESTED: live under 3 days, or under 30 link clicks. Too early to judge in either direction.
3. DEAD: 30 or more link clicks and zero checkouts started, whatever its age.
4. READY TO JUDGE: everything else.
5. Show three short lists with the numbers that put each ad there. For each dead ad, show its total spend.

If a number is missing, say so. Never guess a number.
```

**Done when:** every active ad sits in one of the three lists, and you've decided what to do with each dead one.

## Step 4: find the tired ads

**What it checks:** ads that worked but are wearing out, because the same people have seen them too often.

Black Friday budget spent on a tired ad buys more views from people who have already decided not to click. The two signs I use: the average person has seen it more than 2.5 times, or its click rate has dropped 30% from its first week.

**A bad result** is a tired ad in your top three from step 2: the ad you'd most want to give more money, and the one least likely to hold up.

**What to do:** leave the tired ad as it is and launch one clean replacement test beside it. One change at a time, so you know what made the difference: keep the visual and change the words, or the other way round. A new ad needs 3 days and 30 link clicks before you can judge it, so a test started now can be judged well before 27 November.

```
Find the tired ads in my Meta ad account {AD ACCOUNT NAME} and suggest one clean replacement test for each.

Read only. Do not change anything in my ad account or my shop. Report, and I decide.

1. For every active ad that has run at least 7 days: frequency over the last 7 days, link CTR in its first 7 days, link CTR in the last 7 days, and the change between them as a percentage.
2. TIRED: frequency above 2.5, or link CTR down 30% or more from its first 7 days.
3. For each tired ad, show those numbers, its main text and its headline.
4. Suggest one replacement test per tired ad, with exactly one change: new words on the same visual, or the same words on a visual that already worked in another ad. If the change is in the words, write them. Suggest a name that says what changed, like "Test B | new opening line | visual from ad 3".
5. Never suggest discounts, freebies or delivery dates, except these offers I allow: {OFFERS I ALLOW, OR "NONE"}.

If a number is missing, say so. Never guess a number.
```

**Done when:** each tired ad has one replacement test written out, and you've picked which ones to launch.

## Step 5: check for a checkout leak

**What it checks:** whether the people who start your checkout actually finish buying.

When 10 or more people start the checkout and fewer than 1 in 10 buy, the ads have done their job. Something after that stops people: the offer, the price, the delivery cost, the page itself. That's an offer or landing-page problem, not an ad problem, and no budget increase fixes it. Black Friday traffic just means more people falling through the same hole.

It's also the check that stops you blaming good ads. My daily rules carry a line for it: if the funnel breaks, flag it before blaming the ads.

**A bad result** is any ad, or the account as a whole, with 10 or more checkouts started and under 10% of them becoming purchases.

**What to do:** fix it before you raise any budget. Buy something from your own shop on your phone, the way a stranger would, and write down every moment you'd hesitate.

```
Check my shop for a checkout leak: people who start the checkout but don't buy.

Read only. Do not change anything in my ad account or my shop. Report, and I decide.

1. From my Meta ad account {AD ACCOUNT NAME}, for the last 14 full days, per ad and for the whole account: checkouts started, purchases, and purchases divided by checkouts started.
2. From my shop, for the same days, if it records them: checkouts started (including abandoned checkouts) and real paid orders.
3. Flag every ad, and the account as a whole, with 10 or more checkouts started and under 10% of them becoming purchases.
4. If the leak shows across most ads, say plainly that it looks like an offer or landing-page problem, not an ad problem. If it is one ad only, say what that ad promises that the page might not deliver.
5. List what I should check by hand, in this order: the price and delivery cost shown before the checkout, the checkout on a phone, the payment options, and any field that asks for more than it needs.

If a source is unreachable or a number is missing, say so. Never guess a number.
```

**Done when:** you know whether the checkout leaks, and if it does, the fix is live before any budget goes up.

## Step 6: build the budget ramp

**What it checks:** how to get from today's daily budget to the one you want on Black Friday without knocking the campaign back to the start.

A budget change restarts Meta's learning phase, the stretch when Meta is still working out who to show your ads to and results jump around. The safe move is at most 20% up, every 3 days. So a budget you want doubled for Black Friday has to start rising now. Four steps of 20% is about 2.07 times the budget, and four steps take 12 days. Count back 12 days from Friday 27 November and the last day to start is Sunday 15 November.

On a $70 daily budget, the size of my own campaign, that ramp looks like this:

<table>
  <tr><th>Date</th><th>Daily budget</th><th>Before you raise it</th></tr>
  <tr><td>Sunday 15 November</td><td>$84</td><td>Real sales over the last 3 days cost at or under your target</td></tr>
  <tr><td>Wednesday 18 November</td><td>$101</td><td>The same check</td></tr>
  <tr><td>Saturday 21 November</td><td>$121</td><td>The same check</td></tr>
  <tr><td>Tuesday 24 November</td><td>$145</td><td>The same check</td></tr>
  <tr class="hl"><td>Friday 27 November</td><td>$145</td><td>Black Friday, about 2.07 times where you started</td></tr>
</table>

The check comes from my own rules: the budget only goes up if real sales over the last three days cost at or under the target. If not, that step waits three days. Start on 15 November and one failed check means you don't reach double. Start on 12 November and you have a spare step. Lowering is fine any time.

**A bad result** is the prompt telling you there isn't time for four steps. Then go as far as the steps allow, and don't close the gap with one big jump.

**What to do:** put every date in your calendar, run the check that morning, and make each change yourself.

```
Build me a dated budget ramp for my Meta campaign {CAMPAIGN NAME}, from today to Black Friday, Friday 27 November 2026.

Read only. Do not change any budget or setting. Write the plan, and I make every change myself.

My numbers:
- Today's date: {TODAY'S DATE}
- Current daily budget: {CURRENT DAILY BUDGET}
- Daily budget I want on Black Friday: {TARGET DAILY BUDGET}
- My target real cost per sale: {TARGET COST PER SALE}
- Daily ceiling I will not go above without deciding again: {CEILING}

Rules for the ramp:
1. A budget change restarts Meta's learning phase. Raise by at most 20% per step, and leave at least 3 days between steps. Lowering is allowed any time.
2. If the campaign started less than 4 days ago, the first step waits until it has run 4 full days.
3. A step happens only if real sales over the previous 3 full days, counted from my shop's orders, cost at or under my target per sale. If not, that step waits 3 days and the rest of the plan moves with it.
4. Never plan above my target budget or my ceiling, whichever is lower.

Before you plan: read the campaign's current daily budget from Meta and tell me if it differs from mine. Then work out real cost per sale for the last 3 full days (Meta spend divided by my shop's real orders) and tell me whether today's step passes the check.

Write the plan as a table: date, weekday, new daily budget rounded to whole numbers, times the starting budget, and the check to make that morning.

Then tell me in two lines:
- how many spare steps the plan has before 27 November, so I know how many failed checks it can absorb;
- if four steps of 20% don't fit or don't reach my target, the highest budget I can safely reach by 27 November. Never suggest one big jump to close the gap.

If a number is missing, say so. Never guess a number.
```

**Done when:** every step is in your calendar with its date and its check, and you know how many failed checks the plan can absorb.

## Step 7: write your stop rules before the sale

**What it checks:** nothing in the account. It writes down when you'll cut, pause or stop, while you're calm.

During Black Friday the numbers move by the hour, and "give it one more day" sounds reasonable every day. A sentence like "be sensible" drifts. A threshold doesn't.

Three rules cover most of it:

- **Cut** the budget hard if real sales over the last 7 days cost more than your limit, once enough has been spent for that to mean something.
- **Pause** the campaign after zero real sales 3 days running.
- **Never go above a daily ceiling** without your own OK.

Mine: break-even is about $18 per new customer. If real sales over 7 days cost more than $30 each after $350 spent, the budget gets cut hard. $30 is where a sale costs more than the margin, and $350 is five days of my $70 budget. Zero real sales three days running pauses the campaign.

**A bad result** is no rules, or rules without numbers, or a limit set by feel instead of from your break-even.

**What to do:** have Claude draft the rules from your numbers, change what doesn't fit, and save them where you'll see them on 27 November.

```
Draft my stop rules for Black Friday from my own numbers, and write them down as a short rule sheet.

Read only. Do not change anything in my ad account or my shop. Draft, and I decide.

My numbers:
- Break-even, the most I can pay in ads for one new customer without losing money: {BREAK-EVEN}
- What I keep from an average order after product, shipping, payment fees and returns: {MARGIN PER ORDER}
- Daily budget on Black Friday, from my ramp: {BLACK FRIDAY DAILY BUDGET}
- The daily budget I would drop to if things go wrong: {FLOOR BUDGET}

Draft three rules, each with a number:
1. CUT: if real sales over the last 7 days cost more than a limit per sale, after a set amount spent, cut the daily budget to my floor. Suggest the limit from my break-even and margin, suggest the spend from my daily budget, and show the sum behind each.
2. PAUSE: if there are zero real sales 3 days running, pause the campaign.
3. CEILING: never go above a daily budget of X without my OK. Suggest X from my ramp.

For reference only, an example from another account: break-even about $18, cut hard above $30 per real sale after $350 spent ($350 is five days of a $70 budget), pause after 0 real sales for 3 days. Use my numbers, not these.

Then read the last 14 full days from Meta and from my shop, and tell me whether any of the three rules would already have fired.

Write the result as a rule sheet I can paste into a note: dated today, plain words, one line per rule. End it with: "Real sales means orders in my shop, not Meta's purchase count."

If a number is missing, say so. Never guess a number.
```

**Done when:** the rule sheet is saved with today's date, and you'd follow it even on the best-looking Black Friday morning.

## Where it goes wrong

- **Timezones.** Version one of my morning report compared Monday's spend with Tuesday's sales, because Meta and the shop counted days in different timezones. That's why prompt 1 asks for both timezones first.
- **Doubling the budget in Black Friday week.** It sends Meta back into learning exactly when you need it settled. My rule about moving slowly exists because I broke it myself, repeatedly, by hand.
- **Judging on a single day.** At $70 a day, one day is a handful of orders. That's why the prompts read 3, 7 and 14 days.
- **A wrong break-even.** Prompts 6 and 7 apply your break-even but can't tell you it's wrong. If your $18 is really $24, every rule is quietly wrong.
- **Believing a confident number.** A guessed number is a confident wrong number. When a figure surprises you, ask Claude where it read it.

## Start here today

Run prompt 1 today. The gap it finds changes how you read every other number in your account. Then run the ramp, prompt 6, by Sunday 15 November, the last day a four-step ramp still fits before Black Friday. Prompts 2 to 5 and the stop rules fit in between.

If you later want Claude to do more than read, here are [the seven rules mine runs by](/blog/meta-ads-seven-rules).

<details>
<summary>For your developer: the connections, the fields and the ramp arithmetic</summary>

### What Claude needs to reach

- **Meta ads insights** at ad level, per day, through a connector. Windsor.ai here. Read scope is enough: nothing in the audit writes. If the connector offers a read-only scope, use it. The prompts say "read only", but a scope is a stronger guarantee than a sentence.
- **The shop's orders**: a read-only database connection, the shop platform's own connector, or a CSV export of the last 14 days of orders with timestamps and status (paid, test, cancelled, refunded). Prompt 5 also wants the shop's checkout or abandoned-checkout records, if it keeps them.

### Fields per prompt

<table>
  <tr><th>Prompt</th><th>Meta fields (ad level unless noted)</th><th>Shop data</th><th>Window</th></tr>
  <tr><td>1</td><td>date, purchases, purchase_value (account level, daily)</td><td>paid orders and revenue per day</td><td>14 full days</td></tr>
  <tr><td>2</td><td>spend, purchases, initiate_checkout, link_clicks, link CTR, cpm, clicks (all)</td><td>none</td><td>14 full days</td></tr>
  <tr><td>3</td><td>ad start date, spend, link_clicks, initiate_checkout, purchases, effective_status</td><td>none</td><td>ad lifetime to yesterday</td></tr>
  <tr><td>4</td><td>frequency, link CTR, ad creative text</td><td>none</td><td>the ad's first 7 days vs the last 7 days</td></tr>
  <tr><td>5</td><td>initiate_checkout, purchases</td><td>checkouts started, paid orders</td><td>14 full days</td></tr>
  <tr><td>6</td><td>campaign daily budget, spend</td><td>paid orders</td><td>last 3 full days</td></tr>
  <tr><td>7</td><td>spend</td><td>paid orders</td><td>14 full days, 7-day rolling</td></tr>
</table>

Clicks (all) and CTR (all) include reactions, comments, shares and clicks on the page name. Link clicks and link CTR are the ones that leave Meta. Prompt 2's "winner only on clicks" flag is the gap between the two.

### Where the data goes wrong

- **Day boundary.** Meta reports in the ad account's timezone. Convert shop timestamps to that timezone before grouping by day, or prompt 1 compares one day's spend with the next day's orders.
- **Attribution.** Meta's purchase count depends on the account's attribution setting and includes modelled conversions (sales Meta estimates rather than sees). The prompt 1 gap is an account-level correction. Don't apply it per ad as if it were exact.
- **Field names change between connectors.** Add one line to every prompt: if a field is rejected, look up the real field list instead of guessing. A guessed field is a confident wrong number.

### The ramp arithmetic

Each step multiplies the budget by 1.2: 1.2, 1.44, 1.728, 2.0736. A step is a raise plus three days to settle, so four steps take 12 days and the latest start for a 27 November finish is 15 November. Starting on 12 November gives five step slots (12, 15, 18, 21 and 24 November) for the four steps needed, one spare for a failed check.

On $70: $84.00, $100.80, $120.96, $145.15.

### The stop rules as they run on my account

<table>
  <tr><th>Rule</th><th>Trigger</th><th>Action</th></tr>
  <tr><td>Cut</td><td>7-day real cost per sale over $30, after $350 spent</td><td>cut the budget hard, report</td></tr>
  <tr><td>Pause</td><td>0 real sales on 3 straight days</td><td>pause the campaign, report</td></tr>
  <tr><td>Ceiling</td><td>any raise above the hard cap</td><td>needs my written OK</td></tr>
  <tr><td>Ramp</td><td>at most +20% per step, 3 days apart, only if the 3-day real cost per sale is at or under target</td><td>decreases allowed any time</td></tr>
</table>

</details>
