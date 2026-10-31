import { ChangeDetectionStrategy, Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../services/i18n.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-export-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div class="w-full max-w-xl bg-[#080B10] border border-[#172738] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-[#152232] flex items-center justify-between bg-[#040609]">
          <div class="flex items-center gap-2">
            <mat-icon class="text-[#59D9FF] text-[20px] w-5 h-5">storage</mat-icon>
            <h3 class="text-sm font-bold text-white">
              {{ i18n.isRtl() ? 'مدیریت داده‌ها، پشتیبان‌گیری و بازیابی' : 'Workspace Data Storage & Backup' }}
            </h3>
          </div>
          <button (click)="close.emit()" class="text-[#7E9BB0] hover:text-white p-1 rounded-lg">
            <mat-icon class="w-5 h-5 text-[20px]">close</mat-icon>
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 space-y-4 text-xs">
          <!-- Status notice -->
          <div class="p-3 rounded-xl bg-[#0B121C] border border-[#192C40] flex items-center gap-3">
            <mat-icon class="text-emerald-400 text-[22px] w-5 h-5">check_circle</mat-icon>
            <div>
              <div class="font-bold text-white">{{ i18n.t('storage.saved_status') }}</div>
              <div class="text-[11px] text-[#7E9BB0]">
                {{ storage.papers().length }} {{ i18n.isRtl() ? 'مقاله' : 'papers' }} • 
                {{ storage.experiments().length }} {{ i18n.isRtl() ? 'آزمایش' : 'experiments' }} • 
                {{ storage.gaps().length }} {{ i18n.isRtl() ? 'شکاف پژوهشی' : 'research gaps' }}
              </div>
            </div>
          </div>

          <!-- Export Section -->
          <div class="p-4 rounded-xl bg-[#0A0F16] border border-[#152232] space-y-2">
            <h4 class="font-bold text-white text-xs flex items-center gap-1.5">
              <mat-icon class="text-[#59D9FF] text-[16px] w-4 h-4">download</mat-icon>
              <span>{{ i18n.t('storage.export_json') }}</span>
            </h4>
            <p class="text-[11px] text-[#7E9BB0]">
              {{ i18n.isRtl() ? 'دریافت نسخه کامل پشتیبان از تمامی مقالات، نتایج آزمایشگاهی، پیش‌نویس‌های مقاله و پایگاه دانش در قالب فایل JSON استاندارد.' : 'Download complete reproducible snapshot of all papers, empirical experiment logs, manuscript sections, and knowledge graphs.' }}
            </p>
            <button
              (click)="downloadJsonBackup()"
              class="px-4 py-2 rounded-lg bg-[#59D9FF]/15 hover:bg-[#59D9FF]/25 text-[#59D9FF] border border-[#59D9FF]/30 font-semibold transition-all flex items-center gap-1.5"
            >
              <mat-icon class="w-4 h-4 text-[16px]">file_download</mat-icon>
              <span>{{ i18n.isRtl() ? 'دانلود فایل پشتیبان (.json)' : 'Download Workspace JSON' }}</span>
            </button>
          </div>

          <!-- Import Section -->
          <div class="p-4 rounded-xl bg-[#0A0F16] border border-[#152232] space-y-2">
            <h4 class="font-bold text-white text-xs flex items-center gap-1.5">
              <mat-icon class="text-[#38EF7D] text-[16px] w-4 h-4">upload_file</mat-icon>
              <span>{{ i18n.t('storage.import_json') }}</span>
            </h4>
            <p class="text-[11px] text-[#7E9BB0]">
              {{ i18n.isRtl() ? 'بارگذاری فایل پشتیبان قبلی و بازیابی آنی تمامی آرتفکت‌ها و تنظیمات فضای پژوهش.' : 'Restore a previous workspace file with data validation checks.' }}
            </p>
            
            <input 
              #fileInput 
              type="file" 
              accept=".json" 
              class="hidden" 
              (change)="onFileSelected($event)"
            />

            <div class="flex items-center gap-2">
              <button
                (click)="fileInput.click()"
                class="px-4 py-2 rounded-lg bg-[#142332] hover:bg-[#1A2E42] text-[#A9E6FF] border border-[#1F364E] font-semibold transition-all flex items-center gap-1.5"
              >
                <mat-icon class="w-4 h-4 text-[16px]">folder_open</mat-icon>
                <span>{{ i18n.isRtl() ? 'انتخاب فایل JSON...' : 'Select JSON File...' }}</span>
              </button>

              @if (importStatus()) {
                <span class="text-[11px] font-mono" [class.text-emerald-400]="importSuccess()" [class.text-rose-400]="!importSuccess()">
                  {{ importStatus() }}
                </span>
              }
            </div>
          </div>

          <!-- Factory Reset Section -->
          <div class="p-3.5 rounded-xl bg-[#14080B] border border-[#3A141A] flex items-center justify-between">
            <div>
              <div class="font-bold text-rose-300 text-xs">{{ i18n.t('storage.reset') }}</div>
              <div class="text-[10px] text-rose-200/70">
                {{ i18n.isRtl() ? 'بازنشانی تمام داده‌ها به مقالات و آزمایش‌های پیش‌فرض تراز اول اولیه.' : 'Restore factory seminal papers, experiments, and default state.' }}
              </div>
            </div>
            <button
              (click)="resetDefaults()"
              class="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold transition-all"
            >
              {{ i18n.isRtl() ? 'بازنشانی' : 'Reset' }}
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t border-[#152232] bg-[#040609] flex justify-end">
          <button
            (click)="close.emit()"
            class="px-4 py-1.5 rounded-lg bg-[#111A24] text-white text-xs font-medium hover:bg-[#172534] transition-colors"
          >
            {{ i18n.t('btn.close') }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ExportModal {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  close = output<void>();

  importStatus = signal<string>('');
  importSuccess = signal<boolean>(false);

  downloadJsonBackup(): void {
    const jsonStr = this.storage.exportWorkspaceJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ALI_Research_OS_Workspace_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = this.storage.importWorkspaceJson(reader.result as string);
      if (result.success) {
        this.importSuccess.set(true);
        this.importStatus.set(this.i18n.isRtl() ? 'فضای پژوهشی با موفقیت بازیابی شد.' : 'Workspace successfully restored!');
      } else {
        this.importSuccess.set(false);
        this.importStatus.set(result.error || 'Failed to restore workspace.');
      }
    };
    reader.readAsText(file);
  }

  resetDefaults(): void {
    if (confirm(this.i18n.isRtl() ? 'آیا از بازنشانی داده‌ها به حالت پیش‌فرض اطمینان دارید؟' : 'Are you sure you want to reset all data to default?')) {
      this.storage.resetToFactoryDefaults();
      this.close.emit();
    }
  }
}
