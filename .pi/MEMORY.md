# MEMORY.md — Session Log

*Key learnings and facts captured across sessions. Selective, not exhaustive.*

---

## Session: 2026-05-03

### 🎬 Movies Discussed

#### The Map That Leads to You (2025)
- **TMDB ID:** 1312946
- **Rating:** 6.5/10 (307 votes)
- **Genre:** Romance, Drama | **Runtime:** 96 mins
- **Director:** Lasse Hallström | **Writer:** Vera Herbert
- **Cast:** Madelyn Cline (Heather), KJ Apa (Jack), Sofia Wylie, Madison Thompson
- **Heather's dad "Greg"** is played by **Josh Lucas**
- Verdict: Decent, formulaic romantic drama. Fine for fans of the genre.

#### Miss Sophie – Same Procedure as Every Year (2025)
- **TMDB ID:** 304949 (TV series)
- **Platform:** Prime Video | **Episodes:** 6 | **Rating:** 6.6/10 (7 votes — early)
- **Genre:** Period comedy / murder mystery / romance
- **Setting:** Early 20th century England, country estate near Eastbourne
- **Cast:** Alicia von Rittberg (Miss Sophie), Kostja Ullmann (Butler James), Moritz Bleibtreu (Mr. Pommeroy), Frederick Lau (Mr. Winterbottom), Jacob Matschenz (Sir Toby), Christoph Schechinger (Admiral von Schneider), Ulrich Noethen (Butler Mortimer)
- **Premise:** Prequel to the cult 1963 sketch *Dinner for One*. Young Miss Sophie invites marriage candidates to her estate; one is murdered; she secretly investigates while competing suitors vie for her hand — and a romance with James develops.
- **All 6 episodes released:** 22 December 2025
- **Episode runtimes:**
  | # | Title | Runtime |
  |---|---|---|
  | 1 | Happy New Year, Miss Sophie! | 37 mins |
  | 2 | Game On | 45 mins |
  | 3 | All In | 41 mins |
  | 4 | Cheers, Admiral! | 43 mins |
  | 5 | The Village of Truth | 50 mins |
  | 6 | Same Procedure Every Year | 40 mins |
- **Total runtime:** ~256 mins (4h 16mins)
- **Background:** The original *Dinner for One* (1963) is an 18-min B&W sketch — the most frequently repeated TV programme in history (Guinness). Up to half of Germany watches it every New Year's Eve. Also broadcast in SA annually. Graeme is likely familiar with it.

---

### 🗞️ SA News Skill Enhancement

#### News24 RSS Feeds — Now Working!
- News24's website is blocked by Cloudflare but **RSS feeds via `feeds.capi24.com` work perfectly**
- Graeme created `/Users/graemelockley/Projects/simple-agent/.pi/skills/sa-news/news24-rss-feeds.md` with 9 feed URLs
- `SKILL.md` updated to include News24 as ✅ Reliable (via RSS) and document all feeds
- **Key feeds:**
  | Category | URL |
  |---|---|
  | Top Stories | `https://feeds.capi24.com/v1/Search/articles/news24/TopStories/rss` |
  | South Africa | `http://feeds.news24.com/articles/news24/SouthAfrica/rss` |
  | World | `http://feeds.news24.com/articles/news24/World/rss` |
  | Business | `http://feeds.news24.com/articles/fin24/news/rss` |
  | Sport | `http://feeds.24.com/articles/sport/featured/topstories/rss` |
- **Standard practice going forward:** Fetch TimesLive + Daily Maverick + News24 RSS in parallel for SA news

#### World News Sources — Issues Noted
- `https://www.timeslive.co.za/news/world/` — **intermittently times out**
- `http://feeds.news24.com/articles/news24/World/rss` — **blocked (bot protection)**
- Best world coverage: TimesLive world page (when it loads) + `feeds.capi24.com` Top Stories RSS

---

### 🧠 Knowledge Graph Discussion

Discussed ideal agent-facing knowledge graph interface design. Key conclusions:
- **Best interface pattern:** MCP tools wrapping a REST/GraphQL API with natural language search
- **Essential features:** confidence scores, provenance, fuzzy entity matching, self-describing schema
- **Ideal stack:** Property graph (Neo4j/Kuzu) + Vector index (pgvector/Qdrant) + optional triple store
- **Avoid:** Raw SPARQL/Cypher only, opaque IDs, hidden schemas, bulk-only exports
- Graeme appears to be thinking about building or integrating a knowledge graph — worth following up

---

---

## Session: 2026-05-04

### 📍 Graeme's Location
- **Home address:** 9 Knox Road, Lonehill, Sandton (Johannesburg, Gauteng)
- Useful for weather lookups — use `Lonehill, Sandton, South Africa` as the location query

---

### 🏎️ F1 — Miami GP (3 May 2026)
- **Winner:** Kimi Antonelli — his **3rd consecutive win**, extending his championship lead
- Lando Norris (McLaren) finished 2nd
- Charles Leclerc received a 20-second penalty; Max Verstappen a 5-second penalty
- ESPN headline: *"In Antonelli, Russell may have met his match — and F1 may have its new superstar"*

---

### ⛳ Golf Results (week of 4 May 2026)
- **PGA Tour — Cadillac Championship (Final):** Cameron Young 🇺🇸 won at -19; Scottie Scheffler 2nd (-13). No SA players in top 10.
- **DP World Tour — Turkish Airlines Open (Final):** Mikael Lindberg 🇸🇪 won at -10. **JC Ritchie 🇿🇦** finished T10 at -5.

---

### 🏉 Rugby — URC (upcoming)
- **Stormers** have an away fixture vs **Ulster** on **Friday 8 May 2026**

---

*Last updated: 2026-05-04*
