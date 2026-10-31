import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { Paper } from '../models/research.types';

@Component({
  selector: 'app-matrix-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Top Title & Actions -->
      <div class="border-b border-[#152232] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-[#59D9FF] text-[20px] w-5 h-5">grid_on</mat-icon>
            <span>{{ i18n.t('matrix.title') }}</span>
          </h2>
          <p class="text-xs text-[#7E9BB0] mt-0.5">
            {{ i18n.t('matrix.subtitle') }}
          </p>
        </div>

        <!-- Export Buttons -->
        <div class="flex items-center gap-2 self-start md:self-auto">
          <button
            (click)="exportMatrixCsv()"
            class="px-3 py-1.5 rounded-lg bg-[#0E1722] hover:bg-[#142334] border border-[#1A2E42] text-xs font-semibold text-[#59D9FF] flex items-center gap-1.5 transition-colors"
          >
            <mat-icon class="w-4 h-4 text-[16px]">table_chart</mat-icon>
            <span>{{ i18n.t('matrix.export_csv') }}</span>
          </button>

          <button
            (click)="exportAllBibtex()"
            class="px-3 py-1.5 rounded-lg bg-[#0E1722] hover:bg-[#142334] border border-[#1A2E42] text-xs font-semibold text-[#A9E6FF] flex items-center gap-1.5 transition-colors"
          >
            <mat-icon class="w-4 h-4 text-[16px]">file_download</mat-icon>
            <span>{{ i18n.t('matrix.export_bibtex') }}</span>
          </button>
        </div>
      </div>

      <!-- Matrix Table Container -->
      <div class="rounded-xl border border-[#172738] bg-[#080B10] overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-start text-xs border-collapse min-w-[900px]">
            <thead>
              <tr class="border-b border-[#172738] bg-[#05070A] text-[#7E9BB0] font-mono text-[11px] uppercase">
                <th class="p-3.5 w-48">{{ i18n.t('matrix.col_paper') }}</th>
                <th class="p-3.5 w-48">{{ i18n.t('matrix.col_problem') }}</th>
                <th class="p-3.5 w-52">{{ i18n.t('matrix.col_method') }}</th>
                <th class="p-3.5 w-36">{{ i18n.t('matrix.col_dataset') }}</th>
                <th class="p-3.5 w-48">{{ i18n.t('matrix.col_limitations') }}</th>
                <th class="p-3.5 w-48">{{ i18n.t('matrix.col_opportunity') }}</th>
                <th class="p-3.5 w-24 text-center">{{ i18n.isRtl() ? 'عملیات' : 'Actions' }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#13202E]">
              @for (paper of storage.activePapers(); track paper.id) {
                <tr class="hover:bg-[#0C121B] transition-colors">
                  <!-- Paper & Year -->
                  <td class="p-3.5 align-top">
                    <div class="font-bold text-white text-xs leading-snug">
                      {{ paper.title }}
                    </div>
                    <div class="text-[11px] text-[#7E9BB0] font-mono mt-1">
                      {{ paper.authors[0] || 'Author' }} et al. ({{ paper.year }})
                    </div>
                    <div class="mt-1.5 flex items-center gap-1.5">
                      <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#101A24] text-[#59D9FF] border border-[#1A2E42]">
                        {{ paper.venue }}
                      </span>
                    </div>
                  </td>

                  <!-- Problem -->
                  <td class="p-3.5 align-top text-[#A9E6FF]/90 leading-relaxed text-[11px]">
                    {{ paper.domain }}: {{ paper.abstract.slice(0, 130) }}...
                  </td>

                  <!-- Method -->
                  <td class="p-3.5 align-top">
                    <div class="text-xs text-white font-medium">
                      {{ paper.extractedMethods || 'Reasoning trace generation coupled with action execution.' }}
                    </div>
                  </td>

                  <!-- Dataset -->
                  <td class="p-3.5 align-top font-mono text-[11px] text-[#59D9FF]">
                    {{ paper.extractedDatasets || 'Benchmark evaluation suite' }}
                  </td>

                  <!-- Limitations -->
                  <td class="p-3.5 align-top text-amber-200/90 text-[11px] leading-relaxed">
                    {{ paper.extractedLimitations || 'Error cascades in sequential multi-hop steps.' }}
                  </td>

                  <!-- Research Opportunity -->
                  <td class="p-3.5 align-top text-emerald-300 text-[11px] leading-relaxed">
                    {{ paper.extractedOpportunities || 'Transactional state-tree with verified rollback.' }}
                  </td>

                  <!-- Actions: Edit & Inspect -->
                  <td class="p-3.5 align-top text-center">
                    <button
                      (click)="openEditModal(paper)"
                      class="px-2.5 py-1.5 rounded-lg bg-[#111A24] hover:bg-[#182736] border border-[#1E3347] text-[#59D9FF] text-xs font-medium transition-colors"
                      [title]="i18n.isRtl() ? 'ویرایش استخراج‌های این مقاله' : 'Edit Matrix Extractions'"
                    >
                      <mat-icon class="w-4 h-4 text-[16px]">edit</mat-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Matrix Extraction Modal -->
      @if (selectedPaper()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div class="w-full max-w-2xl bg-[#080B10] border border-[#172738] rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-[#152232] pb-3">
              <div>
                <h3 class="text-sm font-bold text-white">{{ selectedPaper()?.title }}</h3>
                <span class="text-[11px] font-mono text-[#7E9BB0]">{{ selectedPaper()?.venue }} ({{ selectedPaper()?.year }})</span>
              </div>
              <button (click)="selectedPaper.set(null)" class="text-[#7E9BB0] hover:text-white">
                <mat-icon class="w-5 h-5 text-[20px]">close</mat-icon>
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-white mb-1">
                  {{ i18n.t('matrix.col_method') }}
                </label>
                <textarea
                  [(ngModel)]="editMethods"
                  rows="2"
                  class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2.5 text-xs text-[#A9E6FF] focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label class="block font-semibold text-white mb-1">
                  {{ i18n.t('matrix.col_dataset') }}
                </label>
                <input
                  type="text"
                  [(ngModel)]="editDatasets"
                  class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2 text-xs text-[#A9E6FF] focus:outline-none"
                />
              </div>

              <div>
                <label class="block font-semibold text-amber-300 mb-1">
                  {{ i18n.t('matrix.col_limitations') }}
                </label>
                <textarea
                  [(ngModel)]="editLimitations"
                  rows="2"
                  class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2.5 text-xs text-amber-100 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label class="block font-semibold text-emerald-300 mb-1">
                  {{ i18n.t('matrix.col_opportunity') }}
                </label>
                <textarea
                  [(ngModel)]="editOpportunities"
                  rows="2"
                  class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2.5 text-xs text-emerald-100 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label class="block font-semibold text-white mb-1">
                  {{ i18n.isRtl() ? 'یادداشت‌های پژوهشگر و نقل‌قول‌ها:' : 'Researcher Notes & Extracted Quotes:' }}
                </label>
                <textarea
                  [(ngModel)]="editNotes"
                  rows="3"
                  placeholder="Paste important theorems, key equations, or experimental setups..."
                  class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2.5 text-xs text-[#A9E6FF] focus:outline-none"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-[#152232]">
              <button
                (click)="selectedPaper.set(null)"
                class="px-4 py-1.5 rounded-lg bg-[#111A24] text-xs font-medium text-[#7E9BB0] hover:text-white"
              >
                {{ i18n.t('btn.cancel') }}
              </button>
              <button
                (click)="saveMatrixEdits()"
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
export class MatrixView {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  selectedPaper = signal<Paper | null>(null);
  editMethods = '';
  editDatasets = '';
  editLimitations = '';
  editOpportunities = '';
  editNotes = '';

  openEditModal(paper: Paper): void {
    this.selectedPaper.set(paper);
    this.editMethods = paper.extractedMethods || '';
    this.editDatasets = paper.extractedDatasets || '';
    this.editLimitations = paper.extractedLimitations || '';
    this.editOpportunities = paper.extractedOpportunities || '';
    this.editNotes = paper.notes || '';
  }

  saveMatrixEdits(): void {
    const paper = this.selectedPaper();
    if (!paper) return;
    this.storage.updatePaperNotes(
      paper.id, 
      this.editNotes, 
      this.editMethods, 
      this.editDatasets, 
      this.editLimitations, 
      this.editOpportunities
    );
    this.selectedPaper.set(null);
  }

  exportMatrixCsv(): void {
    const papers = this.storage.activePapers();
    const headers = ['Paper', 'Year', 'Venue', 'DOI', 'Methodology', 'Dataset', 'Limitations', 'Research Opportunity'];
    const rows = papers.map(p => [
      `"${p.title.replace(/"/g, '""')}"`,
      p.year,
      `"${p.venue.replace(/"/g, '""')}"`,
      `"${p.doi || ''}"`,
      `"${(p.extractedMethods || '').replace(/"/g, '""')}"`,
      `"${(p.extractedDatasets || '').replace(/"/g, '""')}"`,
      `"${(p.extractedLimitations || '').replace(/"/g, '""')}"`,
      `"${(p.extractedOpportunities || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ALI_OS_Literature_Matrix_${this.storage.activeProgramId()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportAllBibtex(): void {
    const papers = this.storage.activePapers();
    const bibtexAll = papers.map(p => p.bibtex).join('\n\n');
    const blob = new Blob([bibtexAll], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ALI_OS_References_${this.storage.activeProgramId()}.bib`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
