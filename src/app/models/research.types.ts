export type Language = 'fa' | 'en';

export type ProgramId = 
  | 'agent-os' 
  | 'knowledge-engine' 
  | 'code-intelligence' 
  | 'ai-security' 
  | 'scientific-discovery';

export interface ResearchProgram {
  id: ProgramId;
  code: string;
  titleFa: string;
  titleEn: string;
  subtitleFa: string;
  subtitleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  icon: string;
  readinessScore: number; // 0-100%
  color: string;
  activeQuestionsCount: number;
  hypothesesCount: number;
  papersCount: number;
  experimentsCount: number;
  keyTopics: string[];
}

export interface Paper {
  id: string;
  programId: ProgramId;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  doi: string;
  venue: string;
  type: 'Peer-Reviewed Journal' | 'Conference Proceeding' | 'Preprint' | 'Technical Report';
  citations: number;
  url: string;
  openAccessUrl?: string;
  domain: string;
  keywords: string[];
  bibtex: string;
  notes?: string;
  highlights?: string[];
  extractedMethods?: string;
  extractedDatasets?: string;
  extractedLimitations?: string;
  extractedOpportunities?: string;
  unresolvedQuestions?: string[];
  relatedPaperIds?: string[];
  savedAt: string;
  isCurated?: boolean;
}

export interface LiteratureMatrixRow {
  paperId: string;
  title: string;
  year: number;
  problem: string;
  method: string;
  dataset: string;
  results: string;
  limitations: string;
  opportunity: string;
  source: string;
}

export interface ResearchGap {
  id: string;
  programId: ProgramId;
  title: string;
  description: string;
  evidenceLevel: 'Empirical' | 'Theoretical' | 'Methodological' | 'Anecdotal';
  confidenceLevel: 'High' | 'Medium' | 'Low';
  candidateQuestions: string[];
  supportingPaperIds: string[];
  underexploredCombinations: string;
  missingDatasets: string;
  reproducibilityIssues: string;
  dateIdentified: string;
  status: 'Open' | 'Under Investigation' | 'Addressed';
}

export interface ExperimentMetric {
  name: string;
  baselineValue: number;
  proposedValue: number;
  unit: string;
  improvementPercentage: number;
  pValue?: number;
}

export interface Experiment {
  id: string;
  programId: ProgramId;
  title: string;
  hypothesis: string;
  baselineModel: string;
  proposedModel: string;
  variables: {
    independent: string[];
    dependent: string[];
    controlled: string[];
  };
  datasetRef: string;
  randomSeeds: number[];
  metrics: ExperimentMetric[];
  status: 'Planned' | 'Running' | 'Completed' | 'Failed';
  reproducibilityNotes: string;
  codeSnippet?: string;
  executionDate: string;
  datasetRowCount?: number;
}

export interface LearningLesson {
  id: string;
  moduleNumber: number;
  category: 'Algorithms' | 'DataStructures' | 'LinearAlgebra' | 'ProbabilityStats' | 'Optimization' | 'MachineLearning' | 'DeepLearning' | 'ResearchMethodology' | 'ScientificWriting' | 'ExperimentalDesign' | 'Reproducibility';
  titleFa: string;
  titleEn: string;
  objectiveFa: string;
  objectiveEn: string;
  contentFa: string;
  contentEn: string;
  mathFoundation: string;
  practicalExample: string;
  exerciseFa: string;
  exerciseEn: string;
  references: string[];
  completed: boolean;
  masteryScore?: number;
}

export interface ResearchTask {
  id: string;
  programId: ProgramId;
  title: string;
  type: 'Reading' | 'Writing' | 'Experiment' | 'Methodology' | 'Milestone';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  estimatedHours: number;
  completedHours?: number;
  notes?: string;
}

export interface ResearchPaperDraft {
  id: string;
  programId: ProgramId;
  title: string;
  authors: string;
  targetVenue: string;
  abstract: string;
  introduction: string;
  relatedWork: string;
  background: string;
  methodology: string;
  mathematicalFormulation: string;
  experimentalSetup: string;
  results: string;
  discussion: string;
  limitations: string;
  conclusion: string;
  bibtexEntries: string;
  version: number;
  lastUpdated: string;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  labelFa?: string;
  type: 'Paper' | 'Concept' | 'Method' | 'Dataset' | 'Experiment' | 'Hypothesis';
  programId: ProgramId;
  details: string;
  detailsFa?: string;
  connections: string[]; // ids of other nodes
}

export interface PublicationChecklist {
  scopeCompatibility: boolean;
  noveltyEvidence: boolean;
  methodologicalClarity: boolean;
  reproducibility: boolean;
  datasetAvailability: boolean;
  statisticalValidity: boolean;
  citationCompleteness: boolean;
  ethicalRequirements: boolean;
  formattingCheck: boolean;
  authorContributions: boolean;
  dataAvailabilityStatement: boolean;
  targetVenueNotes?: string;
}

export interface UserProfile {
  name: string;
  affiliation: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  activeProgramId: ProgramId;
  language: Language;
  onboardingCompleted: boolean;
  startDate: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: 'explain_paper' | 'math_tutor' | 'critique_writing' | 'find_gaps' | 'experiment_design';
  isLiveGemini?: boolean;
}
