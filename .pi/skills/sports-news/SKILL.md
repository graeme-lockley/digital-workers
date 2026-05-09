---
name: sports-news
description: Get sports news, fixtures, results, scores and standings for Graeme's teams — Stormers, Bulls, Lions, Sharks, Springboks, Junior Springboks, Blitzbokke, Brentford FC, Proteas, Western Province, SA golf, and Formula 1. Use for any rugby, football, cricket, golf, or F1 question.
metadata:
  spec: https://agentskills.io/home
---

# Sports News Skill

Covers all sports Graeme follows. The **primary data source** is the **ESPN hidden JSON API** —
free, no API key, returns clean JSON via `bash` curl commands. It is faster and more reliable than
scraping pages.

Use `browse_page` only for cricket (not in ESPN API) or for news articles where more context is needed.

---

## Graeme's Teams at a Glance

| Sport | Team / Interest |
|-------|----------------|
| Rugby (URC) | DHL Stormers ⭐ favourite, Vodacom Bulls, Lions, Sharks |
| Rugby (International) | Springboks, Junior Springboks (U20), Blitzbokke (Sevens) |
| Football | Brentford FC (Premier League) |
| Cricket | Proteas, Western Province |
| Golf | SA players, Majors, Ryder Cup, PGA Tour, DP World Tour |
| Motorsport | Formula 1 |

Default to Stormers when rugby is asked without specifying a team.

---

## ESPN API — Overview

The ESPN API is a free, undocumented JSON API. No API key required.

**Base pattern:**
```
site.api.espn.com/apis/site/v2/sports/{sport}/{league}/{endpoint}
```

All calls use `bash` with `curl`:
```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/{endpoint}" | python3 -m json.tool
```

**Key sport/league slugs:**

| Sport | Slug |
|-------|------|
| Rugby Union | `rugby` |
| Soccer (Premier League) | `soccer/eng.1` |
| Formula 1 | `racing/f1` |
| Golf (PGA Tour) | `golf/pga` |
| Golf (European/DP World Tour) | `golf/eur` |

**Key endpoints:** `scoreboard`, `news`, `standings`, `teams`, `teams/{id}/schedule`

---

## 1. RUGBY

### 1.1 ESPN Rugby League IDs

| Competition | ESPN League ID |
|-------------|---------------|
| United Rugby Championship (URC) | `270557` |
| Rugby Championship | `244293` |
| Six Nations | `180659` |
| Currie Cup | `270555` |
| Super Rugby Pacific | `242041` |
| British & Irish Lions Tour | `268565` |
| Rugby World Cup | `164205` |

### 1.2 URC — Scoreboard (Live / Today)

```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/rugby/270557/scoreboard" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for e in d.get('events', []):
    comps = e.get('competitions', [{}])[0]
    teams = comps.get('competitors', [])
    home = next((t for t in teams if t.get('homeAway')=='home'), {})
    away = next((t for t in teams if t.get('homeAway')=='away'), {})
    status = e.get('status', {}).get('type', {}).get('description', '?')
    date = e.get('date', '?')[:10]
    print(f\"{date} | {home.get('team',{}).get('displayName','?')} {home.get('score','-')} - {away.get('score','-')} {away.get('team',{}).get('displayName','?')} | {status}\")
"
```

Replace `270557` with any other league ID from the table above.

### 1.3 URC Team IDs (SA Teams)

| Team | ESPN ID |
|------|---------|
| Stormers | `25962` |
| Bulls | `25953` |
| Lions | `25958` |
| Sharks | `25961` |

### 1.4 Team Schedule / Results & Fixtures

```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/rugby/270557/teams/25962/schedule" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for e in d.get('events', []):
    comps = e.get('competitions', [{}])[0]
    teams = comps.get('competitors', [])
    home = next((t for t in teams if t.get('homeAway')=='home'), {})
    away = next((t for t in teams if t.get('homeAway')=='away'), {})
    status = e.get('status', {}).get('type', {}).get('description', '?')
    date = e.get('date', '?')[:10]
    print(f\"{date} | {home.get('team',{}).get('displayName','?')} {home.get('score','-')} - {away.get('score','-')} {away.get('team',{}).get('displayName','?')} | {status}\")
"
```

Change team ID (e.g. `25953` for Bulls) as needed.

### 1.5 URC News

```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/rugby/270557/news?limit=10" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for a in d.get('articles', []):
    print(a.get('published','')[:10], '|', a.get('headline',''))
"
```

### 1.6 Springboks / Rugby Championship

Use league ID `244293` for the Rugby Championship scoreboard and news. Filter results to South Africa:

