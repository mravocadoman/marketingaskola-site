
The eight carousels below all went out on my LinkedIn as swipeable PDFs. Nobody designed them. I didn't open Canva and I didn't brief a designer. A small program drew every slide, and each deck cost €0.

Making them was always the problem with carousels. One carousel is eight slides of design work. Do that in Canva three times a week and it's a part-time job, one you'll quit by week four. Templates help, until the text doesn't fit and you spend twenty minutes nudging a text box.

So I took the design step out. I write the post. An AI turns it into a list of slides. The program lays them out, shrinks the type until it fits, centres everything, and saves a PDF. Long text or short, five slides or eight, nothing ever spills off the edge.

Open a couple before you read on:

<div class="cards">
    <a class="card" href="https://yxdtomxgsqaguqjhutgq.supabase.co/storage/v1/object/public/post_files/roas.pdf"><b>ROAS is mostly product, not skill</b><span>7 slides · PDF</span></a>
    <a class="card" href="https://yxdtomxgsqaguqjhutgq.supabase.co/storage/v1/object/public/post_files/ads-library.pdf"><b>I killed a business idea with the Ads Library</b><span>7 slides · PDF</span></a>
    <a class="card" href="https://yxdtomxgsqaguqjhutgq.supabase.co/storage/v1/object/public/post_files/cheap-leads.pdf"><b>€0.38 a lead. 2% bought.</b><span>6 slides · PDF</span></a>
    <a class="card" href="https://yxdtomxgsqaguqjhutgq.supabase.co/storage/v1/object/public/post_files/ai-review-layer.pdf"><b>An AI that reviews another AI&#x27;s work</b><span>6 slides · PDF</span></a>
    <a class="card" href="https://yxdtomxgsqaguqjhutgq.supabase.co/storage/v1/object/public/post_files/ux-older-buyers.pdf"><b>Designing AI for people who distrust AI</b><span>6 slides · PDF</span></a>
    <a class="card" href="https://yxdtomxgsqaguqjhutgq.supabase.co/storage/v1/object/public/post_files/photos-commission.pdf"><b>The best sales training I ever got</b><span>6 slides · PDF</span></a>
    <a class="card" href="https://yxdtomxgsqaguqjhutgq.supabase.co/storage/v1/object/public/post_files/trust-checklist.pdf"><b>Selling a product that can fail</b><span>5 slides · PDF</span></a>
    <a class="card" href="https://yxdtomxgsqaguqjhutgq.supabase.co/storage/v1/object/public/post_files/latvian-ads.pdf"><b>Meta ads in a two-million-person market</b><span>5 slides · PDF</span></a>
</div>

**What you'll have at the end:** you paste a finished post and one prompt into an AI chat, type one line on your computer, and get a branded PDF carousel ready for LinkedIn. No design step, and €0 a deck.

## What you need

- **Claude or ChatGPT**, whichever you already use. It writes the slides from your post.
- **Python** (free), the program that runs the generator, plus one free add-on for it called reportlab, which draws the PDF.
- **The generator itself**: one file of about two hundred lines. You copy it from the developer section at the bottom. You never need to read it.
- **Money:** €0 per deck. No subscription, no font licences, no paid service. It runs on your own computer, even offline.
- **Time:** the setup is a one-off. Making it look like your brand takes about two minutes. After that, each deck is one copy and paste plus one typed line.
- **Skill:** no design, and no coding beyond that one line. If you've never typed a command into your computer, step 4 is the part to hand to someone technical, once.

## How it works

First, why a PDF at all. LinkedIn treats a PDF as a document post, the swipeable card format. Document posts consistently get more engagement than plain text or a single image, and they hold people on the post for longer. How long people stay is the signal that actually decides how far a post travels.

Now think of a sign maker who owns exactly five stencils. You hand over the words and say which stencil. The sign maker picks the letter size that fits the board, puts it where it looks centred, and paints it in your colours. You never touch the layout, so there is nothing to nudge.

The whole trip looks like this:

