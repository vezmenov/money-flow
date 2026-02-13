import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appInput]',
  standalone: true,
  host: {
    class: 'app-control',
    '[class.app-control--select]': 'isSelect',
    '[class.app-control--textarea]': 'isTextarea',
  },
})
export class InputDirective {
  readonly isSelect: boolean;
  readonly isTextarea: boolean;

  constructor(private readonly el: ElementRef<HTMLElement>) {
    const tag = this.el.nativeElement.tagName.toLowerCase();
    this.isSelect = tag === 'select';
    this.isTextarea = tag === 'textarea';
  }
}

