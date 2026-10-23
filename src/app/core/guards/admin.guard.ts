import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);
  const currentUser = await firstValueFrom(authService.user$);

  if (!currentUser) {
    return router.createUrlTree(['/login']);
  }

  try {
    return await userService.getRole(currentUser.uid) === 'admin'
      ? true
      : router.createUrlTree(['/']);
  } catch {
    return router.createUrlTree(['/']);
  }
};