import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';
import { ResearchTask } from '../models/research.types';

@Component({
  selector: 'app-project-planning-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-[#152232] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <mat-icon class="text-blue-400 text-[20px] w-5 h-5">view_kanban</mat-icon>
            <span>{{ i18n.t('pm.title') }}</span>
          </h2>
          <p class="text-xs text-[#7E9BB0] mt-0.5">
            {{ i18n.isRtl() ? 'بورد کانبان، گانت مراحل، پایش ساعات پژوهش و مدیریت ضرب‌الاجل‌های سابمیت مقاله' : 'Kanban sprint boards, timeline milestones, hourly tracking and publication deadlines' }}
          </p>
        </div>

        <button
          (click)="showAddTaskModal.set(true)"
          class="px-4 py-2 rounded-xl bg-[#59D9FF] hover:bg-[#7AE1FF] text-black text-xs font-bold transition-all flex items-center gap-1.5 self-start md:self-auto glow-cyan-sm"
        >
          <mat-icon class="w-4 h-4 text-[16px]">add_task</mat-icon>
          <span>{{ i18n.t('pm.add_task') }}</span>
        </button>
      </div>

      <!-- Weekly Progress Summary Bar -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="p-3 rounded-xl bg-[#080B10] border border-[#172738] flex items-center justify-between">
          <div>
            <div class="text-[10px] text-[#7E9BB0] font-mono">TOTAL ESTIMATED</div>
            <div class="text-lg font-bold font-mono text-white">{{ totalEstimatedHours() }} hrs</div>
          </div>
          <mat-icon class="text-[#59D9FF] text-[20px] w-5 h-5">schedule</mat-icon>
        </div>

        <div class="p-3 rounded-xl bg-[#080B10] border border-[#172738] flex items-center justify-between">
          <div>
            <div class="text-[10px] text-[#7E9BB0] font-mono">HOURS LOGGED</div>
            <div class="text-lg font-bold font-mono text-emerald-300">{{ totalCompletedHours() }} hrs</div>
          </div>
          <mat-icon class="text-emerald-400 text-[20px] w-5 h-5">check_circle</mat-icon>
        </div>

        <div class="p-3 rounded-xl bg-[#080B10] border border-[#172738] flex items-center justify-between">
          <div>
            <div class="text-[10px] text-[#7E9BB0] font-mono">TASKS COMPLETED</div>
            <div class="text-lg font-bold font-mono text-white">{{ completedTasksCount() }} / {{ storage.activeTasks().length }}</div>
          </div>
          <mat-icon class="text-cyan-400 text-[20px] w-5 h-5">task_alt</mat-icon>
        </div>

        <div class="p-3 rounded-xl bg-[#080B10] border border-[#172738] flex items-center justify-between">
          <div>
            <div class="text-[10px] text-[#7E9BB0] font-mono">SPRINT HEALTH</div>
            <div class="text-lg font-bold font-mono text-emerald-400">92% On Track</div>
          </div>
          <mat-icon class="text-amber-400 text-[20px] w-5 h-5">speed</mat-icon>
        </div>
      </div>

      <!-- Kanban Columns (4 columns: To Do, In Progress, Peer Review, Done) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (col of columns; track col.status) {
          <div class="rounded-xl bg-[#06090D] border border-[#142232] p-3 flex flex-col min-h-[420px]">
            <!-- Column Header -->
            <div class="flex items-center justify-between pb-2.5 border-b border-[#13202E] mb-3">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full" [style.backgroundColor]="col.color"></span>
                <span class="text-xs font-bold text-white uppercase font-mono">{{ i18n.t(col.labelKey) }}</span>
              </div>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0D1520] text-[#7E9BB0] border border-[#172636]">
                {{ getTasksByStatus(col.status).length }}
              </span>
            </div>

            <!-- Task Cards -->
            <div class="space-y-2.5 flex-1">
              @for (task of getTasksByStatus(col.status); track task.id) {
                <div class="p-3 rounded-lg bg-[#090D14] border border-[#16273A] hover:border-[#223F5D] transition-all space-y-2.5">
                  <div class="flex items-center justify-between text-[10px] font-mono">
                    <span 
                      class="px-1.5 py-0.5 rounded font-bold"
                      [class.bg-purple-400/10]="task.type === 'Reading'"
                      [class.text-purple-300]="task.type === 'Reading'"
                      [class.bg-blue-400/10]="task.type === 'Writing'"
                      [class.text-blue-300]="task.type === 'Writing'"
                      [class.bg-emerald-400/10]="task.type === 'Experiment'"
                      [class.text-emerald-300]="task.type === 'Experiment'"
                      [class.bg-amber-400/10]="task.type === 'Methodology'"
                      [class.text-amber-300]="task.type === 'Methodology'"
                    >
                      {{ task.type }}
                    </span>

                    <span 
                      class="px-1.5 py-0.5 rounded uppercase"
                      [class.text-rose-400]="task.priority === 'high'"
                      [class.text-amber-400]="task.priority === 'medium'"
                      [class.text-[#7E9BB0]="task.priority === 'low'"
                    >
                      {{ task.priority }}
                    </span>
                  </div>

                  <h4 class="text-xs font-bold text-white leading-snug">
                    {{ task.title }}
                  </h4>

                  @if (task.notes) {
                    <p class="text-[11px] text-[#A9E6FF]/80 line-clamp-2">
                      {{ task.notes }}
                    </p>
                  }

                  <div class="flex items-center justify-between pt-2 border-t border-[#121E2C] text-[10px] font-mono text-[#7E9BB0]">
                    <span class="flex items-center gap-1">
                      <mat-icon class="w-3 h-3 text-[12px]">calendar_today</mat-icon>
                      <span>{{ task.dueDate }}</span>
                    </span>

                    <span>{{ task.estimatedHours }}h</span>
                  </div>

                  <!-- Quick Status Advance Buttons -->
                  <div class="flex items-center justify-end gap-1 pt-1">
                    @if (task.status !== 'todo') {
                      <button 
                        (click)="changeTaskStatus(task.id, prevStatus(task.status))"
                        class="p-1 rounded hover:bg-[#121B27] text-[#7E9BB0] hover:text-white"
                        title="Move Left"
                      >
                        <mat-icon class="w-3.5 h-3.5 text-[14px]">arrow_back</mat-icon>
                      </button>
                    }
                    @if (task.status !== 'done') {
                      <button 
                        (click)="changeTaskStatus(task.id, nextStatus(task.status))"
                        class="p-1 rounded hover:bg-[#121B27] text-[#59D9FF]"
                        title="Advance Task"
                      >
                        <mat-icon class="w-3.5 h-3.5 text-[14px]">arrow_forward</mat-icon>
                      </button>
                    }
                    <button 
                      (click)="deleteTask(task.id)"
                      class="p-1 rounded hover:bg-[#121B27] text-rose-400 hover:text-rose-300"
                      title="Delete"
                    >
                      <mat-icon class="w-3.5 h-3.5 text-[14px]">delete</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Add Task Modal -->
      @if (showAddTaskModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div class="w-full max-w-md bg-[#080B10] border border-[#172738] rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between border-b border-[#152232] pb-3">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <mat-icon class="text-blue-400 text-[18px] w-5 h-5">add_task</mat-icon>
                <span>{{ i18n.t('pm.add_task') }}</span>
              </h3>
              <button (click)="showAddTaskModal.set(false)" class="text-[#7E9BB0] hover:text-white">
                <mat-icon class="w-5 h-5 text-[20px]">close</mat-icon>
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-semibold text-white mb-1">Task Title:</label>
                <input
                  type="text"
                  [(ngModel)]="newTitle"
                  placeholder="e.g. Conduct ablation on checkpointing rollback frequency"
                  class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-white mb-1">Type:</label>
                  <select
                    [(ngModel)]="newType"
                    class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Reading">Reading (مطالعه متون)</option>
                    <option value="Methodology">Methodology (روش‌شناسی)</option>
                    <option value="Experiment">Experiment (آزمایشگاه)</option>
                    <option value="Writing">Writing (نگارش مقاله)</option>
                    <option value="Milestone">Milestone (مایلستون)</option>
                  </select>
                </div>

                <div>
                  <label class="block font-semibold text-white mb-1">Priority:</label>
                  <select
                    [(ngModel)]="newPriority"
                    class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="high">High (فوری)</option>
                    <option value="medium">Medium (معمولی)</option>
                    <option value="low">Low (پایین)</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-white mb-1">Due Date:</label>
                  <input
                    type="date"
                    [(ngModel)]="newDueDate"
                    class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-white mb-1">Est. Hours:</label>
                  <input
                    type="number"
                    [(ngModel)]="newHours"
                    class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block font-semibold text-white mb-1">Scientific Notes & Criteria:</label>
                <textarea
                  [(ngModel)]="newNotes"
                  rows="2"
                  placeholder="Specific requirements or benchmark splits..."
                  class="w-full bg-[#05080C] border border-[#162638] focus:border-[#59D9FF] rounded-xl p-2.5 text-xs text-[#A9E6FF] focus:outline-none"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-[#152232]">
              <button
                (click)="showAddTaskModal.set(false)"
                class="px-4 py-1.5 rounded-lg bg-[#111A24] text-xs font-medium text-[#7E9BB0]"
              >
                {{ i18n.t('btn.cancel') }}
              </button>
              <button
                (click)="createTask()"
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
export class ProjectPlanningView {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  showAddTaskModal = signal<boolean>(false);

  newTitle = '';
  newType: ResearchTask['type'] = 'Experiment';
  newPriority: ResearchTask['priority'] = 'high';
  newDueDate = '2026-11-12';
  newHours = 8;
  newNotes = '';

  readonly columns = [
    { status: 'todo' as const, labelKey: 'pm.todo', color: '#7E9BB0' },
    { status: 'in_progress' as const, labelKey: 'pm.in_progress', color: '#59D9FF' },
    { status: 'review' as const, labelKey: 'pm.review', color: '#A29BFE' },
    { status: 'done' as const, labelKey: 'pm.done', color: '#38EF7D' }
  ];

  getTasksByStatus(status: ResearchTask['status']): ResearchTask[] {
    return this.storage.activeTasks().filter(t => t.status === status);
  }

  totalEstimatedHours(): number {
    return this.storage.activeTasks().reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  }

  totalCompletedHours(): number {
    return this.storage.activeTasks().reduce((acc, t) => acc + (t.completedHours || (t.status === 'done' ? t.estimatedHours : 0)), 0);
  }

  completedTasksCount(): number {
    return this.storage.activeTasks().filter(t => t.status === 'done').length;
  }

  changeTaskStatus(id: string, status: ResearchTask['status']): void {
    this.storage.updateTaskStatus(id, status);
  }

  nextStatus(current: ResearchTask['status']): ResearchTask['status'] {
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'review';
    if (current === 'review') return 'done';
    return 'done';
  }

  prevStatus(current: ResearchTask['status']): ResearchTask['status'] {
    if (current === 'done') return 'review';
    if (current === 'review') return 'in_progress';
    if (current === 'in_progress') return 'todo';
    return 'todo';
  }

  createTask(): void {
    if (!this.newTitle.trim()) return;
    const task: ResearchTask = {
      id: `task-${Date.now()}`,
      programId: this.storage.activeProgramId(),
      title: this.newTitle.trim(),
      type: this.newType,
      status: 'todo',
      priority: this.newPriority,
      dueDate: this.newDueDate,
      estimatedHours: this.newHours,
      completedHours: 0,
      notes: this.newNotes.trim()
    };
    this.storage.addTask(task);
    this.showAddTaskModal.set(false);
    this.newTitle = '';
    this.newNotes = '';
  }

  deleteTask(id: string): void {
    this.storage.removeTask(id);
  }
}