<pre class="flow">  <b>YOUR POST</b>     you write it, as always
     ▼
  <b>AI CHAT</b>       your post + the prompt from step 2
     ▼
  <b>SLIDE LIST</b>    which slide, what text, in what order
     ▼
  <b>GENERATOR</b>     lays it out, shrinks the type to fit
     ▼
  <b>PDF</b>           upload it to LinkedIn as a document
</pre>

And these are the five stencils, the only slide types there are:

- **Cover.** Slide 1. The hook: your post's first line, word for word.
- **Big number.** One figure as the hero. If it's bad news, it turns red.
- **Statement.** A claim that needs room to land.
- **List.** Three to five points. This is the slide people screenshot.
- **Outro.** The takeaway, then the follow prompt.

That's the whole vocabulary, and the limit is the point. A deck that needs a sixth type is usually a deck that needs cutting.

<div class="callout callout--cyan">
  <p><b>Cost per deck: zero.</b> No paid service, no subscription, no font licences. It uses the
  fourteen fonts every PDF reader already has, which is also why each deck weighs about 7 KB
  instead of 400 KB. Run it two hundred times and the bill is the same.</p>
</div>

## Step 1: pick a post that deserves a carousel

Roughly half your posts shouldn't get one, and that discipline is worth more than the generator.

- **Give it one** when the spine of the post is a list, a checklist, a sequence of steps, or a comparison of numbers. Tactical posts, teardowns, walk-throughs of an automation.
- **Never** for a personal story. A story flattened into slides loses the thing that made it a story. Those get one real photograph and nothing else.

**Done when:** you've picked one post that's built on a list, steps or numbers.

## Step 2: let the AI write the slides

You don't write the slide list by hand. Open Claude or ChatGPT, paste this prompt, and paste your finished post underneath it:

```
You turn a finished LinkedIn post into a carousel spec for carousel.py.

RULES
- 5 to 8 slides. Fewer is better. Never pad.
- Slide 1 is `cover`: a drawn visual hook (pick one art_* helper: tiles, toggle, bars2, code_to_slide, clock, circles2, gauge) above the headline. The headline is the post's opening line, VERBATIM, with the one number or noun that carries it wrapped in **double asterisks** (it takes the accent colour).
  Use \n for a deliberate line break. Under 12 words.
- The last slide is `outro`: the takeaway, then the follow prompt.
- Between them, choose types by what the content actually is:
    bignum     one figure as the hero. Use it whenever a number carries the point.
               `red: true` for the number that is bad news.
    statement  a claim that needs room to land. Eyebrow + headline + short body.
    list       3 to 5 items. This is the slide people screenshot. Every deck needs one.
- EVERY number must appear in the source post. Invent nothing. If the post
  says "most", the slide says "most" - not "80%".
- No slide body over ~40 words. If it does not fit, it is two slides or it is cut.
- Voice: flat, specific, no hype adjectives. Same voice as the post.

OUTPUT
JSON only, no fence, matching this shape:
{"title": "...", "slides": [ {...}, ... ]}
```

What comes back looks like code. Don't let that put you off: it's your slides written out in a strict format the generator can read, with each slide's type and its text. Leave the technical bits of the prompt in, too. They're instructions for the generator, not for you.

Two rules in that prompt do most of the work. One stops the AI padding the deck out to eight slides. The other stops it inventing numbers.

**Done when:** you have the AI's answer, five to eight slides long, with a cover first and an outro last.

## Step 3: check every number

Read the slides next to your post. Every number on a slide must be one you can point to in the post. If the post says "most", the slide says "most".

<div class="callout">
  <p><b>The rule that matters most:</b> <em>every number must appear in the source post.</em>
  Left unconstrained, a model will happily turn "most of them" into "80%" because
  a specific number looks better on a slide. It looks better right up until someone asks
  where it came from.</p>
</div>

While you're there, look at length. The prompt caps each slide at about 40 words. If a slide runs over, it's two slides or it gets cut.

