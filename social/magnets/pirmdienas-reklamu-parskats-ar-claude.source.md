---
title: My Monday ads meeting is a Claude task now. Here's the prompt and the rules it runs on
description: Every Monday a Claude task reviews my Meta ads, moves budget inside written rules and reports back. The prompt, and the kill, scale and hold rules to copy.
date: 2026-11-09
topic: Ads
drawing: sessions
order: 7
---

My Monday ads meeting is a Claude task now.

You know the meeting. Coffee, a shared screen, and the same question every week: "what happened last week?" Mine doesn't happen any more. Every Monday morning, a scheduled Claude task reviews my Meta ad account, makes the budget moves my rules allow, launches the next test, refreshes the dashboard and sends me a short report.

It doesn't ask first. It has run under my standing OK since early October 2026, on the ad account of a print-on-demand ecommerce project I own.

The report has four parts: what changed, the numbers behind each change, what is live now, and what needs my decision. It also says plainly what it could not verify. A report that guesses is worse than no report, so that last part is not optional.

The model isn't the clever part. The rules are. Here they are, with the prompt, so you can set up the same Monday for your own account.

**What you'll have at the end:** a Monday review that runs by itself. Claude reads your Meta numbers in a fixed order, pauses what failed a fair test, gives more budget to what earned it, launches one new test, and leaves you a short note with only the decisions that need you.

## What you need

- **Claude, with scheduled tasks.** A scheduled task is a Claude session that starts by itself at a set time. Mine starts on Monday morning.
- **A way for Claude to read your Meta numbers.** I use Windsor.ai.
- **A connector that can make changes** in the ad account: pause an ad, change a budget, launch a new one.
- **A dashboard,** if you keep one. Mine gets refreshed on every run.
- **Three numbers of your own:** your break-even cost per purchase, your target cost per purchase, and the most you'll spend in a day across the whole account.
- **Money:** a Claude plan that includes scheduled tasks, whatever the connectors charge, and your ad budget. The rules never take the budget above the ceiling you set.
- **Time:** working out your three numbers is the slow part. The prompt is copy and paste.
- **Skill:** no coding. Connecting Claude to your ad account is the one step where a developer helps, if you've never connected Claude to anything.

## How it works

Think of a good shop manager doing the Monday walk-round before the doors open.

They don't start with how busy the shop felt. They start at the till, then look at the baskets people left at the counter, then at what it cost to get people through the door, and only at the end at the window display. Same route, same order, every week.

Then they act, inside rules the owner wrote down. A product that had a fair chance and didn't sell comes off the shelf. The one that keeps selling gets more space. The new arrival that came in on Saturday stays put, because nobody can judge it yet. One new display goes up. And the manager has a company card with a limit, and doesn't go over it without calling the owner.

Last, they leave a note on the owner's desk: here's what I changed and why, here's what's on the floor now, here's what I need you to decide, and here's what I couldn't check.

That is the whole Monday task.

<pre class="flow">  <b>READ</b>     cost per purchase → checkouts started → link CPC → link CTR, CPM
  <b>SORT</b>     every ad: kill, scale or hold
  <b>ACT</b>      pause, raise budgets (never past the ceiling), launch one test
  <b>REPORT</b>   what changed · the numbers · live now · needs you · couldn't verify
</pre>

## The rules it follows

The thresholds are from my account. The logic travels; your numbers will be different.

### Read the numbers in the same order, every time

1. **Cost per purchase.** What one sale cost in ads. This is the number that decides.
2. **Checkouts started.** The bridge. It shows people meant to buy before purchases have had time to pile up.
3. **Link CPC.** What you paid for each click that went to your site.
4. **Link CTR and CPM.** The share of people who saw the ad and clicked through to your site, and what a thousand views of the ad cost. These are secondary only.

Never rank ads on Meta's plain "clicks", "CTR" or "CPC". Those count likes and profile clicks too, so the ad people enjoyed looks like the ad that sold.

### Age before spend

