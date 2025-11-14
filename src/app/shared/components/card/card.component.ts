// // shared/components/card/card.component.ts
// import { Component, Input } from '@angular/core';
// import { CardModule } from 'primeng/card';
// import { ButtonModule } from 'primeng/button';

// @Component({
//   selector: 'app-card',
//   standalone: true, // <-- standalone component
//   imports: [CardModule, ButtonModule], // <-- import PrimeNG modules used
//   template: `
//     <p-card [header]="title" class="w-60">
//       <ng-template pTemplate="content">
//         <div class="flex flex-col items-center gap-2">
//           <i
//             *ngIf="icon"
//             [class]="'pi ' + icon + ' text-3xl text-blue-600'"
//           ></i>
//           <button
//             pButton
//             type="button"
//             label="{{ buttonText }}"
//             (click)="buttonClick()"
//           ></button>
//         </div>
//       </ng-template>
//     </p-card>
//   `,
// })
// export class CardComponent {
//   @Input() title!: string;
//   @Input() icon?: string;
//   @Input() buttonText: string = 'Action';
//   @Input() buttonClick: () => void = () => {};
// }
