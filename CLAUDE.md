# LingoVerse — Permanent Development Instructions

## Project identity

LingoVerse is a premium English/French language-learning application built with React Native, Expo, TypeScript and React Native Web.

Its core experience combines narrative adventures, spoken conversations, educational feedback, regional coaches, humor and progressive language learning.

The goal is genuine language acquisition, not completing quizzes or maximizing artificial engagement metrics.

## Authoritative project location

Current project:

`D:\Documents\Jason\LingoVerse\LingoVerse Main\LingoVerse-Codex-Inicio`

An older project exists at:

`D:\Documents\Jason\LingoVerse\LingoVerse-Codex-Inicio`

Never modify, merge or replace the current project with the older version without explicit authorization.

## Sources of truth

Before significant changes, consult only the relevant existing files:

- `AGENTS.md` — existing development and architecture rules.
- `docs/PRODUCT_VISION.md` — product requirements.
- `docs/ROADMAP.md` — planned milestones.
- `docs/PROJECT_STATE.md` — last recorded implementation state.
- Relevant task specifications, educational contracts and test files.

Do not repeatedly read the entire repository.

Project documentation may be outdated. Confirm important claims against actual code and executable tests.

If instructions conflict, identify the conflict and avoid destructive assumptions.

## Engineering principles

1. Preserve the existing application and its working features.
2. Prefer minimal, maintainable architectural extensions.
3. Keep educational domain logic separate from UI components.
4. Reuse existing engines, repositories, providers and contracts.
5. Maintain strict TypeScript contracts.
6. Preserve backward compatibility and versioned content.
7. Never silently invalidate or rewrite saved adventure progress.
8. Avoid unnecessary dependencies, duplicated abstractions and speculative infrastructure.
9. Never add paid APIs, mandatory cloud services or commercial licenses without approval.
10. Do not replace real functionality with mocked or simulated behavior.
11. Treat privacy, consent and accessibility as functional requirements.
12. Never modify functionality unrelated to the current task without a demonstrated need.

## Educational quality

LingoVerse must teach before evaluating absolute beginners.

Support language-specific learning preferences and guided/autonomous experiences.

Core learning sequence:

Understand → Listen → Learn → Practice → Respond → Receive feedback → Apply independently.

Do not require students to know a phrase before it has been adequately introduced in beginner mode.

Accept verified, contextually appropriate alternative answers.

Distinguish unknown responses from actual linguistic mistakes.

Never interpret an incorrect speech-to-text transcript as proof of poor pronunciation.

Allow the user to repeat, review transcripts, edit, type and continue with appropriate educational assistance.

Distinguish assisted completion from independently demonstrated ability.

Never claim CEFR mastery, pronunciation quality or skill improvement without appropriate evidence.

## Pronunciation instruction

Pronunciation support must be useful to Spanish-speaking beginners.

Use:

- Correct original expressions.
- Accurate Spanish meanings.
- Editorially reviewed pronunciation approximations.
- Correct language-specific audio.
- Meaningful phrase segmentation.
- Short explanations of difficult sounds.
- Repetition and controlled listening.

Spanish approximations are learning aids, not exact phonetic transcriptions.

Never invent pronunciation guidance from spelling or generate unreviewed approximations at runtime.

When pronunciation cannot be represented accurately in Spanish, explain the limitation and rely on authentic audio.

Never use approximate pronunciation strings for speech recognition, answer evaluation or grading.

## Voice and speech recognition

Keep audio languages correct:

- French speech: French voice.
- English speech: English voice.
- Spanish explanations: Spanish voice.

Never silently use a voice from the wrong language.

Avoid overlapping playback, stale callbacks and speech continuing after navigation or revocation.

Preserve microphone permission checks, transcript review, cancellation and written alternatives.

Do not store voice recordings without explicit authorization.

Do not claim offline recognition, native compatibility or phonetic assessment without verification.

## Narrative integrity

Adventures must be coherent stories, not unrelated questions.

Characters should react to decisions and known conversation context.

Avoid asking for information already provided by the student.

Respect established NPC identities and personalities.

