# Angular Developer Rules — DnD-Servant

> These rules apply to **every** file touched or created by the agent.
> Run a mental code-review against all rules before finalising any change.

---

## 1. Component Declaration

| Rule | Detail |
|---|---|
| **Standalone only** | Every component must be `standalone: true` (no NgModules). |
| **OnPush always** | `changeDetection: ChangeDetectionStrategy.OnPush` is mandatory on every component. |
| **Selector naming** | Use `kebab-case` selectors matching the file name (`dm-quests` → `dm-quests.component.ts`). |
| **No `styleUrl` for shared scss** | Avoid `styleUrl: 'character-sheet.component.scss'` on non-character-sheet components; use inline `styles: \`…\`` or a dedicated file. |
| **Template in-file preferred** | For small/medium components keep template inline (`template: \`…\``). Extract to `.html` only when > ~150 lines. |

```ts
// ✅ correct
@Component({
  selector: 'my-feature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIcon],
  template: `…`,
  styles: `…`,
})
export class MyFeatureComponent { … }
```

---

## 2. Signals & State

| Rule | Detail |
|---|---|
| **Signals for local state** | Use `signal()` for all mutable local component state. No `BehaviorSubject` for UI state. |
| **`computed()` for derived state** | Never re-derive a value in the template; use `computed()`. |
| **`effect()` with `untracked()`** | All side-effects inside `effect()` that write to signals must be wrapped in `untracked()` to prevent infinite loops. |
| **NgRx SignalStore for shared state** | Cross-component / persisted state lives in a `signalStore`. Never access `patchState` directly from a component. |
| **No direct store mutation** | Components call store *methods* only; they never import `patchState`. |

```ts
// ✅ effect with untracked
effect(() => {
  const data = this.store.someSignal();
  untracked(() => {
    if (data) this.localSignal.set(data);
  });
});

// ❌ never write a signal inside an effect without untracked
effect(() => {
  this.mySignal.set(this.store.otherSignal()); // infinite loop risk
});
```

---

## 3. Reactive Forms vs ngModel

| Rule | Detail |
|---|---|
| **ReactiveFormsModule** for persisted/validated forms | Character sheet, notes, group sheet — always `FormBuilder` + `FormGroup`. |
| **`FormsModule` / `ngModel`** for simple local lists | Initiative tracker rows, quest cards, item vault cards — `[(ngModel)]` is fine. |
| **No mixing** | Do not combine `[formControl]` and `[(ngModel)]` on the same element. |
| **`$any()` cast for `selectedIndexChange`** | Mat tab-group's `selectedIndexChange` must be bound as `(selectedIndexChange)="handler($any($event))"` to avoid IDE type errors. |

---

## 4. Imports

| Rule | Detail |
|---|---|
| **No unused imports** | Every entry in the `imports: []` array must be used in the template. Remove unused ones. |
| **Path aliases only** | Always import from `@dn-d-servant/…` aliases, never with relative `../../` paths that cross lib boundaries. |
| **Group imports** | Order: Angular core → Angular Material → RxJS → NgRx → project libs → local files. |
| **No wildcard imports** | `import * as X` is forbidden. |

```ts
// ✅ correct import order
import { Component, inject, signal } from '@angular/core';   // Angular core
import { MatIcon } from '@angular/material/icon';             // Angular Material
import { debounceTime } from 'rxjs';                          // RxJS
import { CharacterSheetStore } from '@dn-d-servant/character-sheet-data-access'; // project lib
import { MyLocalService } from './my-local.service';          // local
```

---

## 5. RxJS

| Rule | Detail |
|---|---|
| **`takeUntilDestroyed`** | Any `subscribe()` inside a component must use `pipe(takeUntilDestroyed(this.destroyRef))`. |
| **`rxMethod` for store side-effects** | Store async operations use `rxMethod` from `@ngrx/signals/rxjs-interop`, not manual subscriptions. |
| **`tapResponse`** | Use `tapResponse` from `@ngrx/operators` inside store `rxMethod` pipes for success/error handling. |
| **No nested subscriptions** | Use `switchMap`/`mergeMap`/`concatMap` instead. |
| **Debounce auto-save** | Auto-save triggers must use `debounceTime(≥1500)` on a `Subject`, not raw `interval`. |

---

## 6. Firestore / API Layer

| Rule | Detail |
|---|---|
| **One service per domain** | Each feature lib has exactly one `*-api.service.ts` with `@Injectable({ providedIn: 'root' })`. |
| **Collection naming** | Firestore collections use `kebab-case` (e.g., `dm-quests`, `item-vault`, `player-notes`). |
| **`from(promise)` pattern** | Wrap every Firestore promise with `from()` to return an `Observable`. |
| **Typed snapshots** | Always cast: `snapshot.data() as MyModel`. |
| **No direct Firestore calls in components** | Components call store methods only; never inject `Firestore` into a component. |

```ts
// ✅ correct API service method
getItemsByUsername(username: string): Observable<MyModel | undefined> {
  const ref = doc(this.firestore, `my-collection/${username}`);
  return from(getDoc(ref)).pipe(
    map(s => (s.exists() ? (s.data() as MyModel) : undefined)),
  );
}
```

---

## 7. Styling & CSS

