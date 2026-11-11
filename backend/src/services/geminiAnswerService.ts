interface GeminiCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
}

interface GeminiGenerateResponse {
  candidates?: GeminiCandidate[];
}

export interface GeneratedAnswer {
  answer: string;
  topic: string;
  noAnswerFound: boolean;
}

const TOPICS = [
  'Rooms',
  'Restaurant',
  'Pool',
  'Parking',
  'Spa',
  'Check-in/Check-out',
  'Pricing',
  'Location',
  'Facilities',
  'Other',
] as const;

export class GeminiAnswerService {
  async generateAnswer(input: {
    question: string;
    context: string[];
    history: Array<{ role: 'user' | 'ai'; content: string }>;
  }): Promise<GeneratedAnswer> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY must be configured');
    }

    const prompt = this.buildPrompt(input);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini answer request failed with status ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as GeminiGenerateResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini returned an empty answer');
    }

    return this.parseAnswer(text);
  }

  private buildPrompt(input: {
    question: string;
    context: string[];
    history: Array<{ role: 'user' | 'ai'; content: string }>;
  }): string {
    const history = input.history
      .map((message) => `${message.role === 'user' ? 'Guest' : 'Assistant'}: ${message.content}`)
      .join('\n');

    return `You are a helpful hotel assistant.

Answer only using the knowledge-base context below and the conversation history.
If the context does not answer the question, do not guess. Set noAnswerFound to true
and answer: "I don't have that information. Please contact the hotel directly."
Classify the question into exactly one of: ${TOPICS.join(', ')}.

Knowledge-base context:
${input.context.join('\n\n---\n\n')}

Conversation history:
${history || '(none)'}

Guest question:
${input.question}

Return JSON only:
{
  "answer": "string",
  "topic": "one allowed topic",
  "noAnswerFound": true or false
}`;
  }

  private parseAnswer(text: string): GeneratedAnswer {
    const normalized = text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    let parsed: unknown;
    try {
      parsed = JSON.parse(normalized);
    } catch {
      throw new Error('Gemini returned invalid JSON for the answer');
    }

    if (!this.isAnswer(parsed)) {
      throw new Error('Gemini returned an invalid answer shape');
    }

    return {
      answer: parsed.answer.trim(),
      topic: TOPICS.includes(parsed.topic as (typeof TOPICS)[number]) ? parsed.topic : 'Other',
      noAnswerFound: parsed.noAnswerFound,
    };
  }

  private isAnswer(value: unknown): value is GeneratedAnswer {
    if (!value || typeof value !== 'object') {
      return false;
    }
    const answer = value as Record<string, unknown>;
    return (
      typeof answer.answer === 'string' &&
      answer.answer.trim().length > 0 &&
      typeof answer.topic === 'string' &&
      typeof answer.noAnswerFound === 'boolean'
    );
  }
}
