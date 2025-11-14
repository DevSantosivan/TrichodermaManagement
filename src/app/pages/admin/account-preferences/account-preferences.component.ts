import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account-preferences',
  imports: [FormsModule],
  templateUrl: './account-preferences.component.html',
  styleUrl: './account-preferences.component.css',
})
export class AccountPreferencesComponent {
  firstName = '';
  lastName = '';
  username = 'alvinhernandez090@gmail.com';
  email = 'alvinhernandez090@gmail.com';
  primaryEmail = this.email;

  saveChanges() {
    console.log('Saving profile info...');
    // TODO: integrate with firestore/supabase if needed
    alert('Profile updated successfully!');
  }

  resetPassword() {
    alert('Password reset link sent to your email.');
  }
}