```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/rugby/244293/scoreboard" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for e in d.get('events', []):
    comps = e.get('competitions', [{}])[0]
    teams = comps.get('competitors', [])
    names = [t.get('team',{}).get('displayName','') for t in teams]
    if any('south africa' in n.lower() for n in names):
        home = next((t for t in teams if t.get('homeAway')=='home'), {})
        away = next((t for t in teams if t.get('homeAway')=='away'), {})
        status = e.get('status', {}).get('type', {}).get('description', '?')
        date = e.get('date', '?')[:10]
        print(f\"{date} | {home.get('team',{}).get('displayName','?')} {home.get('score','-')} - {away.get('score','-')} {away.get('team',{}).get('displayName','?')} | {status}\")
"
```

### 1.7 SA Rugby News (springboks.rugby fallback)

For Springboks/Junior Springboks/Blitzbokke news and context that ESPN may lack:

```
browse_page(
  url: "https://springboks.rugby/",
  extractText: true
)
```

### 1.8 Flashscore Fallback (only if ESPN data is missing)

Flashscore has more granular live scores but requires `browse_page` and can time out.
Use only as a fallback when ESPN scoreboard returns no events.

| Page | URL |
|------|-----|
| All live rugby | `https://www.flashscore.co.za/rugby-union/` |
| URC results | `https://www.flashscore.co.za/rugby-union/world/united-rugby-championship/results/` |
| URC standings | `https://stats.unitedrugby.com/match-centre/table/2025-26` |

---

## 2. FOOTBALL — Brentford FC

### 2.1 Live Premier League Scores (Today)

```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for e in d.get('events', []):
    comps = e.get('competitions', [{}])[0]
    teams = comps.get('competitors', [])
    home = next((t for t in teams if t.get('homeAway')=='home'), {})
    away = next((t for t in teams if t.get('homeAway')=='away'), {})
    status = e.get('status', {}).get('type', {}).get('description', '?')
    clock = e.get('status', {}).get('displayClock', '')
    score_h = home.get('score', '-')
    score_a = away.get('score', '-')
    print(f\"{home.get('team',{}).get('displayName','?')} {score_h} - {score_a} {away.get('team',{}).get('displayName','?')} | {status} {clock}\")
"
```

### 2.2 Brentford Schedule / Recent Results

Brentford's ESPN team ID is **337**.

```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/337/schedule" | python3 -c "
import sys, json
d = json.load(sys.stdin)
events = d.get('events', [])
for e in events:
    comps = e.get('competitions', [{}])[0]
    teams = comps.get('competitors', [])
    home = next((t for t in teams if t.get('homeAway')=='home'), {})
    away = next((t for t in teams if t.get('homeAway')=='away'), {})
    status = e.get('status', {}).get('type', {}).get('description', '?')
    date = e.get('date', '?')[:10]
    # scores may be dicts with displayValue
    def get_score(t):
        s = t.get('score', '-')
        if isinstance(s, dict): return s.get('displayValue', '-')
        return str(s) if s is not None else '-'
    print(f\"{date} | {home.get('team',{}).get('displayName','?')} {get_score(home)} - {get_score(away)} {away.get('team',{}).get('displayName','?')} | {status}\")
" 2>/dev/null | tail -15
```

### 2.3 Premier League News

```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news?limit=8" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for a in d.get('articles', []):
    print(a.get('published','')[:10], '|', a.get('headline',''))
"
```

### 2.4 Presenting Football Results

- Show: date, score (home X–Y away), competition, and any notable context (e.g. European race, relegation).
- Note Brentford's league position and European/relegation implications where relevant.
- For richer match reports, use `browse_page` on `https://www.bbc.com/sport/football/teams/brentford`.

---

## 3. FORMULA 1

### 3.1 F1 Scoreboard / Current Race Weekend

```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for e in d.get('events', []):
    print('Race:', e.get('name'), '| Date:', e.get('date','?')[:10])
    print('Status:', e.get('status',{}).get('type',{}).get('description','?'))
    for c in e.get('competitions', []):
        ctype = c.get('type', {}).get('abbreviation', '?')
        cstatus = c.get('status', {}).get('type', {}).get('description', '?')
        print(f'  Session: {ctype} | {cstatus}')
        for comp in c.get('competitors', [])[:5]:
            pos = comp.get('order','?')
            name = comp.get('athlete',{}).get('displayName','?')
            country = comp.get('athlete',{}).get('flag',{}).get('alt','?')
            print(f'    P{pos}: {name} ({country})')
"
```

### 3.2 F1 News

```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/racing/f1/news?limit=8" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for a in d.get('articles', []):
    print(a.get('published','')[:10], '|', a.get('headline',''))
"
```

### 3.3 F1 Season Calendar

