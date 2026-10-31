import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { LearningLesson } from '../models/research.types';

@Component({
  selector: 'app-learning-path-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-[#152232] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-cyan-400 text-[20px] w-5 h-5">school</mat-icon>
            <span>{{ i18n.t('learn.title') }}</span>
          </h2>
          <p class="text-xs text-[#7E9BB0] mt-0.5">
            {{ i18n.t('learn.subtitle') }}
          </p>
        </div>

        <div class="flex items-center gap-2 text-xs font-mono self-start md:self-auto bg-[#0E1724] px-3 py-1.5 rounded-xl border border-[#1B2F44]">
          <span class="text-[#7E9BB0]">Mastery:</span>
          <span class="text-[#59D9FF] font-bold">{{ completedCount() }} / {{ storage.lessons().length }}</span>
          <span class="text-emerald-400 font-bold">({{ masteryPercentage() }}%)</span>
        </div>
      </div>

      <!-- Modules Selector Tabs -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        @for (lesson of storage.lessons(); track lesson.id; let idx = $index) {
          <div 
            (click)="selectedLessonId.set(lesson.id)"
            class="p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between"
            [class.border-[#59D9FF]]="selectedLessonId() === lesson.id"
            [class.bg-[#0D1826]]="selectedLessonId() === lesson.id"
            [class.glow-cyan-sm]="selectedLessonId() === lesson.id"
            [class.border-[#172738]]="selectedLessonId() !== lesson.id"
            [class.bg-[#080B10]]="selectedLessonId() !== lesson.id"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101A24] text-[#59D9FF] border border-[#16293C]">
                  MODULE {{ lesson.moduleNumber }}: {{ lesson.category }}
                </span>

                @if (lesson.completed) {
                  <span class="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <mat-icon class="w-3.5 h-3.5 text-[14px]">check_circle</mat-icon>
                    <span>Mastered</span>
                  </span>
                }
              </div>

              <h4 class="text-xs font-bold text-white line-clamp-2">
                {{ i18n.isRtl() ? lesson.titleFa : lesson.titleEn }}
              </h4>

              <p class="text-[11px] text-[#A9E6FF]/70 line-clamp-2 mt-1.5">
                {{ i18n.isRtl() ? lesson.objectiveFa : lesson.objectiveEn }}
              </p>
            </div>

            <div class="pt-3 border-t border-[#121E2C] mt-3 flex items-center justify-between text-[10px] font-mono text-[#7E9BB0]">
              <span>{{ lesson.references.length }} Core References</span>
              <span class="text-[#59D9FF] font-bold">Inspect Module &rarr;</span>
            </div>
          </div>
        }
      </div>

      <!-- Active Lesson Deep View -->
      @if (currentLesson()) {
        <div class="p-6 rounded-2xl bg-[#080B10] border border-[#172738] space-y-5 animate-fade-in">
          <!-- Lesson Title & Mastery Toggle -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#142334] pb-4">
            <div>
              <div class="text-[11px] font-mono text-[#59D9FF] mb-1">
                MODULE {{ currentLesson()!.moduleNumber }} • {{ currentLesson()!.category }}
              </div>
              <h3 class="text-base font-bold text-white">
                {{ i18n.isRtl() ? currentLesson()!.titleFa : currentLesson()!.titleEn }}
              </h3>
            </div>

            <button
              type="button"
              (click)="toggleMastery(currentLesson()!.id)"
              class="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
              [class.bg-emerald-400]="currentLesson()!.completed"
              [class.text-black]="currentLesson()!.completed"
              [class.bg-[#101B27]]="!currentLesson()!.completed"
              [class.text-[#59D9FF]]="!currentLesson()!.completed"
              [class.border]="!currentLesson()!.completed"
              [class.border-[#59D9FF]/30]="!currentLesson()!.completed"
            >
              <mat-icon class="w-4 h-4 text-[18px]">
                {{ currentLesson()!.completed ? 'check_circle' : 'radio_button_unchecked' }}
              </mat-icon>
              <span>{{ currentLesson()!.completed ? (i18n.isRtl() ? 'تسلط بر مبحث ثبت شد' : 'Topic Mastered') : i18n.t('learn.mark_completed') }}</span>
            </button>
          </div>

          <!-- Learning Objective Box -->
          <div class="p-3.5 rounded-xl bg-[#0C141E] border border-[#192C40] space-y-1">
            <div class="text-[11px] font-bold text-[#59D9FF] flex items-center gap-1 font-mono uppercase">
              <mat-icon class="w-3.5 h-3.5 text-[16px]">flag</mat-icon>
              <span>{{ i18n.isRtl() ? 'هدف آموزشی اصلی:' : 'Core Research Objective:' }}</span>
            </div>
            <p class="text-xs text-[#A9E6FF] leading-relaxed">
              {{ i18n.isRtl() ? currentLesson()!.objectiveFa : currentLesson()!.objectiveEn }}
            </p>
          </div>

          <!-- Theoretical Explanation -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <mat-icon class="text-[#59D9FF] text-[16px] w-4 h-4">menu_book</mat-icon>
              <span>{{ i18n.isRtl() ? 'تشریح مبانی نظری و روش‌شناختی' : 'Theoretical Foundations & Methods' }}</span>
            </h4>
            <p class="text-xs text-[#A9E6FF]/90 leading-relaxed font-sans">
              {{ i18n.isRtl() ? currentLesson()!.contentFa : currentLesson()!.contentEn }}
            </p>
          </div>

          <!-- Mathematical Foundation Box -->
          <div class="p-4 rounded-xl bg-[#05080C] border border-[#152434] space-y-2">
            <div class="text-xs font-bold text-amber-300 font-mono uppercase flex items-center gap-1.5">
              <mat-icon class="w-4 h-4 text-[16px]">functions</mat-icon>
              <span>{{ i18n.t('learn.math_foundation') }}</span>
            </div>
            <pre class="bg-[#030406] p-3 rounded-lg border border-[#101924] text-xs font-mono text-cyan-300 overflow-x-auto"><code>{{ currentLesson()!.mathFoundation }}</code></pre>
          </div>

          <!-- Practical Implementation Example -->
          <div class="p-4 rounded-xl bg-[#05080C] border border-[#152434] space-y-2">
            <div class="text-xs font-bold text-emerald-300 font-mono uppercase flex items-center gap-1.5">
              <mat-icon class="w-4 h-4 text-[16px]">code</mat-icon>
              <span>{{ i18n.t('learn.example') }}</span>
            </div>
            <p class="text-xs text-[#A9E6FF]/80 leading-relaxed font-mono text-[11px]">
              {{ currentLesson()!.practicalExample }}
            </p>
          </div>

          <!-- Exercise & Self-Audit -->
          <div class="p-4 rounded-xl bg-[#0E1520] border border-[#20364C] space-y-2">
            <div class="text-xs font-bold text-violet-300 font-mono uppercase flex items-center gap-1.5">
              <mat-icon class="w-4 h-4 text-[16px]">assignment</mat-icon>
              <span>{{ i18n.t('learn.exercise') }}</span>
            </div>
            <p class="text-xs text-white leading-relaxed">
              {{ i18n.isRtl() ? currentLesson()!.exerciseFa : currentLesson()!.exerciseEn }}
            </p>
          </div>

          <!-- Academic References -->
          <div class="pt-3 border-t border-[#142334] text-xs space-y-1">
            <div class="text-[10px] font-mono text-[#7E9BB0] uppercase">Canonical References:</div>
            <ul class="list-disc list-inside space-y-1 text-[#7E9BB0] text-[11px] font-mono">
              @for (ref of currentLesson()!.references; track ref) {
                <li>{{ ref }}</li>
              }
            </ul>
          </div>
        </div>
      }
    </div>
  `
})
export class LearningPathView {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  selectedLessonId = signal<string>(this.storage.lessons()[0]?.id || 'lesson-01');

  currentLesson = () => {
    return this.storage.lessons().find(l => l.id === this.selectedLessonId()) || this.storage.lessons()[0];
  };

  completedCount = () => {
    return this.storage.lessons().filter(l => l.completed).length;
  };

  masteryPercentage = () => {
    const total = this.storage.lessons().length || 1;
    return Math.round((this.completedCount() / total) * 100);
  };

  toggleMastery(id: string): void {
    this.storage.toggleLessonCompleted(id);
  }
}
