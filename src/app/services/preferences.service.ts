import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppTheme = 'light' | 'dark';
export type AppLanguage = 'pt-BR' | 'en-US';

export interface UserPreferences {
  theme: AppTheme;
  language: AppLanguage;
}

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private storageKey = 'user_preferences';

  preferences = signal<UserPreferences>({
    theme: 'light',
    language: 'pt-BR',
  });

  constructor(private translate: TranslateService) {
    this.carregarPreferencias();

    this.translate.use(this.preferences().language);
    this.aplicarTema(this.preferences().theme);
  }

  alterarIdioma(language: AppLanguage) {
    const atual = this.preferences();

    this.preferences.set({
      ...atual,
      language,
    });

    this.translate.use(language);
    this.salvar();
  }

  alterarTema(theme: AppTheme) {
    const atual = this.preferences();

    this.preferences.set({
      ...atual,
      theme,
    });

    this.aplicarTema(theme);
    this.salvar();
  }

  private carregarPreferencias() {
    const saved = localStorage.getItem(this.storageKey);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as UserPreferences;

      const theme: AppTheme = parsed.theme === 'dark' ? 'dark' : 'light';

      const language: AppLanguage = parsed.language === 'en-US' ? 'en-US' : 'pt-BR';

      this.preferences.set({
        theme,
        language,
      });
    } catch {
      localStorage.removeItem(this.storageKey);
    }
  }

  private salvar() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.preferences()));
  }

  private aplicarTema(theme: AppTheme) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }
}