This matters more than it looks. A carousel is a screenshot waiting to happen, and whatever is on it will outlive the caption that explained it.

**Done when:** every number on the slides is in your post, and no slide is longer than a short paragraph.

## Step 4: set up the generator, once

This is the one technical step. If typing a command into your computer is new to you, hand this part to someone technical. You only do it once.

1. Install Python. It's free.
2. Install its one add-on, reportlab. That's a single line typed into the Terminal, the window on your computer where you type commands instead of clicking.
3. Copy the generator from the developer section and save it as a file called `carousel.py`, in a folder of its own.
4. Save the example slide list from the developer section next to it. It's the one behind the "€0.38 a lead" deck. Then run it once.

The exact lines to type are in the developer section too. You don't need to understand them, just paste them.

**Done when:** a six-slide PDF appears in the folder, and it looks like the "€0.38 a lead" deck in the grid above.

## Step 5: make it look like yours

Open `carousel.py` in any text editor. It takes about two minutes, and everything you change is near the top of the file or in the part that draws the last slide:

1. **Your colours.** They sit in two lines near the top, as six-character colour codes. Swap them for your brand's and every deck follows.
2. **Your name in the footer.** One line near the top, called `BRAND`, sets the name printed on every slide.
3. **Your sign-off.** The name, the one-line description and the follow prompt on the last slide. Mine says "12 years in paid ads, ecommerce and automation."
4. **Other alphabets.** The built-in fonts cover the euro sign and Western European accents, but not Latvian, Polish, Czech or Turkish letters. For those, one setting switches to a font you choose, and each file grows to roughly 60 KB. The developer section says which setting.

**Done when:** you run the example again and it comes out in your colours, with your name on the last slide.

## Step 6: draw the deck and post it

1. Save the AI's answer from step 2 as a file in the same folder, named after the post, for example `my-post.json`. Delete any double asterisks from the cover line first (more on that below).
2. Type the same line as in step 4, with your file's name in place of the example's. The PDF appears next to it.
3. Swipe through it once, the way your readers will.
4. On LinkedIn, write the post as usual and attach the PDF as a document. I use the post's first line as the document's title.

**Done when:** your post is live with a swipeable carousel under it.

## The bigger version I use now

Everything above still works. But since October 2026, the decks on my profile come from a second generator. If you're starting today and have someone technical to help, start there.

The simple one draws five slide types from text. The newer one draws fourteen, from the numbers in a post: bars, funnels, a grid of 25 squares with 4 lit, tables, before and after. Two ideas matter most in it:

- **It measures everything.** Every line of text is measured before it's placed. If a block won't fit its box, the type shrinks in steps until it does.
- **It refuses to save a broken deck.** If any text is clipped or overlapping, or any slide runs past 32 words, it saves nothing and tells you which slide. You fix the copy, not the slide.

It's built differently, though: you make a deck by copying one block in its build file and changing the words and numbers. That's a job for someone comfortable editing code. The files, the seven decks it made for my profile in October 2026, and how to run it are in the developer section.

## Where it goes wrong

- **Padding.** Left alone, an AI pads the deck out to eight slides. That's why the prompt says "fewer is better, never pad". Past eight slides, engagement falls off and you've written an article with extra steps.
- **Made-up numbers.** A precise number looks better on a slide, so "most" quietly becomes "80%". Step 3 is there to catch it.
- **Asterisks on the cover.** The prompt asks for a drawn picture above the headline and for the key number wrapped in double asterisks. Only the bigger generator draws those. The simple one skips the picture and prints the asterisks as they are, so delete them from the cover line before you draw.
- **Latvian decks.** The built-in fonts don't have Latvian letters. A Latvian deck needs the font setting from step 5 switched on.
- **Every deck looking the same.** A week of posts should not look like one long post. The bigger generator alternates a dark theme and a light one. I tried a third theme in cyan and dropped it on 30 September: it looked bad.

## Start here today

Take your last post that's built on a list, steps or numbers. Paste it into Claude or ChatGPT with the prompt from step 2, and check every number in the answer against the post.

