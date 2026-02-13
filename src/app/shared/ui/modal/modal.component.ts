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
      border-radius: var(--radius-card, 18px);
      border: 1px solid rgba(255, 255, 255, 0.55);
      background: rgba(255, 255, 255, 0.55);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.7),
        inset 0 -1px 0 rgba(2, 6, 23, 0.1),
        0 26px 60px rgba(2, 6, 23, 0.25);
      backdrop-filter: blur(var(--glass-blur, 18px));
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

    .app-modal__header {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 1rem 1rem 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.28);
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
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.55);
      background:
        linear-gradient(to bottom, rgba(255, 255, 255, 0.7), rgba(240, 248, 255, 0.55));
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.75),
        inset 0 -1px 0 rgba(2, 6, 23, 0.1);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      -webkit-tap-highlight-color: transparent;
      transition: transform 140ms ease, filter 140ms ease;
    }

    .app-modal__close:hover {
      transform: translateY(-1px);
      filter: saturate(1.05);
    }

    .app-modal__close:active {
      transform: translateY(0);
    }

    .app-modal__close:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 3px rgba(43, 124, 255, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.75),
        inset 0 -1px 0 rgba(2, 6, 23, 0.1);
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

