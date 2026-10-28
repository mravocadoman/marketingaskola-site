
The post that sent you here was published by a machine I built. I didn't open LinkedIn to post it. I didn't open Facebook either, and I didn't set a reminder to reply to comments. All of that happened on its own.

My part took about ninety seconds: I read the post, I ticked one box in Notion, and I went back to work.

That's the whole system. Nine small automations and one human. Seven of them run every day, two are switched off for now. And there's one thing it is **not allowed** to do, which I'll get to, because it's the most important part.

**What you'll have at the end:** you write your posts once a week, tick a box next to each one, and they go out on LinkedIn and Facebook by themselves, at a good hour, with a ping to your phone when it's time to answer comments.

## What you need

- **Notion** (free). This is your content calendar: one row per post.
- **n8n**. A visual tool where you connect boxes into a recipe of steps. There's a free version you host yourself, or a paid cloud plan if you don't want to deal with servers.
- **A scheduling tool** that can post to LinkedIn and Facebook for you. I use Zernio. Buffer works the same way.
- **Telegram** (free), for the pings to your phone.
- **Claude or ChatGPT**, only for the optional extras. The basic version needs no AI at all.
- **Time:** a weekend for the basic version.
- **Skill:** no coding, apart from one copy and paste in step 4.
- **Money:** the tools are free or cheap, and the AI part is a rounding error. Infrastructure is not what this costs you. Time is.

## How it works

Think of a small restaurant kitchen.

You are the chef: you write the posts. Notion is the order board on the wall, one ticket per post. n8n is the kitchen porter who checks the board every morning at 08:00, takes every ticket that's marked ready, and carries it out. The scheduling tool is the waiter who serves it to the table, LinkedIn at 10:00 Riga time, and a copy to Facebook. Telegram is the little bell that rings in the kitchen when the plate is out, so you can go and talk to the guests.

Two of the nine automations do nothing but watch the others. If anything breaks, they shout at me on Telegram. That sounds boring. It's the reason I trust the rest.

And the one rule: **the machine never touches the words.** The text I approved is the text that goes out, character for character. These days a Claude session drafts two weeks of posts on Sundays, I read them all once, fix what's off, and approve the batch. After that, nothing is allowed to "improve" them.

I learned this the hard way. Every version where a model wrote or polished the post on its own was technically fine and completely forgettable. Over a month it quietly sands your voice off.

## Step 1: build the order board in Notion

Make a Notion database with one row per post and three columns:

- **Date**, the day it should go out.
- **Approved**, a checkbox. This is the only switch. Nothing goes out without it.
- **Status**, so you can see what's drafted, approved and posted.

Inside each row's page, write the post under a simple heading, so the machine knows exactly where the post starts and stops:

```
=== FINAL POST ===
Your post text, exactly as it should appear.

=== FIRST COMMENT ===
The comment that should go up right after the post.
```

**Done when:** next week's posts are in the table, each with a date, and none of them ticked yet.

## Step 2: build the alarm first

Before you automate anything, set up the part that tells you when it fails. In n8n, make a tiny automation that sends you a Telegram message whenever any other automation errors: which one, what went wrong, and a link to it. Then point every automation you build at it.

It's two boxes. It's also what makes everything else safe, because a machine that silently stopped three weeks ago is worse than no machine.

**Done when:** you break something on purpose and your phone buzzes.

## Step 3: the morning run

Now the porter. In n8n, make an automation that runs every weekday at 08:00:

1. Look in Notion for posts dated today with **Approved** ticked.
2. Take the text under `=== FINAL POST ===` and the text under `=== FIRST COMMENT ===`.
3. Send both to your scheduling tool for a good hour that day. Mine posts at 10:00 Riga time and mirrors to Facebook.
4. Mark the row as posted in Notion, so it never goes out twice.

**Done when:** you tick a test post for tomorrow, and it appears in your scheduling tool by itself at 08:00.

## Step 4: protect your words

If you let an AI touch your post anywhere in the chain, even just to "format" it, it will eventually tighten a sentence, drop a comma or rewrite your ending. Asking it nicely not to doesn't work reliably.

So the guarantee goes in the machine itself, not in the instructions: a last step that says "if a human wrote this post, use it exactly as written". It's four lines of code. You don't need to understand them, just paste them. They're in the developer section at the bottom.

**Done when:** you compare a published post with your Notion text and they match exactly.

## Step 5 (optional): a second language that doesn't sound translated

I post in English and Latvian. Every tutorial says "ask the AI to translate". The result is grammatically perfect, and a native speaker smells it in one sentence: English rhythm wearing a Latvian coat.

The fix is to never ask for a translation. Give the AI the facts and ask it to write a new post for that market. This is the prompt, and it works for any language:

