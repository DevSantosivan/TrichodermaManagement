import { Component, OnInit } from '@angular/core';
import { User, UserService } from '../../../service/user.serice';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.user = await this.userService.getUserById(id);
    }
  }
  goBack() {
    this.router.navigate(['/admin/accounts']); // Adjust based on your route
  }

  goToChat(userId: string) {
    this.router.navigate(['/admin/chat', userId]); // Navigate to ChatBoxComponent
  }
}
