# RAG (Retrieval-Augmented Generation) Setup Guide

This document provides comprehensive guidance for implementing a RAG system for the Coffee Copilot to search and reference your documentation.

## What is RAG?

RAG allows the AI to:
1. Search your documentation in real-time
2. Ground answers in factual information
3. Cite sources for transparency
4. Stay up-to-date as docs change

## Architecture

```
User Query → Embed Query → Vector Search → Retrieve Top-K Docs → Send to AI → Answer with Citations
```

## Vector Database Options

### Option 1: pgvector (PostgreSQL Extension) - Recommended for Existing Postgres Users

**Pros:**
- Works with existing PostgreSQL database
- No additional service required
- Good for small to medium doc collections
- Lower cost

**Setup:**
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for document embeddings
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(3072), -- text-embedding-3-large dimension
  source VARCHAR(500),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

**Search implementation:**
```typescript
import { Pool } from 'pg';
import { OpenAI } from 'openai';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function searchDocs(query: string, limit = 5) {
  // 1. Convert query to embedding
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query
  });

  const vector = embedding.data[0].embedding;

  // 2. Search for similar documents
  const result = await pool.query(
    `SELECT content, source, metadata,
            1 - (embedding <=> $1::vector) AS similarity
     FROM documents
     WHERE 1 - (embedding <=> $1::vector) > 0.7
     ORDER BY similarity DESC
     LIMIT $2`,
    [JSON.stringify(vector), limit]
  );

  return result.rows.map(row => ({
    text: row.content,
    source: row.source,
    score: row.similarity,
    metadata: row.metadata
  }));
}
```

### Option 2: Pinecone - Managed Vector Database

**Pros:**
- Fully managed service
- Excellent for production at scale
- Built-in hybrid search
- Great performance

**Setup:**
```bash
npm install @pinecone-database/pinecone
```

```typescript
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const index = pinecone.index('coffee-docs');

async function searchDocs(query: string, limit = 5) {
  // 1. Convert query to embedding
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query
  });

  // 2. Query Pinecone
  const results = await index.query({
    vector: embedding.data[0].embedding,
    topK: limit,
    includeMetadata: true
  });

  return results.matches.map(match => ({
    text: match.metadata?.content as string,
    source: match.metadata?.source as string,
    score: match.score,
    metadata: match.metadata
  }));
}
```

### Option 3: Qdrant - Open Source Vector Database

**Pros:**
- Open source
- Can self-host or use cloud
- Rich filtering capabilities
- Great performance

**Setup:**
```bash
npm install @qdrant/js-client-rest
```

```typescript
import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAI } from 'openai';

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function searchDocs(query: string, limit = 5) {
  // 1. Convert query to embedding
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query
  });

  // 2. Search Qdrant
  const results = await qdrant.search('coffee-docs', {
    vector: embedding.data[0].embedding,
    limit,
    with_payload: true
  });

  return results.map(result => ({
    text: result.payload?.content as string,
    source: result.payload?.source as string,
    score: result.score,
    metadata: result.payload
  }));
}
```

## Document Preparation

### 1. Collect Your Documents

Gather all content you want the copilot to reference:
- Product descriptions
- Brewing guides
- FAQ pages
- Blog posts
- Technical documentation
- Origin stories

Supported formats:
- Markdown (`.md`)
- HTML (`.html`)
- PDF (`.pdf`)
- Plain text (`.txt`)

### 2. Text Chunking Strategy

**Why chunk?** Embeddings work best on focused passages (300-800 tokens).

**Chunking approaches:**

**A. Semantic chunking (recommended):**
Split on natural boundaries (paragraphs, sections).

```typescript
function semanticChunk(text: string, maxTokens = 500): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = '';
  let currentTokens = 0;

  for (const para of paragraphs) {
    const paraTokens = estimateTokens(para);

    if (currentTokens + paraTokens > maxTokens && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
      currentTokens = paraTokens;
    } else {
      currentChunk += '\n\n' + para;
      currentTokens += paraTokens;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}
```

**B. Sliding window chunking:**
For dense technical content, use overlapping chunks.

```typescript
function slidingWindowChunk(
  text: string,
  chunkSize = 500,
  overlap = 100
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
  }

  return chunks;
}
```

