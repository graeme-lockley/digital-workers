---
name: sa-news
description: Get the latest South African and general news — top stories, breaking news, politics, crime, business, economy, and human interest. Use for any question about current events, SA news, or what's happening in the world.
metadata:
  spec: https://agentskills.io/home
---

# SA News Skill

Fetches current news using **TimesLive** and **Daily Maverick** — both reliable, accessible sources with no paywalls on headlines.

Use `web_fetch` with a clear `prompt` to extract relevant stories efficiently.

---

## Primary Sources

| Source | URL | Best For |
|--------|-----|----------|
| TimesLive | `https://www.timeslive.co.za/news/south-africa/` | Breaking news, crime, courts, general SA |
| Daily Maverick | `https://www.dailymaverick.co.za/south-africa/` | Politics, governance, business, analysis |
| Daily Maverick (World) | `https://www.dailymaverick.co.za/world/` | International news |
| TimesLive (Politics) | `https://www.timeslive.co.za/politics/` | SA politics |
| TimesLive (Business) | `https://www.timeslive.co.za/business-and-money/` | Business and economy |
| TimesLive (World) | `https://www.timeslive.co.za/news/world/` | World news |

---

## 1. GENERAL SA NEWS (Default)

Fetch both sources in parallel for best coverage:

```
web_fetch(
  pages: [
    {
      url: "https://www.timeslive.co.za/news/south-africa/",
      prompt: "List the latest South African news headlines with a one-sentence summary for each"
    },
    {
      url: "https://www.dailymaverick.co.za/south-africa/",
      prompt: "List the latest South African news headlines with a one-sentence summary for each"
    }
  ]
)
```

Combine and deduplicate stories, grouping by theme (Crime & Safety, Politics, Business, etc.).

---

## 2. SA POLITICS

```
web_fetch(
  pages: [
    {
      url: "https://www.timeslive.co.za/politics/",
      prompt: "List the latest SA political news headlines and brief summaries"
    },
    {
      url: "https://www.dailymaverick.co.za/south-africa/",
      prompt: "List only political news headlines and summaries"
    }
  ]
)
```

---

## 3. BUSINESS & ECONOMY

```
web_fetch(
  pages: [
    {
      url: "https://www.timeslive.co.za/business-and-money/",
      prompt: "List the latest SA business and economy news headlines with brief summaries"
    },
    {
      url: "https://www.dailymaverick.co.za/south-africa/",
      prompt: "List only business, economy, or financial news headlines and summaries"
    }
  ]
)
```

---

## 4. WORLD / INTERNATIONAL NEWS

```
web_fetch(
  pages: [
    {
      url: "https://www.timeslive.co.za/news/world/",
      prompt: "List the latest world/international news headlines with brief summaries"
    },
    {
      url: "https://www.dailymaverick.co.za/world/",
      prompt: "List the latest world/international news headlines with brief summaries"
    }
  ]
)
```

---

## 5. SPECIFIC TOPIC SEARCH

When the user asks about a specific topic (e.g. "load shedding", "ANC", "rand"), fetch both sources with a targeted prompt:

```
web_fetch(
  pages: [
    {
      url: "https://www.timeslive.co.za/news/south-africa/",
      prompt: "Find any headlines or stories related to [TOPIC]"
    },
    {
      url: "https://www.dailymaverick.co.za/south-africa/",
      prompt: "Find any headlines or stories related to [TOPIC]"
    }
  ]
)
```

Replace `[TOPIC]` with the user's subject of interest.

---

## 6. WORKFLOW

1. **Identify the news category** — general, politics, business, world, or specific topic
2. **Fetch both sources in parallel** using the appropriate URLs and prompts above
3. **Combine and deduplicate** — if the same story appears in both sources, mention it once
4. **Group by theme** where there are 5+ stories
5. **Present clearly** with headline + one-sentence summary per story

---

## Presentation Guidelines

- Lead with the most significant or impactful stories
- Group stories by theme when there are many: **Politics | Crime & Safety | Business & Economy | Courts & Justice | Human Interest | World**
- Keep summaries concise — one sentence per story
- For breaking news (crime, disasters), include location and key facts
- For political stories, name the key figures involved
- Bullet point format preferred unless the user asks for something different

---

## Source Status

| Source | Method | Status | Notes |
|--------|--------|--------|-------|
| TimesLive (`timeslive.co.za`) | `web_fetch` | ✅ Reliable | Good for breaking news, crime, courts |
| Daily Maverick (`dailymaverick.co.za`) | `web_fetch` | ✅ Reliable | Good for politics, analysis, governance |
| News24 (RSS) | `web_fetch` | ✅ Reliable | Use RSS feeds — direct site blocked by Cloudflare. See `news24-rss-feeds.md` for full list of feeds. |

---

## News24 RSS Feeds

News24's website is blocked by Cloudflare, but their RSS feeds are accessible via `web_fetch`. See `news24-rss-feeds.md` for the full list. Key feeds:

| Category | URL |
|----------|-----|
| Top Stories | `https://feeds.capi24.com/v1/Search/articles/news24/TopStories/rss` |
| South Africa | `http://feeds.news24.com/articles/news24/SouthAfrica/rss` |
| Africa | `http://feeds.news24.com/articles/news24/Africa/rss` |
| World | `http://feeds.news24.com/articles/news24/World/rss` |
| Business | `http://feeds.news24.com/articles/fin24/news/rss` |
| Sport | `http://feeds.24.com/articles/sport/featured/topstories/rss` |
| Tech | `http://feeds.news24.com/articles/fin24/tech/rss` |
| Entertainment | `http://feeds.news24.com/articles/channel/topstories/rss` |
| Opinion | `http://feeds.news24.com/articles/news24/opinions/rss` |

Fetch News24 RSS feeds like this:

```
web_fetch(
  url: "https://feeds.capi24.com/v1/Search/articles/news24/TopStories/rss",
  prompt: "List all news headlines and their summaries from this RSS feed"
)
```

For general SA news, include the News24 Top Stories feed alongside TimesLive and Daily Maverick.
