import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { ResearchGap } from '../models/research.types';

@Component({
  selector: 'app-gap-analyzer-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-[#152232] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-amber-400 text-[20px] w-5 h-5">troubleshoot</mat-icon>
            <span>{{ i18n.t('gap.title') }}</span>
          </h2>
          <p class="text-xs text-[#7E9BB0] mt-0.5">
            {{ i18n.t('gap.subtitle') }}
          </p>
        </div>

        <button
          (click)="showAddModal.set(true)"
          class="px-4 py-2 rounded-xl bg-[#59D9FF] hover:bg-[#7AE1FF] text-black text-xs font-bold transition-all flex items-center gap-1.5 self-start md:self-auto glow-cyan-sm"
        >
          <mat-icon class="w-4 h-4 text-[16px]">add</mat-icon>
          <span>{{ i18n.t('gap.add_new') }}</span>
        </button>
      </div>

      <!-- Gap Cards List -->
      <div class="space-y-4">
        @for (gap of storage.activeGaps(); track gap.id) {
          <div class="p-5 rounded-xl bg-[#080B10] border border-[#172738] hover:border-[#233D56] transition-all space-y-4">
            <!-- Badges & Status -->
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <!-- Evidence Level -->
                <span 
                  class="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                  [class.bg-emerald-400/10]="gap.evidenceLevel === 'Empirical'"
                  [class.text-emerald-400]="gap.evidenceLevel === 'Empirical'"
                  [class.border]="gap.evidenceLevel === 'Empirical'"
                  [class.border-emerald-400/30]="gap.evidenceLevel === 'Empirical'"
                  [class.bg-blue-400/10]="gap.evidenceLevel === 'Theoretical'"
                  [class.text-blue-400]="gap.evidenceLevel === 'Theoretical'"
                  [class.border-blue-400/30]="gap.evidenceLevel === 'Theoretical'"
                  [class.bg-purple-400/10]="gap.evidenceLevel === 'Methodological'"
                  [class.text-purple-400]="gap.evidenceLevel === 'Methodological'"
                  [class.border-purple-400/30]="gap.evidenceLevel === 'Methodological'"
                >
                  {{ i18n.t('gap.evidence_level') }}: {{ gap.evidenceLevel }}
                </span>

                <!-- Confidence Level -->
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101B27] border border-[#1A2E44] text-[#59D9FF]">
                  {{ i18n.t('gap.confidence_level') }}: {{ gap.confidenceLevel }}
                </span>
              </div>

              <!-- Status Badge -->
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#142332] text-[#A9E6FF] border border-[#1F374F]">
                Status: {{ gap.status }}
              </span>
            </div>

            <!-- Title & Description -->
            <div>
              <h3 class="text-sm font-bold text-white mb-1.5">
                {{ gap.title }}
              </h3>
              <p class="text-xs text-[#A9E6FF]/80 leading-relaxed">
                {{ gap.description }}
              </p>
            </div>

            <!-- Candidate Research Questions -->
            @if (gap.candidateQuestions.length > 0) {
              <div class="p-3.5 rounded-lg bg-[#0C121A] border border-[#18293B] space-y-2">
                <div class="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <mat-icon class="w-4 h-4 text-[16px]">psychology</mat-icon>
                  <span>{{ i18n.t('gap.candidate_questions') }}</span>
                </div>
                <div class="space-y-1.5 text-xs text-[#A9E6FF]">
                  @for (q of gap.candidateQuestions; track q; let idx = $index) {
                    <div class="flex items-start gap-2">
                      <span class="text-amber-400 font-mono font-bold">Q{{ idx + 1 }}.</span>
                      <span class="leading-relaxed font-medium">"{{ q }}"</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Deep Analysis Pillars -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div class="p-3 rounded-lg bg-[#0A0E15] border border-[#14202E]">
                <div class="font-bold text-[#59D9FF] text-[11px] mb-1 flex items-center gap-1">
                  <mat-icon class="w-3.5 h-3.5 text-[14px]">merge_type</mat-icon>
                  <span>{{ i18n.t('gap.underexplored') }}</span>
                </div>
                <p class="text-[11px] text-[#7E9BB0] leading-relaxed">
                  {{ gap.underexploredCombinations }}
                </p>
              </div>

              <div class="p-3 rounded-lg bg-[#0A0E15] border border-[#14202E]">
                <div class="font-bold text-rose-300 text-[11px] mb-1 flex items-center gap-1">
                  <mat-icon class="w-3.5 h-3.5 text-[14px]">warning</mat-icon>
                  <span>{{ i18n.t('gap.reproducibility') }}</span>
                </div>
                <p class="text-[11px] text-[#7E9BB0] leading-relaxed">
                  {{ gap.reproducibilityIssues }}
                </p>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="flex items-center justify-between pt-2 border-t border-[#121E2C] text-[10px] font-mono text-[#7E9BB0]">
              <div>Identified on: {{ gap.dateIdentified }}</div>
              <button
                (click)="removeGap(gap.id)"
                class="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <mat-icon class="w-3.5 h-3.5 text-[14px]">delete</mat-icon>
                <span>{{ i18n.t('btn.delete') }}</span>
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Add New Gap Modal -->
      @if (showAddModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div class="w-full max-w-xl bg-[#080B10] border border-[#172738] rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-[#152232] pb-3">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <mat-icon class="text-amber-400 text-[18px] w-5 h-5">add_circle</mat-icon>
                <span>{{ i18n.t('gap.add_new') }}</span>
              </h3>
              <button (click)="showAddModal.set(false)" class="text-[#7E9BB0] hover:text-white">
                <mat-icon class="w-5 h-5 text-[20px]">close</mat-icon>
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-white mb-1">
                  {{ i18n.isRtl() ? 'عنوان شکاف پژوهشی:' : 'Research Gap Title:' }}
                </label>
                <input
                  type="text"
                  [(ngModel)]="newTitle"
                  placeholder="e.g. Failure Cascade Bounding in Multi-Agent Reasoning"
                  class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-white mb-1">
                    {{ i18n.t('gap.evidence_level') }}:
                  </label>
                  <select
                    [(ngModel)]="newEvidenceLevel"
                    class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Empirical">Empirical (تجربی)</option>
                    <option value="Theoretical">Theoretical (نظری)</option>
                    <option value="Methodological">Methodological (روش‌شناختی)</option>
                    <option value="Anecdotal">Anecdotal (شواهد موردی)</option>
                  </select>
                </div>

                <div>
                  <label class="block font-semibold text-white mb-1">
                    {{ i18n.t('gap.confidence_level') }}:
                  </label>
                  <select
                    [(ngModel)]="newConfidenceLevel"
                    class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="High">High Confidence (بالا)</option>
                    <option value="Medium">Medium Confidence (متوسط)</option>
                    <option value="Low">Low Confidence (محدود)</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block font-semibold text-white mb-1">
                  {{ i18n.isRtl() ? 'شرح تفصیلی شواهد و خلاء موجود در ادبیات:' : 'Detailed Gap Description & Literature Evidence:' }}
                </label>
                <textarea
                  [(ngModel)]="newDescription"
                  rows="3"
                  placeholder="Explain why existing literature fails to address this specific scenario..."
                  class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2.5 text-xs text-[#A9E6FF] focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label class="block font-semibold text-amber-300 mb-1">
                  {{ i18n.isRtl() ? 'سوال پژوهشی پیشنهادی برای مقاله (کاندید):' : 'Candidate Research Question for Investigation:' }}
                </label>
                <input
                  type="text"
                  [(ngModel)]="newQuestion"
                  placeholder="e.g. Can transactional state rollback reduce cascade failure below 5%?"
                  class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label class="block font-semibold text-white mb-1">
                  {{ i18n.t('gap.underexplored') }}
                </label>
                <input
                  type="text"
                  [(ngModel)]="newUnderexplored"
                  placeholder="e.g. Branching MCTS + formal contract schema checks"
                  class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-[#152232]">
              <button
                (click)="showAddModal.set(false)"
                class="px-4 py-1.5 rounded-lg bg-[#111A24] text-xs font-medium text-[#7E9BB0] hover:text-white"
              >
                {{ i18n.t('btn.cancel') }}
              </button>
              <button
                (click)="createGap()"
                class="px-5 py-1.5 rounded-lg bg-[#59D9FF] hover:bg-[#7AE1FF] text-black text-xs font-bold transition-all"
              >
                {{ i18n.t('btn.save') }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class GapAnalyzerView {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  showAddModal = signal<boolean>(false);
  newTitle = '';
  newEvidenceLevel: 'Empirical' | 'Theoretical' | 'Methodological' | 'Anecdotal' = 'Empirical';
  newConfidenceLevel: 'High' | 'Medium' | 'Low' = 'High';
  newDescription = '';
  newQuestion = '';
  newUnderexplored = '';

  createGap(): void {
    if (!this.newTitle.trim() || !this.newDescription.trim()) return;
    const gap: ResearchGap = {
      id: `gap-${Date.now()}`,
      programId: this.storage.activeProgramId(),
      title: this.newTitle.trim(),
      description: this.newDescription.trim(),
      evidenceLevel: this.newEvidenceLevel,
      confidenceLevel: this.newConfidenceLevel,
      candidateQuestions: this.newQuestion.trim() ? [this.newQuestion.trim()] : [],
      supportingPaperIds: [],
      underexploredCombinations: this.newUnderexplored.trim() || 'Novel algorithmic combination',
      missingDatasets: 'Standardized adversarial evaluation harness',
      reproducibilityIssues: 'Single-seed variance reporting',
      dateIdentified: new Date().toISOString().slice(0, 10),
      status: 'Open'
    };
    this.storage.addGap(gap);
    this.showAddModal.set(false);
    this.newTitle = '';
    this.newDescription = '';
    this.newQuestion = '';
    this.newUnderexplored = '';
  }

  removeGap(id: string): void {
    if (confirm(this.i18n.isRtl() ? 'آیا از حذف این شکاف پژوهشی اطمینان دارید؟' : 'Delete this research gap?')) {
      this.storage.removeGap(id);
    }
  }
}
