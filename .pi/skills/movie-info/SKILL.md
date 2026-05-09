---
name: movie-info
description: Look up movies and TV shows using TMDB — search by title, get cast and crew, actor/actress filmographies, trending movies, similar/recommended titles, and movie details like rating, runtime, genres, and plot. Use for any question about movies, actors, directors, or what to watch next.
metadata:
  spec: https://agentskills.io/home
---

# Movie Info Skill

Uses the **TMDB (The Movie Database) API v3** — comprehensive, free movie and TV data.

**Base URL:** `https://api.themoviedb.org/3/`

---

## Setup (First-Time Only)

1. Register at [themoviedb.org](https://www.themoviedb.org/signup) (use a desktop browser)
2. Go to **Account Settings → API** and request an API key (choose "Developer")
3. Copy your **API Read Access Token** (the long Bearer token)
4. Add it to your environment:

```bash
export TMDB_ACCESS_TOKEN="your_bearer_token_here"
```

Or add to `~/.zshrc` / `~/.bashrc` for persistence.

**Verify it works:**
```bash
curl -s "https://api.themoviedb.org/3/authentication" \
  -H "Authorization: Bearer $TMDB_ACCESS_TOKEN" | python3 -m json.tool
```

---

## Authentication

All requests use the Bearer token from `$TMDB_ACCESS_TOKEN`:

```bash
curl -s "https://api.themoviedb.org/3/{endpoint}" \
  -H "Authorization: Bearer $TMDB_ACCESS_TOKEN" \
  -H "accept: application/json"
```

If the env var is not set, inform the user and show the setup instructions above.

---

## 1. SEARCH FOR A MOVIE

```bash
curl -s "https://api.themoviedb.org/3/search/movie?query=TITLE&language=en-US" \
  -H "Authorization: Bearer $TMDB_ACCESS_TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for m in d.get('results', [])[:5]:
    print(f\"{m.get('id')} | {m.get('title')} ({m.get('release_date','?')[:4]}) | Rating: {m.get('vote_average','?')} | {m.get('overview','')[:100]}\")
"
```

Replace spaces in `TITLE` with `+` or `%20`. Always use the **first result** unless the user specifies a year — then match on `release_date`.

---

## 2. MOVIE DETAILS + CAST + SIMILAR TITLES

Use `append_to_response` to get everything in one request:

```bash
curl -s "https://api.themoviedb.org/3/movie/MOVIE_ID?append_to_response=credits,similar,keywords&language=en-US" \
  -H "Authorization: Bearer $TMDB_ACCESS_TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)

# Basic info
print('Title:   ', d.get('title'))
print('Year:    ', d.get('release_date','?')[:4])
print('Runtime: ', d.get('runtime'), 'mins')
print('Rating:  ', d.get('vote_average'), f\"({d.get('vote_count')} votes)\")
print('Tagline: ', d.get('tagline',''))
print('Genres:  ', ', '.join(g['name'] for g in d.get('genres', [])))
print('Overview:', d.get('overview',''))
print()

# Cast
print('CAST:')
for c in d.get('credits', {}).get('cast', [])[:10]:
    print(f\"  {c.get('name')} as {c.get('character')}\")
print()

# Crew highlights
crew = d.get('credits', {}).get('crew', [])
director = next((c for c in crew if c.get('job') == 'Director'), None)
if director:
    print('Director:', director.get('name'))
writer = next((c for c in crew if c.get('job') in ('Writer','Screenplay','Story')), None)
if writer:
    print('Writer:  ', writer.get('name'))
print()

# Similar titles
print('SIMILAR TITLES:')
for m in d.get('similar', {}).get('results', [])[:5]:
    print(f\"  {m.get('title')} ({m.get('release_date','?')[:4]}) — {m.get('vote_average')}\")
"
```

---

## 3. SEARCH FOR A PERSON (Actor/Director)

```bash
curl -s "https://api.themoviedb.org/3/search/person?query=NAME&language=en-US" \
  -H "Authorization: Bearer $TMDB_ACCESS_TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for p in d.get('results', [])[:3]:
    print(f\"{p.get('id')} | {p.get('name')} | Known for: {p.get('known_for_department')}\")
    for m in p.get('known_for', []):
        title = m.get('title') or m.get('name','?')
        print(f\"  - {title} ({m.get('release_date', m.get('first_air_date','?'))[:4]})\")
"
```

---

## 4. PERSON DETAILS + FULL FILMOGRAPHY

First search for the person (section 3) to get their ID, then:

```bash
curl -s "https://api.themoviedb.org/3/person/PERSON_ID?append_to_response=movie_credits,tv_credits&language=en-US" \
  -H "Authorization: Bearer $TMDB_ACCESS_TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)

print('Name:       ', d.get('name'))
print('Born:       ', d.get('birthday','?'), d.get('place_of_birth',''))
print('Known for:  ', d.get('known_for_department'))
print('Biography:  ', d.get('biography','')[:300])
print()

# Movies (sorted by release date, most recent first)
movies = sorted(
    [m for m in d.get('movie_credits',{}).get('cast',[]) if m.get('release_date')],
    key=lambda m: m.get('release_date',''), reverse=True
)
print('MOVIES:')
for m in movies[:20]:
    print(f\"  {m.get('release_date','?')[:4]} | {m.get('title','?')} as {m.get('character','?')}\")
print()

# TV
tv = sorted(
    [t for t in d.get('tv_credits',{}).get('cast',[]) if t.get('first_air_date')],
    key=lambda t: t.get('first_air_date',''), reverse=True
)
print('TV:')
for t in tv[:10]:
    print(f\"  {t.get('first_air_date','?')[:4]} | {t.get('name','?')} as {t.get('character','?')}\")
"
```

---

## 5. TRENDING MOVIES

```bash
# Trending today
curl -s "https://api.themoviedb.org/3/trending/movie/day?language=en-US" \
  -H "Authorization: Bearer $TMDB_ACCESS_TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('TRENDING TODAY:')
for i, m in enumerate(d.get('results', [])[:10], 1):
    print(f\"  {i}. {m.get('title')} ({m.get('release_date','?')[:4]}) — ⭐ {m.get('vote_average')}\")
"
```

Change `day` to `week` for weekly trending.

---

## 6. MOVIE RECOMMENDATIONS

Based on a specific movie (use movie ID from search):

```bash
curl -s "https://api.themoviedb.org/3/movie/MOVIE_ID/recommendations?language=en-US" \
  -H "Authorization: Bearer $TMDB_ACCESS_TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for m in d.get('results', [])[:10]:
    print(f\"  {m.get('title')} ({m.get('release_date','?')[:4]}) — ⭐ {m.get('vote_average')}\")
"
```

---

## 7. SEARCH TV SHOWS

```bash
curl -s "https://api.themoviedb.org/3/search/tv?query=TITLE&language=en-US" \
  -H "Authorization: Bearer $TMDB_ACCESS_TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for t in d.get('results', [])[:5]:
    print(f\"{t.get('id')} | {t.get('name')} ({t.get('first_air_date','?')[:4]}) | ⭐ {t.get('vote_average')} | {t.get('overview','')[:100]}\")
"
```

---

## 8. WORKFLOW: ANSWER A MOVIE QUESTION

For most questions, the pattern is:

1. **Search** → get the movie/person ID
2. **Fetch details** with `append_to_response` → get everything in one call
3. **Present** clearly

**Common two-step pattern:**
```bash
# Step 1: search
MOVIE_ID=$(curl -s "https://api.themoviedb.org/3/search/movie?query=TITLE" \
  -H "Authorization: Bearer $TMDB_ACCESS_TOKEN" | \
  python3 -c "import sys,json; r=json.load(sys.stdin)['results']; print(r[0]['id']) if r else print('')")

# Step 2: details + cast
curl -s "https://api.themoviedb.org/3/movie/$MOVIE_ID?append_to_response=credits,similar" \
  -H "Authorization: Bearer $TMDB_ACCESS_TOKEN" | python3 -m json.tool
```

---

## Presentation Guidelines

- Always show: **title, year, rating, genres, runtime, overview**
- For cast questions: show character name alongside actor name
- For actor questions: show both movies **and** TV, sorted newest first
- Highlight any **South African** cast/crew when present
- For "what should I watch" questions: use trending + recommendations, filter by genre if specified
- Ratings are out of 10; note vote count for reliability (low count = treat with caution)

---

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `status_code: 7` | Invalid/missing API key | Check `$TMDB_ACCESS_TOKEN` is set |
| `status_code: 34` | Resource not found | Movie/person ID doesn't exist |
| Empty `results` array | No matches | Try alternate spelling or add year to query |
