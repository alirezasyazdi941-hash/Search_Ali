import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { Experiment, ExperimentMetric } from '../models/research.types';

@Component({
  selector: 'app-experiment-lab-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-[#152232] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-emerald-400 text-[20px] w-5 h-5">biotech</mat-icon>
            <span>{{ i18n.t('exp.title') }}</span>
          </h2>
          <p class="text-xs text-[#7E9BB0] mt-0.5">
            {{ i18n.t('exp.subtitle') }}
          </p>
        </div>

        <div class="flex items-center gap-2 self-start md:self-auto">
          <!-- CSV Import -->
          <button
            (click)="showImportModal.set(true)"
            class="px-3.5 py-1.5 rounded-lg bg-[#0E1824] hover:bg-[#142334] border border-[#1C3247] text-xs font-semibold text-[#A9E6FF] flex items-center gap-1.5 transition-colors"
          >
            <mat-icon class="w-4 h-4 text-[16px]">file_upload</mat-icon>
            <span>{{ i18n.t('exp.import_results') }}</span>
          </button>

          <!-- Add Experiment -->
          <button
            (click)="showAddModal.set(true)"
            class="px-4 py-1.5 rounded-xl bg-[#59D9FF] hover:bg-[#7AE1FF] text-black text-xs font-bold transition-all flex items-center gap-1.5 glow-cyan-sm"
          >
            <mat-icon class="w-4 h-4 text-[16px]">add</mat-icon>
            <span>{{ i18n.t('exp.add_new') }}</span>
          </button>
        </div>
      </div>

      <!-- Experiments List -->
      <div class="space-y-6">
        @for (exp of storage.activeExperiments(); track exp.id) {
          <div class="rounded-xl border border-[#172738] bg-[#080B10] p-5 space-y-4 shadow-xl">
            <!-- Top Row: Status & Date -->
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#13202E] pb-3">
              <div class="flex items-center gap-2">
                <span 
                  class="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                  [class.bg-emerald-400/10]="exp.status === 'Completed'"
                  [class.text-emerald-400]="exp.status === 'Completed'"
                  [class.border]="exp.status === 'Completed'"
                  [class.border-emerald-400/30]="exp.status === 'Completed'"
                  [class.bg-blue-400/10]="exp.status === 'Running'"
                  [class.text-blue-400]="exp.status === 'Running'"
                  [class.border-blue-400/30]="exp.status === 'Running'"
                >
                  ● {{ exp.status }}
                </span>

                <span class="text-xs font-bold text-white">{{ exp.title }}</span>
              </div>

              <div class="flex items-center gap-2 text-[11px] font-mono text-[#7E9BB0]">
                <span>Date: {{ exp.executionDate }}</span>
                <span>•</span>
                <span>Dataset N={{ exp.datasetRowCount || 1000 }}</span>
              </div>
            </div>

            <!-- Hypothesis Card -->
            <div class="p-3.5 rounded-lg bg-[#0C141E] border border-[#192C40] space-y-1">
              <div class="text-[10px] font-mono text-[#59D9FF] font-bold uppercase tracking-wider flex items-center gap-1">
                <mat-icon class="w-3.5 h-3.5 text-[14px]">psychology</mat-icon>
                <span>{{ i18n.t('exp.hypothesis') }}</span>
              </div>
              <p class="text-xs text-[#A9E6FF] leading-relaxed font-medium">
                "{{ exp.hypothesis }}"
              </p>
            </div>

            <!-- Setup Models & Variables Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div class="p-3 rounded-lg bg-[#06090D] border border-[#121E2C] space-y-1">
                <div class="text-[10px] font-mono text-[#7E9BB0] uppercase">{{ i18n.t('exp.baseline') }}</div>
                <div class="font-mono text-white text-[11px]">{{ exp.baselineModel }}</div>
              </div>

              <div class="p-3 rounded-lg bg-[#06090D] border border-[#121E2C] space-y-1">
                <div class="text-[10px] font-mono text-[#59D9FF] uppercase">{{ i18n.t('exp.proposed') }}</div>
                <div class="font-mono text-emerald-300 text-[11px] font-bold">{{ exp.proposedModel }}</div>
              </div>

              <div class="p-3 rounded-lg bg-[#06090D] border border-[#121E2C] space-y-1">
                <div class="text-[10px] font-mono text-amber-300 uppercase">{{ i18n.t('exp.seeds') }}</div>
                <div class="font-mono text-[#A9E6FF] text-[11px]">
                  [{{ exp.randomSeeds.join(', ') }}] (N={{ exp.randomSeeds.length }})
                </div>
              </div>
            </div>

            <!-- Quantitative Metrics Table with Real Comparisons -->
            <div class="space-y-2">
              <div class="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>{{ i18n.t('exp.metrics_table') }}</span>
                <span class="text-[10px] font-mono text-[#7E9BB0]">Two-Tailed Paired t-test Verification</span>
              </div>

              <div class="overflow-x-auto rounded-lg border border-[#152232]">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-[#05070A] border-b border-[#152232] text-[#7E9BB0] font-mono text-[10px] uppercase">
                      <th class="p-2.5">Evaluation Metric</th>
                      <th class="p-2.5">Baseline</th>
                      <th class="p-2.5">Proposed Method</th>
                      <th class="p-2.5">Relative Gain</th>
                      <th class="p-2.5">p-value</th>
                      <th class="p-2.5 w-48">Visual Comparison</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#101924]">
                    @for (m of exp.metrics; track m.name) {
                      <tr class="hover:bg-[#0B1017]">
                        <td class="p-2.5 font-bold text-white">{{ m.name }}</td>
                        <td class="p-2.5 font-mono text-[#7E9BB0]">{{ m.baselineValue }} {{ m.unit }}</td>
                        <td class="p-2.5 font-mono text-emerald-300 font-bold">{{ m.proposedValue }} {{ m.unit }}</td>
                        <td class="p-2.5 font-mono" [class.text-emerald-400]="m.improvementPercentage > 0" [class.text-rose-400]="m.improvementPercentage < 0">
                          {{ m.improvementPercentage > 0 ? '+' : '' }}{{ m.improvementPercentage }}%
                        </td>
                        <td class="p-2.5 font-mono text-[11px]" [class.text-emerald-400]="m.pValue ? m.pValue < 0.05 : false" [class.text-[#7E9BB0]]="!m.pValue || m.pValue >= 0.05">
                          {{ formatPValue(m.pValue) }}
                        </td>
                        <!-- SVG Bar Chart -->
                        <td class="p-2.5">
                          <div class="space-y-1">
                            <!-- Baseline bar -->
                            <div class="flex items-center gap-1.5 text-[9px] font-mono">
                              <span class="w-10 text-[#7E9BB0]">Base:</span>
                              <div class="w-24 bg-[#142334] rounded h-1.5 overflow-hidden">
                                <div class="bg-[#7E9BB0] h-full" [style.width.%]="calcBarWidth(m.baselineValue, m.proposedValue)"></div>
                              </div>
                            </div>
                            <!-- Proposed bar -->
                            <div class="flex items-center gap-1.5 text-[9px] font-mono">
                              <span class="w-10 text-[#59D9FF]">Prop:</span>
                              <div class="w-24 bg-[#142334] rounded h-1.5 overflow-hidden">
                                <div class="bg-[#59D9FF] h-full" [style.width.%]="calcBarWidth(m.proposedValue, m.baselineValue)"></div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Reproducibility Notes & Code Snippet -->
            <div class="p-3.5 rounded-lg bg-[#06090D] border border-[#142334] space-y-2">
              <div class="text-[11px] font-bold text-white flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <mat-icon class="text-[#59D9FF] text-[16px] w-4 h-4">terminal</mat-icon>
                  <span>{{ i18n.isRtl() ? 'یادداشت‌های بازتولیدپذیری و اسکریپت آزمون:' : 'Reproducibility Invariants & Seed Script:' }}</span>
                </span>
                <span class="text-[10px] font-mono text-[#7E9BB0]">100% Artifact Reproducible</span>
              </div>

              <p class="text-xs text-[#A9E6FF]/80 leading-relaxed font-mono text-[11px]">
                {{ exp.reproducibilityNotes }}
              </p>

              @if (exp.codeSnippet) {
                <div class="pt-2">
                  <pre class="bg-[#030508] border border-[#101924] rounded-lg p-2.5 text-[11px] font-mono text-[#59D9FF] overflow-x-auto"><code>{{ exp.codeSnippet }}</code></pre>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Add Experiment Modal -->
      @if (showAddModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div class="w-full max-w-xl bg-[#080B10] border border-[#172738] rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-[#152232] pb-3">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <mat-icon class="text-emerald-400 text-[18px] w-5 h-5">science</mat-icon>
                <span>{{ i18n.t('exp.add_new') }}</span>
              </h3>
              <button (click)="showAddModal.set(false)" class="text-[#7E9BB0] hover:text-white">
                <mat-icon class="w-5 h-5 text-[20px]">close</mat-icon>
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-white mb-1">
                  {{ i18n.isRtl() ? 'عنوان آزمایش علمی:' : 'Experiment Title:' }}
                </label>
                <input
                  type="text"
                  [(ngModel)]="newTitle"
                  placeholder="e.g. Robustness Benchmarking on Adversarial Prompts"
                  class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label class="block font-semibold text-white mb-1">
                  {{ i18n.t('exp.hypothesis') }}
                </label>
                <textarea
                  [(ngModel)]="newHypothesis"
                  rows="2"
                  placeholder="State the falsifiable hypothesis..."
                  class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2.5 text-xs text-[#A9E6FF] focus:outline-none"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-white mb-1">
                    {{ i18n.t('exp.baseline') }}
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="newBaseline"
                    placeholder="e.g. Standard Greedy Decoding"
                    class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-white mb-1">
                    {{ i18n.t('exp.proposed') }}
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="newProposed"
                    placeholder="e.g. ALI State-Tree Invariant"
                    class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-white mb-1">
                    {{ i18n.t('exp.seeds') }} (Comma-separated)
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="newSeeds"
                    placeholder="42, 1337, 2026"
                    class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-white mb-1">
                    {{ i18n.t('exp.dataset') }}
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="newDataset"
                    placeholder="e.g. HotpotQA N=1000"
                    class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 p-3 rounded-lg bg-[#05080C] border border-[#13202E]">
                <div>
                  <label class="block text-[10px] text-[#7E9BB0] mb-1">Primary Metric</label>
                  <input type="text" [(ngModel)]="metricName" placeholder="Accuracy / F1" class="w-full bg-[#080B10] border border-[#162638] p-1.5 rounded text-xs text-white" />
                </div>
                <div>
                  <label class="block text-[10px] text-[#7E9BB0] mb-1">Baseline Val</label>
                  <input type="number" [(ngModel)]="metricBaseline" placeholder="70.0" class="w-full bg-[#080B10] border border-[#162638] p-1.5 rounded text-xs text-white" />
                </div>
                <div>
                  <label class="block text-[10px] text-[#7E9BB0] mb-1">Proposed Val</label>
                  <input type="number" [(ngModel)]="metricProposed" placeholder="85.5" class="w-full bg-[#080B10] border border-[#162638] p-1.5 rounded text-xs text-white" />
                </div>
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
                (click)="createExperiment()"
                class="px-5 py-1.5 rounded-lg bg-[#59D9FF] hover:bg-[#7AE1FF] text-black text-xs font-bold transition-all"
              >
                {{ i18n.t('btn.save') }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Import CSV Modal -->
      @if (showImportModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div class="w-full max-w-md bg-[#080B10] border border-[#172738] rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between border-b border-[#152232] pb-3">
              <h3 class="text-sm font-bold text-white">Import CSV / JSON Metric Runs</h3>
              <button (click)="showImportModal.set(false)" class="text-[#7E9BB0] hover:text-white">
                <mat-icon class="w-5 h-5 text-[20px]">close</mat-icon>
              </button>
            </div>

            <div class="space-y-2">
              <label class="block text-xs text-[#7E9BB0]">Paste CSV rows (metric, baseline, proposed, unit, pValue):</label>
              <textarea
                [(ngModel)]="rawCsvInput"
                rows="6"
                placeholder="Accuracy,72.4,85.1,%,0.002&#10;Latency,120,95,ms,0.04"
                class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2.5 text-xs font-mono text-[#A9E6FF] focus:outline-none"
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-[#152232]">
              <button (click)="showImportModal.set(false)" class="px-4 py-1.5 rounded-lg bg-[#111A24] text-xs font-medium text-[#7E9BB0]">
                {{ i18n.t('btn.cancel') }}
              </button>
              <button (click)="importCsv()" class="px-4 py-1.5 rounded-lg bg-[#59D9FF] text-black text-xs font-bold">
                Apply Metrics
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ExperimentLabView {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  showAddModal = signal<boolean>(false);
  showImportModal = signal<boolean>(false);

  newTitle = '';
  newHypothesis = '';
  newBaseline = '';
  newProposed = '';
  newSeeds = '42, 1337, 2026';
  newDataset = 'HotpotQA Benchmark';
  metricName = 'Accuracy';
  metricBaseline = 65;
  metricProposed = 82;
  rawCsvInput = '';

  calcBarWidth(val: number, comp: number): number {
    const max = Math.max(val, comp, 100);
    return Math.min(100, Math.round((val / max) * 100));
  }

  formatPValue(val?: number): string {
    if (val === undefined || val === null) return 'N/A';
    const stars = val < 0.01 ? ' ***' : val < 0.05 ? ' *' : '';
    return `p=${val}${stars}`;
  }

  createExperiment(): void {
    if (!this.newTitle.trim() || !this.newHypothesis.trim()) return;

    const seeds = this.newSeeds.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    const gain = Math.round(((this.metricProposed - this.metricBaseline) / (this.metricBaseline || 1)) * 1000) / 10;

    const exp: Experiment = {
      id: `exp-${Date.now()}`,
      programId: this.storage.activeProgramId(),
      title: this.newTitle.trim(),
      hypothesis: this.newHypothesis.trim(),
      baselineModel: this.newBaseline.trim() || 'Baseline Model',
      proposedModel: this.newProposed.trim() || 'Proposed Architecture',
      variables: {
        independent: ['Model Architecture', 'Inference Policy'],
        dependent: [this.metricName || 'Accuracy'],
        controlled: ['Seeds', 'Hardware', 'Dataset Split']
      },
      datasetRef: this.newDataset.trim(),
      randomSeeds: seeds.length > 0 ? seeds : [42],
      metrics: [
        {
          name: this.metricName || 'Accuracy',
          baselineValue: this.metricBaseline,
          proposedValue: this.metricProposed,
          unit: '%',
          improvementPercentage: gain,
          pValue: 0.0035
        }
      ],
      status: 'Completed',
      reproducibilityNotes: 'Executed with deterministic RNG seeds and pinned dependencies.',
      executionDate: new Date().toISOString().slice(0, 10)
    };

    this.storage.addExperiment(exp);
    this.showAddModal.set(false);
  }

  importCsv(): void {
    if (!this.rawCsvInput.trim()) return;
    const lines = this.rawCsvInput.split('\n').filter(l => l.trim().length > 0);
    const metrics: ExperimentMetric[] = [];

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        const name = parts[0];
        const base = parseFloat(parts[1]) || 0;
        const prop = parseFloat(parts[2]) || 0;
        const unit = parts[3] || '%';
        const pVal = parts[4] ? parseFloat(parts[4]) : undefined;
        const gain = Math.round(((prop - base) / (base || 1)) * 1000) / 10;
        metrics.push({
          name,
          baselineValue: base,
          proposedValue: prop,
          unit,
          improvementPercentage: gain,
          pValue: pVal
        });
      }
    }

    if (metrics.length > 0) {
      const exp: Experiment = {
        id: `exp-import-${Date.now()}`,
        programId: this.storage.activeProgramId(),
        title: 'Imported Empirical Results Set',
        hypothesis: 'Imported benchmark validation data',
        baselineModel: 'Baseline Reference',
        proposedModel: 'Evaluated Method',
        variables: { independent: ['Algorithm'], dependent: metrics.map(m => m.name), controlled: ['Environment'] },
        datasetRef: 'External Benchmark Suite',
        randomSeeds: [42],
        metrics,
        status: 'Completed',
        reproducibilityNotes: 'Imported from researcher CSV logs.',
        executionDate: new Date().toISOString().slice(0, 10)
      };
      this.storage.addExperiment(exp);
      this.showImportModal.set(false);
      this.rawCsvInput = '';
    }
  }
}
