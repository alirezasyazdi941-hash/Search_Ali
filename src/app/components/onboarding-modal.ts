import { ChangeDetectionStrategy, Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { Language, ProgramId } from '../models/research.types';

@Component({
  selector: 'app-onboarding-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div class="w-full max-w-2xl bg-[#080B10] border border-[#172738] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Modal Top Bar -->
        <div class="px-6 py-4 border-b border-[#152232] flex items-center justify-between bg-[#040609]">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-[#0D1824] border border-[#59D9FF]/40 flex items-center justify-center glow-cyan-sm">
              <mat-icon class="text-[#59D9FF] text-[18px] w-4 h-4">science</mat-icon>
            </div>
            <div>
              <h2 class="text-sm font-bold text-white tracking-wide">
                {{ i18n.t('onboarding.welcome_title') }}
              </h2>
              <span class="text-[11px] text-[#7E9BB0] font-mono">
                ALI Research OS • Initial Setup Wizard
              </span>
            </div>
          </div>
          <button 
            (click)="close.emit()" 
            class="text-[#7E9BB0] hover:text-white p-1 rounded-lg hover:bg-[#121A24] transition-colors"
          >
            <mat-icon class="w-5 h-5 text-[20px]">close</mat-icon>
          </button>
        </div>

        <!-- Wizard Step Indicators -->
        <div class="grid grid-cols-4 px-6 py-2.5 border-b border-[#121E2C] bg-[#06090D] text-[11px]">
          <div class="flex items-center gap-1.5" [class.text-[#59D9FF]]="currentStep() >= 1" [class.text-[#4B6375]]="currentStep() < 1">
            <span class="w-4 h-4 rounded-full flex items-center justify-center border" [class.border-[#59D9FF]]="currentStep() >= 1" [class.bg-[#59D9FF]/10]="currentStep() >= 1">1</span>
            <span>{{ i18n.isRtl() ? 'رسالت و زبان' : 'Mission & Lang' }}</span>
          </div>
          <div class="flex items-center gap-1.5" [class.text-[#59D9FF]]="currentStep() >= 2" [class.text-[#4B6375]]="currentStep() < 2">
            <span class="w-4 h-4 rounded-full flex items-center justify-center border" [class.border-[#59D9FF]]="currentStep() >= 2" [class.bg-[#59D9FF]/10]="currentStep() >= 2">2</span>
            <span>{{ i18n.isRtl() ? 'پروفایل پژوهشگر' : 'Researcher Profile' }}</span>
          </div>
          <div class="flex items-center gap-1.5" [class.text-[#59D9FF]]="currentStep() >= 3" [class.text-[#4B6375]]="currentStep() < 3">
            <span class="w-4 h-4 rounded-full flex items-center justify-center border" [class.border-[#59D9FF]]="currentStep() >= 3" [class.bg-[#59D9FF]/10]="currentStep() >= 3">3</span>
            <span>{{ i18n.isRtl() ? 'انتخاب برنامه' : 'Choose Program' }}</span>
          </div>
          <div class="flex items-center gap-1.5" [class.text-[#59D9FF]]="currentStep() >= 4" [class.text-[#4B6375]]="currentStep() < 4">
            <span class="w-4 h-4 rounded-full flex items-center justify-center border" [class.border-[#59D9FF]]="currentStep() >= 4" [class.bg-[#59D9FF]/10]="currentStep() >= 4">4</span>
            <span>{{ i18n.isRtl() ? 'نقشه راه پژوهش' : 'Launch Roadmap' }}</span>
          </div>
        </div>

        <!-- Wizard Step Body -->
        <div class="p-6 overflow-y-auto space-y-5 flex-1">
          <!-- STEP 1: Introduction & Language Selection -->
          @if (currentStep() === 1) {
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-[#0B111A] border border-[#192C40] space-y-2">
                <div class="flex items-center gap-2 text-[#59D9FF] font-semibold text-sm">
                  <mat-icon class="w-4 h-4 text-[18px]">verified</mat-icon>
                  <span>{{ i18n.t('app.motto') }}</span>
                </div>
                <p class="text-xs text-[#A9E6FF]/90 leading-relaxed">
                  {{ i18n.t('onboarding.mission') }}
                </p>
                <div class="pt-2 flex flex-wrap gap-2 text-[10px] font-mono text-[#7E9BB0]">
                  <span class="px-2 py-0.5 rounded bg-[#101924] border border-[#1B2F44]">✓ No Fabricated Data</span>
                  <span class="px-2 py-0.5 rounded bg-[#101924] border border-[#1B2F44]">✓ Real OpenAlex & arXiv Discovery</span>
                  <span class="px-2 py-0.5 rounded bg-[#101924] border border-[#1B2F44]">✓ Reproducible Experiment Lab</span>
                  <span class="px-2 py-0.5 rounded bg-[#101924] border border-[#1B2F44]">✓ IEEE/ACM Writing Studio</span>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-white mb-2">
                  {{ i18n.isRtl() ? 'زبان پیش‌فرض محیط کاری را انتخاب کنید:' : 'Select Default Workspace Language:' }}
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    (click)="setLang('fa')"
                    class="p-3.5 rounded-xl border text-left transition-all flex items-center justify-between"
                    [class.border-[#59D9FF]]="i18n.currentLang() === 'fa'"
                    [class.bg-[#0E1A27]]="i18n.currentLang() === 'fa'"
                    [class.border-[#172738]]="i18n.currentLang() !== 'fa'"
                    [class.bg-[#090D13]]="i18n.currentLang() !== 'fa'"
                  >
                    <div>
                      <div class="text-sm font-bold text-white">فارسی (پیش‌فرض)</div>
                      <div class="text-[11px] text-[#7E9BB0]">محیط راست‌به‌چپ با اصطلاحات تخصصی استاندارد</div>
                    </div>
                    @if (i18n.currentLang() === 'fa') {
                      <mat-icon class="text-[#59D9FF] text-[20px] w-5 h-5">check_circle</mat-icon>
                    }
                  </button>

                  <button
                    type="button"
                    (click)="setLang('en')"
                    class="p-3.5 rounded-xl border text-left transition-all flex items-center justify-between"
                    [class.border-[#59D9FF]]="i18n.currentLang() === 'en'"
                    [class.bg-[#0E1A27]]="i18n.currentLang() === 'en'"
                    [class.border-[#172738]]="i18n.currentLang() !== 'en'"
                    [class.bg-[#090D13]]="i18n.currentLang() !== 'en'"
                  >
                    <div>
                      <div class="text-sm font-bold text-white">English</div>
                      <div class="text-[11px] text-[#7E9BB0]">Left-to-Right engineering interface</div>
                    </div>
                    @if (i18n.currentLang() === 'en') {
                      <mat-icon class="text-[#59D9FF] text-[20px] w-5 h-5">check_circle</mat-icon>
                    }
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- STEP 2: Researcher Profile -->
          @if (currentStep() === 2) {
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-white mb-1.5">
                  {{ i18n.t('onboarding.name_label') }}
                </label>
                <input
                  type="text"
                  [value]="researcherName()"
                  (input)="researcherName.set($any($event.target).value)"
                  placeholder="e.g. Dr. Ali K. / Independent CS Researcher"
                  class="w-full bg-[#090E15] border border-[#192C40] focus:border-[#59D9FF] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-white mb-1.5">
                  {{ i18n.isRtl() ? 'آزمایشگاه / وابستگی سازمانی:' : 'Research Affiliation / Lab:' }}
                </label>
                <input
                  type="text"
                  [value]="affiliation()"
                  (input)="affiliation.set($any($event.target).value)"
                  placeholder="e.g. ALI Independent Research Lab"
                  class="w-full bg-[#090E15] border border-[#192C40] focus:border-[#59D9FF] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-white mb-2">
                  {{ i18n.t('onboarding.level_label') }}
                </label>
                <div class="space-y-2">
                  @for (level of levels; track level.id) {
                    <div 
                      (click)="selectedLevel.set(level.id)"
                      class="p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between"
                      [class.border-[#59D9FF]]="selectedLevel() === level.id"
                      [class.bg-[#0D1824]]="selectedLevel() === level.id"
                      [class.border-[#172738]]="selectedLevel() !== level.id"
                      [class.bg-[#090D13]]="selectedLevel() !== level.id"
                    >
                      <div>
                        <div class="text-xs font-bold text-white">{{ i18n.isRtl() ? level.labelFa : level.labelEn }}</div>
                        <div class="text-[11px] text-[#7E9BB0]">{{ i18n.isRtl() ? level.descFa : level.descEn }}</div>
                      </div>
                      <div class="w-4 h-4 rounded-full border flex items-center justify-center" [class.border-[#59D9FF]]="selectedLevel() === level.id">
                        @if (selectedLevel() === level.id) {
                          <div class="w-2 h-2 rounded-full bg-[#59D9FF]"></div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- STEP 3: Present 5 Programs -->
          @if (currentStep() === 3) {
            <div class="space-y-3">
              <p class="text-xs text-[#7E9BB0]">
                {{ i18n.t('onboarding.program_select') }}
              </p>
              
              <div class="space-y-2.5">
                @for (prog of storage.programs; track prog.id) {
                  <div 
                    (click)="selectedProgram.set(prog.id)"
                    class="p-3.5 rounded-xl border cursor-pointer transition-all"
                    [class.border-[#59D9FF]]="selectedProgram() === prog.id"
                    [class.bg-[#0E1926]]="selectedProgram() === prog.id"
                    [class.border-[#172738]]="selectedProgram() !== prog.id"
                    [class.bg-[#080C12]]="selectedProgram() !== prog.id"
                  >
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#132232] text-[#59D9FF] border border-[#192D42]">
                          {{ prog.code }}
                        </span>
                        <h4 class="text-xs font-bold text-white">
                          {{ i18n.isRtl() ? prog.titleFa : prog.titleEn }}
                        </h4>
                      </div>
                      <div class="w-4 h-4 rounded-full border flex items-center justify-center" [class.border-[#59D9FF]]="selectedProgram() === prog.id">
                        @if (selectedProgram() === prog.id) {
                          <div class="w-2 h-2 rounded-full bg-[#59D9FF]"></div>
                        }
                      </div>
                    </div>

                    <p class="text-[11px] text-[#A9E6FF]/80 line-clamp-2">
                      {{ i18n.isRtl() ? prog.descriptionFa : prog.descriptionEn }}
                    </p>

                    <div class="mt-2 flex flex-wrap gap-1">
                      @for (topic of prog.keyTopics; track topic) {
                        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0A121B] text-[#7E9BB0] border border-[#132232]">
                          {{ topic }}
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- STEP 4: Roadmap & Concrete Action -->
          @if (currentStep() === 4) {
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-[#09121B] border border-[#59D9FF]/30 space-y-2">
                <div class="flex items-center gap-2 text-[#59D9FF] font-bold text-xs">
                  <mat-icon class="w-4 h-4 text-[18px]">alt_route</mat-icon>
                  <span>{{ i18n.isRtl() ? 'نقشه راه سفارشی‌شده بر اساس سطح شما:' : 'Customized Guided Research Roadmap:' }}</span>
                </div>
                <p class="text-xs text-white">
                  {{ i18n.isRtl() ? 'برنامه انتخاب‌شده: ' : 'Selected Program: ' }}
                  <span class="font-mono text-[#59D9FF] font-bold">{{ selectedProgram() }}</span>
                </p>
                <div class="space-y-2 text-xs text-[#A9E6FF]/90 pt-1">
                  <div class="flex items-start gap-2">
                    <span class="text-[#59D9FF] font-mono font-bold">1.</span>
                    <span>{{ i18n.isRtl() ? 'گام ۱ (کشف و بازبینی): بررسی مقالات مرجع نمایه‌شده و تکمیل ماتریس ادبیات' : 'Step 1: Explore curated seminal papers and construct the Literature Matrix' }}</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-[#59D9FF] font-mono font-bold">2.</span>
                    <span>{{ i18n.isRtl() ? 'گام ۲ (شکاف پژوهشی): مطالعه شکاف‌های شناسایی‌شده و فرموله کردن فرضیه ابطال‌پذیر' : 'Step 2: Investigate identified gaps & formulate a falsifiable hypothesis' }}</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-[#59D9FF] font-mono font-bold">3.</span>
                    <span>{{ i18n.isRtl() ? 'گام ۳ (آزمایشگاه): ثبت آزمایش کنترل‌شده با حداقل ۳ سید تصادفی و آزمون p-value' : 'Step 3: Run controlled experiments with >= 3 random seeds and p-value tests' }}</span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-[#59D9FF] font-mono font-bold">4.</span>
                    <span>{{ i18n.isRtl() ? 'گام ۴ (نگارش و سابمیت): نگارش پیش‌نویس بخش‌های IEEE/ACM در استودیوی نگارش و اعتبارسنجی چک‌لیست' : 'Step 4: Draft manuscript sections in Writing Studio and pass peer-review checklist' }}</span>
                  </div>
                </div>
              </div>

              <!-- Next Concrete Action Callout -->
              <div class="p-3.5 rounded-xl bg-[#0F1B26] border border-[#234562] flex items-center gap-3">
                <mat-icon class="text-[#59D9FF] text-[24px] w-6 h-6">flag</mat-icon>
                <div>
                  <h5 class="text-xs font-bold text-white">
                    {{ i18n.isRtl() ? 'نخستین اقدام مشخص شما پس از ورود:' : 'Your Immediate First Action:' }}
                  </h5>
                  <p class="text-[11px] text-[#A9E6FF]/80">
                    {{ i18n.isRtl() ? 'به «ماتریس مرور متون» بروید و روش‌شناسی مقاله ReAct را با مقالات مکمل مقایسه کنید.' : 'Open Literature Matrix, inspect the ReAct baseline extraction, and formulate your testable hypothesis.' }}
                  </p>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Wizard Footer Actions -->
        <div class="px-6 py-3.5 border-t border-[#152232] bg-[#05080C] flex items-center justify-between">
          <button
            type="button"
            (click)="prevStep()"
            [disabled]="currentStep() === 1"
            class="px-3.5 py-1.5 rounded-lg border border-[#192C40] text-xs font-medium text-[#7E9BB0] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            {{ i18n.isRtl() ? 'مرحله قبلی' : 'Previous' }}
          </button>

          <div class="flex items-center gap-2">
            @if (currentStep() < 4) {
              <button
                type="button"
                (click)="nextStep()"
                class="px-5 py-2 rounded-xl bg-[#59D9FF] hover:bg-[#7AE1FF] text-black text-xs font-bold transition-all shadow-md glow-cyan-sm flex items-center gap-1.5"
              >
                <span>{{ i18n.isRtl() ? 'مرحله بعدی' : 'Next' }}</span>
                <mat-icon class="w-4 h-4 text-[16px]">{{ i18n.isRtl() ? 'arrow_back' : 'arrow_forward' }}</mat-icon>
              </button>
            } @else {
              <button
                type="button"
                (click)="finishOnboarding()"
                class="px-6 py-2.5 rounded-xl bg-[#59D9FF] hover:bg-[#7AE1FF] text-black text-xs font-bold transition-all shadow-lg glow-cyan flex items-center gap-2"
              >
                <mat-icon class="w-4 h-4 text-[18px]">rocket_launch</mat-icon>
                <span>{{ i18n.t('onboarding.start_btn') }}</span>
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class OnboardingModal {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  close = output<void>();

  currentStep = signal<number>(1);
  researcherName = signal<string>(this.storage.userProfile().name);
  affiliation = signal<string>(this.storage.userProfile().affiliation);
  selectedLevel = signal<'Beginner' | 'Intermediate' | 'Advanced'>(this.storage.userProfile().experienceLevel);
  selectedProgram = signal<ProgramId>(this.storage.activeProgramId());

  readonly levels = [
    {
      id: 'Beginner' as const,
      labelFa: 'تازه در حال ورود به دنیای پژوهش علمی هستم (Beginner)',
      labelEn: 'Entering Scientific Research (Foundational)',
      descFa: 'تأکید بر مسیر یادگیری، مبانی ریاضی، درک ساختار مقالات و یادگیری ابزارهای آزمایشگاهی.',
      descEn: 'Focus on foundational math, algorithm proofs, literature review basics, and reproduction.'
    },
    {
      id: 'Intermediate' as const,
      labelFa: 'آشنا با مطالعه مقالات، نیازمند متدولوژی و آزمایش دقیق (Intermediate)',
      labelEn: 'Methodology & Rigorous Experimentation (Intermediate)',
      descFa: 'توسعه فرضیات ابطال‌پذیر، بنچ‌مارک‌های استاندارد، سنجه‌های معناداری آماری و نگارش IEEE/ACM.',
      descEn: 'Focus on testable hypothesis formulation, baseline benchmarking, and manuscript drafting.'
    },
    {
      id: 'Advanced' as const,
      labelFa: 'پژوهشگر با سابقه، هدف‌گذاری ژورنال‌ها و کنفرانس‌های برتر (Advanced)',
      labelEn: 'Top-Tier Publication Target (Advanced)',
      descFa: 'تمرکز بر اثبات اصالت صوری، مطالعه ابلیشن سخت‌گیرانه، امنیت و بازتولیدپذیری ۱۰۰٪ آرتفکت‌ها.',
      descEn: 'Focus on formal novelty proofs, strict ablations, artifact evaluation, and peer review defense.'
    }
  ];

  setLang(lang: Language): void {
    this.i18n.setLanguage(lang);
  }

  nextStep(): void {
    if (this.currentStep() < 4) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  finishOnboarding(): void {
    this.storage.updateUserProfile({
      name: this.researcherName().trim() || 'Independent Researcher',
      affiliation: this.affiliation().trim() || 'ALI Independent Research Lab',
      experienceLevel: this.selectedLevel(),
      activeProgramId: this.selectedProgram(),
      language: this.i18n.currentLang(),
      onboardingCompleted: true
    });
    this.storage.setActiveProgram(this.selectedProgram());
    this.close.emit();
  }
}
