import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { GeminiService } from '../services/gemini.service';
import { AssistantMessage } from '../models/research.types';

type AssistantMode = 'explain_paper' | 'math_tutor' | 'critique_writing' | 'find_gaps' | 'experiment_design';

@Component({
  selector: 'app-assistant-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-[#152232] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-[#59D9FF] text-[20px] w-5 h-5">psychology</mat-icon>
            <span>{{ i18n.t('ai.title') }}</span>
          </h2>
          <p class="text-xs text-[#7E9BB0] mt-0.5">
            {{ i18n.t('ai.subtitle') }}
          </p>
        </div>

        <!-- Connection Transparency Badge -->
        <div class="flex items-center gap-2 text-xs font-mono self-start md:self-auto px-3 py-1.5 rounded-xl border"
             [class.border-cyan-500/40]="gemini.hasGeminiKey()"
             [class.bg-[#0E1A26]]="gemini.hasGeminiKey()"
             [class.border-amber-500/40]="!gemini.hasGeminiKey()"
             [class.bg-[#161208]]="!gemini.hasGeminiKey()">
          <span class="w-2 h-2 rounded-full" [class.bg-cyan-400]="gemini.hasGeminiKey()" [class.bg-amber-400]="!gemini.hasGeminiKey()"></span>
          <span [class.text-[#59D9FF]]="gemini.hasGeminiKey()" [class.text-amber-300]="!gemini.hasGeminiKey()">
            {{ gemini.hasGeminiKey() ? i18n.t('ai.status_online') : i18n.t('ai.status_local') }}
          </span>
        </div>
      </div>

      <!-- Mode Selector Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          (click)="selectedMode.set('explain_paper')"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          [class.bg-[#59D9FF]]="selectedMode() === 'explain_paper'"
          [class.text-black]="selectedMode() === 'explain_paper'"
          [class.bg-[#090D14]]="selectedMode() !== 'explain_paper'"
          [class.text-[#7E9BB0]]="selectedMode() !== 'explain_paper'"
          [class.border]="selectedMode() !== 'explain_paper'"
          [class.border-[#172738]]="selectedMode() !== 'explain_paper'"
        >
          <mat-icon class="w-4 h-4 text-[16px]">menu_book</mat-icon>
          <span>{{ i18n.t('ai.mode_explain') }}</span>
        </button>

        <button
          type="button"
          (click)="selectedMode.set('math_tutor')"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          [class.bg-[#59D9FF]]="selectedMode() === 'math_tutor'"
          [class.text-black]="selectedMode() === 'math_tutor'"
          [class.bg-[#090D14]]="selectedMode() !== 'math_tutor'"
          [class.text-[#7E9BB0]]="selectedMode() !== 'math_tutor'"
          [class.border]="selectedMode() !== 'math_tutor'"
          [class.border-[#172738]]="selectedMode() !== 'math_tutor'"
        >
          <mat-icon class="w-4 h-4 text-[16px]">functions</mat-icon>
          <span>{{ i18n.t('ai.mode_math') }}</span>
        </button>

        <button
          type="button"
          (click)="selectedMode.set('critique_writing')"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          [class.bg-[#59D9FF]]="selectedMode() === 'critique_writing'"
          [class.text-black]="selectedMode() === 'critique_writing'"
          [class.bg-[#090D14]]="selectedMode() !== 'critique_writing'"
          [class.text-[#7E9BB0]]="selectedMode() !== 'critique_writing'"
          [class.border]="selectedMode() !== 'critique_writing'"
          [class.border-[#172738]]="selectedMode() !== 'critique_writing'"
        >
          <mat-icon class="w-4 h-4 text-[16px]">rate_review</mat-icon>
          <span>{{ i18n.t('ai.mode_critique') }}</span>
        </button>

        <button
          type="button"
          (click)="selectedMode.set('find_gaps')"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          [class.bg-[#59D9FF]]="selectedMode() === 'find_gaps'"
          [class.text-black]="selectedMode() === 'find_gaps'"
          [class.bg-[#090D14]]="selectedMode() !== 'find_gaps'"
          [class.text-[#7E9BB0]]="selectedMode() !== 'find_gaps'"
          [class.border]="selectedMode() !== 'find_gaps'"
          [class.border-[#172738]]="selectedMode() !== 'find_gaps'"
        >
          <mat-icon class="w-4 h-4 text-[16px]">find_in_page</mat-icon>
          <span>{{ i18n.t('ai.mode_gaps') }}</span>
        </button>

        <button
          type="button"
          (click)="selectedMode.set('experiment_design')"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          [class.bg-[#59D9FF]]="selectedMode() === 'experiment_design'"
          [class.text-black]="selectedMode() === 'experiment_design'"
          [class.bg-[#090D14]]="selectedMode() !== 'experiment_design'"
          [class.text-[#7E9BB0]]="selectedMode() !== 'experiment_design'"
          [class.border]="selectedMode() !== 'experiment_design'"
          [class.border-[#172738]]="selectedMode() !== 'experiment_design'"
        >
          <mat-icon class="w-4 h-4 text-[16px]">biotech</mat-icon>
          <span>{{ i18n.t('ai.mode_exp') }}</span>
        </button>
      </div>

      <!-- Quick Template Injections -->
      <div class="flex flex-wrap items-center gap-2 text-[11px]">
        <span class="text-[#7E9BB0] font-mono">Suggested Inputs:</span>
        @for (q of quickPrompts(); track q) {
          <button
            type="button"
            (click)="setUserInput(q)"
            class="px-2.5 py-1 rounded-md bg-[#0A1017] hover:bg-[#121B27] border border-[#162738] text-[#59D9FF] truncate max-w-xs transition-colors"
          >
            "{{ q }}"
          </button>
        }
      </div>

      <!-- Dialogue History -->
      <div class="space-y-4">
        @for (msg of messages(); track msg.id) {
          <div 
            class="p-4 rounded-2xl border transition-all space-y-2"
            [class.bg-[#080E16]]="msg.role === 'user'"
            [class.border-[#1A2E44]]="msg.role === 'user'"
            [class.bg-[#05080C]]="msg.role === 'assistant'"
            [class.border-[#142334]]="msg.role === 'assistant'"
          >
            <div class="flex items-center justify-between text-[10px] font-mono">
              <div class="flex items-center gap-2">
                <span class="font-bold uppercase" [class.text-[#59D9FF]]="msg.role === 'user'" [class.text-emerald-400]="msg.role === 'assistant'">
                  {{ msg.role === 'user' ? (i18n.isRtl() ? 'پژوهشگر' : 'Researcher') : (i18n.isRtl() ? 'هسته علمی هوشمند' : 'ALI Scientific Core') }}
                </span>
                @if (msg.mode) {
                  <span class="px-1.5 py-0.5 rounded bg-[#101A24] text-[#7E9BB0] border border-[#172636]">
                    {{ msg.mode }}
                  </span>
                }
              </div>

              <span class="text-[#4B6375]">{{ msg.timestamp }}</span>
            </div>

            <!-- Content with whitespace preservation and code readability -->
            <div class="text-xs text-[#A9E6FF] leading-relaxed whitespace-pre-wrap font-sans">
              {{ msg.content }}
            </div>
          </div>
        }

        @if (isLoading()) {
          <div class="p-4 rounded-2xl border border-[#172738] bg-[#05080C] flex items-center gap-3">
            <span class="w-4 h-4 border-2 border-[#59D9FF] border-t-transparent rounded-full animate-spin"></span>
            <span class="text-xs font-mono text-[#59D9FF]">
              {{ i18n.isRtl() ? 'در حال تحلیل شواهد و بررسی روش‌شناختی...' : 'Deconstructing evidence and verifying methodological invariants...' }}
            </span>
          </div>
        }
      </div>

      <!-- Input Bar -->
      <div class="p-3 rounded-2xl bg-[#080B10] border border-[#172738] shadow-2xl">
        <form (ngSubmit)="sendQuery()" class="flex flex-col sm:flex-row gap-2">
          <textarea
            [(ngModel)]="userInput"
            name="userInput"
            rows="2"
            [placeholder]="inputPlaceholder()"
            class="flex-1 bg-[#040608] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
          ></textarea>

          <button
            type="submit"
            [disabled]="isLoading() || !userInput.trim()"
            class="px-5 py-2.5 rounded-xl bg-[#59D9FF] hover:bg-[#7AE1FF] text-black text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shrink-0 self-end sm:self-center glow-cyan-sm"
          >
            <mat-icon class="w-4 h-4 text-[18px]">send</mat-icon>
            <span>{{ i18n.t('ai.send_btn') }}</span>
          </button>
        </form>
      </div>
    </div>
  `
})
export class AssistantView {
  i18n = inject(I18nService);
  storage = inject(StorageService);
  gemini = inject(GeminiService);

  selectedMode = signal<AssistantMode>('explain_paper');
  isLoading = signal<boolean>(false);
  userInput = '';

  messages = signal<AssistantMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content: this.i18n.isRtl() 
        ? `سلام، من هسته استنتاج علمی ALI Research OS هستم.
می‌توانید مقالات دشوار را برای توضیح عمقی بفرستید، فرمول‌های ریاضی و تعاریف را بپرسید، یا پیش‌نویس متن خود را جهت نقد سخت‌گیرانه داوری ارائه دهید.`
        : `Greetings. I am the scientific intelligence core of ALI Research OS. You can submit complex papers for decomposition, verify mathematical proofs, critique manuscript sections for unsubstantiated claims, or synthesize controlled experimental designs.`,
      timestamp: new Date().toLocaleTimeString(),
      mode: 'explain_paper',
      isLiveGemini: false
    }
  ]);

  quickPrompts = () => {
    switch (this.selectedMode()) {
      case 'explain_paper':
        return [
          'Deconstruct ReAct: Synergizing Reasoning and Acting (Yao et al., 2023)',
          'Explain Evoformer architecture and Invariant Point Attention in AlphaFold2',
          'Break down Toolformer self-supervised API sampling logic'
        ];
      case 'math_tutor':
        return [
          'Explain SVD low-rank matrix decomposition W = W_0 + B*A in LoRA',
          'Derive the UCB1 multi-armed bandit exploration bound in tree search',
          'Explain the two-tailed paired t-test formula and degrees of freedom'
        ];
      case 'critique_writing':
        return [
          'Critique this claim: "Our agent guarantees zero errors across all web tasks"',
          'Review this methodology paragraph for missing baseline comparisons',
          'Identify threats to external validity in 10-shot prompt evaluations'
        ];
      case 'find_gaps':
        return [
          'Synthesize research gaps from ReAct and Reflexion limitations',
          'Identify missing benchmarks in bilingual prompt injection defense',
          'Generate 2 candidate research questions for transactional agent rollback'
        ];
      case 'experiment_design':
        return [
          'Design controlled experiment for HotpotQA with 3 deterministic seeds',
          'Define ablation controls for state-tree checkpointing rollback',
          'Suggest statistical significance verification protocol for latency vs pass@1'
        ];
    }
  };

  inputPlaceholder(): string {
    switch (this.selectedMode()) {
      case 'explain_paper':
        return this.i18n.isRtl() ? 'نام مقاله، چکیده یا بخشی از روش‌شناسی را جهت تحلیل وارد کنید...' : 'Enter paper title, abstract, or methodology passage...';
      case 'math_tutor':
        return this.i18n.isRtl() ? 'فرمول یا نمادهای ریاضیاتی را وارد کنید (مانند تانسور امبدینگ، نابرابری یا قضیه)...' : 'Paste formula or mathematical expression to decompose...';
      case 'critique_writing':
        return this.i18n.isRtl() ? 'پاراگرافی از مقاله خود را وارد کنید تا از منظر داوران تراز اول نقد شود...' : 'Paste draft paragraph to audit for unsupported claims or vague wording...';
      case 'find_gaps':
        return this.i18n.isRtl() ? 'یادداشت‌های مقالات مرتبط را وارد کنید تا شکاف‌های بکر استخراج شوند...' : 'Paste paper limitations to synthesize high-impact research gaps...';
      case 'experiment_design':
        return this.i18n.isRtl() ? 'فرضیه و متغیرهای خود را جهت دریافت پروتکل آزمایشی وارد کنید...' : 'State hypothesis to receive controlled experimental protocol...';
    }
  }

  setUserInput(text: string): void {
    this.userInput = text;
  }

  async sendQuery(): Promise<void> {
    const text = this.userInput.trim();
    if (!text || this.isLoading()) return;

    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
      mode: this.selectedMode()
    };

    this.messages.update(list => [...list, userMsg]);
    this.userInput = '';
    this.isLoading.set(true);

    try {
      const res = await this.gemini.queryAssistant(text, this.selectedMode(), this.i18n.currentLang());
      const replyMsg: AssistantMessage = {
        id: `reply-${Date.now()}`,
        role: 'assistant',
        content: res.text,
        timestamp: new Date().toLocaleTimeString(),
        mode: this.selectedMode(),
        isLiveGemini: res.isLiveGemini
      };
      this.messages.update(list => [...list, replyMsg]);
    } finally {
      this.isLoading.set(false);
    }
  }
}