An ad under 3 days old, or with under 30 link clicks, is **untested**, whatever it spent. Don't kill it.

There's one exception. Zero checkouts after 30 link clicks is dead at any age. On my account about one in ten link clicks starts a checkout, so 30 clicks with no checkout at all means something is wrong. If far fewer of your clicks start a checkout, raise the 30 to match.

### Kill

An ad that has had a fair test, meaning 3 days or more **and** 30 link clicks or more, gets paused if either is true:

- its cost per purchase is above your break-even, or
- it has zero checkouts.

An ad that has barely spent gets judged with its family, never alone. A family is the group of ads that share the start of their name, so the name has to tell you which idea an ad belongs to.

### Scale

A campaign that stays under your target cost per purchase for three days in a row gets its budget raised by 20 to 30%.

### Hold

Too young or too thin to judge: leave it alone, and say so in the report. "Hold" is a decision, not a gap in the report.

### Checkout leak

If an ad has brought 10 or more checkouts and under 10% of them turned into purchases, that's an offer or landing page problem, not an ad problem. The ad did its job and the shop dropped the sale. Flag it for me, and don't kill the ad.

### The ceiling

Never take the total daily budget above the ceiling I set without asking me first. Every "scale" move has to fit under it.

### The next test

80% of the test money goes to variations of proven winners, changing one thing at a time: the headline, the image or the format. The other 20% goes to one wild idea. Never two changes in one test, or you can't tell which one did the work.

### What winning and losing looked like on my account

Measured in early October 2026. Yours will differ, so treat these as the shape of the gap, not as your targets.

<div class="cards">
  <div class="card">
    <h4>Winners</h4>
    <p class="stat">$0.62</p>
    <p>the most any winner paid per link click. Winners ran $0.44 to $0.62 per link click, at a CPM of $11 to $15.</p>
  </div>
  <div class="card">
    <h4>Everything that died</h4>
    <p class="stat">$0.98</p>
    <p>the least anything that died paid per link click. They ran $0.98 to $1.84, at a CPM of $18 to $31.</p>
  </div>
</div>

Between 15 and 38% of checkouts turned into purchases. Set that next to the checkout leak rule: under 10% is well below the worst of that range.

## Step 1: write down your three numbers

Write down, with the date:

- **Break-even cost per purchase:** the most you can pay in ads for one sale before it loses money.
- **Target cost per purchase:** what you'd like a sale to cost.
- **The daily ceiling:** the most you'll let the whole account spend in a day without being asked.

Every rule leans on these. The machine applies them, but it can't tell you if they're wrong.

**Done when:** all three are written down, with the date.

## Step 2: name your ads in families

Give every ad that tests the same idea the same start to its name, like "Angle1 A", "Angle1 B" and "Angle1 C". That's how Claude finds an ad's family when the ad itself has barely spent, and it's how you read a test from its name in the report.

**Done when:** every live ad's name starts with its family.

## Step 3: connect Claude to the account, reading first

Connect Windsor.ai, or whatever you use to read Meta numbers, before anything that can make changes. Then ask Claude: "For every live ad over the past seven days, show me spend, link clicks, checkouts started, purchases and cost per purchase." Check a few against Ads Manager.

Only when the numbers match do you add the connector that can make changes.

**Done when:** Claude's numbers match Ads Manager for the ads you checked.

## Step 4: copy the Monday review prompt and fill it in

Replace everything in curly brackets with your own. Leave the structure alone: the order of the numbers and the order of the rules are the parts that matter.

