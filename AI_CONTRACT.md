# AI module contract — read before editing

The AI layer is **minified** and has no source map. Two earlier sessions edited it by
bracket-notation string surgery and introduced a missing-paren bug that needed a debug
script to find. This file is the intent contract: what each artifact owns, which strings
are load-bearing, and how to change it safely. `test-ai-contract.js` enforces the
load-bearing strings, so an edit that drops one fails the QA gate.

## File map — change the right layer

| File | Role | Safe to edit? |
|---|---|---|
| `app/src/shared/uikit.js` | **Data + kit knowledge** (source of truth). `KIT_CREDITS`, `listKits()`, `findKitControl()`, `kitPatchFromRequest()`, `lexiconPatchFromRequest()`, `kitAnswerFromRequest()`. | Yes — data-only. Prefer changes here over the minified provider. |
| `app/src/shared/ai.js` | **Prompt engineering + patch application**. `editSystemPrompt()`, `screenshotSystemPrompt()`, `askSystemPrompt()`, `parseAiJson()`, `applyAiResult()`, `compactProject()`. | Minified but readable-ish; change one string at a time. |
| `app/src/main/ai.cjs` | **Provider layer** (66 KB, 11 lines). Provider catalog, `pLocal` (built-in offline), `localAiAnswer()`, `localAiEdit()` regex fallbacks, network providers. | Highest risk — minified. Use the recipe below. |

`uikit.js` is a shared source of truth: the provider imports it lazily and never executes
project code from it. Never duplicate kit/palette data into `ai.cjs`.

## Behavioural contract (all offline, no key required)

1. **Default provider is the built-in `local` one.** `pLocal` has `key: false`,
   `model: "wicked-local"`, and a note promising no key/internet. No sign-in or remote
   backend is ever required. Keep `account.cjs` offline invariants intact.
2. **Local answer mode** (`localAiAnswer`) handles the `Reply with the single word OK`
   probe, then delegates to `kitAnswerFromRequest`, then falls back to regex answers.
3. **Local edit mode** (`localAiEdit`) tries, in order:
   `kitPatchFromRequest` → `lexiconPatchFromRequest` → regex editor. Never reorder so a
   generic request shadows an exact kit/lexicon match.
4. **Batch intents** operate across *every* page, not just the focused one:
   - rename text project-wide (keep widget IDs),
   - restyle all pages by changing the shared `style`/`window`/`titlebar`/`background`
     keys once,
   - convert widget types project-wide (keep each widget's `id` and `text`).
   They appear in **both** `ai.cjs` (local provider prompt) and `shared/ai.js`
   (`editSystemPrompt`, so remote LLMs honour them too). Keep both in sync.
5. **Conservative lexicon.** Exact quoted or unquoted sampled control names get a
   `lexiconPatchFromRequest` patch; generic widget requests deliberately fall through to
   the base AI. `findKitControl()` is exact-match-first. Array labels are expanded into
   individual controls by the kit data, not by ad-hoc provider regex.
6. **Preserve user code.** `raw` widgets and custom-widget `code` are returned unchanged.

## Load-bearing strings (enforced by `test-ai-contract.js`)

`app/src/main/ai.cjs`:
- `pLocal`, `"wicked-local"`, `function localAiEdit`, `function localAiAnswer`
- `kitPatchFromRequest`, `kitAnswerFromRequest`, `lexiconPatchFromRequest`
- `Batch requests work too: rename text across all pages`
- `restyle every page with a named theme`, `convert widget types project-wide`
- `No API key or internet connection is required.`

`app/src/shared/ai.js` (note the literal `\x20` escapes — the file encodes spaces this way):
- `Batch\x20requests:`, `rename\x20text\x20across\x20all\x20pages`
- `restyle\x20all\x20pages`, `convert\x20widget\x20types`
- `editSystemPrompt`, `applyAiResult`, `parseAiJson`

`app/src/shared/uikit.js`:
- `findKitControl`, `lexiconPatchFromRequest`, `kitPatchFromRequest`,
  `kitAnswerFromRequest`, `KIT_CREDITS`, `listKits`

## Safe edit recipe

1. Change **one** literal at a time. The files use mixed quote characters
   (`"..."`, `'...'`, backticks) and bracket notation (`obj["key"]`) to survive old
   minifiers — copy the surrounding quote style exactly.
2. After each edit run `node --check app/src/main/ai.cjs`, then
   `node test-ai-contract.js`, then `node regression.mjs`. A paren/bracket slip shows up
   immediately rather than at release time.
3. Add a behavioural case to `regression.mjs` for every new intent (see the
   `aiPrompts`, `advancedAiCases` and `batchAiCases` tables). The structural guard only
   protects existing behaviour; new behaviour needs its own test.
4. If a prompt string changes, update **both** the `ai.cjs` local-provider note and the
   `shared/ai.js` system prompt, plus this contract's string list and the guard.
5. Never reformat the whole file "for readability" without a byte-for-byte behavioural
   diff — that is how the missing-paren bug happened.

## Verification command

```
node test-ai-contract.js     # structural needles + syntax of the provider
npm test                      # full gate, including all AI behaviour tests
```