**C. Markdown-aware chunking:**
Preserve headings for context.

```typescript
function markdownChunk(markdown: string, maxTokens = 500): string[] {
  const sections = markdown.split(/(?=^#{1,3}\s)/m);
  const chunks: string[] = [];

  for (const section of sections) {
    const lines = section.split('\n');
    const heading = lines[0];
    const content = lines.slice(1).join('\n');

    if (estimateTokens(section) <= maxTokens) {
      chunks.push(section);
    } else {
      // Split long sections while keeping heading
      const subchunks = semanticChunk(content, maxTokens - estimateTokens(heading));
      chunks.push(...subchunks.map(chunk => `${heading}\n\n${chunk}`));
    }
  }

  return chunks;
}
```

### 3. Extract Metadata

Enrich chunks with metadata for better retrieval and filtering:

```typescript
type DocumentMetadata = {
  source: string;        // File path or URL
  title?: string;        // Document title
  section?: string;      // Section/heading
  category?: string;     // beans, brewing, equipment, etc.
  lastUpdated?: Date;    // When doc was last updated
  tags?: string[];       // Search tags
  url?: string;          // Public URL if available
};

function extractMetadata(filePath: string, chunk: string): DocumentMetadata {
  const category = filePath.includes('beans') ? 'beans'
                 : filePath.includes('brewing') ? 'brewing'
                 : filePath.includes('equipment') ? 'equipment'
                 : 'general';

  // Extract heading if present
  const headingMatch = chunk.match(/^#{1,3}\s+(.+)$/m);
  const section = headingMatch ? headingMatch[1] : undefined;

  return {
    source: filePath,
    category,
    section,
    lastUpdated: new Date()
  };
}
```

## Document Indexing

### Complete Indexing Script

```typescript
// index-docs.ts
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import { chunk } from 'lodash';
import { Pool } from 'pg'; // or your vector DB client

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Batch embeddings for efficiency
async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: texts
  });
  return response.data.map(d => d.embedding);
}

// Read and process files
async function indexDirectory(dirPath: string) {
  const files = fs.readdirSync(dirPath, { recursive: true }) as string[];

  for (const file of files) {
    const filePath = path.join(dirPath, file);

    // Skip directories
    if (!fs.statSync(filePath).isFile()) continue;

    // Skip non-text files
    if (!['.md', '.txt', '.html'].some(ext => filePath.endsWith(ext))) {
      continue;
    }

    console.log(`Processing: ${filePath}`);

    const content = fs.readFileSync(filePath, 'utf8');
    const chunks = semanticChunk(content, 500);

    // Process in batches of 100 (OpenAI limit is 2048)
    for (const batch of chunk(chunks, 100)) {
      const embeddings = await createEmbeddings(batch);

      // Insert into database
      for (let i = 0; i < batch.length; i++) {
        const metadata = extractMetadata(filePath, batch[i]);

        await pool.query(
          `INSERT INTO documents (content, embedding, source, metadata)
           VALUES ($1, $2, $3, $4)`,
          [
            batch[i],
            JSON.stringify(embeddings[i]),
            filePath,
            JSON.stringify(metadata)
          ]
        );
      }

      console.log(`  Indexed ${batch.length} chunks`);
    }
  }

  console.log('✅ Indexing complete!');
}

// Run indexing
indexDirectory('./docs/coffee')
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Indexing failed:', err);
    process.exit(1);
  });
```

### Incremental Updates

Update docs without re-indexing everything:

```typescript
async function updateDocument(filePath: string) {
  // 1. Delete old chunks
  await pool.query('DELETE FROM documents WHERE source = $1', [filePath]);

  // 2. Re-index the file
  const content = fs.readFileSync(filePath, 'utf8');
  const chunks = semanticChunk(content, 500);
  const embeddings = await createEmbeddings(chunks);

  // 3. Insert new chunks
  for (let i = 0; i < chunks.length; i++) {
    const metadata = extractMetadata(filePath, chunks[i]);
    await pool.query(
      `INSERT INTO documents (content, embedding, source, metadata)
       VALUES ($1, $2, $3, $4)`,
      [chunks[i], JSON.stringify(embeddings[i]), filePath, JSON.stringify(metadata)]
    );
  }

  console.log(`✅ Updated ${filePath}`);
}
```