```
You run the Monday ads review for my Meta ad account {AD_ACCOUNT}. You have my standing OK: act inside these rules without asking me, then report. Anything outside these rules, ask me first.

TOOLS
- Read the numbers with {READ_TOOL}.
- Make changes with {CHANGE_TOOL}.
- Refresh the dashboard at {DASHBOARD}.
- Send the report to {REPORT_TO}.

MY NUMBERS
- Break-even cost per purchase: {BREAK_EVEN}. Above this, an ad loses money.
- Target cost per purchase: {TARGET}.
- Ceiling: never take the total daily budget above {MAX_DAILY_BUDGET} without asking me first.

READ IN THIS ORDER, EVERY TIME
1. Cost per purchase. This is the decision metric.
2. Checkouts started. The bridge: it shows intent before purchases pile up.
3. Link CPC.
4. Link CTR and CPM. Secondary only.
Never rank ads on plain "clicks", "CTR" or "CPC". They count likes and profile clicks.

AGE BEFORE SPEND
- An ad under 3 days old or under 30 link clicks is UNTESTED, whatever it spent. Do not kill it.
- Exception: zero checkouts after 30 or more link clicks is dead at any age.

KILL: pause the ad
- Past a fair test (3 or more days AND 30 or more link clicks) and either cost per purchase above {BREAK_EVEN}, or zero checkouts.
- Judge an under-spent ad by its family (the ads that share its name prefix), never alone.

SCALE: raise the budget
- A campaign under {TARGET} cost per purchase for three days in a row: raise that campaign's budget by 20 to 30%.
- The total daily budget must stay at or under {MAX_DAILY_BUDGET}.

HOLD: leave it
- Too young or too thin to judge. Leave it, and say so in the report.

CHECKOUT LEAK: flag, do not kill
- 10 or more checkouts with under 10% turning into purchases is an offer or landing page problem, not an ad problem. Flag it for me. Do not kill the ad.

NEXT TEST
- Launch the next test. 80% of test money goes to variations of proven winners, changing one thing at a time: the headline, the image or the format. 20% goes to one wild idea.
- Never two changes in one test.

THEN
1. Refresh the dashboard.
2. Send me a short report:
   - What changed, with the numbers behind each change.
   - What is live now.
   - What needs my decision.
   - What you could not verify. Say it plainly. Never fill a gap with a guess.
```

Three lines in there do most of the work:

- **"Whatever it spent"** stops the most expensive habit in ads: killing a new ad on day two because the spend looked scary.
- **"Not an ad problem"** stops it pausing a good ad because the checkout page is losing the sale.
- **"What you could not verify"** is the difference between a report you can act on and one you have to double-check.

**Done when:** there are no curly brackets left in your copy.

## Step 5: run it once without its hands

Make it a scheduled task for Monday morning. For the first runs, add one line at the very top: "This week, change nothing. Report what you would have done and why."

Read the report against your own judgement. Every time you disagree, the fix is a rule with a number in it, not a nicer sentence.

**Done when:** you read a full report and agree with every move it would have made.

## Step 6: give it the standing OK

Delete the "change nothing" line. From now on it acts, then tells you. Your Monday job is the "needs my decision" part of the report, and the "could not verify" part.

**Done when:** the first real report arrives with all four parts: what changed and why, what's live, what needs you, and what it couldn't check.

## Where it goes wrong

- **Ranking on plain clicks.** Meta's plain clicks, CTR and CPC count likes and profile clicks. Rank on those and you scale the ad people liked, not the one that sold. Read link clicks, and read them third.
- **Killing on spend alone.** An ad two days old with 20 link clicks hasn't been tested, whatever it spent. The age and click rule exists so a nervous Monday doesn't pause next month's winner.
- **Blaming the ad for the checkout.** Lots of checkouts and few purchases means the ad worked and the offer or the page didn't. Pausing the ad only hides the problem.
- **Judging a thin ad on its own.** An ad that barely spent proves nothing alone. Its family, the ads that share its name, tells you whether the idea works. This only works if you named them that way in step 2.
- **Two changes in one test.** New headline and new format at once, and when it wins you don't know why. One change, every time.

## Start here today

Open Ads Manager and put three columns side by side: cost per purchase, checkouts started and link CPC. Sort by cost per purchase. Then mark every ad under 3 days old or under 30 link clicks as untested, whatever it spent.

