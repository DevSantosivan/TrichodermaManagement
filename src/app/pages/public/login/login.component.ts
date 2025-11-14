import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    InputTextModule,
    ButtonModule,
    InputGroupModule,
    ConfirmPopupModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  target: any;

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  login(form: NgForm) {
    this.target = null;

    if (form.invalid) {
      this.showPopup('Please fill in all required fields correctly.');
      return;
    }

    if (this.email === 'admin@gmail.com' && this.password === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.showPopup('Invalid email or password.');
    }
  }

  showPopup(message: string) {
    this.confirmationService.confirm({
      message: message,
      header: 'Login Error',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'OK',
      rejectVisible: false,
      target: this.target,
    });
  }
}
