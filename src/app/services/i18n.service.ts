import { Injectable, signal, effect } from '@angular/core';
import { Language } from '../models/research.types';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  currentLang = signal<Language>('fa');

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ali_os_lang') as Language;
      if (saved === 'fa' || saved === 'en') {
        this.currentLang.set(saved);
      }
      this.applyHtmlAttributes(this.currentLang());
    }

    effect(() => {
      const lang = this.currentLang();
      if (typeof window !== 'undefined') {
        localStorage.setItem('ali_os_lang', lang);
        this.applyHtmlAttributes(lang);
      }
    });
  }

  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
  }

  toggleLanguage(): void {
    this.currentLang.update(l => l === 'fa' ? 'en' : 'fa');
  }

  isRtl(): boolean {
    return this.currentLang() === 'fa';
  }

  private applyHtmlAttributes(lang: Language): void {
    if (typeof document !== 'undefined') {
      const isRtl = lang === 'fa';
      document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
    }
  }

  t(key: string): string {
    const lang = this.currentLang();
    const entry = DICTIONARY[key];
    if (!entry) return key;
    return entry[lang] || entry['en'] || key;
  }
}

export const DICTIONARY: Record<string, { fa: string; en: string }> = {
  // Navigation & Branding
  'app.name': { fa: 'سیستم‌عامل پژوهشی علی (ALI Research OS)', en: 'ALI Research OS' },
  'app.motto': { fa: 'پژوهش مستقل • شواهد قابل راستی‌آزمایی • علم بازتولیدپذیر', en: 'Independent Research • Verifiable Evidence • Reproducible Science' },
  'nav.command_center': { fa: 'مرکز فرماندهی', en: 'Command Center' },
  'nav.programs': { fa: 'برنامه‌های پنج‌گانه', en: 'Research Programs' },
  'nav.discovery': { fa: 'کشف متون علمی', en: 'Literature Discovery' },
  'nav.review_matrix': { fa: 'ماتریس مرور متون', en: 'Literature Matrix' },
  'nav.comparison': { fa: 'موتور مقایسه مقالات', en: 'Comparison Engine' },
  'nav.gap_analyzer': { fa: 'تحلیلگر شکاف پژوهشی', en: 'Gap Analyzer' },
  'nav.experiments': { fa: 'آزمایشگاه پژوهش', en: 'Experiment Lab' },
  'nav.writing_studio': { fa: 'استودیوی نگارش علمی', en: 'Writing Studio' },
  'nav.project_mgmt': { fa: 'مدیریت و تقویم پروژه', en: 'Project Planning' },
  'nav.learning_path': { fa: 'مسیر آموزشی پژوهشگر', en: 'Learning Path' },
  'nav.knowledge_graph': { fa: 'گراف پایگاه دانش', en: 'Knowledge Graph' },
  'nav.publication_check': { fa: 'چک‌لیست آمادگی چاپ', en: 'Publication Readiness' },
  'nav.ai_assistant': { fa: 'دستیار علمی هوشمند', en: 'AI Scientific Assistant' },

  // Command Center Metrics
  'metrics.active_programs': { fa: 'برنامه‌های پژوهشی فعال', en: 'Active Programs' },
  'metrics.saved_papers': { fa: 'مقالات نمایه‌شده در سامانه', en: 'Indexed Papers' },
  'metrics.identified_gaps': { fa: 'شکاف‌های پژوهشی شناسایی‌شده', en: 'Identified Research Gaps' },
  'metrics.experiments_run': { fa: 'آزمایش‌های ثبت‌شده', en: 'Executed Experiments' },
  'metrics.writing_progress': { fa: 'پیشرفت پیش‌نویس مقاله', en: 'Manuscript Draft Progress' },
  'metrics.readiness_index': { fa: 'شاخص آمادگی ارسال به ژورنال', en: 'Submission Readiness Score' },
  'metrics.daily_objectives': { fa: 'اهداف روزانه پژوهشگر', en: 'Daily Research Objectives' },
  'metrics.unresolved_questions': { fa: 'پرسش‌های بی‌پاسخ پژوهشی', en: 'Unresolved Research Questions' },
  'metrics.activity_timeline': { fa: 'گاه‌شمار فعالیت‌های علمی', en: 'Scientific Activity Timeline' },

  // Programs
  'programs.agent_os': { fa: 'ALI AgentOS: عامل‌های هوشمند خودمختار', en: 'ALI AgentOS: Autonomous Agents' },
  'programs.knowledge_engine': { fa: 'ALI Knowledge Engine: بازیابی، RAG و گراف دانش', en: 'ALI Knowledge Engine: RAG & Knowledge Graphs' },
  'programs.code_intelligence': { fa: 'ALI Code Intelligence: هوش مصنوعی و مهندسی نرم‌افزار', en: 'ALI Code Intelligence: AI-Assisted SE' },
  'programs.ai_security': { fa: 'ALI AI Security Lab: امنیت LLM و دفاع در برابر تزریق', en: 'ALI AI Security Lab: LLM Security & Defenses' },
  'programs.scientific_discovery': { fa: 'ALI Scientific Discovery: یادگیری ماشین در علم و فیزیک', en: 'ALI Scientific Discovery: AI for Science & Physics' },
  'programs.switch_active': { fa: 'انتخاب به عنوان برنامه فعال پژوهشی', en: 'Set as Active Program' },
  'programs.active_badge': { fa: 'برنامه فعال کنونی', en: 'Active Program' },

  // Literature Discovery
  'discovery.search_placeholder': { fa: 'جستجوی مقالات، DOI، نام پژوهشگر، کلمات کلیدی (OpenAlex, arXiv, Crossref)...', en: 'Search papers, DOI, author, keywords across OpenAlex, arXiv, Crossref...' },
  'discovery.search_btn': { fa: 'جستجوی مراجع علمی', en: 'Search Academic Repositories' },
  'discovery.filter_all': { fa: 'تمام مقالات', en: 'All Repositories' },
  'discovery.filter_peer_reviewed': { fa: 'فقط داوری همتا شده (Peer-Reviewed)', en: 'Peer-Reviewed Only' },
  'discovery.filter_preprints': { fa: 'پیش‌چاپ‌ها (arXiv / Tech Reports)', en: 'Preprints & Tech Reports' },
  'discovery.add_to_library': { fa: 'ذخیره در کتابخانه پژوهشی', en: 'Save to Research Library' },
  'discovery.already_saved': { fa: 'در کتابخانه موجود است', en: 'In Library' },
  'discovery.view_doi': { fa: 'مشاهده DOI رسمی', en: 'View Official DOI' },
  'discovery.extract_bibtex': { fa: 'دریافت فرمت BibTeX', en: 'Extract BibTeX' },
  'discovery.no_results': { fa: 'هیچ مقاله‌ای با این عبارت یافت نشد. می‌توانید با کلمات کلیدی استاندارد علوم کامپیوتر جستجو کنید.', en: 'No papers found. Try standard CS keywords or browse curated seminal papers.' },

  // Literature Matrix
  'matrix.title': { fa: 'ماتریس تحلیلی متون پژوهشی', en: 'Structured Literature Review Matrix' },
  'matrix.subtitle': { fa: 'استخراج نظام‌مند مسئله، روش‌شناسی، دیتاست، دستاورد، محدودیت‌ها و فرصت‌های بکر پژوهشی', en: 'Systematic extraction of problems, methodologies, benchmarks, results, limitations & research opportunities' },
  'matrix.col_paper': { fa: 'مقاله و سال', en: 'Paper & Year' },
  'matrix.col_problem': { fa: 'مسئله پژوهشی', en: 'Research Problem' },
  'matrix.col_method': { fa: 'روش‌شناسی (Methodology)', en: 'Methodology' },
  'matrix.col_dataset': { fa: 'دیتاست و بنچ‌مارک', en: 'Dataset / Benchmark' },
  'matrix.col_results': { fa: 'نتایج تجربی', en: 'Empirical Results' },
  'matrix.col_limitations': { fa: 'محدودیت‌های تصریح‌شده', en: 'Stated Limitations' },
  'matrix.col_opportunity': { fa: 'فرصت توسعه (Research Opportunity)', en: 'Research Opportunity' },
  'matrix.export_csv': { fa: 'خروجی CSV ماتریس', en: 'Export Matrix CSV' },
  'matrix.export_bibtex': { fa: 'خروجی یکپارچه BibTeX', en: 'Export All BibTeX' },

  // Comparison
  'compare.title': { fa: 'موتور تحلیل تطبیقی مقالات', en: 'Research Comparison Engine' },
  'compare.select_instructions': { fa: 'حداقل ۲ مقاله را از کتابخانه جهت مقایسه چندبُعدی انتخاب نمایید:', en: 'Select at least 2 papers from library for multi-dimensional contrastive analysis:' },
  'compare.run_btn': { fa: 'اجرای تحلیل تطبیقی روش‌شناختی', en: 'Run Methodological Comparison' },
  'compare.similarities': { fa: 'نقاط اشتراک فرضیات و اهداف', en: 'Shared Assumptions & Goals' },
  'compare.differences': { fa: 'تفاوت‌های معماری و روش‌شناسی', en: 'Methodological & Architectural Differences' },
  'compare.conflicts': { fa: 'یافته‌های متناقض و شرایط مرزی', en: 'Conflicting Findings & Boundary Conditions' },
  'compare.dataset_variance': { fa: 'تفاوت بنچ‌مارک‌ها و سنجه‌های ارزیابی', en: 'Dataset & Evaluation Metric Variance' },

  // Gap Analyzer
  'gap.title': { fa: 'تحلیلگر شکاف‌های پژوهشی (Research Gap Analyzer)', en: 'Research Gap Analyzer' },
  'gap.subtitle': { fa: 'شناسایی خلاءهای روش‌شناختی، سنجه‌های ارزیابی ناکافی و ترکیب‌های بررسی‌نشده بر پایه شواهد', en: 'Evidence-grounded synthesis of underexplored method combinations, missing evaluations and open questions' },
  'gap.evidence_level': { fa: 'سطح شواهد', en: 'Evidence Level' },
  'gap.confidence_level': { fa: 'درجه اطمینان علمی', en: 'Confidence Level' },
  'gap.candidate_questions': { fa: 'پرسش‌های پژوهشی پیشنهادی برای مقاله شما', en: 'Candidate Research Questions for Investigation' },
  'gap.underexplored': { fa: 'ترکیب متدهای بررسی‌نشده', en: 'Underexplored Method Combinations' },
  'gap.reproducibility': { fa: 'چالش‌های بازتولیدپذیری شناسایی‌شده', en: 'Reproducibility & Robustness Challenges' },
  'gap.add_new': { fa: 'ثبت شکاف پژوهشی جدید', en: 'Register Research Gap' },

  // Experiment Lab
  'exp.title': { fa: 'آزمایشگاه پژوهش و نتایج تجربی (Experiment Lab)', en: 'Experiment Lab & Empirical Results' },
  'exp.subtitle': { fa: 'ثبت دقیق فرضیات، متغیرهای مستقل و وابسته، مقایسه با بیس‌لاین‌ها و ارزیابی معناداری آماری', en: 'Rigorous hypothesis testing, independent/controlled variables, baseline benchmarking & statistical verification' },
  'exp.add_new': { fa: 'تعریف آزمایش جدید', en: 'Define New Experiment' },
  'exp.hypothesis': { fa: 'فرضیه آزمون‌پذیر (Hypothesis)', en: 'Testable Hypothesis' },
  'exp.baseline': { fa: 'مدل بیس‌لاین (Baseline)', en: 'Baseline Model' },
  'exp.proposed': { fa: 'روش پیشنهادی (Proposed)', en: 'Proposed Architecture / Method' },
  'exp.seeds': { fa: 'سیدهای تصادفی (Random Seeds)', en: 'Random Seeds' },
  'exp.dataset': { fa: 'دیتاست مورد استفاده', en: 'Benchmark Dataset' },
  'exp.import_results': { fa: 'وارد کردن نتایج CSV / JSON', en: 'Import CSV / JSON Results' },
  'exp.metrics_table': { fa: 'جدول سنجه‌های کمی و درصد بهبود', en: 'Quantitative Metrics & Percentage Gain' },

  // Writing Studio
  'writing.title': { fa: 'استودیوی نگارش مقاله علمی (Scientific Writing Studio)', en: 'Scientific Manuscript Studio' },
  'writing.subtitle': { fa: 'نگارش ساختاریافته مطابق استانداردهای IEEE و ACM، مدیریت ارجاعات BibTeX و فرمول‌های ریاضی', en: 'Standardized IEEE/ACM section workflows, mathematical formulation, BibTeX citation tracking and LaTeX export' },
  'writing.abstract': { fa: 'چکیده (Abstract)', en: 'Abstract' },
  'writing.intro': { fa: 'مقدمه و طرح مسئله (Introduction)', en: 'Introduction' },
  'writing.related': { fa: 'کارهای مرتبط (Related Work)', en: 'Related Work' },
  'writing.background': { fa: 'پیش‌زمینه و تعاریف پایه (Background)', en: 'Background & Preliminaries' },
  'writing.methodology': { fa: 'روش‌شناسی پیشنهادی (Methodology)', en: 'Proposed Methodology' },
  'writing.math': { fa: 'فرمول‌بندی ریاضی (Mathematical Formulation)', en: 'Mathematical Formulation' },
  'writing.experiments': { fa: 'تنظیمات آزمایشگاهی (Experimental Setup)', en: 'Experimental Setup' },
  'writing.results': { fa: 'یافته‌ها و مقایسه تجربی (Results)', en: 'Empirical Results' },
  'writing.discussion': { fa: 'تحلیل و بحث (Discussion)', en: 'Discussion' },
  'writing.limitations': { fa: 'محدودیت‌ها و تهدیدات اعتبار (Limitations & Threats to Validity)', en: 'Limitations & Threats to Validity' },
  'writing.conclusion': { fa: 'نتیجه‌گیری و کارهای آتی (Conclusion & Future Work)', en: 'Conclusion & Future Work' },
  'writing.export_latex': { fa: 'دریافت فایل یکپارچه LaTeX (.tex)', en: 'Export Full LaTeX (.tex)' },
  'writing.export_markdown': { fa: 'دریافت فایل Markdown (.md)', en: 'Export Markdown (.md)' },
  'writing.export_docx': { fa: 'خروجی پیش‌نویس متنی', en: 'Export Formatted Manuscript' },
  'writing.insert_citation': { fa: 'درج ارجاع BibTeX', en: 'Insert \\cite{}' },
  'writing.save_draft': { fa: 'ذخیره خودکار پیش‌نویس', en: 'Auto-Saved Draft' },
  'writing.dictate_start': { fa: 'تایپ صوتی (میکروفون)', en: 'Voice Dictation' },
  'writing.dictate_stop': { fa: 'توقف ضبط صدا', en: 'Stop Dictation' },
  'writing.dictate_listening': { fa: 'در حال شنیدن و ثبت گفتار پژوهشگر...', en: 'Listening & transcribing...' },
  'writing.dictate_lang_fa': { fa: 'گفتار: فارسی (fa-IR)', en: 'Speech: Persian' },
  'writing.dictate_lang_en': { fa: 'گفتار: انگلیسی (en-US)', en: 'Speech: English' },
  'writing.dictate_error': { fa: 'دسترسی به میکروفون مجاز نشد یا خطایی رخ داد', en: 'Microphone permission denied or error' },
  'writing.dictate_unsupported': { fa: 'مرورگر شما از وب‌ای‌پی‌آی SpeechRecognition پشتیبانی نمی‌کند', en: 'Web SpeechRecognition API not supported' },
  'writing.dictate_append_success': { fa: 'متن گفتار به انتهای بخش افزوده شد', en: 'Dictated transcript inserted' },

  // Project Management
  'pm.title': { fa: 'مدیریت و تقویم وظایف پژوهشی', en: 'Research Project Planning' },
  'pm.kanban': { fa: 'بورد کانبان وظایف', en: 'Kanban Board' },
  'pm.gantt': { fa: 'خط زمان و گانت مراحل', en: 'Research Timeline & Milestones' },
  'pm.add_task': { fa: 'افزودن وظیفه جدید', en: 'Add Research Task' },
  'pm.todo': { fa: 'در انتظار انجام', en: 'To Do' },
  'pm.in_progress': { fa: 'در حال انجام', en: 'In Progress' },
  'pm.review': { fa: 'در حال بازبینی علمی', en: 'Under Peer Review' },
  'pm.done': { fa: 'تکمیل‌شده', en: 'Completed' },

  // Learning Path
  'learn.title': { fa: 'مسیر جامع یادگیری پژوهشگر مستقل', en: 'Independent Researcher Learning Path' },
  'learn.subtitle': { fa: 'از اصول الگوریتم، جبر خطی و بهینه‌سازی تا طراحی آزمایش و نگارش مقاله بین‌المللی', en: 'From core mathematics & algorithms to reproducible experimental design and scientific publishing' },
  'learn.math_foundation': { fa: 'مبانی ریاضی و فرمول‌بندی', en: 'Mathematical Foundation' },
  'learn.example': { fa: 'نمونه کاربردی و پیاده‌سازی', en: 'Practical CS Implementation' },
  'learn.exercise': { fa: 'تمرین پژوهشی خودسنجی', en: 'Research Exercise' },
  'learn.mark_completed': { fa: 'ثبت تسلط بر این مبحث', en: 'Mark Topic Mastered' },

  // Knowledge Graph
  'kg.title': { fa: 'پایگاه دانش اتصالی پژوهش (Connected Knowledge Graph)', en: 'Scientific Knowledge Graph' },
  'kg.subtitle': { fa: 'شبکه ارتباطات معنایی: مقالات ↔ مفاهیم ↔ متدها ↔ دیتاست‌ها ↔ فرضیات ↔ آزمایش‌ها', en: 'Semantic link network: Papers ↔ Concepts ↔ Methods ↔ Datasets ↔ Hypotheses ↔ Experiments' },
  'kg.filter_all': { fa: 'تمام گره‌ها', en: 'All Entities' },
  'kg.topology_network': { fa: 'شبکه توپولوژی معنایی دانش', en: 'SEMANTIC TOPOLOGY NETWORK' },
  'kg.nodes_in_scope': { fa: 'گره در محدوده', en: 'NODES IN SCOPE' },
  'kg.click_instruction': { fa: 'برای بازرسی پیوندهای برگشتی معنایی و فرضیات متصل، روی هر گره کلیک کنید', en: 'Click any node to inspect semantic backlinks and connected hypotheses' },
  'kg.dag_label': { fa: 'گراف جهت‌دار بدون دور (DAG)', en: 'Directional Acyclic Graph (DAG)' },
  'kg.entity_tag': { fa: 'موجودیت', en: 'ENTITY' },
  'kg.spec_label': { fa: 'مشخصات معنایی و شواهد:', en: 'SEMANTIC SPECIFICATION:' },
  'kg.backlinks_label': { fa: 'موجودیت‌های متصل (پیوندهای برگشتی):', en: 'CONNECTED ENTITIES (BACKLINKS):' },
  'kg.select_empty': { fa: 'گره‌ای را در گراف انتخاب کنید تا متدها و شواهد متصل را بررسی نمایید.', en: 'Select a node in the graph network to view connected methods and evidence.' },
  'kg.edges': { fa: 'یال متصل', en: 'edges' },
  'kg.type.All': { fa: 'همه گره‌ها', en: 'All' },
  'kg.type.Paper': { fa: 'مقاله', en: 'Paper' },
  'kg.type.Concept': { fa: 'مفهوم', en: 'Concept' },
  'kg.type.Method': { fa: 'روش‌شناسی', en: 'Method' },
  'kg.type.Dataset': { fa: 'دیتاست', en: 'Dataset' },
  'kg.type.Experiment': { fa: 'آزمایش', en: 'Experiment' },
  'kg.type.Hypothesis': { fa: 'فرضیه', en: 'Hypothesis' },

  // Publication Readiness
  'pub.title': { fa: 'چک‌لیست اعتبارسنجی آمادگی سابمیت بین‌المللی', en: 'International Publication Readiness Protocol' },
  'pub.subtitle': { fa: 'ارزیابی سخت‌گیرانه اصالت، بازتولیدپذیری، شفافیت دیتاست و رعایت الزامات داوری ژورنال‌ها و کنفرانس‌ها', en: 'Rigorous peer-review readiness audit: novelty, reproducibility, dataset availability & ethics' },

  // AI Assistant
  'ai.title': { fa: 'دستیار علمی و داور هوشمند پژوهش', en: 'Intelligent Scientific Research Assistant' },
  'ai.subtitle': { fa: 'تحلیل مقالات دشوار، توضیح مشتقات ریاضی، کشف ادعاهای اثبات‌نشده در متن و پیشنهاد آزمایش', en: 'Deconstruct complex papers, verify mathematical derivations, critique draft claims and formulate experiments' },
  'ai.mode_explain': { fa: 'توضیح عمقی مقاله و متد', en: 'Explain Paper & Method' },
  'ai.mode_math': { fa: 'آموزش و تشریح فرمول ریاضی', en: 'Explain Math & Formulas' },
  'ai.mode_critique': { fa: 'نقد و شناسایی ادعاهای اثبات‌نشده', en: 'Critique Claims & Validity' },
  'ai.mode_gaps': { fa: 'پیشنهاد سوالات و شکاف‌های پژوهشی', en: 'Synthesize Research Gaps' },
  'ai.mode_exp': { fa: 'طراحی آزمایش و متغیرها', en: 'Design Controlled Experiment' },
  'ai.send_btn': { fa: 'ارسال جهت تحلیل علمی', en: 'Run Scientific Analysis' },
  'ai.status_online': { fa: 'مدل متصل به سرور (Gemini 3.8 Flash)', en: 'Server AI Connected (Gemini 3.8 Flash)' },
  'ai.status_local': { fa: 'موتور استنتاج بومی فعال (حالت خودکفا)', en: 'Local Heuristic Engine Active' },

  // Storage & Backup
  'storage.export_json': { fa: 'پشتیبان‌گیری کامل فضای پژوهشی (JSON)', en: 'Export Full Workspace (JSON)' },
  'storage.import_json': { fa: 'بازیابی فضای پژوهشی از فایل', en: 'Import Workspace (JSON)' },
  'storage.reset': { fa: 'بازنشانی به حالت اولیه پیش‌فرض', en: 'Reset to Factory Defaults' },
  'storage.saved_status': { fa: 'داده‌ها به صورت پایدار در فضای مرورگر ذخیره شده است', en: 'All research artifacts securely persisted locally' },

  // Onboarding
  'onboarding.welcome_title': { fa: 'به سیستم‌عامل پژوهشی علی خوش آمدید', en: 'Welcome to ALI Research OS' },
  'onboarding.mission': { fa: 'محیط هوشمند پژوهش و توسعه علمی برای تبدیل یک پژوهشگر مستقل به نگارنده پژوهش‌های اصیل، قابل بازتولید و آماده انتشار در معتبرترین محافل علمی علوم کامپیوتر جهان.', en: 'An intelligent research and development operating system engineered to guide an independent researcher into producing technically sound, reproducible, publication-ready computer science science.' },
  'onboarding.name_label': { fa: 'نام یا نام مستعار پژوهشگر:', en: 'Researcher Name / Alias:' },
  'onboarding.level_label': { fa: 'سطح تجربه کنونی در پژوهش علمی:', en: 'Current Academic Experience Level:' },
  'onboarding.level_beginner': { fa: 'تازه در حال ورود به دنیای پژوهش علمی هستم', en: 'Entering scientific research' },
  'onboarding.level_intermediate': { fa: 'آشنا با مطالعه مقالات، نیازمند متدولوژی دقیق و پیاده‌سازی', en: 'Familiar with papers, refining methodology' },
  'onboarding.level_advanced': { fa: 'پژوهشگر با سابقه، متمرکز بر مقالات ژورنال و کنفرانس تراز اول', en: 'Experienced researcher targeting top-tier venues' },
  'onboarding.program_select': { fa: 'برنامه پژوهشی اولیه خود را انتخاب کنید:', en: 'Select your initial Research Program:' },
  'onboarding.start_btn': { fa: 'شروع سیستم‌عامل و بارگذاری فضای پژوهش', en: 'Initialize Workspace & Launch OS' },
  
  // Generic
  'btn.cancel': { fa: 'انصراف', en: 'Cancel' },
  'btn.save': { fa: 'ذخیره تغییرات', en: 'Save Changes' },
  'btn.close': { fa: 'بستن', en: 'Close' },
  'btn.delete': { fa: 'حذف', en: 'Delete' },
  'btn.details': { fa: 'مشاهده جزئیات', en: 'View Details' },
  'status.ready': { fa: 'آماده', en: 'Ready' },
  'status.in_progress': { fa: 'در حال پردازش', en: 'Processing' }
};