That's the Monday review by hand. Do it for one Monday and you'll see which ads you would have killed too early. When doing it by hand gets boring, set up the prompt from step 4.

<details>
<summary>For your developer: the decision logic, the fields and the connections</summary>

### The shape of it

```
MONDAY, morning   MONDAY ADS REVIEW (Claude scheduled task)
  read    ─ per ad and per campaign: spend, link clicks, checkouts started,
            purchases, cost per purchase, link CPC, link CTR, CPM, days live   (Windsor.ai)
  sort    ─ every ad: KILL / SCALE / HOLD, plus a CHECKOUT LEAK flag
  act     ─ pauses, budget raises (ceiling-checked), one new test             (connector that can make changes)
  refresh ─ the dashboard
  report  ─ changed + numbers · live now · needs a decision · could not verify
```

Reads and writes go through different connectors on purpose: Windsor.ai reads, a separate connector writes. Give the task read access first and check its numbers against Ads Manager before it gets write access.

### The decision logic, per ad

The order of the checks matters. The checkout leak is tested before the cost-per-purchase kill, so a leaking offer never costs a good ad its life.

```
fair = days_live >= 3 AND link_clicks >= 30

if link_clicks >= 30 AND checkouts == 0             -> KILL   (dead at any age)
elif NOT fair                                       -> HOLD   (untested, whatever it spent)
elif checkouts >= 10 AND purchases < 0.10 * checkouts
                                                    -> FLAG   checkout leak, keep the ad
elif cost_per_purchase > BREAK_EVEN                 -> KILL   (thin spend: judge by family)
else                                                -> keep

family(ad) = all ads whose name starts with the same prefix
```

Per campaign:

```
if cost_per_purchase < TARGET on each of the last 3 full days:
    new_budget = budget * 1.20 to 1.30
    if sum(all daily budgets after the change) > MAX_DAILY_BUDGET:
        do not change; ask the owner
```

### The fields

Meta reports two kinds of clicks. "Clicks (all)", "CTR (all)" and "CPC (all)" include likes, profile clicks and other clicks that never leave Meta. The rules only use link clicks. In Meta's own reporting those are `inline_link_clicks`, `cost_per_inline_link_click` and `inline_link_click_ctr`; checkouts and purchases come from the `actions` list (`initiate_checkout`, `purchase`). Connectors rename fields, so have the task look up the connector's real field list when a field is rejected, instead of guessing. A guessed field is a confident wrong number.

### The rules, as a table

<table>
  <tr><th>Rule</th><th>Trigger</th><th>Action</th></tr>
  <tr><td>Untested</td><td>Under 3 days old or under 30 link clicks</td><td>Hold, whatever it spent</td></tr>
  <tr class="hl"><td>Dead at any age</td><td>30+ link clicks, 0 checkouts</td><td>Pause</td></tr>
  <tr><td>Kill</td><td>3+ days and 30+ link clicks, and cost per purchase above break-even or 0 checkouts</td><td>Pause; judge thin spend by family</td></tr>
  <tr><td>Scale</td><td>Under target cost per purchase three days in a row</td><td>Raise the campaign 20 to 30%</td></tr>
  <tr><td>Checkout leak</td><td>10+ checkouts, under 10% become purchases</td><td>Flag; do not pause</td></tr>
  <tr><td>Ceiling</td><td>Total daily budget would pass {MAX_DAILY_BUDGET}</td><td>Ask first</td></tr>
  <tr><td>Next test</td><td>Every run</td><td>80% variations of winners, one change each; 20% one wild idea</td></tr>
</table>

<div class="callout callout--cyan">
  <p><b>My account, early October 2026.</b> Winners: link CPC $0.44 to $0.62, CPM $11 to $15. Everything that died: link CPC $0.98 to $1.84, CPM $18 to $31. 15 to 38% of checkouts became purchases. Separately, about one in ten link clicks starts a checkout on this account. Useful as a sanity check on the thresholds, not as anyone else's targets.</p>
</div>

</details>
