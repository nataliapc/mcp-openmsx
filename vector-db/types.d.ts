declare module '@themaximalist/embeddings.js' {
  export default class Embeddings {
    constructor(options?: any);
    embed(text: string): Promise<number[]>;
  }
}

declare module '@elpassion/semantic-chunking' {
  export function chunk(text: string, options?: {
    maxTokens?: number;
    overlap?: number;
    model?: string;
  }): Promise<string[]>;
}