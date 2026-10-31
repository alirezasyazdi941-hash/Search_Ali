import { Injectable, inject } from '@angular/core';
import { Paper, ProgramId } from '../models/research.types';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class DiscoveryService {
  private storage = inject(StorageService);

  async searchAcademicPapers(query: string, activeProgramId: ProgramId): Promise<{ papers: Paper[]; source: 'live' | 'curated'; message?: string }> {
    const trimmed = query.trim();
    if (!trimmed) {
      return { papers: [], source: 'curated' };
    }

    try {
      const response = await fetch(`/api/discovery/academic-search?q=${encodeURIComponent(trimmed)}`, {
        signal: AbortSignal.timeout(6000)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.works && data.works.length > 0) {
          const livePapers: Paper[] = data.works.map((w: any) => ({
            id: `alex-${w.id.split('/').pop() || Math.random().toString(36).substring(7)}`,
            programId: activeProgramId,
            title: w.title,
            authors: w.authors && w.authors.length > 0 ? w.authors : ['Academic Research Team'],
            year: w.year || new Date().getFullYear(),
            abstract: w.abstract || 'Detailed abstract available in publication portal.',
            doi: w.doi || '',
            venue: w.venue || 'Peer-Reviewed Conference / Journal',
            type: w.type || 'Publication',
            citations: w.citations ?? 0,
            url: w.url || (w.doi ? `https://doi.org/${w.doi}` : '#'),
            openAccessUrl: w.openAccessUrl || undefined,
            domain: w.keywords && w.keywords.length > 0 ? w.keywords[0] : 'Computer Science',
            keywords: w.keywords || ['Computer Science', 'Machine Learning'],
            bibtex: this.generateBibtexFromMeta(w),
            savedAt: new Date().toISOString()
          }));
          return { papers: livePapers, source: 'live' };
        }
      }
    } catch (e) {
      console.warn('Live API request failed, switching to curated academic repository:', e);
    }

    // Fallback search across curated repositories
    const qLower = trimmed.toLowerCase();
    const allCurated = this.storage.papers();
    const matches = allCurated.filter(p => 
      p.title.toLowerCase().includes(qLower) ||
      p.authors.some(a => a.toLowerCase().includes(qLower)) ||
      p.keywords.some(k => k.toLowerCase().includes(qLower)) ||
      (p.doi && p.doi.toLowerCase().includes(qLower)) ||
      p.abstract.toLowerCase().includes(qLower)
    );

    return { 
      papers: matches.length > 0 ? matches : allCurated, 
      source: 'curated', 
      message: 'Using verified seminal papers repository (live academic search returned 0 items or timed out).' 
    };
  }

  generateBibtexFromMeta(paper: Partial<Paper>): string {
    const firstAuthor = paper.authors && paper.authors.length > 0 ? paper.authors[0].split(' ').pop()?.toLowerCase() || 'author' : 'author';
    const year = paper.year || new Date().getFullYear();
    const key = `${firstAuthor}${year}`;
    const authorStr = (paper.authors || []).join(' and ');
    return `@article{${key},
  title={${paper.title || 'Untitled'}},
  author={${authorStr}},
  journal={${paper.venue || 'Academic Repository'}},
  year={${year}},
  doi={${paper.doi || ''}}
}`;
  }

  parseBibtex(bibtexText: string, targetProgram: ProgramId): Partial<Paper>[] {
    const papers: Partial<Paper>[] = [];
    const entries = bibtexText.split(/@\w+\s*\{/g).filter(e => e.trim().length > 0);

    for (const entry of entries) {
      const titleMatch = entry.match(/title\s*=\s*[\{"]([^"\}]+)[\}"]/i);
      const authorMatch = entry.match(/author\s*=\s*[\{"]([^"\}]+)[\}"]/i);
      const yearMatch = entry.match(/year\s*=\s*[\{"]?(\d{4})[\}"]?/i);
      const doiMatch = entry.match(/doi\s*=\s*[\{"]([^"\}]+)[\}"]/i);
      const journalMatch = entry.match(/(?:journal|booktitle)\s*=\s*[\{"]([^"\}]+)[\}"]/i);

      if (titleMatch) {
        const authors = authorMatch ? authorMatch[1].split(/\s+and\s+/i) : ['Unknown Researcher'];
        const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
        papers.push({
          id: `bib-${Math.random().toString(36).substring(7)}`,
          programId: targetProgram,
          title: titleMatch[1].trim(),
          authors,
          year,
          venue: journalMatch ? journalMatch[1].trim() : 'Indexed Venue',
          doi: doiMatch ? doiMatch[1].trim() : '',
          type: journalMatch && journalMatch[1].toLowerCase().includes('conference') ? 'Conference Proceeding' : 'Peer-Reviewed Journal',
          citations: 0,
          url: doiMatch ? `https://doi.org/${doiMatch[1].trim()}` : '#',
          domain: 'Computer Science',
          keywords: ['Imported BibTeX'],
          abstract: 'Imported from researcher BibTeX file.',
          bibtex: `@article{import_${year},\n  title={${titleMatch[1]}},\n  author={${authors.join(' and ')}},\n  year={${year}}\n}`,
          savedAt: new Date().toISOString()
        });
      }
    }
    return papers;
  }
}