```
DO NOT TRANSLATE. You are not given an English post to convert.
You are given the SOURCE FACTS. COMPOSE THE POST FROM SCRATCH in Latvian,
as a Latvian marketer writing for Latvians would.

If a sentence in your draft maps word-for-word onto an English sentence,
rewrite it.

Different examples, different rhythm, different opening are all CORRECT.
Same facts, same point, same voice.
```

Same facts, same point, same voice, and two posts that share no sentence structure at all. It's the most useful paragraph in the whole system.

## Step 6: the reminder that actually matters

The last automation checks every ten minutes, from 06:00 to 20:00, whether a post has just gone live. When it has, my phone says: "you are live, go and reply for 15 minutes".

That ping is the real output of the whole system. Publishing on time is the easy part. The fifteen minutes you spend answering comments in the first hour still does more for reach than everything above.

**Done when:** your phone tells you a post is live before you thought to check.

## Where it goes wrong

- **Saving a change isn't switching it on.** n8n keeps a draft and a live version of every automation. I lost a day to a post that scheduled itself for "now", in the wrong time zone, because the live version was still the old one. Publish after every change.
- **The free database falls asleep.** Free database plans pause when they're barely used, and a machine that checks in once a morning is exactly that. One extra automation pokes it every six hours to keep it awake.
- **The silent failure.** The crash isn't the danger. The danger is the step that quietly stops marking posts as done, so the same post gets picked up forever. This is why the alarm comes first.
- **The AI drifts if you let it.** Any rule you really care about belongs in the machine, not in the prompt.
- **Automation doesn't buy reach.** It buys you time. What you do with the first hour after posting still decides how far a post goes.

## Start here today

Make the Notion table from step 1 and write next week's posts into it. Don't automate anything yet. Just get used to writing a week ahead and ticking the box. That habit is most of the system, and the machine only makes it effortless.

If you want the carousels too, they have their own article: [how my carousels are drawn in code](/blog/carousel-generator).

<details>
<summary>For your developer: the whole system, step by step</summary>

### The shape of it

<pre class="flow">  <b>NOTION</b>  content calendar        one row per post, per weekday
     │           topic · bucket · approved · the written post itself
     ▼
  <b>n8n</b>     Post Creation Automation      <i>08:00 Riga, weekdays</i>
     │           ├─ take oldest approved, not-yet-generated entry
     │           ├─ fetch the page body, split it on section markers
     │           ├─ <i>if a human wrote it → deliver verbatim, hard stop</i>
     │           ├─ else → Claude drafts from the source notes
     │           ├─ art-direct an image (deterministic mode per post type)
     │           └─ email me a one-click approval link
     ▼
  <b>SUPABASE</b>  content_log         post · image · carousel · first comment
     │             content_log_lv      the Latvian sibling
     │             lead_magnet_posts   magnet + trigger keyword
     ▼
  <b>n8n</b>     Post on Socials              <i>on approval</i>
     │           ├─ LinkedIn: document if a carousel exists, else image
     │           ├─ first comment auto-posts with the post
     │           └─ Facebook: image
     ▼
  <b>n8n</b>     LV Content Adapter           <i>12:05 Riga, daily</i>
     │           native Latvian version, composed — never translated
     ▼
  <b>n8n</b>     Golden hour reminder         <i>every 10 min, 06:00–20:00</i>
                 Telegram: "you are live, go and reply for 15 minutes"
</pre>

### The nine automations

<table>
  <thead><tr><th>Workflow</th><th>Trigger</th><th>What it owns</th></tr></thead>
  <tbody>
    <tr><td>Monthly Content Planner</td><td>25th, monthly</td><td>Reads the founder log, lays out next month's calendar skeleton in Notion, assigns buckets and day types.</td></tr>
    <tr><td>Post Creation Automation</td><td>08:00, weekdays</td><td>The core. One approved entry → post text, image, carousel link, first comment, DB row, approval email.</td></tr>
    <tr><td>Post generator (magnet)</td><td>sub-workflow</td><td>Lead-magnet days. Builds the magnet as styled HTML, uploads it to object storage, returns a public URL.</td></tr>
    <tr><td>Post on Socials</td><td>approval click</td><td>Schedules LinkedIn + Facebook at the local peak slot. Documents when a carousel exists, images otherwise.</td></tr>
    <tr><td>Post on Socials (magnet)</td><td>approval click</td><td>Same, plus the trigger keyword and the magnet URL for delivery.</td></tr>
    <tr><td>LV Content Adapter</td><td>12:05, daily</td><td>Native Latvian version of anything approved in the last seven days.</td></tr>
    <tr><td>Golden hour reminder</td><td>every 10 min</td><td>Catches the moment a post goes live and pushes the engagement checklist to Telegram.</td></tr>
    <tr><td>Failure notifier</td><td>on any error</td><td>Shared error handler. Every content workflow names it. Telegram with node, message, execution link.</td></tr>
    <tr><td>Database keepalive</td><td>every 6 hours</td><td>Free-tier Postgres pauses after a week of low traffic. A daily-at-08:00 pipeline is exactly that profile.</td></tr>
  </tbody>
