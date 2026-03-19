import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User, UserService } from '../../../service/user.serice';
import { Router } from '@angular/router';

@Component({
  selector: 'app-farmer-accounts',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './farmer-accounts.component.html',
  styleUrl: './farmer-accounts.component.css',
})
export class FarmerAccountsComponent implements OnInit {
  accounts: User[] = [];

  searchText = '';
  showMenuId: string | null = null;

  isEditing = false;
  selectedAccount: any = {};

  loading = false;

  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  // 🚀 LOAD USERS
  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    this.accounts = await this.userService.getUsers();
    this.loading = false;
  }

  // 🔍 FILTER
  filteredAccounts(): User[] {
    return this.accounts.filter(
      (acc) =>
        acc.name?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        acc.email?.toLowerCase().includes(this.searchText.toLowerCase()),
    );
  }

  // ⋮ MENU
  toggleMenu(id: string) {
    this.showMenuId = this.showMenuId === id ? null : id;
  }

  // ➕ ADD
  openAddForm() {
    this.selectedAccount = {
      name: '',
      email: '',
      password: '',
      status: 'active',
    };
    this.isEditing = true;
  }

  // ✏️ EDIT
  openEdit(acc: User) {
    this.selectedAccount = { ...acc };
    this.isEditing = true;
  }

  // 💾 SAVE (SUPABASE NA)
  async saveAccount() {
    if (!this.selectedAccount.name || !this.selectedAccount.email) {
      this.showToast('Name and Email are required', 'error');
      return;
    }

    this.showToast('Saving account...', 'loading');

    try {
      if (!this.selectedAccount.id) {
        // 👉 REGISTER
        if (!this.selectedAccount.password) {
          this.showToast('Password is required', 'error');
          return;
        }

        const success = await this.userService.register(
          this.selectedAccount.name,
          this.selectedAccount.email,
          this.selectedAccount.password,
        );

        if (success) {
          await this.loadUsers();
          this.cancelEdit();
          this.showToast('Account created successfully!', 'success');
        } else {
          // 🔥 ALREADY EXIST / FAIL
          this.showToast('Account already exists or failed', 'error');
        }
      } else {
        // 👉 UPDATE
        const success = await this.userService.updateUser(this.selectedAccount);

        if (success) {
          await this.loadUsers();
          this.cancelEdit();
          this.showToast('Account updated!', 'success');
        } else {
          this.showToast('Failed to update account', 'error');
        }
      }
    } catch (error) {
      console.error(error);
      this.showToast('Something went wrong', 'error');
    }
  }

  // 🗑 DELETE
  async deleteAccount(id: string) {
    if (!confirm('Delete this account?')) return;

    this.showToast('Deleting account...', 'loading');

    try {
      await this.userService.deleteUser(id);
      await this.loadUsers();
      this.showToast('Account deleted', 'success');
    } catch (error) {
      this.showToast('Failed to delete account', 'error');
    }
  }

  // 🚫 BLOCK
  async toggleBlock(user: User) {
    this.showToast('Updating status...', 'loading');

    try {
      await this.userService.toggleBlock(user);
      await this.loadUsers();
      this.showToast('Status updated', 'success');
    } catch (error) {
      this.showToast('Failed to update status', 'error');
    }
  }

  // ❌ CANCEL
  cancelEdit() {
    this.isEditing = false;
    this.selectedAccount = {};
  }

  goToProfile(userId: string) {
    this.router.navigate(['/admin/profile', userId]); // <-- include parent path
  }

  // 🟦 TOAST STATE
  toast = {
    show: false,
    message: '',
    type: 'loading' as 'loading' | 'success' | 'error',
  };

  // 🟦 SHOW TOAST
  showToast(
    message: string,
    type: 'loading' | 'success' | 'error' = 'success',
  ) {
    this.toast = { show: true, message, type };

    if (type !== 'loading') {
      setTimeout(() => (this.toast.show = false), 2500);
    }
  }

  // 🟦 HIDE
  hideToast() {
    this.toast.show = false;
  }
}
