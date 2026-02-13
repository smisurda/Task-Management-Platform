import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private dark = signal<boolean>(document.documentElement.classList.contains('dark'));

  isDark(): boolean {
    return this.dark();
  }

  toggle(): void {
    const newDark = !this.dark();
    this.dark.set(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
