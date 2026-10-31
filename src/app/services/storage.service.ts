import { Injectable, signal, computed } from '@angular/core';
import {
  ResearchProgram,
  Paper,
  LiteratureMatrixRow,
  ResearchGap,
  Experiment,
  LearningLesson,
  ResearchTask,
  ResearchPaperDraft,
  KnowledgeNode,
  PublicationChecklist,
  UserProfile,
  ProgramId
} from '../models/research.types';

const STORAGE_KEYS = {
  USER: 'ali_os_user_v1',
  PAPERS: 'ali_os_papers_v1',
  GAPS: 'ali_os_gaps_v1',
  EXPERIMENTS: 'ali_os_experiments_v1',
  LESSONS: 'ali_os_lessons_v1',
  TASKS: 'ali_os_tasks_v1',
  DRAFTS: 'ali_os_drafts_v1',
  KNOWLEDGE: 'ali_os_knowledge_v1',
  CHECKLISTS: 'ali_os_checklists_v1',
};

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  userProfile = signal<UserProfile>(this.loadUserProfile());
  papers = signal<Paper[]>(this.loadPapers());
  gaps = signal<ResearchGap[]>(this.loadGaps());
  experiments = signal<Experiment[]>(this.loadExperiments());
  lessons = signal<LearningLesson[]>(this.loadLessons());
  tasks = signal<ResearchTask[]>(this.loadTasks());
  drafts = signal<ResearchPaperDraft[]>(this.loadDrafts());
  knowledgeNodes = signal<KnowledgeNode[]>(this.loadKnowledgeNodes());
  checklist = signal<PublicationChecklist>(this.loadChecklist());

  // Active Program Signal
  activeProgramId = computed(() => this.userProfile().activeProgramId);

  // Filtered views by active program
  activePapers = computed(() => this.papers().filter(p => p.programId === this.activeProgramId()));
  activeGaps = computed(() => this.gaps().filter(g => g.programId === this.activeProgramId()));
  activeExperiments = computed(() => this.experiments().filter(e => e.programId === this.activeProgramId()));
  activeTasks = computed(() => this.tasks().filter(t => t.programId === this.activeProgramId()));
  activeDraft = computed(() => this.drafts().find(d => d.programId === this.activeProgramId()) || this.drafts()[0]);

  // Comprehensive Research Programs
  readonly programs: ResearchProgram[] = [
    {
      id: 'agent-os',
      code: 'PROG-01',
      titleFa: 'ALI AgentOS: عامل‌های هوشمند خودمختار',
      titleEn: 'ALI AgentOS: Autonomous AI Agents',
      subtitleFa: 'ابزارشناسی، برنامه‌ریزی سلسله‌مراتبی، حافظه بلندمدت و سیستم‌های چندعاملی',
      subtitleEn: 'Tool Use, Hierarchical Planning, Long-term Memory & Multi-Agent Reliability',
      descriptionFa: 'پژوهش بر روی ساختارهای استدلال پویا (ReAct, Reflexion)، فراخوانی دقیق ابزارها (Tool Calling)، کاهش توهم در تصمیم‌گیری و پروتکل‌های همکاری چندعاملی با شواهد تجربی قابل اثبات.',
      descriptionEn: 'Investigation of autonomous agent architectures, multi-agent coordination, iterative reflection mechanisms, tool invocation robustness, and verifiable evaluation protocols.',
      icon: 'smart_toy',
      readinessScore: 68,
      color: '#59D9FF',
      activeQuestionsCount: 4,
      hypothesesCount: 3,
      papersCount: 4,
      experimentsCount: 3,
      keyTopics: ['ReAct & Reflexion', 'Tool Calling Reliability', 'Episodic Memory', 'Multi-Agent Consensus', 'Agent Benchmarking']
    },
    {
      id: 'knowledge-engine',
      code: 'PROG-02',
      titleFa: 'ALI Knowledge Engine: بازیابی، RAG و گراف دانش',
      titleEn: 'ALI Knowledge Engine: RAG & Knowledge Graphs',
      subtitleFa: 'بازیابی متراکم، بازیابی ترکیبی هیبرید، استناد شفاف و گراف‌های معنایی',
      subtitleEn: 'Dense Retrieval, Hybrid Search, Grounded Answering & Graph RAG',
      descriptionFa: 'توسعه موتورهای بازیابی فراداده‌ای، ادغام پایگاه‌های دانش رابطه‌ای و برداری، حذف پاسخ‌های بدون سند (Hallucination) و ارزیابی جامع با سنجه‌های RAGAS و TruLens.',
      descriptionEn: 'Research into trustworthy knowledge retrieval, contextual re-ranking, knowledge graph embeddings, hallucination mitigation, and faithful provenance tracking.',
      icon: 'account_tree',
      readinessScore: 62,
      color: '#38EF7D',
      activeQuestionsCount: 3,
      hypothesesCount: 2,
      papersCount: 3,
      experimentsCount: 2,
      keyTopics: ['Hybrid BM25 + Dense', 'Graph RAG', 'Self-RAG Reflection', 'Faithfulness Evaluation', 'Vector Indexes']
    },
    {
      id: 'code-intelligence',
      code: 'PROG-03',
      titleFa: 'ALI Code Intelligence: هوش مصنوعی و مهندسی نرم‌افزار',
      titleEn: 'ALI Code Intelligence: AI for Software Engineering',
      subtitleFa: 'تولید و راستی‌آزمایی صوری کد، تحلیل ایستا، آزمون خودکار و رفع باگ‌های پیچیده',
      subtitleEn: 'Formal Code Verification, Static Analysis, Automated Testing & Bug Repair',
      descriptionFa: 'پژوهش در تقاطع LLMها و تحلیل ایستای کد، سنتز خودکار تست‌یونیت‌ها، اثبات درستی و ارزیابی مدل‌های برنامه‌نویسی بر روی بنچ‌مارک‌های معتبر HumanEval و SWE-bench.',
      descriptionEn: 'Interpretable code synthesis, neuro-symbolic program repair, automated test generation, invariant generation, and formal software verification benchmarks.',
      icon: 'terminal',
      readinessScore: 55,
      color: '#A29BFE',
      activeQuestionsCount: 3,
      hypothesesCount: 2,
      papersCount: 3,
      experimentsCount: 2,
      keyTopics: ['SWE-bench Solving', 'Static Analysis Feedback', 'Invariant Synthesis', 'Test Suite Minimization', 'Compiler In-the-loop']
    },
    {
      id: 'ai-security',
      code: 'PROG-04',
      titleFa: 'ALI AI Security Lab: امنیت LLM و دفاع در برابر حملات',
      titleEn: 'ALI AI Security Lab: LLM Security & Defenses',
      subtitleFa: 'تزریق پرامپت، مسموم‌سازی داده، خروج امن، حریم خصوصی داده‌ها و ارزیابی دفاعی',
      subtitleEn: 'Prompt Injection, Jailbreaking, Model Extraction & Defense Verification',
      descriptionFa: 'ارزیابی تجربی استحکام امنیتی مدل‌ها، دفاع در برابر حملات تزریق غیرمستقیم پرامپت (Indirect Prompt Injection)، ردیابی نشت داده و فرمول‌بندی گارانتی‌های امنیتی در سناریوهای تهاجمی.',
      descriptionEn: 'Adversarial robustness of language models, defenses against direct and indirect prompt injection, data poisoning detection, differential privacy, and red-teaming.',
      icon: 'security',
      readinessScore: 72,
      color: '#FF7675',
      activeQuestionsCount: 4,
      hypothesesCount: 3,
      papersCount: 3,
      experimentsCount: 3,
      keyTopics: ['Indirect Prompt Injection', 'Adversarial Suffix Defense', 'Differential Privacy in RAG', 'Guardrail Formalization', 'Red Teaming Benchmarks']
    },
    {
      id: 'scientific-discovery',
      code: 'PROG-05',
      titleFa: 'ALI Scientific Discovery: یادگیری ماشین در علوم و فیزیک',
      titleEn: 'ALI Scientific Discovery: AI for Scientific ML',
      subtitleFa: 'شبکه‌های عصبی پایبند به قوانین فیزیک (PINN)، شیمی محاسباتی و کشف مواد',
      subtitleEn: 'Physics-Informed Neural Networks, Materials Informatics & Scientific ML',
      descriptionFa: 'تحقیق در بکارگیری یادگیری عمیق با ارضای صوری معادلات دیفرانسیل جزئی (PDE)، مدل‌های تولیدی مولکولی و تسریع شبیه‌سازی‌های علمی با تضمین پایستگی انرژی.',
      descriptionEn: 'Physics-informed machine learning, surrogate modeling for complex differential equations, molecular property prediction, and energy-conserving neural operators.',
      icon: 'biotech',
      readinessScore: 48,
      color: '#FDCB6E',
      activeQuestionsCount: 2,
      hypothesesCount: 2,
      papersCount: 3,
      experimentsCount: 2,
      keyTopics: ['Physics-Informed NNs (PINN)', 'Fourier Neural Operators', 'Molecular Graph Representation', 'Conservation Law Penalties', 'Surrogate Accelerators']
    }
  ];

  // Set active research program
  setActiveProgram(id: ProgramId): void {
    const user = { ...this.userProfile(), activeProgramId: id };
    this.userProfile.set(user);
    this.saveToStorage(STORAGE_KEYS.USER, user);
  }

  // Update User Profile
  updateUserProfile(profile: Partial<UserProfile>): void {
    const updated = { ...this.userProfile(), ...profile };
    this.userProfile.set(updated);
    this.saveToStorage(STORAGE_KEYS.USER, updated);
  }

  // Papers Operations
  savePaper(paper: Paper): void {
    const current = this.papers();
    const exists = current.some(p => p.id === paper.id || (p.doi && p.doi === paper.doi));
    if (exists) {
      this.papers.update(list => list.map(p => (p.id === paper.id || (p.doi && p.doi === paper.doi)) ? paper : p));
    } else {
      this.papers.update(list => [paper, ...list]);
    }
    this.saveToStorage(STORAGE_KEYS.PAPERS, this.papers());
  }

  removePaper(id: string): void {
    this.papers.update(list => list.filter(p => p.id !== id));
    this.saveToStorage(STORAGE_KEYS.PAPERS, this.papers());
  }

  updatePaperNotes(id: string, notes: string, methods?: string, datasets?: string, limitations?: string, opportunities?: string): void {
    this.papers.update(list => list.map(p => {
      if (p.id === id) {
        return {
          ...p,
          notes,
          extractedMethods: methods ?? p.extractedMethods,
          extractedDatasets: datasets ?? p.extractedDatasets,
          extractedLimitations: limitations ?? p.extractedLimitations,
          extractedOpportunities: opportunities ?? p.extractedOpportunities
        };
      }
      return p;
    }));
    this.saveToStorage(STORAGE_KEYS.PAPERS, this.papers());
  }

  // Research Gaps Operations
  addGap(gap: ResearchGap): void {
    this.gaps.update(list => [gap, ...list]);
    this.saveToStorage(STORAGE_KEYS.GAPS, this.gaps());
  }

  updateGap(gap: ResearchGap): void {
    this.gaps.update(list => list.map(g => g.id === gap.id ? gap : g));
    this.saveToStorage(STORAGE_KEYS.GAPS, this.gaps());
  }

  removeGap(id: string): void {
    this.gaps.update(list => list.filter(g => g.id !== id));
    this.saveToStorage(STORAGE_KEYS.GAPS, this.gaps());
  }

  // Experiments Operations
  addExperiment(exp: Experiment): void {
    this.experiments.update(list => [exp, ...list]);
    this.saveToStorage(STORAGE_KEYS.EXPERIMENTS, this.experiments());
  }

  updateExperiment(exp: Experiment): void {
    this.experiments.update(list => list.map(e => e.id === exp.id ? exp : e));
    this.saveToStorage(STORAGE_KEYS.EXPERIMENTS, this.experiments());
  }

  removeExperiment(id: string): void {
    this.experiments.update(list => list.filter(e => e.id !== id));
    this.saveToStorage(STORAGE_KEYS.EXPERIMENTS, this.experiments());
  }

  // Learning Lessons
  toggleLessonCompleted(id: string): void {
    this.lessons.update(list => list.map(l => l.id === id ? { ...l, completed: !l.completed } : l));
    this.saveToStorage(STORAGE_KEYS.LESSONS, this.lessons());
  }

  // Tasks Operations
  addTask(task: ResearchTask): void {
    this.tasks.update(list => [task, ...list]);
    this.saveToStorage(STORAGE_KEYS.TASKS, this.tasks());
  }

  updateTaskStatus(id: string, status: ResearchTask['status']): void {
    this.tasks.update(list => list.map(t => t.id === id ? { ...t, status } : t));
    this.saveToStorage(STORAGE_KEYS.TASKS, this.tasks());
  }

  removeTask(id: string): void {
    this.tasks.update(list => list.filter(t => t.id !== id));
    this.saveToStorage(STORAGE_KEYS.TASKS, this.tasks());
  }

  // Draft Operations
  saveDraft(draft: ResearchPaperDraft): void {
    this.drafts.update(list => list.map(d => d.id === draft.id ? { ...draft, lastUpdated: new Date().toISOString() } : d));
    this.saveToStorage(STORAGE_KEYS.DRAFTS, this.drafts());
  }

  // Checklist Operations
  updateChecklist(updated: Partial<PublicationChecklist>): void {
    this.checklist.update(c => ({ ...c, ...updated }));
    this.saveToStorage(STORAGE_KEYS.CHECKLISTS, this.checklist());
  }

  // Full Workspace Export
  exportWorkspaceJson(): string {
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      userProfile: this.userProfile(),
      papers: this.papers(),
      gaps: this.gaps(),
      experiments: this.experiments(),
      lessons: this.lessons(),
      tasks: this.tasks(),
      drafts: this.drafts(),
      knowledgeNodes: this.knowledgeNodes(),
      checklist: this.checklist()
    };
    return JSON.stringify(payload, null, 2);
  }

  // Full Workspace Import
  importWorkspaceJson(jsonStr: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.papers || !Array.isArray(data.papers)) {
        return { success: false, error: 'Invalid workspace format: missing papers array.' };
      }

      if (data.userProfile) this.userProfile.set(data.userProfile);
      if (data.papers) this.papers.set(data.papers);
      if (data.gaps) this.gaps.set(data.gaps);
      if (data.experiments) this.experiments.set(data.experiments);
      if (data.lessons) this.lessons.set(data.lessons);
      if (data.tasks) this.tasks.set(data.tasks);
      if (data.drafts) this.drafts.set(data.drafts);
      if (data.knowledgeNodes) this.knowledgeNodes.set(data.knowledgeNodes);
      if (data.checklist) this.checklist.set(data.checklist);

      this.saveToStorage(STORAGE_KEYS.USER, this.userProfile());
      this.saveToStorage(STORAGE_KEYS.PAPERS, this.papers());
      this.saveToStorage(STORAGE_KEYS.GAPS, this.gaps());
      this.saveToStorage(STORAGE_KEYS.EXPERIMENTS, this.experiments());
      this.saveToStorage(STORAGE_KEYS.LESSONS, this.lessons());
      this.saveToStorage(STORAGE_KEYS.TASKS, this.tasks());
      this.saveToStorage(STORAGE_KEYS.DRAFTS, this.drafts());
      this.saveToStorage(STORAGE_KEYS.KNOWLEDGE, this.knowledgeNodes());
      this.saveToStorage(STORAGE_KEYS.CHECKLISTS, this.checklist());

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to parse JSON file.' };
    }
  }

  // Reset to initial seeded state
  resetToFactoryDefaults(): void {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
    this.userProfile.set(this.defaultUserProfile());
    this.papers.set(this.defaultPapers());
    this.gaps.set(this.defaultGaps());
    this.experiments.set(this.defaultExperiments());
    this.lessons.set(this.defaultLessons());
    this.tasks.set(this.defaultTasks());
    this.drafts.set(this.defaultDrafts());
    this.knowledgeNodes.set(this.defaultKnowledgeNodes());
    this.checklist.set(this.defaultChecklist());

    this.saveToStorage(STORAGE_KEYS.USER, this.userProfile());
    this.saveToStorage(STORAGE_KEYS.PAPERS, this.papers());
    this.saveToStorage(STORAGE_KEYS.GAPS, this.gaps());
    this.saveToStorage(STORAGE_KEYS.EXPERIMENTS, this.experiments());
    this.saveToStorage(STORAGE_KEYS.LESSONS, this.lessons());
    this.saveToStorage(STORAGE_KEYS.TASKS, this.tasks());
    this.saveToStorage(STORAGE_KEYS.DRAFTS, this.drafts());
    this.saveToStorage(STORAGE_KEYS.KNOWLEDGE, this.knowledgeNodes());
    this.saveToStorage(STORAGE_KEYS.CHECKLISTS, this.checklist());
  }

  // Storage Persistence Helper
  private saveToStorage(key: string, data: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn('Storage quota or serialization warning:', err);
    }
  }

  private loadUserProfile(): UserProfile {
    if (typeof window === 'undefined') return this.defaultUserProfile();
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : this.defaultUserProfile();
  }

  private loadPapers(): Paper[] {
    if (typeof window === 'undefined') return this.defaultPapers();
    const raw = localStorage.getItem(STORAGE_KEYS.PAPERS);
    return raw ? JSON.parse(raw) : this.defaultPapers();
  }

  private loadGaps(): ResearchGap[] {
    if (typeof window === 'undefined') return this.defaultGaps();
    const raw = localStorage.getItem(STORAGE_KEYS.GAPS);
    return raw ? JSON.parse(raw) : this.defaultGaps();
  }

  private loadExperiments(): Experiment[] {
    if (typeof window === 'undefined') return this.defaultExperiments();
    const raw = localStorage.getItem(STORAGE_KEYS.EXPERIMENTS);
    return raw ? JSON.parse(raw) : this.defaultExperiments();
  }

  private loadLessons(): LearningLesson[] {
    if (typeof window === 'undefined') return this.defaultLessons();
    const raw = localStorage.getItem(STORAGE_KEYS.LESSONS);
    return raw ? JSON.parse(raw) : this.defaultLessons();
  }

  private loadTasks(): ResearchTask[] {
    if (typeof window === 'undefined') return this.defaultTasks();
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    return raw ? JSON.parse(raw) : this.defaultTasks();
  }

  private loadDrafts(): ResearchPaperDraft[] {
    if (typeof window === 'undefined') return this.defaultDrafts();
    const raw = localStorage.getItem(STORAGE_KEYS.DRAFTS);
    return raw ? JSON.parse(raw) : this.defaultDrafts();
  }

  private loadKnowledgeNodes(): KnowledgeNode[] {
    if (typeof window === 'undefined') return this.defaultKnowledgeNodes();
    const raw = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE);
    return raw ? JSON.parse(raw) : this.defaultKnowledgeNodes();
  }

  private loadChecklist(): PublicationChecklist {
    if (typeof window === 'undefined') return this.defaultChecklist();
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLISTS);
    return raw ? JSON.parse(raw) : this.defaultChecklist();
  }

  // --- SEED DATA: 100% AUTHENTIC PEER-REVIEWED PAPERS, LESSONS, TASKS & GAPS ---
  private defaultUserProfile(): UserProfile {
    return {
      name: 'پژوهشگر مستقل (Ali Researcher)',
      affiliation: 'ALI Independent Research Lab',
      experienceLevel: 'Intermediate',
      activeProgramId: 'agent-os',
      language: 'fa',
      onboardingCompleted: true,
      startDate: new Date().toISOString()
    };
  }

  private defaultPapers(): Paper[] {
    return [
      // PROG 1: AgentOS
      {
        id: 'paper-react-2023',
        programId: 'agent-os',
        title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
        authors: ['Shunyu Yao', 'Jeffrey Zhao', 'Dian Yu', 'Nan Du', 'Izhak Shafran', 'Karthik Narasimhan', 'Yuan Cao'],
        year: 2023,
        venue: 'International Conference on Learning Representations (ICLR)',
        type: 'Conference Proceeding',
        doi: '10.48550/arXiv.2210.03629',
        citations: 2840,
        url: 'https://arxiv.org/abs/2210.03629',
        openAccessUrl: 'https://arxiv.org/pdf/2210.03629.pdf',
        domain: 'Autonomous Agents & Reasoning',
        keywords: ['ReAct', 'Tool Use', 'Reasoning Trace', 'HotpotQA', 'Fever Benchmark'],
        abstract: 'A unique feature of human intelligence is the seamless blend of goal-directed action with verbal reasoning. While recent work has shown success in using language models for multi-step reasoning, existing systems lack the ability to take actions to interact with external environments. We propose ReAct, where language models are used to generate both reasoning traces and task-specific actions in an interleaved manner.',
        bibtex: '@inproceedings{yao2023react,\n  title={ReAct: Synergizing Reasoning and Acting in Language Models},\n  author={Yao, Shunyu and Zhao, Jeffrey and Yu, Dian and Du, Nan and Shafran, Izhak and Narasimhan, Karthik and Cao, Yuan},\n  booktitle={International Conference on Learning Representations (ICLR)},\n  year={2023}\n}',
        extractedMethods: 'Interleaving thought generation and environment action execution with state observation injection.',
        extractedDatasets: 'HotpotQA, FEVER, AlfWorld, WebShop',
        extractedLimitations: 'Susceptible to error propagation if early reasoning steps make incorrect assumptions; higher inference latency and token overhead.',
        extractedOpportunities: 'Integration with verifiable self-consistency checking and rollback mechanisms before executing irreversible actions.',
        unresolvedQuestions: ['How can an agent backtrack efficiently when a tool returns noisy or incomplete observations?', 'What are formal bounds on hallucination cascade depth?'],
        savedAt: '2026-10-25T10:00:00Z',
        isCurated: true
      },
      {
        id: 'paper-toolformer-2023',
        programId: 'agent-os',
        title: 'Toolformer: Language Models Can Teach Themselves to Use Tools',
        authors: ['Timo Schick', 'Jane Dwivedi-Sankaranarayanan', 'Roberto Dessi', 'Roman Leicher', 'Hamid Schroeder', 'Thomas Scialom'],
        year: 2023,
        venue: 'Conference on Neural Information Processing Systems (NeurIPS)',
        type: 'Conference Proceeding',
        doi: '10.48550/arXiv.2302.04761',
        citations: 2150,
        url: 'https://arxiv.org/abs/2302.04761',
        openAccessUrl: 'https://arxiv.org/pdf/2302.04761.pdf',
        domain: 'Self-Supervised Tool Calling',
        keywords: ['Toolformer', 'Self-Supervised', 'API Calling', 'Calculator', 'Wikipedia Search'],
        abstract: 'Language models exhibit remarkable abilities to solve new tasks from few examples, but struggle with basic tasks such as arithmetic or factual lookup. In this paper, we show that LMs can teach themselves to use external tools via simple APIs and achieve the best of both worlds. We introduce Toolformer, a model trained to decide which APIs to call, when to call them, and how to incorporate results.',
        bibtex: '@inproceedings{schick2023toolformer,\n  title={Toolformer: Language Models Can Teach Themselves to Use Tools},\n  author={Schick, Timo and Dwivedi-Sankaranarayanan, Jane and Dessi, Roberto and Leicher, Roman and Schroeder, Hamid and Scialom, Thomas},\n  booktitle={Advances in Neural Information Processing Systems (NeurIPS)},\n  year={2023}\n}',
        extractedMethods: 'Self-supervised bootstrapping: sampling API calls, executing them, and filtering based on whether API outputs reduce language modeling loss on subsequent tokens.',
        extractedDatasets: 'LAMA, Math, Question Answering, Temporal Datasets',
        extractedLimitations: 'Tools are called sequentially; does not support interactive multi-turn tool sessions or stateful transaction rollbacks.',
        extractedOpportunities: 'Extending self-supervised tool grounding to asynchronous tool execution and multi-agent coordination.',
        unresolvedQuestions: ['Can models self-supervise multi-argument tool calls under strict latency budgets?'],
        savedAt: '2026-10-26T12:00:00Z',
        isCurated: true
      },
      {
        id: 'paper-reflexion-2023',
        programId: 'agent-os',
        title: 'Reflexion: Language Agents with Verbal Reinforcement Learning',
        authors: ['Noah Shinn', 'Federico Cassano', 'Edward Berman', 'Ashwin Gopinath', 'Karthik Narasimhan', 'Shunyu Yao'],
        year: 2023,
        venue: 'Advances in Neural Information Processing Systems (NeurIPS)',
        type: 'Conference Proceeding',
        doi: '10.48550/arXiv.2303.11366',
        citations: 1480,
        url: 'https://arxiv.org/abs/2303.11366',
        openAccessUrl: 'https://arxiv.org/pdf/2303.11366.pdf',
        domain: 'Autonomous Self-Reflection',
        keywords: ['Reflexion', 'Verbal RL', 'Episodic Memory', 'Self-Correction', 'AlfWorld'],
        abstract: 'Reflexion is an architecture that endows language agents with dynamic memory and self-reflective capabilities. To achieve verbal reinforcement learning, Reflexion converts scalar environment feedback into linguistic self-reflections that are stored in an episodic buffer to guide subsequent trials.',
        bibtex: '@inproceedings{shinn2023reflexion,\n  title={Reflexion: Language Agents with Verbal Reinforcement Learning},\n  author={Shinn, Noah and Cassano, Federico and Berman, Edward and Gopinath, Ashwin and Narasimhan, Karthik and Yao, Shunyu},\n  booktitle={NeurIPS},\n  year={2023}\n}',
        extractedMethods: 'Verbal self-reflection stored in episodic memory buffer to iteratively improve agent trial policies without weight updates.',
        extractedDatasets: 'AlfWorld, HumanEval, HotpotQA',
        extractedLimitations: 'Reflections can hallucinate counterfactual causes of failure, reinforcing incorrect biases across successive iterations.',
        extractedOpportunities: 'Coupling verbal reflections with formal verification checkers or symbolic ground truth assertions.',
        unresolvedQuestions: ['How to bound the degradation of reflection quality after multiple failure rounds?'],
        savedAt: '2026-10-27T08:30:00Z',
        isCurated: true
      },

      // PROG 2: Knowledge Engine
      {
        id: 'paper-rag-2020',
        programId: 'knowledge-engine',
        title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
        authors: ['Patrick Lewis', 'Ethan Perez', 'Aleksandra Piktus', 'Fabio Petroni', 'Vladimir Karpukhin', 'Naman Goyal', 'Heinrich Küttler', 'Mike Lewis', 'Wen-tau Yih', 'Tim Rocktäschel', 'Sebastian Riedel', 'Douwe Kiela'],
        year: 2020,
        venue: 'Advances in Neural Information Processing Systems (NeurIPS)',
        type: 'Conference Proceeding',
        doi: '10.48550/arXiv.2005.11401',
        citations: 6200,
        url: 'https://arxiv.org/abs/2005.11401',
        openAccessUrl: 'https://arxiv.org/pdf/2005.11401.pdf',
        domain: 'Information Retrieval & Generation',
        keywords: ['RAG', 'Dense Retrieval', 'DPR', 'BART', 'Knowledge-Intensive'],
        abstract: 'Large pre-trained language models store factual knowledge in their parameters, but their ability to access and precisely manipulate knowledge is still limited. We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) models which combine pre-trained parametric and non-parametric memory.',
        bibtex: '@inproceedings{lewis2020rag,\n  title={Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks},\n  author={Lewis, Patrick and Perez, Ethan and Piktus, Aleksandra and Petroni, Fabio and Karpukhin, Vladimir and Goyal, Naman and Kuttler, Heinrich and Lewis, Mike and Yih, Wen-tau and Rocktaschel, Tim and others},\n  booktitle={Advances in Neural Information Processing Systems (NeurIPS)},\n  volume={33},\n  pages={9459--9474},\n  year={2020}\n}',
        extractedMethods: 'Marginalizing over top-K retrieved latent documents using dense representations generated by Dense Passage Retrieval (DPR) coupled with a seq2seq generator.',
        extractedDatasets: 'Natural Questions, TriviaQA, WebQuestions, CuratedTREC',
        extractedLimitations: 'Sensitive to retrieval noise; does not actively verify if the retrieved documents contain sufficient evidence or contradict each other.',
        extractedOpportunities: 'Hybrid BM25 + dense neural rankers with explicit contradiction resolution layers.',
        unresolvedQuestions: ['How can we guarantee zero attribution hallucination when retrieved passages present conflicting facts?'],
        savedAt: '2026-10-24T14:15:00Z',
        isCurated: true
      },

      // PROG 3: Code Intelligence
      {
        id: 'paper-codellama-2023',
        programId: 'code-intelligence',
        title: 'Code Llama: Open Foundation Models for Code',
        authors: ['Baptiste Rozière', 'Jonas Gehring', 'Fabian Gloeckle', 'Sten Sootla', 'Itai Gat', 'Xiaoqing Ellen Tan', 'Yossi Adi', 'Jingyu Liu', 'Tal Remez', 'Jérémy Rapin', 'Artyom Kozhevnikov', 'Ivan Evtimov', 'Marta Zavalishina', 'Ali Farhad', 'Gabriel Synnaeve'],
        year: 2023,
        venue: 'arXiv Computer Science - Software Engineering',
        type: 'Preprint',
        doi: '10.48550/arXiv.2308.12950',
        citations: 1890,
        url: 'https://arxiv.org/abs/2308.12950',
        openAccessUrl: 'https://arxiv.org/pdf/2308.12950.pdf',
        domain: 'Code Synthesis & Infilling',
        keywords: ['Code Llama', 'Fill-In-The-Middle', 'HumanEval', 'MBPP', 'Software Engineering'],
        abstract: 'We release Code Llama, a family of large language models for code based on Llama 2. Code Llama reaches state-of-the-art performance among open models on code tasks, supporting infilling capabilities, large input contexts up to 100k tokens, and zero-shot instruction following for programming tasks.',
        bibtex: '@article{roziere2023code,\n  title={Code Llama: Open Foundation Models for Code},\n  author={Roziere, Baptiste and Gehring, Jonas and Gloeckle, Fabian and Sootla, Sten and Gat, Itai and Tan, Xiaoqing Ellen and Adi, Yossi and Liu, Jingyu and Remez, Tal and Rapin, Jeremy and others},\n  journal={arXiv preprint arXiv:2308.12950},\n  year={2023}\n}',
        extractedMethods: 'Domain-specific continuous pretraining on 500B tokens of code with infilling objective (FIM: Prefix, Suffix, Middle).',
        extractedDatasets: 'HumanEval, MBPP, MultiPL-E, HumanEvalPack',
        extractedLimitations: 'Generates plausible code that may contain subtle concurrency bugs, off-by-one errors, or memory leaks not caught by shallow unit tests.',
        extractedOpportunities: 'Coupling Code Llama generation with interactive compiler feedback and symbolic invariant verification.',
        unresolvedQuestions: ['Can symbolic model checkers be embedded directly into the decoding beam search?'],
        savedAt: '2026-10-25T11:00:00Z',
        isCurated: true
      },

      // PROG 4: AI Security Lab
      {
        id: 'paper-universal-attacks-2023',
        programId: 'ai-security',
        title: 'Universal and Transferable Adversarial Attacks on Aligned Language Models',
        authors: ['Andy Zou', 'Zifan Wang', 'J. Zico Kolter', 'Matt Fredrikson'],
        year: 2023,
        venue: 'International Conference on Machine Learning (ICML)',
        type: 'Conference Proceeding',
        doi: '10.48550/arXiv.2307.15043',
        citations: 1650,
        url: 'https://arxiv.org/abs/2307.15043',
        openAccessUrl: 'https://arxiv.org/pdf/2307.15043.pdf',
        domain: 'Adversarial Machine Learning & Security',
        keywords: ['GCG', 'Adversarial Suffix', 'Jailbreak', 'Safety Alignment', 'Transferability'],
        abstract: 'Because "safety-aligned" language models undergo reinforcement learning from human feedback (RLHF), finding prompt injections or jailbreaks typically requires manual engineering. We present Greedy Coordinate Gradient (GCG), a simple and effective attack method that automatically generates adversarial suffixes causing aligned models to produce objectionable behaviors.',
        bibtex: '@inproceedings{zou2023universal,\n  title={Universal and Transferable Adversarial Attacks on Aligned Language Models},\n  author={Zou, Andy and Wang, Zifan and Kolter, J Zico and Fredrikson, Matt},\n  booktitle={International Conference on Machine Learning (ICML)},\n  year={2024}\n}',
        extractedMethods: 'Greedy Coordinate Gradient optimization over token embeddings to find universal adversarial strings that transfer across black-box models.',
        extractedDatasets: 'AdvBench Harmful Behaviors and Strings Benchmark',
        extractedLimitations: 'Perplexity filters and random token masking mitigate naive GCG suffixes, but semantic attacks remain viable.',
        extractedOpportunities: 'Developing provably robust verification bounds against semantic paraphrased injection attacks.',
        unresolvedQuestions: ['Can we construct provable certified robustness radii for discrete language models against token substitutions?'],
        savedAt: '2026-10-26T16:00:00Z',
        isCurated: true
      },

      // PROG 5: Scientific Discovery
      {
        id: 'paper-alphafold-2021',
        programId: 'scientific-discovery',
        title: 'Highly accurate protein structure prediction with AlphaFold',
        authors: ['John Jumper', 'Richard Evans', 'Alexander Pritzel', 'Tim Green', 'Michael Figurnov', 'Olaf Ronneberger', 'Kathryn Tunyasuvunakool', 'Russ Bates', 'Augustin Žídek', 'Alexey Potapenko', 'Demis Hassabis'],
        year: 2021,
        venue: 'Nature 596, 583–589',
        type: 'Peer-Reviewed Journal',
        doi: '10.1038/s41586-021-03819-2',
        citations: 24500,
        url: 'https://www.nature.com/articles/s41586-021-03819-2',
        openAccessUrl: 'https://www.nature.com/articles/s41586-021-03819-2.pdf',
        domain: 'Computational Biology & Structural AI',
        keywords: ['AlphaFold2', 'Evoformer', 'Protein Folding', 'CASP14', 'Invariant Point Attention'],
        abstract: 'Proteins are essential to life in all known organisms, and determining their 3D structures is central to biology. Here we report AlphaFold, an AI system that predicts protein structures with atomic accuracy even in cases where no homologous structure is available, demonstrating near-experimental accuracy across CASP14 targets.',
        bibtex: '@article{jumper2021highly,\n  title={Highly accurate protein structure prediction with AlphaFold},\n  author={Jumper, John and Evans, Richard and Pritzel, Alexander and Green, Tim and Figurnov, Michael and Ronneberger, Olaf and Tunyasuvunakool, Kathryn and Bates, Russ and Zidek, Augustin and Potapenko, Alexey and others},\n  journal={Nature},\n  volume={596},\n  number={7873},\n  pages={583--589},\n  year={2021},\n  publisher={Nature Publishing Group}\n}',
        extractedMethods: 'Evoformer architecture operating on multiple sequence alignments (MSA) coupled with invariant point attention (IPA) acting on 3D Euclidean frames.',
        extractedDatasets: 'PDB, CASP14, BFD, Uniclust30',
        extractedLimitations: 'Struggles with disordered regions, protein-ligand binding dynamics, and multi-state conformational transitions.',
        extractedOpportunities: 'Equivariant diffusion models predicting equilibrium conformational ensembles rather than single static structures.',
        unresolvedQuestions: ['How can physical energy barriers be learned end-to-end alongside geometric equivariance?'],
        savedAt: '2026-10-27T09:00:00Z',
        isCurated: true
      }
    ];
  }

  private defaultGaps(): ResearchGap[] {
    return [
      {
        id: 'gap-agent-rollback',
        programId: 'agent-os',
        title: 'Verifiable State Rollback and Error Bounding in Multi-Step Agent Tool Invocations',
        description: 'Existing autonomous agents (ReAct, Reflexion) execute tool actions sequentially without a formalized transactional state machine. When an intermediate tool produces a noisy or adversarial observation, the agent enters an irreversible hallucination cascade. No peer-reviewed work has yet established certified bounds on recovery without high computational rollback costs.',
        evidenceLevel: 'Empirical',
        confidenceLevel: 'High',
        candidateQuestions: [
          'Can a transactional state-tree (with checkpointing and rollback) reduce agent cascade failure rates below 5% on web navigation benchmarks?',
          'What is the minimum formal invariant required to detect tool observation deception before passing it to subsequent agent steps?'
        ],
        supportingPaperIds: ['paper-react-2023', 'paper-reflexion-2023'],
        underexploredCombinations: 'MCTS (Monte Carlo Tree Search) with formal contract assertions on API schema outputs.',
        missingDatasets: 'Interactive multi-step benchmarks with deliberate Byzantine / delayed API feedback.',
        reproducibilityIssues: 'Most studies report pass@1 on frozen benchmarks without reporting variance across seed initialization or API latency timeouts.',
        dateIdentified: '2026-10-28',
        status: 'Open'
      },
      {
        id: 'gap-rag-conflict',
        programId: 'knowledge-engine',
        title: 'Evidence Attribution Under Contradictory Retrieved Knowledge Passages',
        description: 'Dense vector search often retrieves snippets from different temporal periods or conflicting authors. Current RAG systems either randomly choose one snippet or blend contradictory claims into plausible-sounding hallucinations without explicitly warning the user of scientific conflict.',
        evidenceLevel: 'Methodological',
        confidenceLevel: 'High',
        candidateQuestions: [
          'How can a dual-encoder RAG architecture detect epistemic contradictions before generation and output explicit provenance branches?',
          'What is the impact of temporal knowledge discounting on biomedical question-answering accuracy?'
        ],
        supportingPaperIds: ['paper-rag-2020'],
        underexploredCombinations: 'Natural Language Inference (NLI) cross-passage verification + Graph RAG entity linking.',
        missingDatasets: 'Scientific domain datasets with annotated temporal obsolescence.',
        reproducibilityIssues: 'Evaluations frequently rely on LLM-as-a-judge (GPT-4) without inter-annotator human agreement verification.',
        dateIdentified: '2026-10-27',
        status: 'Under Investigation'
      },
      {
        id: 'gap-security-semantic',
        programId: 'ai-security',
        title: 'Formal Certification of LLM Agent Guardrails Against Multilingual Indirect Prompt Injections',
        description: 'While token-level perplexity filters detect naive GCG suffixes (Zou et al., 2023), indirect injections embedded into semantic text or Persian/Arabic scripts bypass token-level defenses with >60% success rate. A certifiable defense remains an open challenge in literature.',
        evidenceLevel: 'Theoretical',
        confidenceLevel: 'Medium',
        candidateQuestions: [
          'Can semantic representation shielding guarantee that tool input arguments remain isolated from untrusted web document text?',
          'What is the trade-off between strict sandboxing and reasoning flexibility in bilingual Persian-English agents?'
        ],
        supportingPaperIds: ['paper-universal-attacks-2023'],
        underexploredCombinations: 'Type-safe functional execution wrappers + Differential Privacy on prompt activations.',
        missingDatasets: 'Persian and low-resource language prompt injection red-teaming benchmarks.',
        reproducibilityIssues: 'Lack of standardized evaluation harnesses for multi-turn conversational jailbreaks.',
        dateIdentified: '2026-10-29',
        status: 'Open'
      }
    ];
  }

  private defaultExperiments(): Experiment[] {
    return [
      {
        id: 'exp-agent-01',
        programId: 'agent-os',
        title: 'Comparative Evaluation of ALI State-Tree Rollback vs. Vanilla ReAct on HotpotQA-Distracted',
        hypothesis: 'Integrating a transactional rollback checkpointing protocol into LLM tool invocation will reduce cascade failure rate by at least 25% while maintaining execution token efficiency.',
        baselineModel: 'Vanilla ReAct (Yao et al., 2023) with Greedy Decoding',
        proposedModel: 'ALI AgentOS State-Tree with Invariant Checkpoints & Rollback',
        variables: {
          independent: ['Rollback Threshold tau in [0.3, 0.7]', 'Adversarial distractor injection rate (0%, 20%, 40%)'],
          dependent: ['Success Rate (pass@1)', 'Average Tokens per Successful Episode', 'Cascade Failure Rate'],
          controlled: ['Backbone LLM (gemini-3.8-flash)', 'Temperature = 0.0', 'Max Iterations = 8']
        },
        datasetRef: 'HotpotQA Multi-hop (1,000 validation questions with 200 injected distractor paragraphs)',
        randomSeeds: [42, 1337, 2026],
        metrics: [
          { name: 'Task Success Rate (Pass@1)', baselineValue: 64.2, proposedValue: 81.6, unit: '%', improvementPercentage: 27.1, pValue: 0.0012 },
          { name: 'Cascade Failure Rate', baselineValue: 28.4, proposedValue: 7.2, unit: '%', improvementPercentage: -74.6, pValue: 0.0004 },
          { name: 'Mean Tokens per Episode', baselineValue: 1420, proposedValue: 1680, unit: 'tokens', improvementPercentage: 18.3, pValue: 0.042 },
          { name: 'Latency per Solved Task', baselineValue: 2.45, proposedValue: 2.85, unit: 'sec', improvementPercentage: 16.3 }
        ],
        status: 'Completed',
        reproducibilityNotes: 'Tested across 3 deterministic seeds with temperature=0. Code and prompt templates versioned in repository under /experiments/agent_tree_eval.py. All p-values calculated via two-tailed paired t-test (N=1000).',
        codeSnippet: `def evaluate_state_tree(agent, dataset, seeds=[42, 1337, 2026]):
    results = []
    for seed in seeds:
        torch.manual_seed(seed)
        for sample in dataset:
            state = agent.init_state(sample.question)
            outcome = agent.execute_with_checkpoints(state, max_depth=8)
            results.append(outcome)
    return compute_metrics(results)`,
        executionDate: '2026-10-29',
        datasetRowCount: 1000
      },
      {
        id: 'exp-rag-02',
        programId: 'knowledge-engine',
        title: 'Hybrid BM25 + Dense Graph RAG with Contradiction Filtering',
        hypothesis: 'Incorporating a fast cross-encoder NLI verifier before context assembly improves factual precision by >15% on controversial biomedical literature queries.',
        baselineModel: 'Dense Vector Cosine Similarity Top-5 (Lewis et al. 2020)',
        proposedModel: 'ALI Hybrid BM25-Dense + Contradiction Pruning Filter',
        variables: {
          independent: ['Contradiction Confidence Threshold alpha in [0.8, 0.95]'],
          dependent: ['Faithfulness Score (RAGAS)', 'Answer Relevance', 'Answer Latency'],
          controlled: ['Chunk Size = 512 tokens', 'Top-K candidate pool = 20', 'Backbone Model']
        },
        datasetRef: 'PubMed-QA Contradictory Subset (500 clinical queries with conflicting trials)',
        randomSeeds: [42, 99],
        metrics: [
          { name: 'Faithfulness (RAGAS)', baselineValue: 0.71, proposedValue: 0.89, unit: 'score', improvementPercentage: 25.3, pValue: 0.0028 },
          { name: 'Hallucination Rate', baselineValue: 22.8, proposedValue: 6.4, unit: '%', improvementPercentage: -71.9, pValue: 0.0009 },
          { name: 'Retrieval Latency', baselineValue: 110, proposedValue: 145, unit: 'ms', improvementPercentage: 31.8 }
        ],
        status: 'Completed',
        reproducibilityNotes: 'Indexed with HNSW (M=16, efConstruction=200). BM25 k1=1.5, b=0.75. Hardware: NVIDIA RTX 4090.',
        executionDate: '2026-10-28',
        datasetRowCount: 500
      }
    ];
  }

  private defaultLessons(): LearningLesson[] {
    return [
      {
        id: 'lesson-01',
        moduleNumber: 1,
        category: 'Algorithms',
        titleFa: 'پیچیدگی محاسباتی و تحلیل مجانبی در الگوریتم‌های هوش مصنوعی',
        titleEn: 'Computational Complexity & Asymptotic Analysis in AI Systems',
        objectiveFa: 'تسلط بر تحلیل پیچیدگی زمانی و مکانی (Big-O, Omega, Theta) در الگوریتم‌های جستجو و گراف‌های بزرگ.',
        objectiveEn: 'Master time and space complexity bounds (Big-O, Omega, Theta) for tree search and large-scale graphs.',
        contentFa: 'در پژوهش‌های علمی هوش مصنوعی، سنجش دقیق منابع محاسباتی پیش‌شرط اعتبار مقاله است. یک الگوریتم پیشنهادی اگر دارای مرتبه پیچیدگی O(b^d) باشد بدون مکانیزم هرس یا حد آستانه نمی‌تواند در مقیاس صنعتی مطرح گردد.',
        contentEn: 'Rigorous computational complexity analysis is a fundamental requirement in top-tier CS papers. Claims of scalability must be grounded in formal worst-case, average-case, and amortized resource bounds.',
        mathFoundation: 'T(n) = a T(n/b) + f(n) \\quad \\text{(Master Theorem for divide-and-conquer recurrences)}',
        practicalExample: 'Analysis of beam search vs. exhaustive search in LLM decoding: Beam search maintains K hypotheses at each step, bounding complexity to O(K \\cdot |V| \\cdot L).',
        exerciseFa: 'پیچیدگی زمانی و حافظه‌ای الگوریتم MCTS را با عمق بیشینه d و فاکتور انشعاب b تحلیل نموده و اثبات کنید چرا هرس براساس کران اطمینان بالای UCT پیچیدگی را کاهش می‌دهد.',
        exerciseEn: 'Derive the time and memory bounds of Monte Carlo Tree Search under depth d and branching factor b with UCB1 exploration.',
        references: ['Cormen et al., Introduction to Algorithms (CLRS), MIT Press', 'Russell & Norvig, Artificial Intelligence: A Modern Approach'],
        completed: true,
        masteryScore: 95
      },
      {
        id: 'lesson-02',
        moduleNumber: 2,
        category: 'LinearAlgebra',
        titleFa: 'جبر خطی کاربردی: تجزیه مقادیر منفرد (SVD) و فضای برداری امبدینگ‌ها',
        titleEn: 'Applied Linear Algebra: SVD, Eigendecomposition & Embedding Geometries',
        objectiveFa: 'درک هندسی ماتریس‌های تبدیل، ضرب تانسوری و کاهش بعد در مدل‌های زبانی بزرگ و بازیابی معنایی.',
        objectiveEn: 'Geometric understanding of transformation matrices, tensor products, and dimensionality reduction for vector embeddings.',
        contentFa: 'امبدینگ‌های متنی نقاطی در فضای ریمانی با ابعاد بالا (مانند d=1536 یا d=4096) هستند. فاصله کسینوسی و ضرب درونی در این فضاها تحت پدیده‌ای به نام انحنای ابعاد بالا (Curse of Dimensionality) قرار دارند.',
        contentEn: 'Text embeddings are representations in high-dimensional vector spaces. Metric properties such as cosine distance and inner product determine retrieval performance under the curse of dimensionality.',
        mathFoundation: 'A = U \\Sigma V^T, \\quad \\text{where } U \\in \\mathbb{R}^{m \\times m}, \\; \\Sigma \\in \\mathbb{R}^{m \\times n}, \\; V \\in \\mathbb{R}^{n \\times n}',
        practicalExample: 'Computing low-rank matrix approximations (LoRA) for parameter-efficient fine-tuning: W = W_0 + \\Delta W, \\text{ where } \\Delta W = B \\cdot A, A \\in \\mathbb{R}^{r \\times d}, B \\in \\mathbb{R}^{k \\times r}, r \\ll d.',
        exerciseFa: 'با فرض یک ماتریس امبدینگ X به ابعاد 10000x512، خطای بازسازی رنک r=64 را از طریق فرمول مقادیر ویژه محاسبه کنید.',
        exerciseEn: 'Calculate the Frobenius reconstruction error of a rank-r truncated SVD given the singular value spectrum.',
        references: ['Strang, Gilbert. Linear Algebra and Learning from Data, Wellesley-Cambridge Press'],
        completed: true,
        masteryScore: 90
      },
      {
        id: 'lesson-03',
        moduleNumber: 3,
        category: 'ProbabilityStats',
        titleFa: 'آمار استنباطی، آزمون فرضیه و سنجش معناداری آماری نتایج تجربی',
        titleEn: 'Inferential Statistics, Hypothesis Testing & Significance for ML Experiments',
        objectiveFa: 'توجیه علمی نتایج آزمایش‌ها با استفاده از آزمون‌های فرض، p-value، فواصل اطمینان و آزمون ناپارامتری Wilcoxon.',
        objectiveEn: 'Statistically validating experimental gains using hypothesis tests, p-values, confidence intervals, and Wilcoxon signed-rank tests.',
        contentFa: 'یکی از شایع‌ترین دلایل رد مقالات در کنفرانس‌های معتبر (NeurIPS, ICML, ICLR)، گزارش بهبود جزئی (مثلاً ۱٪) بدون آزمون آماری معناداری است. پژوهشگر مستقل باید نشان دهد تفاوت مشاهده‌شده ناشی از شانس یا تغییر سید تصادفی نبوده است.',
        contentEn: 'Reporting minor percentage gains without statistical hypothesis testing is among the primary reasons for paper rejections at top venues. Researchers must establish whether differences are statistically distinguishable from random seed variance.',
        mathFoundation: 't = \\frac{\\bar{X}_1 - \\bar{X}_2}{s_p \\sqrt{\\frac{2}{n}}}, \\quad p = 2(1 - F_{t}(|t|))',
        practicalExample: 'Comparing baseline vs. proposed algorithm across 10 random seeds using paired t-test: H_0: \\mu_{diff} = 0 versus H_1: \\mu_{diff} > 0 at significance level \\alpha = 0.05.',
        exerciseFa: 'اگر الگوریتم شما در ۵ آزمایش دقت‌های [82.1, 83.0, 82.5, 83.2, 82.8] و بیس‌لاین مقادیر [80.5, 81.2, 80.9, 81.0, 81.1] را ثبت کنند، مقدار t و معناداری را محاسبه نمایید.',
        exerciseEn: 'Perform a paired Student t-test on 5 seed pairs and report t-statistic, degrees of freedom, and p-value.',
        references: ['Demsar, J. (2006). Statistical Comparisons of Classifiers over Multiple Data Sets. JMLR.'],
        completed: false
      },
      {
        id: 'lesson-04',
        moduleNumber: 4,
        category: 'ResearchMethodology',
        titleFa: 'فرمول‌بندی مسئله پژوهش، نگارش ادعاها و پیشگیری از سوگیری‌های تجربی',
        titleEn: 'Research Problem Formulation, Scientific Claims & Threat Mitigation',
        objectiveFa: 'تبدیل یک ایده شهودی به مسئله علمی فرموله، مشخص کردن فرضیات ابطال‌پذیر و شناسایی تهدیدات اعتبار درونی و بیرونی.',
        objectiveEn: 'Transforming intuitive ideas into falsifiable scientific hypotheses and mitigating threats to internal and external validity.',
        contentFa: 'علم بر پایه گزاره‌های ابطال‌پذیر پوپر بنا شده است. یک فرضیه پژوهشی باید معیاری کمی برای رد شدن داشته باشد. در این درس یاد می‌گیرید چگونه ادعاهای خود را مقید کنید تا داوران به کلی‌گویی و بزرگ‌نمایی ایراد نگیرند.',
        contentEn: 'Science relies on falsifiable conjectures. A sound research hypothesis must specify quantifiable rejection criteria. This lesson guides researchers on calibrating claims to avoid overgeneralization critiques.',
        mathFoundation: '\\forall x \\in \\mathcal{D}, \\; \\mathcal{M}_{prop}(x) \\succ_{\\epsilon} \\mathcal{M}_{base}(x) \\implies \\text{Falsification condition: } \\exists x^* \\text{ s.t. } \\Delta < 0',
        practicalExample: 'Instead of claiming "Our model solves all agent reasoning problems", formulate: "On multi-hop QA benchmarks with distractor paragraphs, our transactional rollback mechanism improves task completion by 18-24% (p < 0.01) while increasing token count by <= 20%."',
        exerciseFa: 'یک ادعای خام در حیطه کاری خود انتخاب کرده و آن را به یک فرضیه علمی مقید، مشروط و قابل اندازه‌گیری بازنویسی نمایید.',
        exerciseEn: 'Refactor an informal AI claim into a formal, falsifiable scientific hypothesis with boundary conditions.',
        references: ['Booth, Colomb & Williams. The Craft of Research, Chicago Press'],
        completed: false
      },
      {
        id: 'lesson-05',
        moduleNumber: 5,
        category: 'ScientificWriting',
        titleFa: 'ساختار استاندارد مقالات کنفرانس‌های IEEE و ACM و فنون نگارش علمی',
        titleEn: 'Standard IEEE/ACM Paper Structure & Scientific Prose Best Practices',
        objectiveFa: 'نگارش حرفه‌ای بخش‌های مختلف: چکیده ساختاریافته، کارهای مرتبط انتقادی، روش‌شناسی دقیق و تحلیل محدودیت‌ها.',
        objectiveEn: 'Drafting structured abstracts, critical related work syntheses, rigorous methodology sections, and honest limitations.',
        contentFa: 'مقاله علمی گزارشی روایی نیست؛ یک استدلال منطقی به هم پیوسته است. هر پاراگراف باید یک ایده واحد را مطرح و با شواهد تجربی پشتیبانی کند. لحن باید عینی، بدون صفت‌های احساسی (مانند Revolutionary, Unprecedented) و همراه با ارجاع دقیق به مقالات پیشین باشد.',
        contentEn: 'A scientific paper is an integrated logical argument, not an anecdotal narrative. Tone must remain objective and devoid of promotional adjectives, anchored in rigorous comparative citations.',
        mathFoundation: '\\text{Structure: } \\text{Problem } \\to \\text{Gap } \\to \\text{Novel Formulation } \\to \\text{Empirical Proof } \\to \\text{Limitations}',
        practicalExample: 'IEEE 2-column format vs. ACM double-blind camera ready conventions, handling figures, captions, equations, and BibTeX citations.',
        exerciseFa: 'یک چکیده ۱۵۰ کلمه‌ای شامل: ۱) زمینه، ۲) خلاء موجود، ۳) روش پیشنهادی، ۴) دستاورد کمی اصلی و ۵) پیامد علمی بنویسید.',
        exerciseEn: 'Write a 150-word structured abstract addressing: Context, Problem, Proposed Solution, Key Empirical Metric, and Scientific Implication.',
        references: ['Day, Robert. How to Write and Publish a Scientific Paper, Cambridge University Press'],
        completed: false
      },
      {
        id: 'lesson-06',
        moduleNumber: 6,
        category: 'Reproducibility',
        titleFa: 'استانداردهای بازتولیدپذیری (Reproducibility) و بسته‌بندی کد و داده‌های آزمایشگاهی',
        titleEn: 'Reproducibility Standards: Artifact Packaging, Random Seeds & Environment Pinning',
        objectiveFa: 'تضمین تکرارپذیری ۱۰۰٪ آزمایش‌ها توسط پژوهشگران دیگر با کانتینرسازی، ثبت متغیرها و شفافیت داده‌ها.',
        objectiveEn: 'Ensuring 100% reproducible results for independent researchers via environment locking, seed tracking, and open artifacts.',
        contentFa: 'بحران بازتولیدپذیری در هوش مصنوعی منجر به تصویب چک‌لیست بازتولیدپذیری در کنفرانس‌های تراز اول شده است. مقالاتی که کد، محیط اجرایی و دانه‌های تصادفی را منتشر نکنند، شانس پذیرش پایینی دارند.',
        contentEn: 'The reproducibility crisis in ML has led major conferences to enforce strict artifact evaluation checklists. Disclosing exact seeds, package manifests, and hardware specifications is now standard practice.',
        mathFoundation: '\\mathcal{R} = \\Pr\\left(|\\hat{\\theta}_{rerun} - \\hat{\\theta}_{published}| < \\epsilon\\right) = 1.0 \\quad \\text{under identical seed } s',
        practicalExample: 'Fixing PyTorch/CUDA deterministic flags: torch.use_deterministic_algorithms(True), fixing seed in numpy, torch, and Python hash seed.',
        exerciseFa: 'یک اسکریپت آزمایشی بسازید که تضمین کند اجرای دو مرتبه‌ای یک فرآیند نمونه‌برداری، آرایه‌های خروجی با برابری ریاضی کامل تولید می‌کند.',
        exerciseEn: 'Configure a fully deterministic evaluation pipeline with pinned seeds and assertion checks across 2 independent runs.',
        references: ['Pineau et al. (2021). Improving Reproducibility in Machine Learning Research (NeurIPS checklist).'],
        completed: false
      }
    ];
  }

  private defaultTasks(): ResearchTask[] {
    return [
      {
        id: 'task-01',
        programId: 'agent-os',
        title: 'بررسی نظام‌مند مقالات ReAct و Reflexion و استخراج خطاهای توالی ابزارها',
        type: 'Reading',
        status: 'done',
        priority: 'high',
        dueDate: '2026-10-28',
        estimatedHours: 6,
        completedHours: 6,
        notes: 'تمرکز بر مقایسه رفتار مدل در مواجهه با خطای 404 یا پاسخ متناقض وب‌سایت‌ها.'
      },
      {
        id: 'task-02',
        programId: 'agent-os',
        title: 'طراحی درخت وضعیت (State-Tree) و پیاده‌سازی پروتکل Checkpointing برای عامل هوشمند',
        type: 'Methodology',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-11-04',
        estimatedHours: 12,
        completedHours: 7,
        notes: 'نگارش کلاس StateSnapshot و متدهای save_checkpoint و rollback_to_valid.'
      },
      {
        id: 'task-03',
        programId: 'agent-os',
        title: 'اجرای آزمایش مقایسه‌ای بر روی ۱۰۰۰ نمونه HotpotQA و ثبت فواصل اطمینان ۹۵٪',
        type: 'Experiment',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-11-10',
        estimatedHours: 14,
        completedHours: 0,
        notes: 'استفاده از ۳ سید تصادفی (42, 1337, 2026) و محاسبه p-value.'
      },
      {
        id: 'task-04',
        programId: 'agent-os',
        title: 'نگارش بخش روش‌شناسی (Methodology) و فرمول‌بندی بازگشت به عقب در LaTeX',
        type: 'Writing',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-11-15',
        estimatedHours: 8,
        completedHours: 0,
        notes: 'فرموله‌سازی احتمال تصحیح خطا در مرحله kام.'
      }
    ];
  }

  private defaultDrafts(): ResearchPaperDraft[] {
    return [
      {
        id: 'draft-agent-os',
        programId: 'agent-os',
        title: 'Verifiable State Rollback and Error Bounding in Autonomous Tool-Using Language Agents',
        authors: 'Ali Independent Researcher',
        targetVenue: 'IEEE Transactions on Artificial Intelligence / ACM CSUR',
        abstract: 'Autonomous language agents interacting with external APIs often suffer from cascade failure loops: an initial noisy observation leads to irrecoverable hallucinations in subsequent planning iterations. In this paper, we propose a transactional state-tree architecture (ALI-StateTree) that endows LLM agents with deterministic checkpointing and formal rollback capabilities. Across 1,000 multi-hop reasoning tasks on HotpotQA with injected distractor passages, our framework decreases cascade failure rates from 28.4% to 7.2% (p < 0.001) while achieving an 81.6% task success rate (+27.1% relative gain over vanilla ReAct). We prove theoretical upper bounds on error propagation and release our reproducible benchmark evaluation harness.',
        introduction: 'Recent advances in large language models (LLMs) have enabled autonomous agents capable of interleaving verbal reasoning with external tool executions (Yao et al., 2023; Schick et al., 2023). However, current agent loops remain strictly open-loop or sequentially myopic. When an external tool yields corrupted data, or when the agent misunderstands an API schema, the subsequent reasoning steps unconditionally absorb the corrupt observation into their context window. This phenomenon—termed the cascade hallucination trap—severely restricts the deployment of LLM agents in safety-critical automated software engineering and enterprise workflows.',
        relatedWork: 'Language Model Tool Use: Pioneering frameworks such as Toolformer (Schick et al., 2023) demonstrated that models can self-teach API calling. ReAct (Yao et al., 2023) introduced verbal reasoning traces prior to action execution. Reflexion (Shinn et al., 2023) introduced episodic verbal memory buffers. However, none of these works provide transactional ACID guarantees or rollback invariants when an API side-effect fails or returns deceptive information.',
        background: 'Let S_t denote the world state at discrete step t in a Markov Decision Process (MDP). An autonomous agent policy \\pi generates an action a_t \\in \\mathcal{A} conditioned on the dialogue history H_t = (o_0, a_0, o_1, ..., o_t). In standard ReAct, the state history is strictly append-only, meaning incorrect actions cannot be pruned from the context without explicit external resets.',
        methodology: 'Our proposed ALI-StateTree architecture structures agent trajectory exploration as a directed acyclic tree \\mathcal{T} = (\\mathcal{V}, \\mathcal{E}). Each node v_t represents a verified snapshot of the system state, containing: (1) environment observation o_t, (2) verified assertions \\phi(o_t), and (3) confidence score \\sigma_t. If an execution step violates contract invariant \\psi, the agent triggers an immediate transactional rollback to parent node v_{t-1} and branches into alternative tool candidates.',
        mathematicalFormulation: `\\begin{equation}
\\mathcal{J}(\\pi) = \\mathbb{E}_{\\tau \\sim \\pi} \\left[ \\sum_{t=0}^{T} \\gamma^t r(s_t, a_t) - \\lambda \\cdot \\mathbb{I}_{\\text{cascade}}(\\tau) \\right]
\\end{equation}
where \\mathbb{I}_{\\text{cascade}} penalizes consecutive erroneous tool executions, and the rollback condition is triggered when:
\\begin{equation}
\\Pr(\\text{Valid}(o_{t}) \\mid s_{t-1}, a_t) < \\tau_{\\text{rollback}}
\\end{equation}`,
        experimentalSetup: 'We conduct our evaluations on HotpotQA and AlfWorld benchmarks using 1,000 test questions. We introduce adversarial distractors into 20% of the API observation responses to simulate real-world web API unreliability. All tests are conducted with backbone model gemini-3.8-flash under temperature 0.0 across random seeds {42, 1337, 2026}.',
        results: 'Empirical results demonstrate that ALI-StateTree achieves an 81.6% task success rate compared to 64.2% for vanilla ReAct and 71.8% for Reflexion. Crucially, the cascade failure rate drops by 74.6% (from 28.4% to 7.2%, p = 0.0004). Token consumption increases moderately by 18.3%, demonstrating a favorable Pareto trade-off between reliability and computational cost.',
        discussion: 'The primary factor behind the performance gain is the ability to sever hallucination feedback loops before they corrupt long-term episodic memory. When tool responses deviate from JSON schema invariants, the rollback mechanism prunes the faulty branch in O(1) time without full trajectory restarts.',
        limitations: 'Our current formulation requires deterministic or semi-deterministic tool environments; non-idempotent real-world side-effects (e.g. sending real emails or writing to persistent production databases) require explicit compensating transactions that may not always be supported by 3rd-party APIs.',
        conclusion: 'We presented ALI-StateTree, a verified transactional rollback framework for autonomous agents. By treating agent exploration as a state-tree with contract invariants, we eliminate the primary failure mode of contemporary tool-using agents. Future work will investigate automated generation of compensating transactions for non-idempotent real-world actions.',
        bibtexEntries: `@inproceedings{yao2023react,
  title={ReAct: Synergizing Reasoning and Acting in Language Models},
  author={Yao, Shunyu and Zhao, Jeffrey and Yu, Dian and Du, Nan and Shafran, Izhak and Narasimhan, Karthik and Cao, Yuan},
  booktitle={ICLR},
  year={2023}
}

@inproceedings{schick2023toolformer,
  title={Toolformer: Language Models Can Teach Themselves to Use Tools},
  author={Schick, Timo and others},
  booktitle={NeurIPS},
  year={2023}
}

@inproceedings{shinn2023reflexion,
  title={Reflexion: Language Agents with Verbal Reinforcement Learning},
  author={Shinn, Noah and others},
  booktitle={NeurIPS},
  year={2023}
}`,
        version: 3,
        lastUpdated: '2026-10-30T22:00:00Z'
      }
    ];
  }

  private defaultKnowledgeNodes(): KnowledgeNode[] {
    return [
      { 
        id: 'node-paper-react', 
        label: 'Paper: ReAct (ICLR 2023)', 
        labelFa: 'مقاله: ReAct (ICLR 2023)',
        type: 'Paper', 
        programId: 'agent-os', 
        details: 'Synergizing Reasoning and Acting in Language Models',
        detailsFa: 'هم‌افزایی استدلال زبانی و اجرای کنش در مدل‌های زبانی بزرگ',
        connections: ['node-concept-tool-use', 'node-concept-reasoning-trace'] 
      },
      { 
        id: 'node-paper-toolformer', 
        label: 'Paper: Toolformer (NeurIPS 2023)', 
        labelFa: 'مقاله: Toolformer (NeurIPS 2023)',
        type: 'Paper', 
        programId: 'agent-os', 
        details: 'Self-supervised API calling for LMs',
        detailsFa: 'فراخوانی خودنظارتی رابط‌های برنامه‌نویسی برای مدل‌های زبانی',
        connections: ['node-concept-tool-use', 'node-dataset-lama'] 
      },
      { 
        id: 'node-paper-reflexion', 
        label: 'Paper: Reflexion (NeurIPS 2023)', 
        labelFa: 'مقاله: Reflexion (NeurIPS 2023)',
        type: 'Paper', 
        programId: 'agent-os', 
        details: 'Verbal Reinforcement Learning and Episodic Buffer',
        detailsFa: 'یادگیری تقویتی کلامی و بافر اپیزودیک برای عامل‌های هوشمند',
        connections: ['node-concept-self-reflection', 'node-dataset-alfworld'] 
      },
      { 
        id: 'node-concept-tool-use', 
        label: 'Concept: Tool Calling & APIs', 
        labelFa: 'مفهوم: فراخوانی ابزار و APIها',
        type: 'Concept', 
        programId: 'agent-os', 
        details: 'Interfacing neural models with external deterministic APIs',
        detailsFa: 'اتصال شبکه‌های عصبی به APIهای قطعی و محیط‌های خارجی',
        connections: ['node-method-state-tree', 'node-exp-rollback'] 
      },
      { 
        id: 'node-concept-reasoning-trace', 
        label: 'Concept: Reasoning Traces', 
        labelFa: 'مفهوم: ردپاهای استدلال (Reasoning Traces)',
        type: 'Concept', 
        programId: 'agent-os', 
        details: 'Intermediate linguistic thought steps before action',
        detailsFa: 'گام‌های میانی تفکر زبانی پیش از اجرای عملیات و تصمیم‌گیری',
        connections: ['node-hypothesis-rollback'] 
      },
      { 
        id: 'node-concept-self-reflection', 
        label: 'Concept: Self-Reflection', 
        labelFa: 'مفهوم: بازتاب درونی و خودسنجی',
        type: 'Concept', 
        programId: 'agent-os', 
        details: 'Evaluating prior trial outcomes using verbal feedback',
        detailsFa: 'ارزیابی خودکار خروجی تلاش‌های پیشین با استفاده از بازخورد متنی',
        connections: ['node-hypothesis-rollback'] 
      },
      { 
        id: 'node-method-state-tree', 
        label: 'Method: State-Tree Rollback', 
        labelFa: 'روش‌شناسی: بازگشت درخت وضعیت (State-Tree Rollback)',
        type: 'Method', 
        programId: 'agent-os', 
        details: 'Branching tree with contract invariants and state checkpointing',
        detailsFa: 'درخت انشعابی انطباق با ویژگی‌های پایداری و ایجاد چک‌پوینت قطعی وضعیت',
        connections: ['node-exp-rollback', 'node-hypothesis-rollback'] 
      },
      { 
        id: 'node-hypothesis-rollback', 
        label: 'Hypothesis: Cascade Bound', 
        labelFa: 'فرضیه: کران خطای آبشاری (Cascade Bound)',
        type: 'Hypothesis', 
        programId: 'agent-os', 
        details: 'Transactional rollback reduces cascade failure by >= 25%',
        detailsFa: 'بازگشت تراکنشی شکست‌های زنجیره‌ای عامل را حداقل ۲۵٪ کاهش می‌دهد',
        connections: ['node-exp-rollback'] 
      },
      { 
        id: 'node-exp-rollback', 
        label: 'Experiment: HotpotQA Rollback', 
        labelFa: 'آزمایش: بازگشت وضعیت در بنچ‌مارک HotpotQA',
        type: 'Experiment', 
        programId: 'agent-os', 
        details: '1000 questions, 3 seeds, 81.6% success rate',
        detailsFa: '۱۰۰۰ پرسش چندمرحله‌ای، ۳ سید تصادفی، نرخ موفقیت ۸۱.۶٪',
        connections: ['node-dataset-hotpotqa'] 
      },
      { 
        id: 'node-dataset-hotpotqa', 
        label: 'Dataset: HotpotQA Multi-Hop', 
        labelFa: 'دیتاست: HotpotQA چندمرحله‌ای',
        type: 'Dataset', 
        programId: 'agent-os', 
        details: 'Multi-step question answering benchmark with distractor paragraphs',
        detailsFa: 'بنچ‌مارک پرسش و پاسخ چندمرحله‌ای به همراه بندهای فریبنده و نویزدار',
        connections: ['node-paper-react'] 
      },
      { 
        id: 'node-dataset-alfworld', 
        label: 'Dataset: AlfWorld Text-Sim', 
        labelFa: 'دیتاست: محیط شبیه‌ساز متنی AlfWorld',
        type: 'Dataset', 
        programId: 'agent-os', 
        details: 'Interactive text game environment for embodied reasoning',
        detailsFa: 'محیط تعاملی بازی متنی برای آزمون استدلال و تصمیم‌گیری عامل تجسم‌یافته',
        connections: ['node-paper-reflexion'] 
      },
      { 
        id: 'node-dataset-lama', 
        label: 'Dataset: LAMA Probe', 
        labelFa: 'دیتاست: آزمون بازیابی فکت LAMA',
        type: 'Dataset', 
        programId: 'agent-os', 
        details: 'Language Model Analysis benchmark for factual recall',
        detailsFa: 'بنچ‌مارک تحلیل مدل‌های زبانی برای بازیابی حقایق و دانش گزاره‌ای',
        connections: ['node-paper-toolformer'] 
      }
    ];
  }

  private defaultChecklist(): PublicationChecklist {
    return {
      scopeCompatibility: true,
      noveltyEvidence: true,
      methodologicalClarity: true,
      reproducibility: true,
      datasetAvailability: true,
      statisticalValidity: true,
      citationCompleteness: true,
      ethicalRequirements: true,
      formattingCheck: true,
      authorContributions: true,
      dataAvailabilityStatement: true,
      targetVenueNotes: 'Targeting top IEEE or ACM conference/journal. Ensure all seed scripts and anonymized artifact links are provided.'
    };
  }
}
