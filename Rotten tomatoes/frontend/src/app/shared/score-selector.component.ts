import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid">
      <button
        type="button"
        *ngFor="let n of scores"
        class="chip"
        [class.active]="n === value"
        (click)="pick(n)"
      >
        {{ n }}
      </button>
    </div>
    <p class="hint">
      {{ value > 0 ? 'Tu puntuación: ' + value + '/10' : 'Toca un número para puntuar (1-10)' }}
    </p>
  `,
  styles: [
    `
      .grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .chip {
        width: 44px;
        height: 44px;
        border-radius: var(--qs-radius-md);
        background: var(--qs-surface);
        border: 1.5px solid var(--qs-border);
        color: var(--qs-text-light);
        font-size: 16px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .chip.active {
        background: var(--qs-primary);
        border-color: var(--qs-primary);
        color: #fff;
      }
      .hint {
        font-size: 13px;
        color: var(--qs-text-light);
        margin: 10px 0 0;
      }
    `,
  ],
})
export class ScoreSelectorComponent {
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>();

  scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  pick(n: number): void {
    this.valueChange.emit(n);
  }
}
