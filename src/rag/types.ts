export interface Document {
  id: string;
  text: string;
}

export interface EmbeddedDocument extends Document {
  embedding: number[];
}

export interface EmbedResult {
  allDocs: EmbeddedDocument[];
  newCount: number;
  skippedCount: number;
}

export interface SearchResult {
  document: EmbeddedDocument;
  score: number;
}