You don't need the generator for this part. You'll see straight away whether the post has a carousel in it, and what it would say.

If you want the carousels to go out by themselves too, the whole publishing machine is in [the marketing department article](/blog/marketing-department-on-claude-and-n8n).

<details>
<summary>For your developer: the generator, the spec format and version 2</summary>

### The spec format

Five slide types. That is the whole vocabulary, and the constraint is the point: a deck that needs a sixth type is usually a deck that needs cutting.

<table>
  <thead><tr><th>Type</th><th>Fields</th><th>Use for</th></tr></thead>
  <tbody>
    <tr><td>cover</td><td>headline, kicker, swipe</td><td>Slide 1. The hook, verbatim from the post's first line.</td></tr>
    <tr><td>bignum</td><td>eyebrow, number, label, body, red</td><td>One figure as the hero. <code>red: true</code> flips the accent for bad news.</td></tr>
    <tr><td>statement</td><td>eyebrow, headline, body</td><td>A claim that needs room to land.</td></tr>
    <tr><td>list</td><td>eyebrow, headline, items[]</td><td>The mechanism. Three to five items. This is the slide people screenshot.</td></tr>
    <tr><td>outro</td><td>headline, body, name, tagline, cta</td><td>The takeaway, then the follow prompt.</td></tr>
  </tbody>
</table>

### A real spec, end to end

This is the file behind the "€0.38 a lead" deck above, nothing removed. Save it as `cheap-leads.json`:

```
{
  "title": "Cheap leads vs good leads",
  "slides": [
    {"type":"cover","headline":"€0.38 a lead.\n2% bought.","kicker":"I was proud of that number for about a week.","swipe":true},
    {"type":"bignum","eyebrow":"The vanity number","number":"€0.38","label":"per email signup","body":"A webinar campaign. 2,000+ signups, dirt cheap, dashboard glowing. Then the sales data came in."},
    {"type":"bignum","eyebrow":"The real number","number":"2%","label":"of those signups bought anything","body":"The algorithm did exactly what I asked. I optimised for form-fills, so it found the people of this world who fill forms.","red":true},
    {"type":"statement","eyebrow":"The mechanism","headline":"Filling the form was the conversion.","body":"Buying was never part of the deal.\n\nMeta optimises toward the event you name. Name the wrong one and it will hit it perfectly."},
    {"type":"list","eyebrow":"The fix","headline":"How to stop buying form-fillers","items":["Optimise for the event closest to money that still gets volume - purchases if you can, high-intent steps if you cannot.","Cheap leads are cheap because the platform knows something about them that you do not yet.","A lookalike built on form-fillers finds more form-fillers. The seed defines the harvest.","If volume is too low to optimise for purchases, that is a funnel-economics problem. The ads are not the fix."]},
    {"type":"outro","headline":"The metric you optimise for is the product you are buying from the algorithm.","body":"Buy carefully.","cta":"Follow for the numbers with the caveats attached."}
  ]
}

```

Then:

```
python3 carousel.py cheap-leads.json cheap-leads.pdf
```

### The generator

About two hundred lines. Only dependency is `reportlab` (`pip install reportlab`). Save it as `carousel.py`:

