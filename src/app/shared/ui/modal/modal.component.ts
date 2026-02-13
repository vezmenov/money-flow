import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

let nextModalId = 0;

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'app-modal-host',
    '[attr.data-size]': 'size',
  },
  template: `
    <dialog
      #dialog
      class="app-modal__dialog"
      (click)="handleBackdropClick($event)"
      (cancel)="handleCancel($event)"
      (close)="handleNativeClose()"
      [attr.aria-labelledby]="titleId"
    >
      <section class="app-modal__sheet" role="document">
        <header class="app-modal__header">
          <div class="app-modal__title" [id]="titleId">{{ title }}</div>
          <button class="app-modal__close" type="button" (click)="requestClose()" aria-label="Закрыть">
            <app-icon name="close" [size]="18" [decorative]="true" />
          </button>
        </header>

        <div class="app-modal__body">
          <ng-content />
        </div>

        <footer class="app-modal__footer" *ngIf="hasActions">
          <ng-content select="[modalActions]" />
        </footer>
      </section>
    </dialog>
  `,
  styles: `
    .app-modal__dialog {
      width: min(680px, calc(100vw - 28px));
      max-width: 680px;
      border: none;
      padding: 0;
      margin: auto;
      background: transparent;
      overflow: visible;
    }

    .app-modal__dialog::backdrop {
      background: rgba(3, 7, 18, 0.4);
      backdrop-filter: blur(8px);
    }

    .app-modal__sheet {
      position: relative;
      border-radius: var(--radius-card, 20px);
      border: 1px solid var(--glass-border-strong, rgba(255, 255, 255, 0.5));
      background: var(--glass-bg-strong, rgba(255, 255, 255, 0.65));
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.9),
        0 4px 12px rgba(0, 0, 0, 0.14),
        0 1px 3px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(var(--glass-blur-strong, 20px)) saturate(var(--glass-saturate, 180%));
      overflow: hidden;
    }

    .app-modal__sheet::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(120% 90% at 16% 0%, rgba(255, 255, 255, 0.55), transparent 48%),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      opacity: 0.9;
    }

    .app-modal__sheet::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
      opacity: 0.35;
    }

    .app-modal__header {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 1rem 1rem 0.75rem 1rem;
      border-bottom: 1px solid var(--glass-divider, rgba(0, 0, 0, 0.06));
    }

    .app-modal__title {
      font-size: 1.05rem;
      font-weight: 750;
      letter-spacing: 0.01em;
      color: var(--text, #0b1020);
    }

    .app-modal__close {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid rgba(0, 0, 0, 0.12);
      background:
        linear-gradient(to bottom, rgba(249, 250, 251, 1), rgba(229, 231, 235, 1));
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.9),
        0 1px 3px rgba(0, 0, 0, 0.14);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: rgba(75, 85, 99, 0.98);
      -webkit-tap-highlight-color: transparent;
      transition: transform 140ms ease, filter 140ms ease;
    }

    .app-modal__close:hover {
      transform: translateY(-1px);
      filter: saturate(1.06);
    }

    .app-modal__close:active {
      transform: translateY(0);
      background:
        linear-gradient(to bottom, rgba(229, 231, 235, 1), rgba(209, 213, 219, 1));
    }

    .app-modal__close:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 3px color-mix(in srgb, var(--accent-blue, #3b82f6) 24%, transparent),
        inset 0 1px 1px rgba(255, 255, 255, 0.9),
        0 1px 3px rgba(0, 0, 0, 0.14);
    }

    .app-modal__body {
      position: relative;
      z-index: 1;
      padding: 1rem;
      display: grid;
      gap: 1rem;
    }

    .app-modal__footer {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 0 1rem 1rem 1rem;
    }

    .app-modal-host[data-size='sm'] .app-modal__dialog {
      max-width: 520px;
    }

    .app-modal-host[data-size='lg'] .app-modal__dialog {
      max-width: 840px;
    }
  `,
})
export class ModalComponent implements AfterViewInit {
  @ViewChild('dialog') private readonly dialog?: ElementRef<HTMLDialogElement>;

  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() hasActions = true;

  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();

  private readonly uid = `app-modal-${++nextModalId}`;

  get titleId() {
    return `${this.uid}-title`;
  }

  ngAfterViewInit(): void {
    this.syncOpenState();
  }

  ngOnChanges(): void {
    this.syncOpenState();
  }

  requestClose() {
    const dialog = this.dialog?.nativeElement;
    if (!dialog?.open) {
      this.openChange.emit(false);
      return;
    }
    dialog.close();
  }

  handleBackdropClick(event: MouseEvent) {
    if (event.target === this.dialog?.nativeElement) {
      this.requestClose();
    }
  }

  handleCancel(event: Event) {
    event.preventDefault();
    this.requestClose();
  }

  handleNativeClose() {
    this.openChange.emit(false);
  }

  private syncOpenState() {
    const dialog = this.dialog?.nativeElement;
    if (!dialog) {
      return;
    }
    if (this.open && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        // If showModal fails (e.g. not connected yet), fall back to open attribute.
        dialog.setAttribute('open', '');
      }
      return;
    }
    if (!this.open && dialog.open) {
      dialog.close();
    }
  }
}
