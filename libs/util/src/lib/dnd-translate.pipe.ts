import { inject, Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DndTranslatorService } from './dnd-translator.service';

/**
 * Async pipe that translates English DnD text to Czech via Google Translate.
 *
 * Usage in template (must be combined with Angular's async pipe):
 *   {{ someText | dndTranslate | async }}
 */
@Pipe({ name: 'dndTranslate', pure: true, standalone: true })
export class DndTranslatePipe implements PipeTransform {
  private readonly translator = inject(DndTranslatorService);

  transform(value: string | null | undefined): Observable<string> {
    if (!value) return of(value ?? '');
    return this.translator.translate(value);
  }
}
