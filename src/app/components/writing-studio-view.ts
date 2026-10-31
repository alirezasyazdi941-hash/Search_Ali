import { ChangeDetectionStrategy, Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { ResearchPaperDraft } from '../models/research.types';

type SectionKey = 
  | 'abstract' 
  | 'introduction' 
  | 'relatedWork' 
  | 'background' 
  | 'methodology' 
  | 'mathematicalFormulation' 
  | 'experimentalSetup' 
  | 'results' 
  | 'discussion' 
  | 'limitations' 
  | 'conclusion' 
  | 'bibtexEntries';

@Component({
  selector: 'app-writing-studio-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-[#152232] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-violet-400 text-[20px] w-5 h-5">edit_document</mat-icon>
            <span>{{ i18n.t('writing.title') }}</span>
          </h2>
          <p class="text-xs text-[#7E9BB0] mt-0.5">
            {{ i18n.t('writing.subtitle') }}
          </p>
        </div>

        <!-- Export Buttons -->
        <div class="flex items-center gap-2 self-start md:self-auto">
          <button
            (click)="exportLatex()"
            class="px-3.5 py-1.5 rounded-lg bg-[#59D9FF]/15 hover:bg-[#59D9FF]/25 border border-[#59D9FF]/40 text-[#59D9FF] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <mat-icon class="w-4 h-4 text-[16px]">code</mat-icon>
            <span>{{ i18n.t('writing.export_latex') }}</span>
          </button>

          <button
            (click)="exportMarkdown()"
            class="px-3 py-1.5 rounded-lg bg-[#0E1722] hover:bg-[#142334] border border-[#192D42] text-[#A9E6FF] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <mat-icon class="w-4 h-4 text-[16px]">description</mat-icon>
            <span>{{ i18n.t('writing.export_markdown') }}</span>
          </button>
        </div>
      </div>

      <!-- Manuscript Metadata Bar -->
      <div class="p-4 rounded-xl bg-[#080B10] border border-[#172738] space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label class="block text-[11px] text-[#7E9BB0] mb-1">{{ i18n.isRtl() ? 'عنوان مقاله (Working Title):' : 'Working Manuscript Title:' }}</label>
            <input
              type="text"
              [(ngModel)]="activeDraft.title"
              (ngModelChange)="onDraftChange()"
              class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-lg p-2 text-xs text-white font-bold focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-[11px] text-[#7E9BB0] mb-1">{{ i18n.isRtl() ? 'نویسندگان:' : 'Authors:' }}</label>
            <input
              type="text"
              [(ngModel)]="activeDraft.authors"
              (ngModelChange)="onDraftChange()"
              class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-lg p-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-[11px] text-[#7E9BB0] mb-1">{{ i18n.isRtl() ? 'محل انتشار هدف (Target Venue):' : 'Target Publication Venue:' }}</label>
            <input
              type="text"
              [(ngModel)]="activeDraft.targetVenue"
              (ngModelChange)="onDraftChange()"
              class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-lg p-2 text-xs text-[#59D9FF] focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-[#121E2C] text-[11px] font-mono text-[#7E9BB0]">
          <div class="flex items-center gap-3">
            <span>Total Manuscript Words: <strong class="text-white">{{ totalWordCount() }}</strong></span>
            <span>•</span>
            <span>Version: <strong class="text-[#59D9FF]">v{{ activeDraft.version }}</strong></span>
          </div>

          <div class="flex items-center gap-1.5 text-emerald-400">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{{ i18n.t('writing.save_draft') }}</span>
          </div>
        </div>
      </div>

      <!-- Writing Studio Workspace Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Left: Section Selector (4 cols) -->
        <div class="lg:col-span-4 space-y-1.5 bg-[#080B10] border border-[#172738] rounded-xl p-3">
          <div class="text-[10px] font-mono text-[#7E9BB0] uppercase px-2 py-1 tracking-wider">
            {{ i18n.isRtl() ? 'بخش‌های استاندارد مقاله' : 'Standard IEEE/ACM Sections' }}
          </div>

          @for (sec of sections; track sec.key) {
            <button
              type="button"
              (click)="activeSection.set(sec.key)"
              class="w-full px-3 py-2.5 rounded-lg text-start text-xs font-medium transition-all flex items-center justify-between"
              [class.bg-[#121E2C]]="activeSection() === sec.key"
              [class.text-[#59D9FF]]="activeSection() === sec.key"
              [class.border]="activeSection() === sec.key"
              [class.border-[#59D9FF]/30]="activeSection() === sec.key"
              [class.text-[#7E9BB0]]="activeSection() !== sec.key"
              [class.hover:bg-[#0B1017]]="activeSection() !== sec.key"
            >
              <div class="flex items-center gap-2">
                <mat-icon class="text-[16px] w-4 h-4">{{ sec.icon }}</mat-icon>
                <span>{{ i18n.t(sec.labelKey) }}</span>
              </div>
              <span class="text-[10px] font-mono opacity-60">
                {{ getSectionWordCount(sec.key) }} w
              </span>
            </button>
          }
        </div>

        <!-- Right: Section Editor & Helpers (8 cols) -->
        <div class="lg:col-span-8 bg-[#080B10] border border-[#172738] rounded-xl p-4 flex flex-col space-y-3">
          <!-- Editor Toolbar -->
          <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#142334]">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-white uppercase font-mono tracking-wider">
                {{ activeSectionTitle() }}
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101A24] text-[#59D9FF] border border-[#172738]">
                {{ currentSectionWords() }} words
              </span>
            </div>

            <!-- Insertion & Dictation Helpers -->
            <div class="flex flex-wrap items-center gap-2">
              <!-- Voice Dictation (Microphone) Button -->
              @if (!isRecording()) {
                <button
                  type="button"
                  (click)="startDictation()"
                  class="px-2.5 py-1 rounded bg-[#0D1620] hover:bg-[#142334] border border-[#1B2F44] hover:border-[#59D9FF] text-[11px] text-[#59D9FF] flex items-center gap-1.5 transition-all shadow-sm"
                  [title]="i18n.t('writing.dictate_start')"
                >
                  <mat-icon class="w-3.5 h-3.5 text-[15px] text-[#59D9FF]">mic</mat-icon>
                  <span>{{ i18n.t('writing.dictate_start') }}</span>
                  <span class="text-[9px] font-mono px-1 rounded bg-[#101A24] text-[#7E9BB0]">
                    {{ dictationLang() === 'fa-IR' ? 'فا' : 'EN' }}
                  </span>
                </button>
              } @else {
                <button
                  type="button"
                  (click)="stopDictation()"
                  class="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-[11px] text-rose-300 flex items-center gap-1.5 transition-all animate-pulse shadow-lg glow-cyan-sm"
                  [title]="i18n.t('writing.dictate_stop')"
                >
                  <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <mat-icon class="w-3.5 h-3.5 text-[15px] text-rose-400">mic_off</mat-icon>
                  <span class="font-bold">{{ i18n.t('writing.dictate_stop') }}</span>
                </button>
              }

              <!-- Dictation Language Switcher -->
              <button
                type="button"
                (click)="toggleDictationLang()"
                class="px-2 py-1 rounded bg-[#080D14] hover:bg-[#101824] border border-[#162738] text-[10px] font-mono text-[#7E9BB0] hover:text-[#A9E6FF] transition-colors"
                [title]="dictationLang() === 'fa-IR' ? i18n.t('writing.dictate_lang_fa') : i18n.t('writing.dictate_lang_en')"
              >
                {{ dictationLang() === 'fa-IR' ? 'fa-IR (فارسی)' : 'en-US (English)' }}
              </button>

              <button
                type="button"
                (click)="insertEquationTemplate()"
                class="px-2.5 py-1 rounded bg-[#0D1620] hover:bg-[#142232] border border-[#1B2F44] text-[11px] text-[#59D9FF] flex items-center gap-1 transition-colors"
                title="Insert LaTeX Equation Block"
              >
                <mat-icon class="w-3.5 h-3.5 text-[14px]">functions</mat-icon>
                <span>+ Eq</span>
              </button>

              <button
                type="button"
                (click)="showCitationPicker.set(true)"
                class="px-2.5 py-1 rounded bg-[#0D1620] hover:bg-[#142232] border border-[#1B2F44] text-[11px] text-[#A9E6FF] flex items-center gap-1 transition-colors"
                title="Insert BibTeX \cite{}"
              >
                <mat-icon class="w-3.5 h-3.5 text-[14px]">format_quote</mat-icon>
                <span>+ Cite</span>
              </button>
            </div>
          </div>

          <!-- Active Recording Status & Interim Transcript Preview Banner -->
          @if (isRecording()) {
            <div class="p-3 rounded-xl bg-[#140A0F] border border-rose-500/40 space-y-1.5 animate-fade-in shadow-md">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2 text-rose-300 font-bold">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <mat-icon class="w-4 h-4 text-[16px] text-rose-400">graphic_eq</mat-icon>
                  <span>{{ i18n.t('writing.dictate_listening') }}</span>
                  <span class="text-[10px] font-mono text-[#7E9BB0]">[{{ dictationLang() }}]</span>
                </div>

                <div class="flex items-center gap-1">
                  <span class="inline-block w-1 h-3 bg-rose-400 animate-pulse"></span>
                  <span class="inline-block w-1 h-4 bg-rose-400 animate-pulse delay-75"></span>
                  <span class="inline-block w-1 h-2 bg-rose-400 animate-pulse delay-150"></span>
                  <span class="inline-block w-1 h-5 bg-rose-400 animate-pulse delay-100"></span>
                </div>
              </div>

              <!-- Live preview transcript -->
              <div class="text-xs text-white font-mono bg-[#080507] p-2 rounded-lg border border-rose-500/20 min-h-[28px] leading-relaxed">
                @if (interimTranscript()) {
                  <span class="text-emerald-300">"{{ interimTranscript() }}"</span>
                } @else {
                  <span class="text-[#7E9BB0] italic">{{ i18n.isRtl() ? 'در حال دریافت صدای میکروفون... صحبت کنید.' : 'Microphone streaming active... Speak now.' }}</span>
                }
              </div>
            </div>
          }

          <!-- Microphone Error or Status Notice -->
          @if (micNotice()) {
            <div class="p-2.5 rounded-lg bg-[#140D07] border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <mat-icon class="w-4 h-4 text-[16px] text-amber-400">warning</mat-icon>
                <span>{{ micNotice() }}</span>
              </div>
              <button (click)="micNotice.set('')" class="text-amber-400 hover:text-white p-0.5">
                <mat-icon class="w-3.5 h-3.5 text-[14px]">close</mat-icon>
              </button>
            </div>
          }

          <!-- Main Textarea Editor -->
          <div class="flex-1 min-h-[360px]">
            <textarea
              [(ngModel)]="activeDraft[activeSection()]"
              (ngModelChange)="onDraftChange()"
              rows="16"
              [placeholder]="'Drafting ' + activeSectionTitle() + '... Write in Persian or English. Preserve equations and BibTeX references.'"
              class="w-full h-full bg-[#040608] border border-[#152434] focus:border-[#59D9FF] rounded-xl p-4 text-xs font-mono text-[#A9E6FF] leading-relaxed focus:outline-none resize-y"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Citation Picker Modal -->
      @if (showCitationPicker()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div class="w-full max-w-lg bg-[#080B10] border border-[#172738] rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between border-b border-[#152232] pb-3">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <mat-icon class="text-[#59D9FF] text-[18px] w-5 h-5">format_quote</mat-icon>
                <span>{{ i18n.t('writing.insert_citation') }}</span>
              </h3>
              <button (click)="showCitationPicker.set(false)" class="text-[#7E9BB0] hover:text-white">
                <mat-icon class="w-5 h-5 text-[20px]">close</mat-icon>
              </button>
            </div>

            <div class="space-y-2 max-h-60 overflow-y-auto">
              @for (paper of storage.activePapers(); track paper.id) {
                <div 
                  (click)="insertCitationKey(paper)"
                  class="p-2.5 rounded-lg border border-[#162638] hover:border-[#59D9FF] bg-[#05080C] cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div class="min-w-0 pr-2">
                    <div class="font-bold text-white truncate">{{ paper.title }}</div>
                    <div class="text-[10px] text-[#7E9BB0] font-mono">{{ paper.authors[0] }} ({{ paper.year }})</div>
                  </div>
                  <span class="text-[10px] font-mono text-[#59D9FF] bg-[#0E1A26] px-2 py-1 rounded">
                    {{ '\\cite{' + getCitationKey(paper) + '}' }}
                  </span>
                </div>
              }
            </div>

            <div class="flex justify-end pt-2 border-t border-[#152232]">
              <button
                (click)="showCitationPicker.set(false)"
                class="px-4 py-1.5 rounded-lg bg-[#111A24] text-xs font-medium text-[#7E9BB0]"
              >
                {{ i18n.t('btn.close') }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class WritingStudioView implements OnDestroy {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  activeSection = signal<SectionKey>('abstract');
  showCitationPicker = signal<boolean>(false);

  // Voice Dictation & Browser Microphone Access
  isRecording = signal<boolean>(false);
  interimTranscript = signal<string>('');
  dictationLang = signal<'fa-IR' | 'en-US'>('fa-IR');
  micNotice = signal<string>('');

  private recognitionInstance: any = null;
  private audioStream: MediaStream | null = null;

  activeDraft: ResearchPaperDraft = { ...this.storage.activeDraft() };

  readonly sections: { key: SectionKey; labelKey: string; icon: string }[] = [
    { key: 'abstract', labelKey: 'writing.abstract', icon: 'short_text' },
    { key: 'introduction', labelKey: 'writing.intro', icon: 'play_arrow' },
    { key: 'relatedWork', labelKey: 'writing.related', icon: 'auto_stories' },
    { key: 'background', labelKey: 'writing.background', icon: 'library_books' },
    { key: 'methodology', labelKey: 'writing.methodology', icon: 'account_tree' },
    { key: 'mathematicalFormulation', labelKey: 'writing.math', icon: 'functions' },
    { key: 'experimentalSetup', labelKey: 'writing.experiments', icon: 'tune' },
    { key: 'results', labelKey: 'writing.results', icon: 'assessment' },
    { key: 'discussion', labelKey: 'writing.discussion', icon: 'forum' },
    { key: 'limitations', labelKey: 'writing.limitations', icon: 'report_problem' },
    { key: 'conclusion', labelKey: 'writing.conclusion', icon: 'flag' },
    { key: 'bibtexEntries', labelKey: 'writing.insert_citation', icon: 'format_quote' }
  ];

  activeSectionTitle(): string {
    const sec = this.sections.find(s => s.key === this.activeSection());
    return sec ? this.i18n.t(sec.labelKey) : this.activeSection();
  }

  currentSectionWords(): number {
    const text = this.activeDraft[this.activeSection()] || '';
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  getSectionWordCount(key: SectionKey): number {
    const text = this.activeDraft[key] || '';
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  totalWordCount(): number {
    let count = 0;
    for (const sec of this.sections) {
      if (sec.key !== 'bibtexEntries') {
        count += this.getSectionWordCount(sec.key);
      }
    }
    return count;
  }

  onDraftChange(): void {
    this.storage.saveDraft(this.activeDraft);
  }

  insertEquationTemplate(): void {
    const eq = `\n\\begin{equation}\n  \\mathcal{L}_{\\text{total}} = \\sum_{i=1}^{N} \\| f_\\theta(x_i) - y_i \\|^2 + \\lambda \\cdot \\Omega(\\theta)\n\\end{equation}\n`;
    this.activeDraft[this.activeSection()] = (this.activeDraft[this.activeSection()] || '') + eq;
    this.onDraftChange();
  }

  getCitationKey(paper: any): string {
    const firstAuthor = paper.authors && paper.authors.length > 0 ? paper.authors[0].split(' ').pop().toLowerCase() : 'paper';
    return `${firstAuthor}${paper.year || 2024}`;
  }

  insertCitationKey(paper: any): void {
    const cite = ` \\cite{${this.getCitationKey(paper)}} `;
    this.activeDraft[this.activeSection()] = (this.activeDraft[this.activeSection()] || '') + cite;
    this.onDraftChange();
    this.showCitationPicker.set(false);
  }

  exportLatex(): void {
    const d = this.activeDraft;
    const latex = `\\documentclass[conference]{IEEEtran}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{graphicx}
\\usepackage{cite}

\\begin{document}

\\title{${d.title}}
\\author{\\IEEEauthorblockN{${d.authors}}\\\\
\\IEEEauthorblockA{\\textit{ALI Independent Research Laboratory}}}

\\maketitle

\\begin{abstract}
${d.abstract}
\\end{abstract}

\\section{Introduction}
${d.introduction}

\\section{Related Work}
${d.relatedWork}

\\section{Background \\& Preliminaries}
${d.background}

\\section{Methodology}
${d.methodology}

\\subsection{Mathematical Formulation}
${d.mathematicalFormulation}

\\section{Experimental Setup}
${d.experimentalSetup}

\\section{Empirical Results}
${d.results}

\\section{Discussion}
${d.discussion}

\\section{Limitations \\& Threats to Validity}
${d.limitations}

\\section{Conclusion}
${d.conclusion}

\\bibliographystyle{IEEEtran}
\\bibliography{references}

\\end{document}
`;

    this.downloadFile(latex, `${d.title.slice(0, 30).replace(/\s+/g, '_')}_manuscript.tex`, 'application/x-tex');
  }

  exportMarkdown(): void {
    const d = this.activeDraft;
    const md = `# ${d.title}
**Authors:** ${d.authors}  
**Target Venue:** ${d.targetVenue}  

## Abstract
${d.abstract}

## 1. Introduction
${d.introduction}

## 2. Related Work
${d.relatedWork}

## 3. Background
${d.background}

## 4. Methodology
${d.methodology}

### Mathematical Formulation
${d.mathematicalFormulation}

## 5. Experimental Setup
${d.experimentalSetup}

## 6. Empirical Results
${d.results}

## 7. Discussion
${d.discussion}

## 8. Limitations
${d.limitations}

## 9. Conclusion
${d.conclusion}

## References
\`\`\`bibtex
${d.bibtexEntries}
\`\`\`
`;
    this.downloadFile(md, `${d.title.slice(0, 30).replace(/\s+/g, '_')}_manuscript.md`, 'text/markdown');
  }

  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  toggleDictationLang(): void {
    const next = this.dictationLang() === 'fa-IR' ? 'en-US' : 'fa-IR';
    this.dictationLang.set(next);
    if (this.isRecording()) {
      this.stopDictation();
      this.startDictation();
    }
  }

  async startDictation(): Promise<void> {
    this.micNotice.set('');
    this.interimTranscript.set('');

    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      this.micNotice.set(
        this.i18n.isRtl()
          ? 'مرورگر شما از قابلیت تبدیل صوت به متن (SpeechRecognition) پشتیبانی نمی‌کند. لطفاً از مرورگر گوگل کروم یا مایکروسافت اج استفاده کنید.'
          : 'Your browser does not support SpeechRecognition. Please use Google Chrome or Microsoft Edge.'
      );
      return;
    }

    // Explicitly request browser microphone permission
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (err: any) {
      console.warn('Microphone permission request error:', err);
      this.micNotice.set(
        this.i18n.isRtl()
          ? 'دسترسی به میکروفون مجاز نشد. لطفاً در نوار آدرس دسترسی میکروفون را فعال نمایید.'
          : 'Microphone permission was denied. Please allow microphone access in your browser address bar.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      this.recognitionInstance = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = this.dictationLang();

      recognition.onstart = () => {
        this.isRecording.set(true);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcript = item[0].transcript;
          if (item.isFinal) {
            this.appendDictatedText(transcript);
            currentInterim = '';
          } else {
            currentInterim += transcript;
          }
        }
        this.interimTranscript.set(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          this.micNotice.set(
            this.i18n.isRtl()
              ? 'دسترسی میکروفون رد شد. لطفاً در تنظیمات مرورگر اجازه ضبط صدا را بدهید.'
              : 'Microphone access blocked. Please enable microphone permissions.'
          );
        } else if (event.error !== 'no-speech') {
          this.micNotice.set(
            this.i18n.isRtl() ? `خطای صوتی: ${event.error}` : `Speech error: ${event.error}`
          );
        }
      };

      recognition.onend = () => {
        if (this.isRecording()) {
          try {
            recognition.start();
          } catch {
            this.isRecording.set(false);
          }
        }
      };

      recognition.start();
    } catch (e: any) {
      console.error('Failed to initialize speech recognition:', e);
      this.micNotice.set(e?.message || 'Error initializing voice dictation.');
      this.isRecording.set(false);
    }
  }

  stopDictation(): void {
    if (this.interimTranscript()) {
      this.appendDictatedText(this.interimTranscript());
      this.interimTranscript.set('');
    }

    this.isRecording.set(false);

    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.onend = null;
        this.recognitionInstance.stop();
      } catch (_err) {
        // Recognition already stopped
      }
      this.recognitionInstance = null;
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(t => t.stop());
      this.audioStream = null;
    }
  }

  private appendDictatedText(text: string): void {
    const cleanText = text.trim();
    if (!cleanText) return;

    const current = this.activeDraft[this.activeSection()] || '';
    const separator = current.length > 0 && !current.endsWith('\n') && !current.endsWith(' ') ? ' ' : '';
    this.activeDraft[this.activeSection()] = current + separator + cleanText;
    this.onDraftChange();
  }

  ngOnDestroy(): void {
    this.stopDictation();
  }
}