```
#!/usr/bin/env python3
"""Brand carousel generator for LinkedIn document posts.

Renders native vector text with reportlab: crisp at any zoom, selectable,
and ~20x smaller than a rasterised deck (matters because the PDF has to be
moved into Supabase storage as base64 for Zernio to fetch).

Spine: navy #00152c, white + cyan #03c3f8, red #ff2b2b, amber #ffb020.
Usage: python3 carousel.py spec.json out.pdf
"""
import json, sys
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

PT_W, PT_H = 540, 675                 # 1080x1350 at 2x, in points
S = PT_W / 1080.0                     # design px -> pt
MARGIN, TOP_SAFE, BOT_SAFE = 84 * S, 150 * S, 1180 * S

BRAND = "acquisition.md"              # footer wordmark, every slide

def rgb(h):
    h = h.lstrip("#")
    return Color(*(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)))

NAVY, CYAN, WHITE = rgb("00152c"), rgb("03c3f8"), rgb("ffffff")
RED, BODY, MUTED = rgb("ff2b2b"), rgb("d6e2ee"), rgb("849cb2")

# Base-14 PDF fonts: zero embedding, ~8x smaller files. WinAnsi covers EUR and
# Western European accents. Latvian diacritics are NOT covered - LV decks must
# switch EMBED_FONTS on (see below).
EMBED_FONTS = False
if EMBED_FONTS:
    pdfmetrics.registerFont(TTFont("Head", "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("Body", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
    pdfmetrics.registerFont(TTFont("BodyB", "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"))
else:
    pdfmetrics.registerFont(pdfmetrics.Font("Head", "Helvetica-Bold", "WinAnsiEncoding"))
    pdfmetrics.registerFont(pdfmetrics.Font("Body", "Helvetica", "WinAnsiEncoding"))
    pdfmetrics.registerFont(pdfmetrics.Font("BodyB", "Helvetica-Bold", "WinAnsiEncoding"))

def sw(t, font, size): return pdfmetrics.stringWidth(t, font, size)

def wrap(text, font, size, max_w):
    out = []
    for para in str(text).split("\n"):
        if not para.strip():
            out.append(""); continue
        cur = ""
        for word in para.split():
            t = (cur + " " + word).strip()
            if sw(t, font, size) <= max_w: cur = t
            else:
                if cur: out.append(cur)
                cur = word
        if cur: out.append(cur)
    return out

def fit(text, max_w, max_h, start, floor, lead=1.06):
    size = start
    while size > floor:
        ls = wrap(text, "Head", size, max_w)
        if len(ls) * size * lead <= max_h: return size, ls, size * lead
        size -= 2
    return floor, wrap(text, "Head", floor, max_w), floor * lead

# ---- elements: (height, draw_fn) with y measured downward from the top ----
def e_rule(w=150, h=10, gap=44, color=CYAN):
    w, h, gap = w * S, h * S, gap * S
    def d(c, y):
        c.setFillColor(color); c.rect(MARGIN, PT_H - y - h, w, h, stroke=0, fill=1)
    return (h + gap, d)

def e_lines(lines, font, size, lh, color, gap=0):
    def d(c, y):
        c.setFont(font, size); c.setFillColor(color)
        yy = y
        for ln in lines:
            if ln: c.drawString(MARGIN, PT_H - yy - size, ln)
            yy += lh
    return (len(lines) * lh + gap, d)

def e_text(text, font, size, color, lead=1.36, gap=0, max_w=None):
    max_w = max_w or (PT_W - 2 * MARGIN)
    return e_lines(wrap(text, font, size, max_w), font, size, size * lead, color, gap)

def e_bullets(items, size, color, lead=1.36, item_gap=28):
    item_gap *= S
    indent, lh = 68 * S, size * lead
    wrapped = [wrap(i, "Body", size, PT_W - MARGIN - indent - MARGIN) for i in items]
    total = sum(len(w) * lh + item_gap for w in wrapped) - item_gap
    def d(c, y):
        yy = y
        for ws in wrapped:
            c.setFillColor(CYAN)
            c.rect(MARGIN, PT_H - yy - lh * 0.52, 38 * S, 6 * S, stroke=0, fill=1)
            c.setFont("Body", size); c.setFillColor(color)
            for ln in ws:
                c.drawString(MARGIN + indent, PT_H - yy - size, ln)
                yy += lh
            yy += item_gap
    return (total, d)

def page(c, elements, footer=None, anchor=0.46):
    c.setFillColor(NAVY); c.rect(0, 0, PT_W, PT_H, stroke=0, fill=1)
    total = sum(h for h, _ in elements)
    y = TOP_SAFE + max(0, (BOT_SAFE - TOP_SAFE - total) * anchor)
    for h, fn in elements:
        fn(c, y); y += h
    if footer:
        c.setFont("Body", 13); c.setFillColor(MUTED)
        c.drawString(MARGIN, 39, footer[0])
        c.drawRightString(PT_W - MARGIN, 39, footer[1])
    c.showPage()

def s_cover(c, s, i, n):
    size, ls, lh = fit(s["headline"], PT_W - 2 * MARGIN, 700 * S, 58, 28)
    els = [e_rule(), e_lines(ls, "Head", size, lh, WHITE, gap=40 * S)]
    if s.get("kicker"): els.append(e_text(s["kicker"], "Body", 20, MUTED, 1.38, 56 * S))
    if s.get("swipe", True): els.append(e_text("SWIPE »", "BodyB", 16, CYAN))
    page(c, els, (BRAND, f"{i}/{n}"), anchor=0.40)

def s_statement(c, s, i, n):
    els = []
    if s.get("eyebrow"): els.append(e_text(s["eyebrow"].upper(), "BodyB", 15, CYAN, 1.4, 26 * S))
    size, ls, lh = fit(s["headline"], PT_W - 2 * MARGIN, 520 * S, 46, 26)
    els.append(e_lines(ls, "Head", size, lh, WHITE, gap=44 * S))
    if s.get("body"): els.append(e_text(s["body"], "Body", 21, BODY, 1.40))
    page(c, els, (BRAND, f"{i}/{n}"))

def s_bignum(c, s, i, n):
    els = []
    if s.get("eyebrow"): els.append(e_text(s["eyebrow"].upper(), "BodyB", 15, CYAN, 1.4, 30 * S))
    size = 150
    while size > 45 and sw(s["number"], "Head", size) > PT_W - 2 * MARGIN: size -= 5
    els.append(e_text(s["number"], "Head", size, RED if s.get("red") else CYAN, 1.02, 26 * S))
    if s.get("label"): els.append(e_text(s["label"], "BodyB", 24, WHITE, 1.28, 34 * S))
    if s.get("body"): els.append(e_text(s["body"], "Body", 20, BODY, 1.40))
    page(c, els, (BRAND, f"{i}/{n}"))

def s_list(c, s, i, n):
    els = []
    if s.get("eyebrow"): els.append(e_text(s["eyebrow"].upper(), "BodyB", 15, CYAN, 1.4, 24 * S))
    size, ls, lh = fit(s["headline"], PT_W - 2 * MARGIN, 260 * S, 38, 22)
    els.append(e_lines(ls, "Head", size, lh, WHITE, gap=52 * S))
    cnt = len(s["items"])
    els.append(e_bullets(s["items"], 20 if cnt <= 4 else (18 if cnt == 5 else 16), BODY))
    page(c, els, (BRAND, f"{i}/{n}"), anchor=0.42)

def s_outro(c, s, i, n):
    size, ls, lh = fit(s["headline"], PT_W - 2 * MARGIN, 440 * S, 43, 25)
    els = [e_lines(ls, "Head", size, lh, WHITE, gap=42 * S)]
    if s.get("body"): els.append(e_text(s["body"], "Body", 21, BODY, 1.40, 70 * S))
    els.append(e_rule(gap=34))
    els.append(e_text(s.get("name", "Rihards Zeila"), "Head", 28, WHITE, 1.15, 10 * S))
    els.append(e_text(s.get("tagline", "12 years in paid ads, ecommerce and automation."),
                      "Body", 16, MUTED, 1.3, 22 * S))
    els.append(e_text(s.get("cta", "Follow for the unglamorous version."), "BodyB", 17, CYAN))
    page(c, els, None, anchor=0.38)

RENDER = {"cover": s_cover, "statement": s_statement, "bignum": s_bignum,
          "list": s_list, "outro": s_outro}

def build(spec_path, out_path):
    spec = json.load(open(spec_path))
    slides = spec["slides"]; n = len(slides)
    c = canvas.Canvas(out_path, pagesize=(PT_W, PT_H))
    c.setTitle(spec.get("title", "Carousel"))
    for i, s in enumerate(slides):
        RENDER[s["type"]](c, s, i + 1, n)
    c.save()
    print(f"built {out_path} - {n} slides")

if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2])

```