</table>

Seven touch content. Two exist purely so the other seven fail loudly instead of quietly. The monthly planner and the Latvian adapter are paused, so seven run live today. The publisher also turns each post into an X and Threads thread with Claude Haiku, three hours after LinkedIn.

### The verbatim override (step 4)

The model still runs: it produces the image brief and the metadata. It simply cannot win an argument about the text. Verified by md5 against the source, character for character, every run.

```
// Pre-written post wins, verbatim — code-level guarantee against paraphrase.
try {
  const ctx = $('Assemble Story Context').first().json;
  if (ctx && ctx.prewritten_post && String(ctx.prewritten_post).trim().length > 0) {
    parsed.master_linkedin_post = String(ctx.prewritten_post).trim();
  }
} catch (e) {}
```

### Slicing a Notion page on section markers

```
=== FINAL POST ===        the English post, verbatim
=== FINAL POST LV ===     the Latvian post, natively written
=== FIRST COMMENT ===     auto-posted with the post
=== CAROUSEL URL ===      the PDF to attach as a document
```

```
const ANY_MARKER = /^=+\s*(FINAL POST|FIRST COMMENT|CAROUSEL URL)/i;

function sliceSection(testFn) {
  let start = -1;
  for (let i = 0; i < items.length; i++) { if (testFn(items[i].text)) { start = i; break; } }
  if (start === -1) return [];
  let end = items.length;
  for (let i = start + 1; i < items.length; i++) {
    if (ANY_MARKER.test(items[i].text)) { end = i; break; }   // stop at the NEXT marker
  }
  return items.slice(start + 1, end);
}
```

<div class="callout callout--cyan">
  <p><b>The bug worth stealing the fix for:</b> the first version stopped only at the <em>same</em> marker type, so the Latvian post leaked onto the end of every English one. Any marker ends any section. One regex, one afternoon lost.</p>
</div>

### Deterministic art direction

The image style is picked by lookup, post type in, visual system out, and the model only fills in details. Charts are banned, because image models invent proportions. Personal stories get no generated image at all. Today most posts ship a carousel drawn in code from the post's own numbers instead.

<table>
  <thead><tr><th>Mode</th><th>Accent</th><th>Used for</th><th>Look</th></tr></thead>
  <tbody>
    <tr><td>REBEL</td><td>red</td><td>Hot takes, lessons, failures, market commentary</td><td>Protest-poster typography, one street-art element</td></tr>
    <tr><td>BLUEPRINT</td><td>cyan</td><td>Automation hacks, tactical plays</td><td>Engineering drawing: numbered steps, node flow, real labels from the post</td></tr>
    <tr><td>MAGNET</td><td>amber</td><td>Every lead-magnet day</td><td>Flat mockup of the actual asset + the keyword chip</td></tr>
  </tbody>
</table>

### The database

```
create table content_log (
  id                 uuid primary key default gen_random_uuid(),
  day                text,
  content_type       text,
  post_content       text,
  image_url          text,
  carousel_url       text,          -- PDF → posted as a LinkedIn document
  first_comment      text,          -- auto-posted with the post
  scheduled_for      timestamptz,   -- local peak slot, stored in UTC
  golden_hour_pinged boolean default false,
  status             text,          -- pending | scheduled | posted
  linkedin_post_urn  text,
  facebook_post_urn  text,
  created_at         timestamptz default now()
);

create table content_log_lv (
  id              uuid primary key default gen_random_uuid(),
  source_id       uuid references content_log(id),
  post_content_lv text,
  image_url       text,
  status          text,
  created_at      timestamptz default now()
);

create table lead_magnet_posts (
  id              uuid primary key default gen_random_uuid(),
  post_content    text,
  image_url       text,
  pdf_url         text,   -- the hosted magnet
  trigger_keyword text,   -- the word people comment
  status          varchar,
  created_at      timestamptz default now()
);

create index on content_log (status, scheduled_for);
create index on content_log (golden_hour_pinged) where golden_hour_pinged = false;
```

### Running cost

n8n, a Postgres, a scheduling API and tokens. Claude Opus 5 lists at $5 per million input tokens and $25 per million output, and a day's run of this pipeline is a rounding error against one freelance invoice.

</details>