```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard" | python3 -c "
import sys, json
d = json.load(sys.stdin)
leagues = d.get('leagues', [])
for l in leagues:
    for race in l.get('calendar', []):
        print(race.get('startDate','?')[:10], '|', race.get('label','?'))
"
```

---

## 4. GOLF

### 4.1 Current PGA Tour Leaderboard

```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard" | python3 -c "
import sys, json
d = json.load(sys.stdin)
events = d.get('events', [])
if not events:
    print('No current PGA event')
else:
    e = events[0]
    print('Tournament:', e.get('name'), '| Status:', e.get('status',{}).get('type',{}).get('description','?'))
    comps = e.get('competitions', [{}])[0]
    for c in comps.get('competitors', [])[:20]:
        pos = c.get('order','?')
        name = c.get('athlete',{}).get('displayName','?')
        country = c.get('athlete',{}).get('flag',{}).get('alt','?')
        score = c.get('score','-')
        print(f'  {pos}. {name} ({country}): {score}')
"
```

### 4.2 European / DP World Tour Leaderboard

```bash
curl -s "https://site.api.espn.com/apis/site/v2/sports/golf/eur/scoreboard" | python3 -c "
import sys, json
d = json.load(sys.stdin)
events = d.get('events', [])
if not events:
    print('No current EUR event')
else:
    e = events[0]
    print('Tournament:', e.get('name'), '| Status:', e.get('status',{}).get('type',{}).get('description','?'))
    comps = e.get('competitions', [{}])[0]
    for c in comps.get('competitors', [])[:20]:
        pos = c.get('order','?')
        name = c.get('athlete',{}).get('displayName','?')
        country = c.get('athlete',{}).get('flag',{}).get('alt','?')
        score = c.get('score','-')
        print(f'  {pos}. {name} ({country}): {score}')
"
```

### 4.3 Golf Presentation Notes

- **Always call out South African players** (e.g. Aldrich Potgieter, Christiaan Bezuidenhout, Garrick Higgo, Louis Oosthuizen, Ernie Els).
- For Majors and Ryder Cup, proactively provide context even if not asked.
- Check **both** PGA and EUR leaderboards in parallel — SA players appear on both tours.

### 4.4 Golf Fallback (BBC)

If ESPN golf returns no events or data is stale:
```
browse_page(
  url: "https://www.bbc.co.uk/sport/golf/leaderboard",
  extractText: true
)
```

---

## 5. CRICKET

Cricket is **not available** in the ESPN API. Use these sources:

### 5.1 Proteas / SA Cricket (Primary)

```
browse_page(
  url: "https://www.supersport.com/cricket/south-africa/",
  extractText: true
)
```

### 5.2 International Fixtures (Fallback)

```
browse_page(
  url: "https://www.bbc.co.uk/sport/cricket",
  extractText: true
)
```

Note: `espncricinfo.com` often times out — skip it and go straight to BBC or SuperSport.

---

## 6. WEEKEND SPORT ROUNDUP PATTERN

When asked "how did the weekend sport go?" or similar, run these **in parallel** using `bash`:

```bash
# 1. URC scores
curl -s "https://site.api.espn.com/apis/site/v2/sports/rugby/270557/scoreboard" &

# 2. Brentford recent results  
curl -s "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/337/schedule" &

# 3. PGA leaderboard
curl -s "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard" &

# 4. EUR golf leaderboard
curl -s "https://site.api.espn.com/apis/site/v2/sports/golf/eur/scoreboard" &

wait
```

Then follow up with `browse_page` on `https://springboks.rugby/` for SA rugby news and context.

Present results sport-by-sport: **Rugby → Football → Golf → Cricket (if relevant) → F1 (if relevant)**.

---

## 7. SOURCES AND THEIR STATUS

| Source | Method | Sports | Notes |
|--------|--------|--------|-------|
| ESPN JSON API (`site.api.espn.com`) | `bash curl` | Rugby, Football, F1, Golf | ✅ Primary — fast, reliable, no key needed |
| `springboks.rugby` | `browse_page` | SA Rugby news | ✅ Best for Boks/Junior Boks/Blitzbokke narrative |
| BBC Sport | `browse_page` | Cricket, match reports | ✅ Good for articles; **never use `web_fetch`** on BBC |
| SuperSport | `browse_page` | Cricket | ✅ Good for SA cricket |
| Flashscore | `browse_page` | Rugby (fallback) | ⚠️ Can time out; use only when ESPN has no data |
| `europeantour.com` | — | Golf | ❌ Returns 403 — do not use |
| `espncricinfo.com` | — | Cricket | ❌ Frequently times out — skip |
| `rugbypass.com` | — | Rugby | ❌ Cookie consent wall only |
| `sarugby.co.za` | — | Rugby | ❌ Redirects to `springboks.rugby` |
