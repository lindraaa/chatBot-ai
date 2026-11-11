const GEMINI_EMBEDDING_DIMENSION = 768;

interface GeminiEmbeddingResponse {
  embedding?: { values?: number[] };
}

export class GeminiEmbeddingService {
  async embed(text: string): Promise<number[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY must be configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text }] },
          outputDimensionality: GEMINI_EMBEDDING_DIMENSION,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini embedding request failed with status ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as GeminiEmbeddingResponse;
    const values = data.embedding?.values;

    if (!values || values.length !== GEMINI_EMBEDDING_DIMENSION) {
      throw new Error(`Gemini returned an invalid embedding dimension; expected ${GEMINI_EMBEDDING_DIMENSION}`);
    }

    return values;
  }
}
