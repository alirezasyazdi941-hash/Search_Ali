import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json({ limit: '10mb' }));

/**
 * Health check & status endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'ALI Research OS Engine',
    hasGeminiKey: Boolean(process.env['GEMINI_API_KEY']),
    timestamp: new Date().toISOString()
  });
});

/**
 * Gemini Research AI Assistant endpoint
 */
app.post('/api/gemini/assistant', async (req, res) => {
  const { prompt, systemInstruction, mode } = req.body;
  const apiKey = process.env['GEMINI_API_KEY'];

  if (!apiKey) {
    return res.status(200).json({
      success: false,
      isConfigured: false,
      message: 'GEMINI_API_KEY is not configured in environment secrets. Using local deterministic research engine heuristics.',
      text: null
    });
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || 'You are the intelligent scientific core of ALI Research OS. You provide rigorous, evidence-based computer science research analysis, technical precision, reproducible experimental formulations, and mathematical clarity. Always distinguish known peer-reviewed evidence from conjectures.',
      }
    });

    return res.json({
      success: true,
      isConfigured: true,
      text: response.text || ''
    });
  } catch (err: any) {
    console.error('Gemini API Error in ALI Research OS:', err);
    return res.status(500).json({
      success: false,
      isConfigured: true,
      error: err?.message || 'Error processing request with Gemini model'
    });
  }
});

/**
 * Academic Discovery Proxy: OpenAlex / Crossref
 */
app.get('/api/discovery/academic-search', async (req, res) => {
  const query = (req.query['q'] as string) || '';
  const filter = (req.query['filter'] as string) || '';

  if (!query.trim()) {
    return res.json({ works: [] });
  }

  try {
    const openAlexUrl = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=12&sort=relevance_score:desc`;
    const response = await fetch(openAlexUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ALI-Research-OS/1.0 (mailto:research@alios.local)'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!response.ok) {
      throw new Error(`OpenAlex HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const works = (data.results || []).map((item: any) => ({
      id: item.id || `work-${Math.random()}`,
      doi: item.doi ? item.doi.replace('https://doi.org/', '') : (item.ids?.doi ? item.ids.doi.replace('https://doi.org/', '') : null),
      title: item.title || item.display_name || 'Untitled Paper',
      authors: (item.authorships || []).map((a: any) => a.author?.display_name).filter(Boolean),
      year: item.publication_year || new Date().getFullYear(),
      venue: item.primary_location?.source?.display_name || item.host_venue?.name || 'Academic Venue',
      type: item.type === 'journal-article' ? 'Journal' : item.type === 'proceedings-article' ? 'Conference' : item.type === 'preprint' ? 'Preprint' : 'Publication',
      citations: item.cited_by_count ?? 0,
      url: item.doi || item.primary_location?.landing_page_url || item.id,
      openAccessUrl: item.open_access?.oa_url || item.primary_location?.pdf_url || null,
      abstract: item.abstract_inverted_index ? reconstructInvertedIndex(item.abstract_inverted_index) : (item.abstract || 'Abstract available via publisher landing page.'),
      keywords: (item.concepts || []).slice(0, 5).map((c: any) => c.display_name)
    }));

    return res.json({ works });
  } catch (err: any) {
    console.warn('Academic live discovery query failed or timed out:', err?.message);
    // Return gracefully so client falls back to curated verified dataset
    return res.json({ works: [], fallbackNeeded: true, message: err?.message });
  }
});

function reconstructInvertedIndex(invertedIndex: Record<string, number[]>): string {
  try {
    const wordPositions: { word: string; pos: number }[] = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const pos of positions) {
        wordPositions.push({ word, pos });
      }
    }
    wordPositions.sort((a, b) => a.pos - b.pos);
    return wordPositions.map(wp => wp.word).join(' ');
  } catch {
    return 'Detailed abstract indexed in original source.';
  }
}

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
