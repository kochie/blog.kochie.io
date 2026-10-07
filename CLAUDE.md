# CLAUDE.md

## Article text is human-written only

The prose in articles (`articles/*/index.mdx`, and the same for `journal/` and `projects/`) is written by Robert. AI agents must never change it.

**Off limits — never edit, rewrite, rename or reword:**

- Body text, headings, titles, descriptions and footnotes
- Quotes, captions, alt text and any other reader-facing wording
- Maths, equations and figures stated in the text, even when they are wrong

**Allowed — structural changes only:**

- Frontmatter fields that aren't reader-facing text (dates, tags, flags, image paths)
- MDX components, imports, layout and formatting, as long as the wording they render is unchanged
- Assets, scripts and data files that sit alongside an article (images, `.jl`, `.py`, `.csv`)
- Moving or restructuring files, as long as the text inside them stays word-for-word the same

**Exception — spell-checker fixes, with approval:**

Misspellings and mechanical grammar slips (its/it's, your/you're, then/than) may be corrected, but only like a spell checker would. Swap the single wrong word for the right one and change nothing else around it. First list every proposed fix for Robert in a table (file, line, current, fix), and change only the ones he approves. Use Australian spelling (favourite, colour). Never use this to rephrase, smooth or "improve" the writing.

**Any other problem in article text** (a factual or maths error, a broken sentence, awkward wording): don't fix it. Report it to Robert with the file, the line, and what you think is wrong, and leave the change to him.
