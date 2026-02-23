# Workshop Feedback — Patrick Robinson & Josh Millard
**Date:** February 23, 2026
**Facilitator:** Barry Martin
**Note:** Neither participant received the email. Jodi Lastman (separate session) also did not receive hers. Email delivery is the #1 critical issue.

---

## Patrick Robinson (repeat user)

### What Worked
- **Liked "no account needed" and "~2 minutes" on landing page**
- **Loved being able to add more than 5 books** — "I notably wasn't able to add Eggers or Copeland" last time
- **Forces mostly resonated** — selected 6, engaged deeply, didn't feel forced to pick
- **Reading paragraph validated strongly** — "I watch the system break people, but stay close enough to feel the break happen. Yeah, I can see how that's true for both 1984 and Handmaid's Tale"
- **Boundary section was the standout** — "Not only does it parrot back what I said, but 'you need to be vested in an ordinary texture before the system reveals its teeth'" — then connected this to Murakami books he *didn't even input*
- **Rec for Parable of the Sower validated** — "reading one of the descriptions from a book I know articulates it better than I could"
- **Dispossessed rec** — "very good book"
- **Two books by same author is fine** — Barry asked, Pat said no restriction needed

### Issues & Insights

**1. "Uncover the forces" sounds scary** (0:20)
"Uncover the forces currently working on me sounds a bit scary... out of context, it just is not refined."
*Implication: Landing/intro copy needs softening.*

**2. Wanted author entry, not just books** (1:52)
"For me, I said last time an author."
*Implication: Some readers think in authors, not titles.*

**3. "Rearranged something" prompt didn't land** (4:50)
"That prompt doesn't step out for me as much. Rearranged what?"
*Implication: This rotating placeholder is too vague.*

**4. Wanted an open-ended book field** (5:04)
"It'd be nice to add a book that isn't a direct response to a question."
*Implication: After the prompted slots, offer a blank "anything else?" field.*

**5. Some forces language still off** (8:58, 9:33)
"Watching the system eat people's a bit weird" and "impossible is a bit strong."
*Implication: Forces generation still occasionally too intense or literal.*

**6. Rotating spell-break placeholders disappeared too fast** (10:03)
"I saw the first one, but I looked away and then didn't see."
*Implication: Slow down rotation or show multiple examples.*

**7. Posture label drowned out by Field Signature** (12:14)
"The lightest piece at the top was drowned out by the nice, large script."
*Implication: Card hierarchy — posture needs more visual weight.*

**8. Wants publication year on recommendations** (16:40, 24:12)
Mentioned twice. "This is quite a range from the 70s."

**9. Left Hand of Darkness rec description missed** (19:11)
"'Through a voice that earns its observations by living inside its own limitations.' It's not how it go for it."
*Implication: Some rec descriptions too abstract.*

**10. Email UX — no success confirmation** (20:49)
"I was happy for the payoff that it sends me this, but it doesn't tell me where."

**11. Email privacy concern** (21:14)
"Anytime I enter my email, I pause... How do you use my email and/or data?"

**12. Email bonus content idea** (23:04)
"Links to the Wikipedias on the books I haven't read."

**13. Typography still too small** (22:31)
At 150% zoom: "still so fucking small, granulated."

---

## Josh Millard (casual user, light reader)

### Context
Josh is not the core target user — casual reader, doing this mainly as a UX exercise. Valuable for friction/usability.

### What Worked
- **Noticed fewer steps** — "this is less than before" — appreciated streamlined flow
- **Understood concept quickly** — compared to isekai generators and video game character builders

### Issues & Insights

**1. Previously quit after one book** (25:15)
"I remember putting one book in and then moving on my life."
*Context: Cold-sent casual users may bounce at book entry.*

**2. BUG: Can't go back to re-roll book prompts** (26:24)
Barry: "So glad we found that broken thing."
*Needs fix.*

**3. Forces too on-the-nose with few books** (29:10)
With mostly Red Rising as input, forces became plot synopses. Barry agrees: "these are all really unfortunately speaking directly to story."
*Forces need to abstract to narrative texture even when signal is thin.*

**4. Book disambiguation needed** (30:13)
"I'm surprised it doesn't make you pick from a drop down... Red Rising could really be one."

**5. Wants hooks/loglines, not thematic descriptions** (35:08)
"I need to know the hook... I like the hook." Suggested log line format and sample page.

**6. Wants cover art on recs** (37:42)
"Cover art matters a lot."

**7. "Game vs. form" tension** (30:48)
"Almost in a funny medium between a game and a form." Imagined dice-rolling animation.

**8. Non-readers could use movies/shows** (32:21)
"If you don't read often... I put in movies and shows."

---

## Combined Critical Findings

| Issue | Patrick | Josh | Jodi | Priority |
|-------|---------|------|------|----------|
| Email delivery broken | Not received | Not received | Not received | **Critical** |
| Forces too literal/abstract | Partially | Very much | Very much | High |
| Typography too small | Yes | — | — | High |
| Can't navigate back (bug) | — | Yes | — | High |
| Posture label too small on card | Yes | — | — | Medium |
| Spell-break placeholders too fast | Yes | — | — | Medium |
| No email privacy reassurance | Yes | — | — | Medium |
| No email success confirmation | Yes | — | — | Medium |
| "Uncover the forces" scary | Yes | — | — | Medium |
| Publication year on recs | Yes (2x) | — | — | Medium |
| Book cover art on recs | — | Yes | — | Low |
| Book autocomplete/disambiguation | — | Yes | — | Low |
| Tarot card imagery for cards | — | — | Yes | Low |

---

## Task List

### Critical
1. **Fix email delivery** — Verify domain with Resend, switch from `onboarding@resend.dev` to verified sender. 0/3 test users received emails.

### High Priority — Bugs
2. **Fix back-navigation bug** — Can't go back to re-roll book prompts once past a step

### High Priority — Content Quality
3. **Tighten forces generation for thin signal** — With few books, forces become plot synopses. Need to abstract to narrative texture even when input is thin.
4. **Tighten forces language overall** — "Watching the system eat people" too intense/literal, "confidence under impossible conditions" too strong, "witness without rescue" too opaque.
5. **Increase base typography sizes** — Reading card text too small even at 150% zoom.

### Medium Priority — UX Polish
6. **Rewrite "uncover the forces" intro copy** — Reads as ominous, not inviting.
7. **Improve card hierarchy** — Posture name/definition drowned out by Field Signature.
8. **Slow down spell-break placeholder rotation** — Pat looked away and missed the cue.
9. **Add email privacy reassurance** — Brief note near email field.
10. **Improve email success state** — Warmer confirmation with "check your inbox" guidance.
11. **Add publication year to recommendations** — Pat requested twice.
12. **Rework "rearranged something" book placeholder** — Too vague.
13. **Add an open-ended book field** — For books that aren't responses to specific prompts.

### Low Priority — Future Enhancements
14. **Book cover art on recs**
15. **Book autocomplete/disambiguation**
16. **Tarot-card character imagery per posture**
17. **Email bonus content** — Wikipedia links for recommended books
18. **Accept author names in book fields**
19. **"Re-cast recommendations" button** — For users who've already read several recs