### Making it yours, in the code

1. **Four colours.** The `rgb()` lines near the top. Swap the hexes for your brand and every deck follows.
2. **The wordmark.** One constant, `BRAND`, near the top. Change it and every slide follows.
3. **The sign-off.** Defaults live in `s_outro`: name, tagline, call to action.
4. **Latvian, Polish, Czech, Turkish?** Set `EMBED_FONTS = True` and point the three `TTFont` lines at a Unicode face. Files grow to roughly 60 KB. The base-14 fonts cover Western European accents and the euro sign, but not the full diacritic set.

<div class="callout callout--cyan">
  <p><b>Prompt vs. generator:</b> the cover rule in the prompt (an <code>art_*</code> helper, the accent word in <code>**double asterisks**</code>) is written for <code>deck2.py</code>. <code>carousel.py</code> ignores any key it doesn't read and draws the headline string as it is, so the asterisks print literally. Strip them, or teach <code>s_cover</code> the two-tone headline.</p>
</div>

### Version 2, September 2026: the data-chart generator

Everything above still works. But the decks on my profile since October 2026 come from a second generator, `deck2.py`, and if you are starting today, start there.

The v1 file draws five text-led slide types from a JSON spec. The v2 file draws **fourteen slide types from the numbers in a post**, and the two ideas that matter most in it are measurement and refusal:

