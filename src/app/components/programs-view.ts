import { ChangeDetectionStrategy, Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { ProgramId, ResearchProgram } from '../models/research.types';

@Component({
  selector: 'app-programs-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Section Header -->
      <div class="border-b border-[#152232] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-[#59D9FF] text-[20px] w-5 h-5">apps</mat-icon>
            <span>{{ i18n.t('nav.programs') }}</span>
          </h2>
          <p class="text-xs text-[#7E9BB0] mt-0.5">
            {{ i18n.isRtl() ? 'پنج برنامه پژوهشی مستقل، هر یک دارای کتابخانه، فرضیات، آزمایشگاه و پیش‌نویس مقاله اختصاصی' : 'Five autonomous research tracks with dedicated literature collections, hypotheses, and empirical labs' }}
          </p>
        </div>

        <div class="text-xs font-mono text-[#59D9FF] px-3 py-1 rounded-lg bg-[#59D9FF]/10 border border-[#59D9FF]/20 flex items-center gap-1.5 self-start sm:self-auto">
          <span>ACTIVE:</span>
          <span class="font-bold text-white">{{ storage.activeProgramId() }}</span>
        </div>
      </div>

      <!-- Programs Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (prog of storage.programs; track prog.id) {
          <div 
            class="rounded-xl border transition-all p-5 flex flex-col justify-between"
            [class.border-[#59D9FF]]="storage.activeProgramId() === prog.id"
            [class.bg-[#09121C]]="storage.activeProgramId() === prog.id"
            [class.glow-cyan-sm]="storage.activeProgramId() === prog.id"
            [class.border-[#172738]]="storage.activeProgramId() !== prog.id"
            [class.bg-[#080B10]]="storage.activeProgramId() !== prog.id"
          >
            <div>
              <!-- Top Row: Code & Readiness -->
              <div class="flex items-center justify-between mb-3">
                <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-[#101A24] border border-[#1C3247] text-[#59D9FF] font-bold">
                  {{ prog.code }}
                </span>

                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] text-[#7E9BB0] font-mono">Readiness:</span>
                  <span class="text-xs font-mono font-bold text-white">{{ prog.readinessScore }}%</span>
                </div>
              </div>

              <!-- Title & Icon -->
              <div class="flex items-start gap-2.5 mb-2">
                <div class="w-8 h-8 rounded-lg bg-[#0F1722] border border-[#20364C] flex items-center justify-center shrink-0 mt-0.5">
                  <mat-icon class="text-[20px] w-5 h-5" [style.color]="prog.color">{{ prog.icon }}</mat-icon>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-white leading-tight">
                    {{ i18n.isRtl() ? prog.titleFa : prog.titleEn }}
                  </h3>
                  <div class="text-[11px] text-[#59D9FF]/80 mt-0.5">
                    {{ i18n.isRtl() ? prog.subtitleFa : prog.subtitleEn }}
                  </div>
                </div>
              </div>

              <!-- Description -->
              <p class="text-xs text-[#A9E6FF]/80 leading-relaxed mb-4 line-clamp-3">
                {{ i18n.isRtl() ? prog.descriptionFa : prog.descriptionEn }}
              </p>

              <!-- Topic Tags -->
              <div class="flex flex-wrap gap-1.5 mb-4">
                @for (topic of prog.keyTopics; track topic) {
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0D1520] border border-[#162738] text-[#7E9BB0]">
                    {{ topic }}
                  </span>
                }
              </div>

              <!-- Metrics Mini Bar -->
              <div class="grid grid-cols-4 gap-1.5 py-2.5 px-3 rounded-lg bg-[#06090D] border border-[#121E2C] text-center text-[10px] font-mono mb-4">
                <div>
                  <div class="text-white font-bold">{{ prog.papersCount }}</div>
                  <div class="text-[#7E9BB0] text-[9px]">Papers</div>
                </div>
                <div>
                  <div class="text-white font-bold">{{ prog.activeQuestionsCount }}</div>
                  <div class="text-[#7E9BB0] text-[9px]">Gaps</div>
                </div>
                <div>
                  <div class="text-white font-bold">{{ prog.experimentsCount }}</div>
                  <div class="text-[#7E9BB0] text-[9px]">Exps</div>
                </div>
                <div>
                  <div class="text-white font-bold">{{ prog.hypothesesCount }}</div>
                  <div class="text-[#7E9BB0] text-[9px]">Hypos</div>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div>
              @if (storage.activeProgramId() === prog.id) {
                <div class="w-full py-2 rounded-lg bg-[#59D9FF]/15 border border-[#59D9FF]/30 text-[#59D9FF] text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <mat-icon class="w-4 h-4 text-[16px]">check_circle</mat-icon>
                  <span>{{ i18n.t('programs.active_badge') }}</span>
                </div>
              } @else {
                <button
                  (click)="selectProgram(prog.id)"
                  class="w-full py-2 rounded-lg bg-[#101A26] hover:bg-[#162638] border border-[#1E334A] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <mat-icon class="w-4 h-4 text-[16px]">radio_button_unchecked</mat-icon>
                  <span>{{ i18n.t('programs.switch_active') }}</span>
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProgramsView {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  selectProgram(id: ProgramId): void {
    this.storage.setActiveProgram(id);
  }
}
