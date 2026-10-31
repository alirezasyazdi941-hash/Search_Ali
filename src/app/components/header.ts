import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { GeminiService } from '../services/gemini.service';
import { ProgramId } from '../models/research.types';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <header class="border-b border-[#152232] bg-[#05080C]/90 backdrop-blur-md sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between select-none">
      <!-- Left: Logo & Active Program Badge -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 cursor-pointer" (click)="openOnboarding.emit()">
          <div class="w-8 h-8 rounded-lg bg-[#0D1824] border border-[#59D9FF]/30 flex items-center justify-center glow-cyan-sm">
            <mat-icon class="text-[#59D9FF] text-[20px] w-5 h-5">science</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-sm tracking-wider text-white">ALI</span>
              <span class="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#59D9FF]/10 text-[#59D9FF] border border-[#59D9FF]/20">RESEARCH OS</span>
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online"></span>
            </div>
            <p class="text-[10px] text-[#7E9BB0] hidden sm:block font-mono">
              {{ i18n.t('app.motto') }}
            </p>
          </div>
        </div>

        <div class="h-6 w-px bg-[#152232] mx-1 hidden md:block"></div>

        <!-- Active Program Quick Selector -->
        <div class="hidden lg:flex items-center gap-2">
          <label class="text-[11px] text-[#7E9BB0]">{{ i18n.isRtl() ? 'برنامه فعال:' : 'Active Program:' }}</label>
          <div class="relative">
            <select 
              [value]="storage.activeProgramId()"
              (change)="onProgramSelect($event)"
              class="bg-[#0A0F16] border border-[#192C40] hover:border-[#59D9FF]/40 text-xs text-[#A9E6FF] rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:border-[#59D9FF] cursor-pointer font-medium appearance-none"
            >
              @for (prog of storage.programs; track prog.id) {
                <option [value]="prog.id">
                  {{ prog.code }}: {{ i18n.isRtl() ? prog.titleFa : prog.titleEn }}
                </option>
              }
            </select>
            <mat-icon class="absolute right-1.5 top-1.5 text-xs text-[#7E9BB0] pointer-events-none w-4 h-4 text-[16px]">expand_more</mat-icon>
          </div>
        </div>
      </div>

      <!-- Right: System Status, Language Toggle, Export & Guide -->
      <div class="flex items-center gap-2">
        <!-- AI Core Status Badge -->
        <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A1017] border border-[#172738] text-[11px]">
          <span class="w-1.5 h-1.5 rounded-full" [class.bg-cyan-400]="gemini.hasGeminiKey()" [class.bg-amber-400]="!gemini.hasGeminiKey()"></span>
          <span class="text-[#7E9BB0]">
            @if (gemini.hasGeminiKey()) {
              Gemini 3.8 Flash
            } @else {
              {{ i18n.isRtl() ? 'موتور تحلیلی بومی' : 'Local Heuristic Engine' }}
            }
          </span>
        </div>

        <!-- Language Toggle -->
        <button
          (click)="i18n.toggleLanguage()"
          class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0A0F17] hover:bg-[#121B27] border border-[#172738] text-xs font-semibold text-[#A9E6FF] transition-colors"
          [title]="i18n.isRtl() ? 'تغییر به زبان انگلیسی' : 'Switch to Persian'"
        >
          <mat-icon class="text-sm w-4 h-4 text-[16px] text-[#59D9FF]">language</mat-icon>
          <span>{{ i18n.currentLang() === 'fa' ? 'English' : 'فارسی' }}</span>
        </button>

        <!-- Workspace Backup / Import -->
        <button
          (click)="openExport.emit()"
          class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0A0F17] hover:bg-[#121B27] border border-[#172738] text-xs font-medium text-[#A9E6FF] transition-colors"
          [title]="i18n.t('storage.export_json')"
        >
          <mat-icon class="text-sm w-4 h-4 text-[16px] text-[#7E9BB0]">save_alt</mat-icon>
          <span class="hidden md:inline">{{ i18n.isRtl() ? 'پشتیبان / بازیابی' : 'Backup / Import' }}</span>
        </button>

        <!-- Onboarding / Guide Help -->
        <button
          (click)="openOnboarding.emit()"
          class="p-1.5 rounded-lg bg-[#0A0F17] hover:bg-[#121B27] border border-[#172738] text-[#7E9BB0] hover:text-[#59D9FF] transition-colors"
          [title]="i18n.t('onboarding.welcome_title')"
        >
          <mat-icon class="w-4 h-4 text-[18px]">help_outline</mat-icon>
        </button>
      </div>
    </header>
  `
})
export class Header {
  i18n = inject(I18nService);
  storage = inject(StorageService);
  gemini = inject(GeminiService);

  openOnboarding = output<void>();
  openExport = output<void>();

  onProgramSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as ProgramId;
    this.storage.setActiveProgram(val);
  }
}