- **Every line of text is measured before it is placed.** Words wrap by their real rendered width, not by a character count. If a block would not fit its box, the font shrinks in steps until it does. A single unbreakable token that is too wide for its column shrinks too.
- **The layout audit refuses to save a broken deck.** After drawing, `save()` checks every text box against the safe area and against every other text box on the slide. Anything clipped or overlapping raises, and no PDF is written. You fix the copy, not the slide.
- **Preview equals PDF.** Previews render in TeX Gyre Heros, a Helvetica clone with identical metrics; the PDF uses the Helvetica core font. So what the audit measures is what LinkedIn renders, and the file stays around 10 KB with no embedded fonts.
- **Two themes:** navy (dark) and light (paper), alternated. A cyan inverted theme was tried and dropped on 30 September: it looked bad. A week of posts should not look like one long post.
- **Dollar signs.** matplotlib treats `$...$` as maths and silently turns "$40 and $60" into italic garbage. The generator escapes them. If you write your own, you will hit this in week one.

<table>
  <tr><th>Slide type</th><th>What it is for</th></tr>
  <tr><td>cover</td><td>A drawn visual hook (art=&lt;helper&gt;: tiles, toggle, bars, code-to-slide, clock ring, two circles, gauge) above a two-tone headline (**highlight** = accent colour), a sub line, "swipe". Without art: the old layout with an optional huge number.</td></tr>
  <tr><td>statement</td><td>One sentence worth quoting, centred, with an optional muted sub line.</td></tr>
  <tr><td>bignum, stats</td><td>One number, or two to three numbers side by side with labels.</td></tr>
  <tr><td>hbars</td><td>Horizontal bars from real values; label column and value column sized by measurement so nothing clips.</td></tr>
  <tr><td>funnel</td><td>Anything that narrows: sent, opened, replied, bought. Box widths from ratios, never below the width of the value text.</td></tr>
  <tr><td>flow</td><td>A numbered mechanism. Row heights from measured text; type shrinks together so the list fits.</td></tr>
  <tr><td>bullets</td><td>A checklist with a chevron. Same shrink-to-fit.</td></tr>
  <tr><td>grid</td><td>"N of which M": 25 squares, 4 lit. Cell size from the available height.</td></tr>
  <tr><td>table</td><td>Three columns with fractional widths; row height from the tallest cell.</td></tr>
  <tr><td>compare</td><td>Two columns: before vs after, blueprint vs reality.</td></tr>
  <tr><td>gate</td><td>The kit slide: what is inside, a "Comment KEYWORD" box, the URL in small print.</td></tr>
  <tr><td>outro</td><td>The closing question and a save line, for posts without a kit.</td></tr>
