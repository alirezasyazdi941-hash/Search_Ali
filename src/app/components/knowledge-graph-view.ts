import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { KnowledgeNode } from '../models/research.types';

@Component({
  selector: 'app-knowledge-graph-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-[#152232] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-[#59D9FF] text-[20px] w-5 h-5">hub</mat-icon>
            <span>{{ i18n.t('kg.title') }}</span>
          </h2>
          <p class="text-xs text-[#7E9BB0] mt-0.5">
            {{ i18n.t('kg.subtitle') }}
          </p>
        </div>

        <!-- Filter Tags -->
        <div class="flex items-center gap-1.5 overflow-x-auto self-start md:self-auto text-xs pb-1 max-w-full">
          @for (type of nodeTypes; track type) {
            <button
              (click)="selectedType.set(type)"
              class="px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors shrink-0"
              [class.bg-[#59D9FF]/15]="selectedType() === type"
              [class.text-[#59D9FF]]="selectedType() === type"
              [class.border]="selectedType() === type"
              [class.border-[#59D9FF]/30]="selectedType() === type"
              [class.bg-[#0B1017]]="selectedType() !== type"
              [class.text-[#7E9BB0]]="selectedType() !== type"
            >
              {{ i18n.t('kg.type.' + type) }}
            </button>
          }
        </div>
      </div>

      <!-- Graph & Details Split Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Interactive Node Visual Field (8 cols) -->
        <div class="lg:col-span-8 bg-[#05080C] border border-[#172738] rounded-2xl p-4 sm:p-6 min-h-[460px] relative overflow-hidden scientific-grid flex flex-col justify-between">
          <div class="text-[10px] font-mono text-[#7E9BB0] uppercase flex flex-wrap items-center justify-between gap-2">
            <span>{{ i18n.t('kg.topology_network') }}</span>
            <span>{{ filteredNodes().length }} {{ i18n.t('kg.nodes_in_scope') }}</span>
          </div>

          <!-- Nodes Cloud with connections -->
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 my-auto py-6">
            @for (node of filteredNodes(); track node.id) {
              <div 
                (click)="activeNodeId.set(node.id)"
                class="p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between"
                [class.border-[#59D9FF]]="activeNodeId() === node.id"
                [class.bg-[#0F1B27]]="activeNodeId() === node.id"
                [class.glow-cyan-sm]="activeNodeId() === node.id"
                [class.border-[#17283B]]="activeNodeId() !== node.id"
                [class.bg-[#080E16]/80]="activeNodeId() !== node.id"
              >
                <div>
                  <div class="flex items-center justify-between mb-1.5 gap-1">
                    <span 
                      class="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0"
                      [class.bg-emerald-400/10]="node.type === 'Paper'"
                      [class.text-emerald-400]="node.type === 'Paper'"
                      [class.bg-cyan-400/10]="node.type === 'Concept'"
                      [class.text-cyan-400]="node.type === 'Concept'"
                      [class.bg-purple-400/10]="node.type === 'Method'"
                      [class.text-purple-400]="node.type === 'Method'"
                      [class.bg-amber-400/10]="node.type === 'Hypothesis'"
                      [class.text-amber-400]="node.type === 'Hypothesis'"
                      [class.bg-blue-400/10]="node.type === 'Dataset'"
                      [class.text-blue-400]="node.type === 'Dataset'"
                    >
                      {{ i18n.t('kg.type.' + node.type) }}
                    </span>

                    <span class="text-[9px] font-mono text-[#7E9BB0] shrink-0">
                      {{ node.connections.length }} {{ i18n.t('kg.edges') }}
                    </span>
                  </div>

                  <h4 class="text-xs font-bold text-white leading-tight">
                    {{ getNodeDisplayLabel(node) }}
                  </h4>
                </div>

                <div class="text-[10px] text-[#A9E6FF]/70 line-clamp-2 mt-2 leading-relaxed">
                  {{ getNodeDisplayDetails(node) }}
                </div>
              </div>
            }
          </div>

          <div class="text-[10px] font-mono text-[#4B6375] flex flex-wrap items-center justify-between pt-2 border-t border-[#121E2C] gap-2">
            <span>{{ i18n.t('kg.click_instruction') }}</span>
            <span>{{ i18n.t('kg.dag_label') }}</span>
          </div>
        </div>

        <!-- Node Deep Inspection Drawer (4 cols) -->
        <div class="lg:col-span-4 bg-[#080B10] border border-[#172738] rounded-2xl p-4 flex flex-col justify-between space-y-4">
          @if (activeNode()) {
            <div class="space-y-4">
              <div class="border-b border-[#142334] pb-3">
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101A24] text-[#59D9FF] border border-[#17293C]">
                  {{ i18n.t('kg.type.' + activeNode()!.type) }} {{ i18n.t('kg.entity_tag') }}
                </span>
                <h3 class="text-sm font-bold text-white mt-1.5">
                  {{ getNodeDisplayLabel(activeNode()!) }}
                </h3>
              </div>

              <div class="space-y-1">
                <div class="text-[10px] font-mono text-[#7E9BB0] uppercase">{{ i18n.t('kg.spec_label') }}</div>
                <p class="text-xs text-[#A9E6FF]/90 leading-relaxed font-sans">
                  {{ getNodeDisplayDetails(activeNode()!) }}
                </p>
              </div>

              <!-- Connected Outgoing/Incoming Edges -->
              <div class="space-y-2">
                <div class="text-[10px] font-mono text-[#59D9FF] uppercase flex items-center gap-1">
                  <mat-icon class="w-3.5 h-3.5 text-[14px]">alt_route</mat-icon>
                  <span>{{ i18n.t('kg.backlinks_label') }}</span>
                </div>

                <div class="space-y-1.5">
                  @for (connId of activeNode()!.connections; track connId) {
                    <div 
                      (click)="activeNodeId.set(connId)"
                      class="p-2 rounded-lg bg-[#05080C] border border-[#152434] hover:border-[#59D9FF] cursor-pointer text-xs text-white transition-colors flex items-center justify-between"
                    >
                      <span class="truncate font-mono text-[11px]">{{ getNodeDisplayLabelById(connId) }}</span>
                      <mat-icon class="w-3 h-3 text-[12px] text-[#7E9BB0]">link</mat-icon>
                    </div>
                  }
                </div>
              </div>
            </div>
          } @else {
            <div class="text-center py-12 text-[#7E9BB0] text-xs">
              {{ i18n.t('kg.select_empty') }}
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class KnowledgeGraphView {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  readonly nodeTypes = ['All', 'Paper', 'Concept', 'Method', 'Dataset', 'Experiment', 'Hypothesis'];
  selectedType = signal<string>('All');
  activeNodeId = signal<string>('node-method-state-tree');

  filteredNodes = () => {
    const all = this.storage.knowledgeNodes();
    const type = this.selectedType();
    if (type === 'All') return all;
    return all.filter(n => n.type === type);
  };

  activeNode = () => {
    return this.storage.knowledgeNodes().find(n => n.id === this.activeNodeId()) || this.storage.knowledgeNodes()[0];
  };

  getNodeDisplayLabel(node: KnowledgeNode): string {
    if (this.i18n.currentLang() === 'fa' && node.labelFa) {
      return node.labelFa;
    }
    return node.label;
  }

  getNodeDisplayDetails(node: KnowledgeNode): string {
    if (this.i18n.currentLang() === 'fa' && node.detailsFa) {
      return node.detailsFa;
    }
    return node.details;
  }

  getNodeDisplayLabelById(id: string): string {
    const found = this.storage.knowledgeNodes().find(n => n.id === id);
    if (!found) return id;
    return this.getNodeDisplayLabel(found);
  }
}