| Rule | Detail |
|---|---|
| **CSS custom properties for theming** | Use `var(--property-name, fallback)` for values that need context-specific overrides (e.g., `--rt-text-color`). |
| **No hardcoded `var()` without fallback** | Every `var()` must have a fallback value. |
| **`::ng-deep` only for Angular Material internals** | Acceptable for MDC classes; never for own component selectors. |
| **No inline `style=` for static values** | Inline `style=` is allowed for dynamic/computed values only (e.g., `[style.border-left-color]="…"`). |
| **DnD dark theme palette** | Primary gold: `rgba(200,160,60,…)`. Crimson accent: `rgba(180,30,30,…)`. Background: `rgba(14,10,4,…)`. Text: `#c8c4bc`. |
| **Mikadan font for headers** | Section titles, tab labels, badge text → `font-family: 'Mikadan', sans-serif`. Body text → `sans-serif`. |
| **`box-sizing: border-box`** | All sized elements must include it. |

---

## 8. Rich-Textarea Integration

| Rule | Detail |
|---|---|
| **Always inside a `position: relative` wrapper** | `rich-textarea` host is `position: absolute`; always wrap it in a container with `position: relative` and explicit `height`. |
| **Inline style for positioning** | `style="top:0;left:0;width:100%;height:100%;"` on the `<rich-textarea>` element. |
| **Dark-background default** | Default `--rt-text-color` is `#c8c4bc` (light). Override to `#2e2924` on light/parchment backgrounds via the CSS custom property on the host element. |
| **No `.field.textarea` class on dark panels** | The `.field.textarea` class sets `--rt-text-color: #2e2924`. Do not apply it to rich-textareas inside dark DnD panels. |

---

## 9. File & Library Structure

| Rule | Detail |
|---|---|
| **Feature lib** | UI components, templates, styles. |
| **Data-access lib** | Store + API service. Depends on `util` lib of same domain. |
| **Util lib** | Models (`*ApiModel`, `*Form`, types). Pure; no Angular dependencies. |
| **Global `/ui` lib** | Reusable presentational components: `RichTextareaComponent`, `SpinnerOverlayComponent`, `AutofillInputComponent`, `DiceRollerComponent`. |
| **Global `/util` lib** | Shared services (`AuthService`, `LocalStorageService`), utilities, environment. |
| **No cross-feature imports** | `character-sheet` libs must not import from `dm-page` libs and vice versa. |
| **Export barrel** | Every lib exposes its public API through `src/index.ts` only. |

---

## 10. Naming Conventions

| Artefact | Convention | Example |
|---|---|---|
| Component class | `PascalCase` + `Component` | `DmQuestsComponent` |
| Store constant | `PascalCase` + `Store` | `CharacterSheetStore` |
| API service | `PascalCase` + `ApiService` | `DmPageApiService` |
| Model interface | `PascalCase` + `ApiModel` | `DmQuestsApiModel` |
| Form type | `PascalCase` + `Form` | `NotesPageForm` |
| Signal | `camelCase` | `expandedIds`, `filterStatus` |
| Computed signal | `camelCase` | `filteredAndSorted`, `statusCounts` |
| RxMethod | `camelCase` verb | `loadDmQuests`, `savePlayerNotes` |
| Local storage key | `kebab-case` string constant | `'dm-page-tab-index'` |
| Firestore collection | `kebab-case` | `'dm-quests'`, `'item-vault'` |

---

## 11. Performance & Change Detection

| Rule | Detail |
|---|---|
| **Lazy render with `@if`** | Use `@if` to conditionally render heavy content (e.g., expanded card sections, dialogs). |
| **`track` in `@for`** | Always provide a unique `track` expression: `@for (item of list(); track item.id)`. |
| **No `ChangeDetectorRef.markForCheck()`** | With OnPush + signals this should never be needed. If you feel you need it, refactor to signals instead. |
| **Image size limits** | Character images max 500 KB. Item/quest images max 200 KB. Enforce in `processFile()` before `FileReader`. |

---

## 12. Error Handling

| Rule | Detail |
|---|---|
| **Every store method handles errors** | `tapResponse` must have both success and error callbacks. Error callback shows a `MatSnackBar` and resets `loading: false`. |
| **User-facing messages in Czech** | All `snackBar.open()` messages are in Czech. |
| **No `console.log` in production code** | Use `console.error` only for truly unexpected errors, never `console.log`. |

---

## 13. Accessibility & UX

| Rule | Detail |
|---|---|
| **`matTooltip` on icon-only buttons** | Every `mat-icon-button` without visible label must have `matTooltip`. |
| **`type="button"`** | All `<button>` elements outside `<form>` must have `type="button"` to prevent accidental form submission. |
| **`aria-label` on inputs without visible label** | Provide `[attr.aria-label]` on unlabelled form controls. |
| **Confirmation before destructive actions** | Any delete/remove action must show an inline confirmation dialog before executing. |

---

## 14. Code Review Checklist

Before finalising **any** code change, verify:

- [ ] `ChangeDetectionStrategy.OnPush` present
- [ ] All `imports: []` entries are actually used in the template
- [ ] No `PlayerNotesApiModel` or other removed types referenced
- [ ] `effect()` side-effects use `untracked()` where signals are written
- [ ] `@for` loops have `track`
- [ ] `<button>` elements outside forms have `type="button"`
- [ ] `matTooltip` on all icon-only buttons
- [ ] New Firestore collections use `kebab-case`
- [ ] New models exported from lib's `src/index.ts`
- [ ] `takeUntilDestroyed` on any manual `subscribe()`
- [ ] Rich-textarea wrapped in `position: relative` container with explicit height
- [ ] CSS `var()` calls include a fallback value
- [ ] Image file size enforced before base64 conversion
- [ ] Czech language for all user-facing strings