</table>

### The version 2 files

- [deck2.py](https://yxdtomxgsqaguqjhutgq.supabase.co/functions/v1/download/deck2.py) — the generator, 726 lines (v2.5, 1 October: cyan and navy only, one grid on every card, drawn cover hooks, tool chips under the art, a white light theme, no reader text under 30pt, footer wordmark rihardszeila.com), matplotlib only. Every slide is capped at 32 words (`MAX_WORDS`); over that, `save()` refuses the deck and tells you to cut copy, not shrink type.
- [brand-icons.py](https://yxdtomxgsqaguqjhutgq.supabase.co/functions/v1/download/brand-icons.py) and [brand-paths.json](https://yxdtomxgsqaguqjhutgq.supabase.co/functions/v1/download/brand-paths.json) — the official marks on the tool chips: Simple Icons path data for Claude, n8n, Notion, Facebook, Instagram, Shopify, Stripe, Python, Meta ads, Telegram, Postgres, X, Threads, Gmail and Zapier, drawn in the theme ink beside the tool name. Save them next to deck2.py as `brand_icons.py` and `brand_paths.json` (underscores), `pip install svgpath2mpl`, and the build file picks them up with `import brand_icons`. Tools without a published mark keep the generic pictograms.
- [build-batch1.py](https://yxdtomxgsqaguqjhutgq.supabase.co/functions/v1/download/build-batch1.py) — the build file for the seven decks live on my profile in October 2026: one function call per slide, copy the shapes.
- The seven decks themselves, to see the output before you run anything: [team-department](https://yxdtomxgsqaguqjhutgq.supabase.co/functions/v1/download/carousels/team-department.pdf) · [ads-seven-rules](https://yxdtomxgsqaguqjhutgq.supabase.co/functions/v1/download/carousels/ads-seven-rules.pdf) · [roas-36-13](https://yxdtomxgsqaguqjhutgq.supabase.co/functions/v1/download/carousels/roas-36-13.pdf) · [carousel-330-lines](https://yxdtomxgsqaguqjhutgq.supabase.co/functions/v1/download/carousels/carousel-330-lines.pdf) · [start-six-sessions](https://yxdtomxgsqaguqjhutgq.supabase.co/functions/v1/download/carousels/start-six-sessions.pdf) · [leads-038](https://yxdtomxgsqaguqjhutgq.supabase.co/functions/v1/download/carousels/leads-038.pdf) · [review-marks-homework](https://yxdtomxgsqaguqjhutgq.supabase.co/functions/v1/download/carousels/review-marks-homework.pdf)

### Running version 2

```
pip install matplotlib pillow
# put deck2.py and build-batch1.py in one folder, then:
python3 build-batch1.py
# out2/<slug>.pdf is the carousel; out2/<slug>/01.png ... are the previews; out2/<slug>-sheet.png is the contact sheet
```

To write your own deck: copy one block from the build file, change the slug and theme, and replace the strings and numbers. If the audit complains, the complaint names the slide, the text and the pixels. Shorten the text; do not touch the layout.

### How it gets onto LinkedIn without hands

The PDF is stored base64 in a Postgres table and served by a tiny edge function at a stable URL. That URL goes into the post's Notion page under a `=== CAROUSEL URL ===` marker; the publishing workflow reads it and attaches the file to the LinkedIn post as a document, with the post's first line as the document title. The whole path is in [the marketing department article](/blog/marketing-department-on-claude-and-n8n).

<div class="callout">
  <p><b>The rest of the machine.</b> This generator is one node in a nine-workflow system that
  writes, art-directs, translates, schedules and publishes everything I post, in two languages.
  The whole thing (n8n workflows, prompts, database schema) is in <a href="/blog/marketing-department-on-claude-and-n8n">the marketing department article</a>.</p>
</div>

</details>
