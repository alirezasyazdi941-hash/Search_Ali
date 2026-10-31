import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { DiscoveryService } from '../services/discovery.service';
import { Paper } from '../models/research.types';

@Component({
  selector: 'app-discovery-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-[#152232] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-[#59D9FF] text-[20px] w-5 h-5">travel_explore</mat-icon>
            <span>{{ i18n.t('nav.discovery') }}</span>
          </h2>
          <p class="text-xs text-[#7E9BB0] mt-0.5">
            {{ i18n.isRtl() ? 'جستجو و نمایه مقالات علمی معتبر با اتصال زنده به OpenAlex و arXiv؛ تفکیک مقالات داوری همتا و پیش‌چاپ‌ها' : 'Live academic search across OpenAlex, arXiv & Crossref with strict peer-review vs preprint distinction' }}
          </p>
        </div>

        <!-- BibTeX Quick Import Trigger -->
        <button
          (click)="showBibtexImportModal.set(true)"
          class="px-3.5 py-1.5 rounded-lg bg-[#0F1A26] hover:bg-[#162738] border border-[#1F364E] text-[#59D9FF] text-xs font-semibold flex items-center gap-1.5 self-start md:self-auto transition-colors"
        >
          <mat-icon class="w-4 h-4 text-[16px]">file_upload</mat-icon>
          <span>{{ i18n.isRtl() ? 'ورود فایل BibTeX' : 'Import BibTeX' }}</span>
        </button>
      </div>

      <!-- Search Input & Filters -->
      <div class="p-4 rounded-xl bg-[#080B10] border border-[#172738] space-y-3">
        <form (ngSubmit)="onSearch()" class="flex flex-col sm:flex-row gap-2">
          <div class="relative flex-1">
            <mat-icon class="absolute left-3 top-2.5 text-[#4B6375] text-[18px] w-5 h-5 pointer-events-none">search</mat-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              name="searchQuery"
              [placeholder]="i18n.t('discovery.search_placeholder')"
              class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#4B6375] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            [disabled]="isSearching()"
            class="px-5 py-2.5 rounded-xl bg-[#59D9FF] hover:bg-[#7AE1FF] text-black text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 glow-cyan-sm"
          >
            @if (isSearching()) {
              <span class="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              <span>{{ i18n.isRtl() ? 'در حال جستجو...' : 'Querying...' }}</span>
            } @else {
              <mat-icon class="w-4 h-4 text-[18px]">search</mat-icon>
              <span>{{ i18n.t('discovery.search_btn') }}</span>
            }
          </button>
        </form>

        <!-- Filter Tags -->
        <div class="flex items-center gap-2 pt-1 border-t border-[#121E2C] text-[11px]">
          <span class="text-[#7E9BB0]">{{ i18n.isRtl() ? 'فیلتر بر اساس نوع انتشار:' : 'Publication Type:' }}</span>
          
          <button
            type="button"
            (click)="activeFilter.set('all')"
            class="px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors"
            [class.bg-[#59D9FF]/15]="activeFilter() === 'all'"
            [class.text-[#59D9FF]]="activeFilter() === 'all'"
            [class.text-[#7E9BB0]]="activeFilter() !== 'all'"
          >
            {{ i18n.t('discovery.filter_all') }}
          </button>

          <button
            type="button"
            (click)="activeFilter.set('peer-reviewed')"
            class="px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors"
            [class.bg-[#59D9FF]/15]="activeFilter() === 'peer-reviewed'"
            [class.text-[#59D9FF]]="activeFilter() === 'peer-reviewed'"
            [class.text-[#7E9BB0]]="activeFilter() !== 'peer-reviewed'"
          >
            {{ i18n.t('discovery.filter_peer_reviewed') }}
          </button>

          <button
            type="button"
            (click)="activeFilter.set('preprint')"
            class="px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors"
            [class.bg-[#59D9FF]/15]="activeFilter() === 'preprint'"
            [class.text-[#59D9FF]]="activeFilter() === 'preprint'"
            [class.text-[#7E9BB0]]="activeFilter() !== 'preprint'"
          >
            {{ i18n.t('discovery.filter_preprints') }}
          </button>
        </div>
      </div>

      <!-- Search Notice (Source info) -->
      @if (searchSourceNotice()) {
        <div class="px-4 py-2.5 rounded-lg bg-[#0A121B] border border-[#172E44] text-xs text-[#59D9FF] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <mat-icon class="w-4 h-4 text-[16px]">info</mat-icon>
            <span>{{ searchSourceNotice() }}</span>
          </div>
          <span class="text-[10px] font-mono text-[#7E9BB0]">{{ displayedPapers().length }} results</span>
        </div>
      }

      <!-- Papers Grid -->
      <div class="space-y-3">
        @for (paper of displayedPapers(); track paper.id) {
          <div class="p-4 rounded-xl bg-[#080B10] border border-[#172738] hover:border-[#233A50] transition-all space-y-3">
            <!-- Paper Top Row: Badges & Year -->
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <!-- Peer Reviewed vs Preprint distinction -->
                <span 
                  class="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                  [class.bg-emerald-400/10]="paper.type === 'Peer-Reviewed Journal' || paper.type === 'Conference Proceeding'"
                  [class.text-emerald-400]="paper.type === 'Peer-Reviewed Journal' || paper.type === 'Conference Proceeding'"
                  [class.border]="paper.type === 'Peer-Reviewed Journal' || paper.type === 'Conference Proceeding'"
                  [class.border-emerald-400/30]="paper.type === 'Peer-Reviewed Journal' || paper.type === 'Conference Proceeding'"
                  [class.bg-amber-400/10]="paper.type === 'Preprint' || paper.type === 'Technical Report'"
                  [class.text-amber-400]="paper.type === 'Preprint' || paper.type === 'Technical Report'"
                  [class.border-amber-400/30]="paper.type === 'Preprint' || paper.type === 'Technical Report'"
                >
                  {{ paper.type }}
                </span>

                <span class="text-[11px] font-mono text-[#7E9BB0]">{{ paper.venue }}</span>
                <span class="text-[11px] font-mono text-white font-bold">({{ paper.year }})</span>
              </div>

              <!-- Citations -->
              @if (paper.citations > 0) {
                <span class="text-[11px] font-mono text-[#59D9FF] flex items-center gap-1 bg-[#0E1A27] px-2 py-0.5 rounded border border-[#1C334A]">
                  <mat-icon class="w-3.5 h-3.5 text-[14px]">format_quote</mat-icon>
                  <span>{{ paper.citations }} citations</span>
                </span>
              }
            </div>

            <!-- Title & Authors -->
            <div>
              <h3 class="text-sm font-bold text-white hover:text-[#59D9FF] transition-colors">
                <a [href]="paper.url" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5">
                  <span>{{ paper.title }}</span>
                  <mat-icon class="w-3.5 h-3.5 text-[14px] text-[#7E9BB0]">open_in_new</mat-icon>
                </a>
              </h3>
              <p class="text-[11px] text-[#7E9BB0] mt-1 font-mono">
                {{ paper.authors.join(', ') }}
              </p>
            </div>

            <!-- Abstract -->
            <p class="text-xs text-[#A9E6FF]/80 leading-relaxed line-clamp-3">
              {{ paper.abstract }}
            </p>

            <!-- Keywords & DOI -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#121E2C] text-xs">
              <div class="flex flex-wrap items-center gap-1.5">
                @for (kw of paper.keywords; track kw) {
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A1017] text-[#7E9BB0] border border-[#152232]">
                    {{ kw }}
                  </span>
                }
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2">
                @if (paper.doi) {
                  <a 
                    [href]="'https://doi.org/' + paper.doi" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="px-2.5 py-1 rounded-lg bg-[#0E1722] hover:bg-[#142334] text-[11px] font-mono text-[#59D9FF] border border-[#1C3247] flex items-center gap-1"
                  >
                    <span>DOI: {{ paper.doi }}</span>
                  </a>
                }

                @if (isSaved(paper)) {
                  <div class="px-3 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                    <mat-icon class="w-3.5 h-3.5 text-[14px]">check</mat-icon>
                    <span>{{ i18n.t('discovery.already_saved') }}</span>
                  </div>
                } @else {
                  <button
                    (click)="savePaperToLibrary(paper)"
                    class="px-3 py-1 rounded-lg bg-[#59D9FF] hover:bg-[#7AE1FF] text-black text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    <mat-icon class="w-3.5 h-3.5 text-[14px]">bookmark_add</mat-icon>
                    <span>{{ i18n.t('discovery.add_to_library') }}</span>
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- BibTeX Importer Modal -->
      @if (showBibtexImportModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div class="w-full max-w-lg bg-[#080B10] border border-[#172738] rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between border-b border-[#152232] pb-3">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <mat-icon class="text-[#59D9FF] text-[18px] w-5 h-5">data_object</mat-icon>
                <span>{{ i18n.isRtl() ? 'ورود دسته‌جمعی ارجاعات BibTeX' : 'Batch Import BibTeX Citations' }}</span>
              </h3>
              <button (click)="showBibtexImportModal.set(false)" class="text-[#7E9BB0] hover:text-white">
                <mat-icon class="w-5 h-5 text-[20px]">close</mat-icon>
              </button>
            </div>

            <div>
              <label class="block text-xs font-semibold text-white mb-1.5">
                {{ i18n.isRtl() ? 'متن BibTeX را در کادر زیر وارد کنید:' : 'Paste standard BibTeX entries below:' }}
              </label>
              <textarea
                [(ngModel)]="rawBibtexInput"
                rows="8"
                placeholder="@article{...}"
                class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-3 text-xs font-mono text-[#A9E6FF] focus:outline-none"
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-[#152232]">
              <button
                (click)="showBibtexImportModal.set(false)"
                class="px-3.5 py-1.5 rounded-lg bg-[#111A24] text-xs font-medium text-[#7E9BB0] hover:text-white"
              >
                {{ i18n.t('btn.cancel') }}
              </button>
              <button
                (click)="importBibtex()"
                class="px-4 py-1.5 rounded-lg bg-[#59D9FF] hover:bg-[#7AE1FF] text-black text-xs font-bold transition-all"
              >
                {{ i18n.isRtl() ? 'پردازش و ذخیره مقالات' : 'Parse & Save to Library' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DiscoveryView {
  i18n = inject(I18nService);
  storage = inject(StorageService);
  discovery = inject(DiscoveryService);

  searchQuery = 'autonomous agent reasoning tool use';
  isSearching = signal<boolean>(false);
  activeFilter = signal<'all' | 'peer-reviewed' | 'preprint'>('all');
  searchSourceNotice = signal<string>('Displaying curated seminal peer-reviewed papers for your active program.');
  
  searchResults = signal<Paper[]>(this.storage.activePapers());
  showBibtexImportModal = signal<boolean>(false);
  rawBibtexInput = '';

  displayedPapers = () => {
    const list = this.searchResults();
    const filter = this.activeFilter();
    if (filter === 'peer-reviewed') {
      return list.filter(p => p.type === 'Peer-Reviewed Journal' || p.type === 'Conference Proceeding');
    }
    if (filter === 'preprint') {
      return list.filter(p => p.type === 'Preprint' || p.type === 'Technical Report');
    }
    return list;
  };

  isSaved(paper: Paper): boolean {
    return this.storage.papers().some(p => p.id === paper.id || (p.doi && p.doi === paper.doi));
  }

  async onSearch(): Promise<void> {
    if (!this.searchQuery.trim()) return;
    this.isSearching.set(true);

    try {
      const res = await this.discovery.searchAcademicPapers(this.searchQuery, this.storage.activeProgramId());
      this.searchResults.set(res.papers);
      if (res.source === 'live') {
        this.searchSourceNotice.set(this.i18n.isRtl() ? 'نتایج زنده از پایگاه داده OpenAlex و arXiv' : 'Live query results retrieved from OpenAlex & arXiv index.');
      } else {
        this.searchSourceNotice.set(res.message || 'Seminal peer-reviewed papers repository.');
      }
    } finally {
      this.isSearching.set(false);
    }
  }

  savePaperToLibrary(paper: Paper): void {
    this.storage.savePaper({ ...paper, programId: this.storage.activeProgramId() });
  }

  importBibtex(): void {
    if (!this.rawBibtexInput.trim()) return;
    const parsed = this.discovery.parseBibtex(this.rawBibtexInput, this.storage.activeProgramId());
    for (const p of parsed) {
      if (p.title) {
        this.storage.savePaper(p as Paper);
      }
    }
    this.searchResults.set(this.storage.activePapers());
    this.showBibtexImportModal.set(false);
    this.rawBibtexInput = '';
  }
}
