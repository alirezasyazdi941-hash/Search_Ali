import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';

export type ActiveTab = 
  | 'command_center'
  | 'programs'
  | 'discovery'
  | 'review_matrix'
  | 'comparison'
  | 'gap_analyzer'
  | 'experiments'
  | 'writing_studio'
  | 'project_mgmt'
  | 'learning_path'
  | 'knowledge_graph'
  | 'publication_check'
  | 'ai_assistant';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <aside class="w-full lg:w-64 bg-[#05080C] border-b lg:border-b-0 lg:border-r border-[#152232] p-3 flex flex-col justify-between shrink-0 select-none">
      <div class="space-y-4">
        <!-- Workstations Category 1: Overview & Scope -->
        <div class="space-y-1">
          <div class="text-[10px] font-mono text-[#4B6375] uppercase px-3 py-1 tracking-wider">
            {{ i18n.isRtl() ? 'نمای کلی و برنامه‌ها' : 'Overview & Tracks' }}
          </div>

          <button
            type="button"
            (click)="tabChange.emit('command_center')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all"
            [class.bg-[#59D9FF]/15]="currentTab() === 'command_center'"
            [class.text-[#59D9FF]]="currentTab() === 'command_center'"
            [class.border]="currentTab() === 'command_center'"
            [class.border-[#59D9FF]/30]="currentTab() === 'command_center'"
            [class.text-[#7E9BB0]]="currentTab() !== 'command_center'"
            [class.hover:bg-[#0B1017]]="currentTab() !== 'command_center'"
          >
            <div class="flex items-center gap-2.5">
              <mat-icon class="text-[18px] w-4 h-4">dashboard</mat-icon>
              <span>{{ i18n.t('nav.command_center') }}</span>
            </div>
            <span class="w-1.5 h-1.5 rounded-full" [class.bg-[#59D9FF]]="currentTab() === 'command_center'"></span>
          </button>

          <button
            type="button"
            (click)="tabChange.emit('programs')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all"
            [class.bg-[#59D9FF]/15]="currentTab() === 'programs'"
            [class.text-[#59D9FF]]="currentTab() === 'programs'"
            [class.border]="currentTab() === 'programs'"
            [class.border-[#59D9FF]/30]="currentTab() === 'programs'"
            [class.text-[#7E9BB0]]="currentTab() !== 'programs'"
            [class.hover:bg-[#0B1017]]="currentTab() !== 'programs'"
          >
            <div class="flex items-center gap-2.5">
              <mat-icon class="text-[18px] w-4 h-4">apps</mat-icon>
              <span>{{ i18n.t('nav.programs') }}</span>
            </div>
            <span class="text-[10px] font-mono px-1.5 rounded bg-[#0D1622] text-[#59D9FF]">5</span>
          </button>
        </div>

        <!-- Workstations Category 2: Literature & Synthesis -->
        <div class="space-y-1">
          <div class="text-[10px] font-mono text-[#4B6375] uppercase px-3 py-1 tracking-wider">
            {{ i18n.isRtl() ? 'اکتشاف و ادبیات پژوهش' : 'Literature & Gaps' }}
          </div>

          <button
            type="button"
            (click)="tabChange.emit('discovery')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all"
            [class.bg-[#59D9FF]/15]="currentTab() === 'discovery'"
            [class.text-[#59D9FF]]="currentTab() === 'discovery'"
            [class.border]="currentTab() === 'discovery'"
            [class.border-[#59D9FF]/30]="currentTab() === 'discovery'"
            [class.text-[#7E9BB0]]="currentTab() !== 'discovery'"
            [class.hover:bg-[#0B1017]]="currentTab() !== 'discovery'"
          >
            <mat-icon class="text-[18px] w-4 h-4">travel_explore</mat-icon>
            <span>{{ i18n.t('nav.discovery') }}</span>
          </button>

          <button
            type="button"
            (click)="tabChange.emit('review_matrix')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all"
            [class.bg-[#59D9FF]/15]="currentTab() === 'review_matrix'"
            [class.text-[#59D9FF]]="currentTab() === 'review_matrix'"
            [class.border]="currentTab() === 'review_matrix'"
            [class.border-[#59D9FF]/30]="currentTab() === 'review_matrix'"
            [class.text-[#7E9BB0]]="currentTab() !== 'review_matrix'"
            [class.hover:bg-[#0B1017]]="currentTab() !== 'review_matrix'"
          >
            <mat-icon class="text-[18px] w-4 h-4">grid_on</mat-icon>
            <span>{{ i18n.t('nav.review_matrix') }}</span>
          </button>

          <button
            type="button"
            (click)="tabChange.emit('comparison')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all"
            [class.bg-[#59D9FF]/15]="currentTab() === 'comparison'"
            [class.text-[#59D9FF]]="currentTab() === 'comparison'"
            [class.border]="currentTab() === 'comparison'"
            [class.border-[#59D9FF]/30]="currentTab() === 'comparison'"
            [class.text-[#7E9BB0]]="currentTab() !== 'comparison'"
            [class.hover:bg-[#0B1017]]="currentTab() !== 'comparison'"
          >
            <mat-icon class="text-[18px] w-4 h-4">compare_arrows</mat-icon>
            <span>{{ i18n.t('nav.comparison') }}</span>
          </button>

          <button
            type="button"
            (click)="tabChange.emit('gap_analyzer')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all"
            [class.bg-[#59D9FF]/15]="currentTab() === 'gap_analyzer'"
            [class.text-[#59D9FF]]="currentTab() === 'gap_analyzer'"
            [class.border]="currentTab() === 'gap_analyzer'"
            [class.border-[#59D9FF]/30]="currentTab() === 'gap_analyzer'"
            [class.text-[#7E9BB0]]="currentTab() !== 'gap_analyzer'"
            [class.hover:bg-[#0B1017]]="currentTab() !== 'gap_analyzer'"
          >
            <mat-icon class="text-[18px] w-4 h-4 text-amber-400">troubleshoot</mat-icon>
            <span>{{ i18n.t('nav.gap_analyzer') }}</span>
          </button>
        </div>

        <!-- Workstations Category 3: Investigation & Publishing -->
        <div class="space-y-1">
          <div class="text-[10px] font-mono text-[#4B6375] uppercase px-3 py-1 tracking-wider">
            {{ i18n.isRtl() ? 'آزمایش و نگارش' : 'Experiment & Writing' }}
          </div>

          <button
            type="button"
            (click)="tabChange.emit('experiments')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all"
            [class.bg-[#59D9FF]/15]="currentTab() === 'experiments'"
            [class.text-[#59D9FF]]="currentTab() === 'experiments'"
            [class.border]="currentTab() === 'experiments'"
            [class.border-[#59D9FF]/30]="currentTab() === 'experiments'"
            [class.text-[#7E9BB0]]="currentTab() !== 'experiments'"
            [class.hover:bg-[#0B1017]]="currentTab() !== 'experiments'"
          >
            <mat-icon class="text-[18px] w-4 h-4 text-emerald-400">biotech</mat-icon>
            <span>{{ i18n.t('nav.experiments') }}</span>
          </button>

          <button
            type="button"
            (click)="tabChange.emit('writing_studio')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all"
            [class.bg-[#59D9FF]/15]="currentTab() === 'writing_studio'"
            [class.text-[#59D9FF]]="currentTab() === 'writing_studio'"
            [class.border]="currentTab() === 'writing_studio'"
            [class.border-[#59D9FF]/30]="currentTab() === 'writing_studio'"
            [class.text-[#7E9BB0]]="currentTab() !== 'writing_studio'"
            [class.hover:bg-[#0B1017]]="currentTab() !== 'writing_studio'"
          >
            <mat-icon class="text-[18px] w-4 h-4 text-violet-400">edit_document</mat-icon>
            <span>{{ i18n.t('nav.writing_studio') }}</span>
          </button>

          <button
            type="button"
            (click)="tabChange.emit('project_mgmt')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all"
            [class.bg-[#59D9FF]/15]="currentTab() === 'project_mgmt'"
            [class.text-[#59D9FF]]="currentTab() === 'project_mgmt'"
            [class.border]="currentTab() === 'project_mgmt'"
            [class.border-[#59D9FF]/30]="currentTab() === 'project_mgmt'"
            [class.text-[#7E9BB0]]="currentTab() !== 'project_mgmt'"
            [class.hover:bg-[#0B1017]]="currentTab() !== 'project_mgmt'"
          >
            <mat-icon class="text-[18px] w-4 h-4">view_kanban</mat-icon>
            <span>{{ i18n.t('nav.project_mgmt') }}</span>
          </button>

          <button
            type="button"
            (click)="tabChange.emit('publication_check')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all"
            [class.bg-[#59D9FF]/15]="currentTab() === 'publication_check'"
            [class.text-[#59D9FF]]="currentTab() === 'publication_check'"
            [class.border]="currentTab() === 'publication_check'"
            [class.border-[#59D9FF]/30]="currentTab() === 'publication_check'"
            [class.text-[#7E9BB0]]="currentTab() !== 'publication_check'"
            [class.hover:bg-[#0B1017]]="currentTab() !== 'publication_check'"
          >
            <mat-icon class="text-[18px] w-4 h-4 text-emerald-400">verified_user</mat-icon>
            <span>{{ i18n.t('nav.publication_check') }}</span>
          </button>
        </div>

        <!-- Workstations Category 4: Education & AI Intelligence -->
        <div class="space-y-1">
          <div class="text-[10px] font-mono text-[#4B6375] uppercase px-3 py-1 tracking-wider">
            {{ i18n.isRtl() ? 'آموزش و هوش علمی' : 'Learning & AI Core' }}
          </div>

          <button
            type="button"
            (click)="tabChange.emit('learning_path')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all"
            [class.bg-[#59D9FF]/15]="currentTab() === 'learning_path'"
            [class.text-[#59D9FF]]="currentTab() === 'learning_path'"
            [class.border]="currentTab() === 'learning_path'"
            [class.border-[#59D9FF]/30]="currentTab() === 'learning_path'"
            [class.text-[#7E9BB0]]="currentTab() !== 'learning_path'"
            [class.hover:bg-[#0B1017]]="currentTab() !== 'learning_path'"
          >
            <mat-icon class="text-[18px] w-4 h-4">school</mat-icon>
            <span>{{ i18n.t('nav.learning_path') }}</span>
          </button>

          <button
            type="button"
            (click)="tabChange.emit('knowledge_graph')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2.5 transition-all"
            [class.bg-[#59D9FF]/15]="currentTab() === 'knowledge_graph'"
            [class.text-[#59D9FF]]="currentTab() === 'knowledge_graph'"
            [class.border]="currentTab() === 'knowledge_graph'"
            [class.border-[#59D9FF]/30]="currentTab() === 'knowledge_graph'"
            [class.text-[#7E9BB0]]="currentTab() !== 'knowledge_graph'"
            [class.hover:bg-[#0B1017]]="currentTab() !== 'knowledge_graph'"
          >
            <mat-icon class="text-[18px] w-4 h-4">hub</mat-icon>
            <span>{{ i18n.t('nav.knowledge_graph') }}</span>
          </button>

          <button
            type="button"
            (click)="tabChange.emit('ai_assistant')"
            class="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all"
            [class.bg-[#59D9FF]/15]="currentTab() === 'ai_assistant'"
            [class.text-[#59D9FF]]="currentTab() === 'ai_assistant'"
            [class.border]="currentTab() === 'ai_assistant'"
            [class.border-[#59D9FF]/30]="currentTab() === 'ai_assistant'"
            [class.text-[#7E9BB0]]="currentTab() !== 'ai_assistant'"
            [class.hover:bg-[#0B1017]]="currentTab() !== 'ai_assistant'"
          >
            <div class="flex items-center gap-2.5">
              <mat-icon class="text-[18px] w-4 h-4 text-[#59D9FF]">psychology</mat-icon>
              <span>{{ i18n.t('nav.ai_assistant') }}</span>
            </div>
            <span class="text-[9px] font-mono px-1 rounded bg-[#59D9FF]/20 text-[#59D9FF]">AI</span>
          </button>
        </div>
      </div>

      <!-- Bottom Workstation Footer -->
      <div class="pt-4 border-t border-[#121E2C] text-[10px] font-mono text-[#4B6375] flex items-center justify-between">
        <span>ALI OS v1.0.0</span>
        <span class="text-[#59D9FF]">CS R&amp;D</span>
      </div>
    </aside>
  `
})
export class Sidebar {
  i18n = inject(I18nService);
  currentTab = input.required<ActiveTab>();
  tabChange = output<ActiveTab>();
}