## Search Optimization

### 1. Hybrid Search (Vector + Keyword)

Combine vector similarity with keyword matching:

```typescript
async function hybridSearch(query: string, limit = 5) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query
  });

  const vector = embedding.data[0].embedding;

  // Combine vector similarity with keyword search
  const result = await pool.query(
    `SELECT content, source, metadata,
            (0.7 * (1 - (embedding <=> $1::vector)) +
             0.3 * ts_rank(to_tsvector('english', content), plainto_tsquery('english', $2))) AS score
     FROM documents
     ORDER BY score DESC
     LIMIT $3`,
    [JSON.stringify(vector), query, limit]
  );

  return result.rows;
}
```

### 2. Metadata Filtering

Filter by category, date, or tags:

```typescript
async function searchWithFilters(
  query: string,
  filters: { category?: string; tags?: string[] } = {},
  limit = 5
) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query
  });

  const conditions = ['1 = 1'];
  const params: any[] = [JSON.stringify(embedding.data[0].embedding)];

  if (filters.category) {
    params.push(filters.category);
    conditions.push(`metadata->>'category' = $${params.length}`);
  }

  if (filters.tags) {
    params.push(filters.tags);
    conditions.push(`metadata->'tags' ?| $${params.length}`);
  }

  params.push(limit);

  const result = await pool.query(
    `SELECT content, source, metadata,
            1 - (embedding <=> $1::vector) AS score
     FROM documents
     WHERE ${conditions.join(' AND ')}
     ORDER BY score DESC
     LIMIT $${params.length}`,
    params
  );

  return result.rows;
}
```

### 3. Re-ranking

Improve results by re-ranking with a more powerful model:

```typescript
async function searchWithReranking(query: string, limit = 5) {
  // 1. Get initial candidates (e.g., top 20)
  const candidates = await searchDocs(query, 20);

  // 2. Re-rank using OpenAI or a dedicated model
  const reranked = await Promise.all(
    candidates.map(async (doc) => {
      const prompt = `Query: "${query}"\n\nDocument: "${doc.text}"\n\nRelevance score (0-1):`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 10
      });

      const score = parseFloat(response.choices[0].message.content || '0');
      return { ...doc, rerankScore: score };
    })
  );

  // 3. Sort by rerank score and return top K
  return reranked
    .sort((a, b) => b.rerankScore - a.rerankScore)
    .slice(0, limit);
}
```

## Best Practices

1. **Chunk size**: 300-800 tokens works well for most use cases
2. **Overlap**: Use 10-20% overlap for technical content
3. **Metadata**: Always include source and category
4. **Freshness**: Re-index docs when they change
5. **Quality**: Clean up docs before indexing (remove boilerplate, navigation)
6. **Testing**: Test with real user queries to refine chunking
7. **Monitoring**: Track which docs get retrieved most often

## Testing Your RAG System

```typescript
// test-rag.ts
const testQueries = [
  "What's the difference between arabica and robusta?",
  "How do I make a pour over?",
  "What beans are best for espresso?"
];

async function testRAG() {
  for (const query of testQueries) {
    console.log(`\n Query: ${query}`);

    const results = await searchDocs(query, 3);

    results.forEach((result, i) => {
      console.log(`\n  Result ${i + 1} (score: ${result.score.toFixed(2)})`);
      console.log(`  Source: ${result.source}`);
      console.log(`  Content: ${result.text.slice(0, 150)}...`);
    });
  }
}

testRAG();
```

## Cost Optimization

1. **Cache embeddings**: Don't re-embed the same queries
2. **Batch processing**: Embed multiple docs at once
3. **Use smaller models**: text-embedding-3-small for non-critical searches
4. **Limit candidates**: Retrieve fewer docs per query
5. **Monitor usage**: Track OpenAI API costs

```typescript
import { createHash } from 'crypto';

const embeddingCache = new Map<string, number[]>();

async function cachedEmbedding(text: string): Promise<number[]> {
  const hash = createHash('sha256').update(text).digest('hex');

  if (embeddingCache.has(hash)) {
    return embeddingCache.get(hash)!;
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text
  });

  const embedding = response.data[0].embedding;
  embeddingCache.set(hash, embedding);

  return embedding;
}
```
