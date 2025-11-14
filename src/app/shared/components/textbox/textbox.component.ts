// textbox.component.ts
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-textbox',
  standalone: true, // <-- important
  imports: [FormsModule, InputTextModule], // <-- import what it needs
  template: `
    <input
      pInputText
      [type]="type"
      [placeholder]="placeholder"
      [(ngModel)]="value"
      class="w-full p-2 border rounded"
    />
  `,
})
export class TextboxComponent {
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() value: string = '';
}
