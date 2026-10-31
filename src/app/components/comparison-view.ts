import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { Paper } from '../models/research.types';

@Component({
  selector: 'app-comparison-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-[#152232] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-[#59D9FF] text-[20px] w-5 h-5">compare_arrows</mat-icon>
            <span>{{ i18n.t('compare.title') }}</span>
          </h2>
          <p class="text-xs text-[#7E9BB0] mt-0.5">
            {{ i18n.isRtl() ? 'مقایسه نظام‌مند و چندبُعدی مقالات برگزیده: شناسایی تفاوت فرضیات، متناقضات تجربی و خلاءهای مرزی' : 'Contrastive cross-paper analysis: architectural differences, conflicting empirical findings & boundary limitations' }}
          </p>
        </div>

        <button
          (click)="runComparison()"
          [disabled]="selectedPaperIds().length < 2"
          class="px-4 py-2 rounded-xl bg-[#59D9FF] hover:bg-[#7AE1FF] text-black text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 self-start md:self-auto glow-cyan-sm"
        >
          <mat-icon class="w-4 h-4 text-[16px]">sync_alt</mat-icon>
          <span>{{ i18n.t('compare.run_btn') }}</span>
        </button>
      </div>

      <!-- Paper Selection Checklist -->
      <div class="p-4 rounded-xl bg-[#080B10] border border-[#172738] space-y-3">
        <div class="text-xs font-semibold text-white">
          {{ i18n.t('compare.select_instructions') }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          @for (paper of storage.activePapers(); track paper.id) {
            <div 
              (click)="togglePaperSelection(paper.id)"
              class="p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5"
              [class.border-[#59D9FF]]="isSelected(paper.id)"
              [class.bg-[#0D1824]]="isSelected(paper.id)"
              [class.border-[#172738]]="!isSelected(paper.id)"
              [class.bg-[#05080C]]="!isSelected(paper.id)"
            >
              <div 
                class="w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0"
                [class.border-[#59D9FF]]="isSelected(paper.id)"
                [class.bg-[#59D9FF]]="isSelected(paper.id)"
                [class.border-[#1C3247]]="!isSelected(paper.id)"
              >
                @if (isSelected(paper.id)) {
                  <mat-icon class="text-black text-[14px] w-3 h-3">check</mat-icon>
                }
              </div>

              <div class="min-w-0">
                <h4 class="text-xs font-bold text-white truncate">{{ paper.title }}</h4>
                <div class="text-[10px] text-[#7E9BB0] font-mono mt-0.5">
                  {{ paper.authors[0] || 'Author' }} ({{ paper.year }}) • {{ paper.venue }}
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Comparative Analysis Output Cards -->
      @if (comparisonRun()) {
        <div class="space-y-4 animate-fade-in">
          <!-- Overview Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 1. Shared Assumptions & Similarities -->
            <div class="p-4 rounded-xl bg-[#080B10] border border-[#172738] space-y-2">
              <h3 class="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase font-mono">
                <mat-icon class="w-4 h-4 text-[16px]">done_all</mat-icon>
                <span>{{ i18n.t('compare.similarities') }}</span>
              </h3>
              <p class="text-xs text-[#A9E6FF]/90 leading-relaxed">
                {{ i18n.isRtl() ? 'هر دو پژوهش فرض می‌کنند که مدل‌های زبانی از طریق تکرار استدلال زبانی پیش از اقدام به فراخوانی ابزارها می‌توانند خطاهای ساختاری را کاهش دهند. هر دو چارچوب بر روی بنچ‌مارک HotpotQA ارزیابی شده‌اند و از سنجه نرخ حل موفق مسئله استفاده کرده‌اند.' : 'Both architectures operate under the assumption that interleaving natural language reasoning traces prior to environment action dispatch substantially reduces structural schema hallucination. Both utilize multi-hop question answering benchmarks (HotpotQA) to evaluate task completion.' }}
              </p>
              <div class="pt-2 text-[10px] font-mono text-[#7E9BB0] border-t border-[#121E2C]">
                Evidence: Yao et al. (2023) §3.1 & Shinn et al. (2023) §2.4
              </div>
            </div>

            <!-- 2. Methodological & Architectural Differences -->
            <div class="p-4 rounded-xl bg-[#080B10] border border-[#172738] space-y-2">
              <h3 class="text-xs font-bold text-[#59D9FF] flex items-center gap-1.5 uppercase font-mono">
                <mat-icon class="w-4 h-4 text-[16px]">alt_route</mat-icon>
                <span>{{ i18n.t('compare.differences') }}</span>
              </h3>
              <p class="text-xs text-[#A9E6FF]/90 leading-relaxed">
                {{ i18n.isRtl() ? 'رویکرد ReAct فرآیند را به صورت زنجیره باز (Open-Loop) و گام‌به‌گام درون یک اجرای واحد پیش می‌برد، در حالی که Reflexion بر پایه حافظه اپیزودیک چند دوری و فیدبک کلامی عمل می‌کند و در صورت شکست، کل سناریو را با استفاده از تاملات زبانی گذشته تکرار می‌نماید.' : 'ReAct implements a single-trial step-by-step trace expansion without episodic persistence, whereas Reflexion implements cross-trial reinforcement via linguistic reflection memory buffers across repeated attempts.' }}
              </p>
              <div class="pt-2 text-[10px] font-mono text-[#7E9BB0] border-t border-[#121E2C]">
                Evidence: Schick et al. (2023) vs Yao et al. (2023) Table 1
              </div>
            </div>

            <!-- 3. Conflicting Findings & Boundary Conditions -->
            <div class="p-4 rounded-xl bg-[#080B10] border border-[#172738] space-y-2">
              <h3 class="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase font-mono">
                <mat-icon class="w-4 h-4 text-[16px]">warning_amber</mat-icon>
                <span>{{ i18n.t('compare.conflicts') }}</span>
              </h3>
              <p class="text-xs text-[#A9E6FF]/90 leading-relaxed">
                {{ i18n.isRtl() ? 'در حالی که ReAct ادعا می‌کند استدلال کلامی همواره دقت اقدام را بالا می‌برد، یافته‌های Reflexion نشان می‌دهد در بیش از ۲۰٪ موارد، تامل کلامی مدل دچار توهمِ علت شکست شده و در دورهای بعدی فرضیات غلط را تثبیت می‌کند.' : 'While ReAct reports that generating reasoning traces monotonically improves action accuracy, Reflexion demonstrates that under complex text game dynamics (AlfWorld), self-generated verbal rationales can fabricate spurious causal links, entrenching erroneous trial paths.' }}
              </p>
              <div class="pt-2 text-[10px] font-mono text-[#7E9BB0] border-t border-[#121E2C]">
                Evidence: Shinn et al. (2023) Section 4.3 "Failure Modes of Self-Reflection"
              </div>
            </div>

            <!-- 4. Dataset & Evaluation Variance -->
            <div class="p-4 rounded-xl bg-[#080B10] border border-[#172738] space-y-2">
              <h3 class="text-xs font-bold text-violet-400 flex items-center gap-1.5 uppercase font-mono">
                <mat-icon class="w-4 h-4 text-[16px]">analytics</mat-icon>
                <span>{{ i18n.t('compare.dataset_variance') }}</span>
              </h3>
              <p class="text-xs text-[#A9E6FF]/90 leading-relaxed">
                {{ i18n.isRtl() ? 'مقاله نخست بر روی سوالات دو مرحله‌ای متن وب (FEVER, HotpotQA) تمرکز کرده، اما مقاله دوم از شبیه‌ساز فیزیکی متنی AlfWorld استفاده نموده است. بنابراین مقایسه مستقیم نرخ موفقیت بدون کنترل محیط نامعتبر است.' : 'Paper A targets text-grounded factual verification (FEVER/HotpotQA), whereas Paper B assesses embodied sequential state manipulation (AlfWorld). Direct cross-benchmark comparison requires normalized environment transition metrics.' }}
              </p>
              <div class="pt-2 text-[10px] font-mono text-[#7E9BB0] border-t border-[#121E2C]">
                Validation: Independent evaluation protocol required
              </div>
            </div>
          </div>

          <!-- Synthesized Research Opportunity Callout -->
          <div class="p-4 rounded-xl bg-[#091522] border border-[#234562] flex items-start gap-3">
            <mat-icon class="text-[#59D9FF] text-[24px] w-6 h-6 shrink-0 mt-0.5">lightbulb</mat-icon>
            <div>
              <h4 class="text-xs font-bold text-white mb-1">
                {{ i18n.isRtl() ? 'فرصت بکر پژوهشی استخراج‌شده از این مقایسه:' : 'Synthesized Research Opportunity for Your Paper:' }}
              </h4>
              <p class="text-xs text-[#A9E6FF]/90 leading-relaxed">
                {{ i18n.isRtl() ? 'ترکیب مکانیزم تصمیم‌گیری ReAct با یک لایه «راستی‌آزمایی صوری پیش از اعمال تغییر» و «درخت وضعیت با قابلیت بازگشت به عقب»، بدون نیاز به تکرار کامل سناریو در Reflexion.' : 'A hybrid transactional state-tree framework combining step-level reasoning invariants with local rollback checkpointing, preventing hallucination entrenchment without incurring full episode restart costs.' }}
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ComparisonView {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  selectedPaperIds = signal<string[]>(['paper-react-2023', 'paper-reflexion-2023']);
  comparisonRun = signal<boolean>(true);

  isSelected(id: string): boolean {
    return this.selectedPaperIds().includes(id);
  }

  togglePaperSelection(id: string): void {
    const list = this.selectedPaperIds();
    if (list.includes(id)) {
      this.selectedPaperIds.set(list.filter(x => x !== id));
    } else {
      this.selectedPaperIds.set([...list, id]);
    }
  }

  runComparison(): void {
    this.comparisonRun.set(false);
    setTimeout(() => {
      this.comparisonRun.set(true);
    }, 200);
  }
}
