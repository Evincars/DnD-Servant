# Copilot Instructions – DnD-Servant

## Angular Code Rules

1. **No `setTimeout` / `setInterval`** – Use Angular signals (`signal`, `computed`, `effect`), `afterRender` / `afterNextRender`, or RxJS operators (`timer`, `delay`, `debounceTime`) instead of raw timer APIs. They break zone-less change detection, are hard to test, and are never necessary in modern Angular.

2. **No `@HostListener`** – Use the `host` property in the `@Component` / `@Directive` decorator metadata instead. `@HostListener` is a legacy API; the `host` map is the modern, declarative replacement.

3. **Prefer signals over imperative state** – Use `signal()`, `computed()`, `input()`, `output()`, `model()`, `viewChild()`, `contentChild()` for all component state. Avoid plain class fields for reactive data.

4. **OnPush everywhere** – Every component must use `changeDetection: ChangeDetectionStrategy.OnPush`.

5. **Standalone components only** – Never use `NgModule`-declared components. Use the `imports` array directly in `@Component`.

