import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './components/header';
import { Sidebar, ActiveTab } from './components/sidebar';
import { CommandCenter } from './components/command-center';
import { ProgramsView } from './components/programs-view';
import { DiscoveryView } from './components/discovery-view';
import { MatrixView } from './components/matrix-view';
import { ComparisonView } from './components/comparison-view';
import { GapAnalyzerView } from './components/gap-analyzer-view';
import { ExperimentLabView } from './components/experiment-lab-view';
import { WritingStudioView } from './components/writing-studio-view';
import { ProjectPlanningView } from './components/project-planning-view';
import { LearningPathView } from './components/learning-path-view';
import { KnowledgeGraphView } from './components/knowledge-graph-view';
import { PublicationReadinessView } from './components/publication-readiness-view';
import { AssistantView } from './components/assistant-view';
import { OnboardingModal } from './components/onboarding-modal';
import { ExportModal } from './components/export-modal';
import { I18nService } from './services/i18n.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    Header,
    Sidebar,
    CommandCenter,
    ProgramsView,
    DiscoveryView,
    MatrixView,
    ComparisonView,
    GapAnalyzerView,
    ExperimentLabView,
    WritingStudioView,
    ProjectPlanningView,
    LearningPathView,
    KnowledgeGraphView,
    PublicationReadinessView,
    AssistantView,
    OnboardingModal,
    ExportModal
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  i18n = inject(I18nService);
  storage = inject(StorageService);

  activeTab = signal<ActiveTab>('command_center');
  showOnboarding = signal<boolean>(false);
  showExportModal = signal<boolean>(false);

  constructor() {
    // If onboarding not completed, trigger wizard on launch
    if (!this.storage.userProfile().onboardingCompleted) {
      this.showOnboarding.set(true);
    }
  }

  setTab(tab: string): void {
    this.activeTab.set(tab as ActiveTab);
  }
}
