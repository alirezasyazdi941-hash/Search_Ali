import { ChangeDetectionStrategy, Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { ProgramId } from '../models/research.types';

@Component({
  selector: 'app-command-center',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Top Hero / Workstation Status -->
      <div class="relative rounded-2xl bg-[#080B10] border border-[#172738] p-5 overflow-hidden scientific-grid">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#59D9FF]/10 text-[#59D9FF] border border-[#59D9FF]/30">
                ACTIVE PROGRAM • {{ activeProgram().code }}
              </span>
              <span class="text-xs text-[#7E9BB0] font-mono">
                {{ storage.userProfile().name }}
              </span>
            </div>
            <h1 class="text-lg md:text-xl font-bold text-white tracking-wide">
              {{ i18n.isRtl() ? activeProgram().titleFa : activeProgram().titleEn }}
            </h1>
            <p class="text-xs text-[#A9E6FF]/80 mt-1 max-w-3xl leading-relaxed">
              {{ i18n.isRtl() ? activeProgram().subtitleFa : activeProgram().subtitleEn }}
            </p>
          </div>

          <!-- Publication Readiness Gauge -->
          <div class="flex items-center gap-4 bg-[#0D141E] border border-[#1C3247] p-3 rounded-xl min-w-[200px]">
            <div class="relative w-14 h-14 flex items-center justify-center">
              <svg class="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  class="text-[#132232]"
                  stroke-width="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="text-[#59D9FF]"
                  [attr.stroke-dasharray]="readinessScore() + ', 100'"
                  stroke-width="3.5"
                  stroke-linecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span class="absolute text-xs font-bold font-mono text-white">{{ readinessScore() }}%</span>
            </div>
            <div>
              <div class="text-[11px] font-bold text-white">{{ i18n.t('metrics.readiness_index') }}</div>
              <div class="text-[10px] text-[#7E9BB0]">{{ i18n.isRtl() ? 'آماده بررسی داوری' : 'Peer-Review Ready' }}</div>
            </div>
          </div>
        </div>

        <!-- Research Lifecycle Pipeline -->
        <div class="mt-5 pt-4 border-t border-[#142334] relative z-10">
          <div class="text-[10px] font-mono text-[#7E9BB0] mb-2 uppercase tracking-wider">
            {{ i18n.isRtl() ? 'چرخه زیست پژوهش علمی (Research Lifecycle)' : 'Full Research Lifecycle Pipeline' }}
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 text-center text-[10px] font-medium font-mono">
            @for (stage of lifecycleStages; track stage.key; let idx = $index) {
              <div 
                (click)="navigateTab.emit(stage.targetTab)"
                class="px-2 py-1.5 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
                [class.bg-[#59D9FF]/15]="stage.active"
                [class.border-[#59D9FF]/40]="stage.active"
                [class.text-[#59D9FF]]="stage.active"
                [class.bg-[#0B111A]]="!stage.active"
                [class.border-[#172738]]="!stage.active"
                [class.text-[#7E9BB0]]="!stage.active"
              >
                <div class="flex items-center gap-1">
                  <span>{{ idx + 1 }}.</span>
                  <span>{{ i18n.isRtl() ? stage.nameFa : stage.nameEn }}</span>
                </div>
                <span class="text-[9px] opacity-70">{{ stage.metric }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Real Metrics Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="bg-[#080B10] border border-[#172738] p-3.5 rounded-xl hover:border-[#59D9FF]/30 transition-colors cursor-pointer" (click)="navigateTab.emit('discovery')">
          <div class="flex items-center justify-between text-[#7E9BB0] mb-1">
            <span class="text-[11px] font-medium">{{ i18n.t('metrics.saved_papers') }}</span>
            <mat-icon class="text-sm w-4 h-4 text-[16px] text-[#59D9FF]">menu_book</mat-icon>
          </div>
          <div class="text-xl font-bold font-mono text-white">{{ storage.activePapers().length }}</div>
          <div class="text-[10px] text-[#7E9BB0] mt-1">{{ i18n.isRtl() ? 'در برنامه کنونی' : 'in active program' }}</div>
        </div>

        <div class="bg-[#080B10] border border-[#172738] p-3.5 rounded-xl hover:border-[#59D9FF]/30 transition-colors cursor-pointer" (click)="navigateTab.emit('gap_analyzer')">
          <div class="flex items-center justify-between text-[#7E9BB0] mb-1">
            <span class="text-[11px] font-medium">{{ i18n.t('metrics.identified_gaps') }}</span>
            <mat-icon class="text-sm w-4 h-4 text-[16px] text-amber-400">find_in_page</mat-icon>
          </div>
          <div class="text-xl font-bold font-mono text-white">{{ storage.activeGaps().length }}</div>
          <div class="text-[10px] text-amber-400/80 mt-1">{{ i18n.isRtl() ? 'فرصت بکر مقاله' : 'unsolved targets' }}</div>
        </div>

        <div class="bg-[#080B10] border border-[#172738] p-3.5 rounded-xl hover:border-[#59D9FF]/30 transition-colors cursor-pointer" (click)="navigateTab.emit('experiments')">
          <div class="flex items-center justify-between text-[#7E9BB0] mb-1">
            <span class="text-[11px] font-medium">{{ i18n.t('metrics.experiments_run') }}</span>
            <mat-icon class="text-sm w-4 h-4 text-[16px] text-emerald-400">biotech</mat-icon>
          </div>
          <div class="text-xl font-bold font-mono text-white">{{ storage.activeExperiments().length }}</div>
          <div class="text-[10px] text-emerald-400/80 mt-1">p < 0.05 verified</div>
        </div>

        <div class="bg-[#080B10] border border-[#172738] p-3.5 rounded-xl hover:border-[#59D9FF]/30 transition-colors cursor-pointer" (click)="navigateTab.emit('writing_studio')">
          <div class="flex items-center justify-between text-[#7E9BB0] mb-1">
            <span class="text-[11px] font-medium">{{ i18n.t('metrics.writing_progress') }}</span>
            <mat-icon class="text-sm w-4 h-4 text-[16px] text-violet-400">edit_note</mat-icon>
          </div>
          <div class="text-xl font-bold font-mono text-white">{{ draftWordCount() }}</div>
          <div class="text-[10px] text-[#7E9BB0] mt-1">{{ i18n.isRtl() ? 'کلمه تدوین‌شده' : 'words in draft' }}</div>
        </div>

        <div class="bg-[#080B10] border border-[#172738] p-3.5 rounded-xl hover:border-[#59D9FF]/30 transition-colors cursor-pointer" (click)="navigateTab.emit('learning_path')">
          <div class="flex items-center justify-between text-[#7E9BB0] mb-1">
            <span class="text-[11px] font-medium">{{ i18n.isRtl() ? 'دروس تسلط‌یافته' : 'Mastered Lessons' }}</span>
            <mat-icon class="text-sm w-4 h-4 text-[16px] text-cyan-400">school</mat-icon>
          </div>
          <div class="text-xl font-bold font-mono text-white">
            {{ completedLessonsCount() }} / {{ storage.lessons().length }}
          </div>
          <div class="text-[10px] text-[#7E9BB0] mt-1">{{ i18n.isRtl() ? 'مبانی و متدولوژی' : 'theory & practice' }}</div>
        </div>

        <div class="bg-[#080B10] border border-[#172738] p-3.5 rounded-xl hover:border-[#59D9FF]/30 transition-colors cursor-pointer" (click)="navigateTab.emit('project_mgmt')">
          <div class="flex items-center justify-between text-[#7E9BB0] mb-1">
            <span class="text-[11px] font-medium">{{ i18n.isRtl() ? 'وظایف در جریان' : 'Active Tasks' }}</span>
            <mat-icon class="text-sm w-4 h-4 text-[16px] text-blue-400">task_alt</mat-icon>
          </div>
          <div class="text-xl font-bold font-mono text-white">{{ inProgressTasksCount() }}</div>
          <div class="text-[10px] text-[#7E9BB0] mt-1">{{ i18n.isRtl() ? 'کانبان پژوهش' : 'kanban active' }}</div>
        </div>
      </div>

      <!-- Two Columns: Daily Objectives & Unresolved Research Questions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Daily Objectives Checklist -->
        <div class="bg-[#080B10] border border-[#172738] rounded-xl p-4 flex flex-col">
          <div class="flex items-center justify-between pb-3 border-b border-[#142334] mb-3">
            <div class="flex items-center gap-2">
              <mat-icon class="text-[#59D9FF] text-[18px] w-4 h-4">today</mat-icon>
              <h3 class="text-xs font-bold text-white uppercase tracking-wider">
                {{ i18n.t('metrics.daily_objectives') }}
              </h3>
            </div>
            <button 
              (click)="navigateTab.emit('project_mgmt')"
              class="text-[11px] text-[#59D9FF] hover:underline"
            >
              {{ i18n.isRtl() ? 'مدیریت برنامه...' : 'View Kanban...' }}
            </button>
          </div>

          <div class="space-y-2 flex-1">
            @for (task of storage.activeTasks(); track task.id) {
              <div 
                (click)="toggleTaskStatus(task.id, task.status)"
                class="p-2.5 rounded-lg border border-[#142334] hover:border-[#20364C] bg-[#0A0F16] flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <div 
                    class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                    [class.border-emerald-400]="task.status === 'done'"
                    [class.bg-emerald-400/20]="task.status === 'done'"
                    [class.border-[#1F354A]]="task.status !== 'done'"
                  >
                    @if (task.status === 'done') {
                      <mat-icon class="text-emerald-400 text-[14px] w-3 h-3">check</mat-icon>
                    }
                  </div>
                  <span 
                    class="text-xs text-[#A9E6FF] truncate"
                    [class.line-through]="task.status === 'done'"
                    [class.text-[#4B6375]]="task.status === 'done'"
                  >
                    {{ task.title }}
                  </span>
                </div>
                
                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#101A24] text-[#7E9BB0] border border-[#172738]">
                    {{ task.type }}
                  </span>
                  <span class="text-[10px] text-[#7E9BB0] font-mono">{{ task.dueDate }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Unresolved Research Questions & Gaps -->
        <div class="bg-[#080B10] border border-[#172738] rounded-xl p-4 flex flex-col">
          <div class="flex items-center justify-between pb-3 border-b border-[#142334] mb-3">
            <div class="flex items-center gap-2">
              <mat-icon class="text-amber-400 text-[18px] w-4 h-4">help_center</mat-icon>
              <h3 class="text-xs font-bold text-white uppercase tracking-wider">
                {{ i18n.t('metrics.unresolved_questions') }}
              </h3>
            </div>
            <button 
              (click)="navigateTab.emit('gap_analyzer')"
              class="text-[11px] text-amber-400 hover:underline"
            >
              {{ i18n.isRtl() ? 'تحلیلگر شکاف...' : 'Open Gaps...' }}
            </button>
          </div>

          <div class="space-y-2.5 flex-1">
            @for (gap of storage.activeGaps(); track gap.id) {
              <div class="p-3 rounded-lg bg-[#0A0F16] border border-[#142334] space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    {{ gap.evidenceLevel }} Evidence
                  </span>
                  <span class="text-[10px] font-mono text-[#7E9BB0]">{{ gap.status }}</span>
                </div>
                <h5 class="text-xs font-bold text-white line-clamp-1">
                  {{ gap.title }}
                </h5>
                @if (gap.candidateQuestions.length > 0) {
                  <p class="text-[11px] text-[#A9E6FF]/80 italic line-clamp-2">
                    "{{ gap.candidateQuestions[0] }}"
                  </p>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Recent Scientific Activity Timeline -->
      <div class="bg-[#080B10] border border-[#172738] rounded-xl p-4">
        <div class="flex items-center gap-2 pb-3 border-b border-[#142334] mb-3">
          <mat-icon class="text-[#59D9FF] text-[18px] w-4 h-4">timeline</mat-icon>
          <h3 class="text-xs font-bold text-white uppercase tracking-wider">
            {{ i18n.t('metrics.activity_timeline') }}
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div class="p-3 rounded-lg bg-[#090D13] border border-[#142334] flex items-start gap-2.5">
            <mat-icon class="text-emerald-400 text-[18px] w-4 h-4 shrink-0 mt-0.5">check_circle</mat-icon>
            <div>
              <div class="font-bold text-white">{{ i18n.isRtl() ? 'آزمایش rollback اعتبارسنجی شد' : 'Rollback Experiment Verified' }}</div>
              <div class="text-[11px] text-[#7E9BB0]">Pass@1: 81.6% (gain: +27.1%, p=0.0012)</div>
              <span class="text-[10px] font-mono text-[#4B6375]">2026-10-29</span>
            </div>
          </div>

          <div class="p-3 rounded-lg bg-[#090D13] border border-[#142334] flex items-start gap-2.5">
            <mat-icon class="text-[#59D9FF] text-[18px] w-4 h-4 shrink-0 mt-0.5">menu_book</mat-icon>
            <div>
              <div class="font-bold text-white">{{ i18n.isRtl() ? 'استخراج ماتریس متون ReAct' : 'Extracted ReAct to Matrix' }}</div>
              <div class="text-[11px] text-[#7E9BB0]">HotpotQA & AlfWorld benchmark variables</div>
              <span class="text-[10px] font-mono text-[#4B6375]">2026-10-28</span>
            </div>
          </div>

          <div class="p-3 rounded-lg bg-[#090D13] border border-[#142334] flex items-start gap-2.5">
            <mat-icon class="text-violet-400 text-[18px] w-4 h-4 shrink-0 mt-0.5">edit_document</mat-icon>
            <div>
              <div class="font-bold text-white">{{ i18n.isRtl() ? 'نگارش فرمول ریاضیاتی بازگشت' : 'Drafted Mathematical Formulation' }}</div>
              <div class="text-[11px] text-[#7E9BB0]">LaTeX eq 1 & 2 versioned in draft v3</div>
              <span class="text-[10px] font-mono text-[#4B6375]">2026-10-27</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CommandCenter {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  navigateTab = output<string>();

  activeProgram = () => {
    const id = this.storage.activeProgramId();
    return this.storage.programs.find(p => p.id === id) || this.storage.programs[0];
  };

  readinessScore = () => {
    return this.activeProgram().readinessScore;
  };

  draftWordCount = () => {
    const draft = this.storage.activeDraft();
    if (!draft) return 0;
    const fullText = `${draft.abstract} ${draft.introduction} ${draft.methodology} ${draft.results}`;
    return fullText.trim().split(/\s+/).filter(Boolean).length;
  };

  completedLessonsCount = () => {
    return this.storage.lessons().filter(l => l.completed).length;
  };

  inProgressTasksCount = () => {
    return this.storage.activeTasks().filter(t => t.status === 'in_progress').length;
  };

  readonly lifecycleStages = [
    { key: 'discover', nameFa: 'کشف متون', nameEn: 'Discover', targetTab: 'discovery', active: true, metric: 'OpenAlex/arXiv' },
    { key: 'learn', nameFa: 'یادگیری', nameEn: 'Learn', targetTab: 'learning_path', active: true, metric: '6 Modules' },
    { key: 'matrix', nameFa: 'ماتریس', nameEn: 'Explore', targetTab: 'review_matrix', active: true, metric: 'Matrix View' },
    { key: 'compare', nameFa: 'مقایسه', nameEn: 'Compare', targetTab: 'comparison', active: true, metric: 'Contrastive' },
    { key: 'gaps', nameFa: 'شکاف‌ها', nameEn: 'Find Gaps', targetTab: 'gap_analyzer', active: true, metric: '3 Gaps' },
    { key: 'experiments', nameFa: 'آزمایش', nameEn: 'Experiment', targetTab: 'experiments', active: true, metric: 'Seeds & Stats' },
    { key: 'write', nameFa: 'نگارش', nameEn: 'Write', targetTab: 'writing_studio', active: true, metric: 'IEEE/ACM' },
    { key: 'submit', nameFa: 'ارزیابی نهایی', nameEn: 'Validate', targetTab: 'publication_check', active: false, metric: 'Checklist' }
  ];

  toggleTaskStatus(id: string, currentStatus: string): void {
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
    this.storage.updateTaskStatus(id, nextStatus as any);
  }
}
