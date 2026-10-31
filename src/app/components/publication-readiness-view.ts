import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { PublicationChecklist } from '../models/research.types';

@Component({
  selector: 'app-publication-readiness-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-[#152232] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-emerald-400 text-[20px] w-5 h-5">verified_user</mat-icon>
            <span>{{ i18n.t('pub.title') }}</span>
          </h2>
          <p class="text-xs text-[#7E9BB0] mt-0.5">
            {{ i18n.t('pub.subtitle') }}
          </p>
        </div>

        <!-- Overall Score Badge -->
        <div class="flex items-center gap-2 self-start md:self-auto bg-[#0A121B] border border-[#192C40] px-3.5 py-1.5 rounded-xl font-mono text-xs">
          <span class="text-[#7E9BB0]">Readiness Index:</span>
          <span class="text-emerald-400 font-bold text-sm">{{ score() }}%</span>
          <span class="text-white">({{ passedCount() }}/11 Passed)</span>
        </div>
      </div>

      <!-- Strict Verification Warning -->
      <div class="p-3.5 rounded-xl bg-[#0F141C] border border-[#20364C] flex items-start gap-3 text-xs">
        <mat-icon class="text-amber-400 text-[20px] w-5 h-5 shrink-0 mt-0.5">security</mat-icon>
        <div class="space-y-1">
          <div class="font-bold text-white">
            {{ i18n.isRtl() ? 'اصل شفافیت و تعهد به استانداردهای داوری علمی (Peer Review Integrity):' : 'Peer Review Integrity & Indexing Reality Principle:' }}
          </div>
          <p class="text-[#A9E6FF]/80 leading-relaxed text-[11px]">
            {{ i18n.isRtl() 
              ? 'هیچ قالبی جایگزین داوری همتا نیست. نمایه‌شدن در ISI، Scopus، IEEE یا ACM صرفاً پس از ارزیابی داوران مستقل و دریافت نامه پذیرش رسمی تحقق می‌یابد. این سامانه تمام پیش‌نیازهای ساختاری، آماری و بازتولیدپذیری را پیش از ارسال راستی‌آزمایی می‌کند.'
              : 'Templates and formatting never substitute for rigorous peer review. Indexing in Scopus, IEEE or ACM is strictly a post-review property. This checklist enforces formal statistical bounds, open artifacts, and reproducibility to maximize acceptance odds.' }}
          </p>
        </div>
      </div>

      <!-- Checklist Items Grid -->
      <div class="space-y-2.5">
        @for (item of checklistItems; track item.key) {
          <div 
            (click)="toggleItem(item.key)"
            class="p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-4"
            [class.border-emerald-500/40]="storage.checklist()[item.key]"
            [class.bg-[#081216]]="storage.checklist()[item.key]"
            [class.border-[#172738]]="!storage.checklist()[item.key]"
            [class.bg-[#080B10]]="!storage.checklist()[item.key]"
          >
            <div class="flex items-start gap-3">
              <div 
                class="w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors"
                [class.border-emerald-400]="storage.checklist()[item.key]"
                [class.bg-emerald-400]="storage.checklist()[item.key]"
                [class.border-[#1F3348]]="!storage.checklist()[item.key]"
              >
                @if (storage.checklist()[item.key]) {
                  <mat-icon class="text-black text-[16px] w-4 h-4">check</mat-icon>
                }
              </div>

              <div>
                <h4 class="text-xs font-bold text-white leading-tight">
                  {{ i18n.isRtl() ? item.titleFa : item.titleEn }}
                </h4>
                <p class="text-[11px] text-[#A9E6FF]/70 leading-relaxed mt-1">
                  {{ i18n.isRtl() ? item.descFa : item.descEn }}
                </p>
              </div>
            </div>

            <span 
              class="text-[10px] font-mono px-2 py-0.5 rounded shrink-0 uppercase"
              [class.bg-emerald-400/10]="storage.checklist()[item.key]"
              [class.text-emerald-400]="storage.checklist()[item.key]"
              [class.bg-[#121A24]]="!storage.checklist()[item.key]"
              [class.text-[#7E9BB0]]="!storage.checklist()[item.key]"
            >
              {{ storage.checklist()[item.key] ? 'Compliant' : 'Action Required' }}
            </span>
          </div>
        }
      </div>
    </div>
  `
})
export class PublicationReadinessView {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  readonly checklistItems: {
    key: keyof Omit<PublicationChecklist, 'targetVenueNotes'>;
    titleFa: string;
    titleEn: string;
    descFa: string;
    descEn: string;
  }[] = [
    {
      key: 'scopeCompatibility',
      titleFa: '۱. انطباق کامل با دامنه موضوعی ژورنال یا کنفرانس (Aims & Scope)',
      titleEn: '1. Strict Aims & Scope Alignment with Target Venue',
      descFa: 'تطبیق مسئله مطرح شده با فهرست موضوعات اصلی و مقالات چاپ‌شده اخیر در سال‌های اخیر.',
      descEn: 'Verification that manuscript topics strictly fit CFP tracks and recent proceedings.'
    },
    {
      key: 'noveltyEvidence',
      titleFa: '۲. اثبات اصالت و نوآوری روش‌شناختی (Novelty Proof)',
      titleEn: '2. Formal Evidence of Methodological Novelty',
      descFa: 'تفکیک واضح سهم علمی نوآورانه (Contributions) از کارهای پیشین با جدول مقایسه‌ای دقیق.',
      descEn: 'Explicit differentiation of proposed contributions from prior literature.'
    },
    {
      key: 'methodologicalClarity',
      titleFa: '۳. شفافیت روش‌شناسی و فرمول‌بندی ریاضی (Mathematical Clarity)',
      titleEn: '3. Rigorous Mathematical Formulation & Invariants',
      descFa: 'تعریف کلیه نمادها، ابعاد تانسورها، شبه‌کد الگوریتم و شرایط مرزی بدون ابهام.',
      descEn: 'Unambiguous variable definitions, vector dimensions, and formal algorithmic pseudo-code.'
    },
    {
      key: 'reproducibility',
      titleFa: '۴. بازتولیدپذیری کامل (100% Reproducibility & Seeds)',
      titleEn: '4. Artifact Availability & Pinned Random Seeds',
      descFa: 'ثبت دقیق دانه‌های تصادفی (حداقل ۳ سید)، نسخه کتابخانه‌ها و اسکریپت اجرای قطعی.',
      descEn: 'Disclosed random seeds (N >= 3), environment requirements, and deterministic flags.'
    },
    {
      key: 'datasetAvailability',
      titleFa: '۵. دسترسی‌پذیری و شفافیت دیتاست و بنچ‌مارک (Dataset Transparency)',
      titleEn: '5. Benchmark Transparency & Data Availability Statement',
      descFa: 'ارائه پیوند پایدار یا DOI دیتاست‌های ارزیابی و تفکیک داده‌های آموزش، اعتبارسنجی و آزمون.',
      descEn: 'Explicit splits, download URLs or DOIs, and mitigation of test set leakage.'
    },
    {
      key: 'statisticalValidity',
      titleFa: '۶. اعتبارسنجی آماری و گزارش p-value (Statistical Significance)',
      titleEn: '6. Statistical Hypothesis Testing & Significance (p < 0.05)',
      descFa: 'محاسبه آزمون معناداری فرض (paired t-test یا Wilcoxon) و گزارش فواصل اطمینان.',
      descEn: 'Paired hypothesis tests, standard deviations, and error bars on all gain claims.'
    },
    {
      key: 'citationCompleteness',
      titleFa: '۷. جامعیت ارجاعات و استناد به آخرین مقالات تراز اول (Citations)',
      titleEn: '7. Comprehensive & Contemporary Peer-Reviewed Citations',
      descFa: 'پوشش مقالات پیشرو کنفرانس‌های معتبر ۵ سال اخیر و ارجاع صادقانه به محدودیت‌های رقبا.',
      descEn: 'Citation of top-tier literature from the last 3-5 years without citation cartel bias.'
    },
    {
      key: 'ethicalRequirements',
      titleFa: '۸. بیانیه اخلاق پژوهشی و استفاده مسئولانه از هوش مصنوعی (Ethics)',
      titleEn: '8. Ethics, Safety & AI Usage Disclosure Statement',
      descFa: 'تصریح نحوه استفاده از مدل‌ها، عدم نقض کپی‌رایت دیتاست‌ها و ملاحظات ایمنی هوش مصنوعی.',
      descEn: 'Compliance with IEEE/ACM ethics guidelines and transparent AI assistance disclosure.'
    },
    {
      key: 'formattingCheck',
      titleFa: '۹. رعایت قالب مصوب دو ستونه یا تک‌ستونه (Formatting Compliance)',
      titleEn: '9. Official IEEE/ACM Template & Page Limit Compliance',
      descFa: 'رعایت سقف صفحات، فونت‌ها، فرمول‌های درون‌خطی و کیفیت برداری نمودارها (SVG/PDF).',
      descEn: 'Strict adherence to margin guidelines, vector graphics, and page constraints.'
    },
    {
      key: 'authorContributions',
      titleFa: '۱۰. بیانیه شفاف سهم نویسندگان (CRediT Authorship)',
      titleEn: '10. CRediT Author Contribution Taxonomy',
      descFa: 'تفکیک شفاف نقش‌های Conceptualization, Methodology, Software, Writing.',
      descEn: 'Documented roles for conceptualization, methodology, software, and validation.'
    },
    {
      key: 'dataAvailabilityStatement',
      titleFa: '۱۱. پیوند مخزن کد باز (Open Source Code & Weights)',
      titleEn: '11. Open Source Repository & Checkpoint Availability',
      descFa: 'ارائه لینک ناشناس برای داوری دوسویه کور (Double-Blind Anonymous Repository).',
      descEn: 'Anonymized GitHub/Zenodo repository link for double-blind peer reviewers.'
    }
  ];

  passedCount = () => {
    const c = this.storage.checklist();
    return this.checklistItems.filter(item => c[item.key]).length;
  };

  score = () => {
    return Math.round((this.passedCount() / this.checklistItems.length) * 100);
  };

  toggleItem(key: keyof Omit<PublicationChecklist, 'targetVenueNotes'>): void {
    const current = this.storage.checklist()[key];
    this.storage.updateChecklist({ [key]: !current });
  }
}