Maintain compatibility across Paris, London and future destinations.

## Regional coaches and Roast Me

Existing coaches:

- Luz — El Salvador.
- Toño — Mexico.
- Vale — Colombia.
- Romi — Argentina.

Preserve their distinct regional identities.

Roast Me is an optional adult experience with contextual humor, regional profanity and strong comedic reactions.

Adult content must require valid explicit consent and support immediate revocation.

Humor must never replace educational correction.

Never invent a language or pronunciation mistake to justify a roast.

Roast Me Live is a planned future feature; do not claim it already exists.

## UI and product design

Preserve the approved premium cinematic/editorial design system.

Prioritize mobile usability, navigation clarity, readable text and expressive characters.

Do not redesign the entire application for a small functional change.

Prefer progressive disclosure over placing all controls and explanations on screen simultaneously.

Support small screens, keyboard interaction, accessibility and reduced motion.

Do not expose technical terminology to beginner users when a simpler explanation is possible.

## Testing requirements

Use test-driven development for regressions and clear behavioral requirements when appropriate.

Run focused tests during implementation.

Before final delivery, run the applicable complete project checks:

- `npm test`
- `npm run typecheck:core`
- `npm run typecheck`
- `npm run lint`
- `npm run export:web`

Verify that scripts exist before running them.

Do not delete or weaken tests merely to obtain a passing result.

When test counts change, explain the exact cause.

Include tests for failures, edge cases, navigation, persistence and regressions when relevant.

Automated tests do not replace manual testing of sound quality, speech recognition or visual usability.

## Quality gates

A task is complete only when:

1. The requested behavior is implemented.
2. Existing relevant behavior remains intact.
3. New requirements have meaningful test coverage.
4. Required automated checks pass.
5. Errors and fallbacks are handled.
6. Compatibility and data preservation are considered.
7. Documentation accurately reflects implementation.
8. Manual QA instructions are provided for behavior that cannot be verified automatically.

Never claim success for checks that were not run.

If something cannot be verified, mark it pending rather than guessing.

## Git and data protection

The current project was last reported without `.git`.

Do not initialize Git, modify branches, commit, push, merge, reset, clean or deploy without explicit authorization.

Before significant edits, verify the existing backup strategy and protect affected files.

Never overwrite the older project or delete user data.

Do not modify unrelated files or commit generated secrets, logs, caches or dependency directories.

## Token efficiency without quality loss

Optimize exploration, not correctness.

- Inspect only relevant source files.
- Reuse knowledge already established within the session.
- Avoid repeatedly summarizing the entire project.
- Do not perform unnecessary web browsing.
- Avoid redundant agents and parallel work.
- Use targeted tests while implementing.
- Run the necessary complete checks before delivery.
- Keep progress messages concise.
- Do not skip important edge cases, tests or implementation details to save tokens.

Thorough internal implementation is more important than long conversational explanations.

## Task workflow

For each task:

1. Inspect relevant code and documentation.
2. Confirm the current baseline.
3. Identify affected modules and risks.
4. Implement the smallest complete solution.
5. Add and run meaningful tests.
6. Validate regressions.
7. Update documentation.
8. Report the result.

Stop and request approval only for material blockers such as destructive changes, external costs, major architecture decisions or unavailable required access.

## Delivery format

Keep final responses concise and evidence-based:

- Implemented changes.
- Modified files.
- Test results.
- Manual QA instructions.
- Known limitations.
- Next recommended step.

No exaggerated success claims.

Do not deliver documentation alone when the task requests working software.


## Git and version control

Git operations are managed exclusively by the project owner.

Claude Code must NOT:
- Create, switch, rename or delete branches.
- Execute git add, commit, push, pull, fetch, merge, rebase, reset or clean.
- Initialize repositories.
- Modify .git configuration or repository history.
- Automatically commit changes after completing tasks.

Claude Code MAY:
- Read git status, diff and log when necessary to understand existing changes.
- Modify project source files as required by the assigned development task.
- Report which files were modified.

Leave all changes uncommitted for manual review.

Do not suggest or execute Git commands unless explicitly requested by the project owner.