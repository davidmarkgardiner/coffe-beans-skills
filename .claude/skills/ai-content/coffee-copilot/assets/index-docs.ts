// index-docs.ts - Document Indexing Script for RAG
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Directory containing your documentation
  docsDirectory: './docs/coffee',

  // Maximum tokens per chunk (adjust based on your needs)
  maxChunkTokens: 500,

  // Overlap between chunks (in tokens)
  chunkOverlap: 100,

  // File extensions to process
  allowedExtensions: ['.md', '.txt', '.html'],

  // Batch size for embedding API calls
  embeddingBatchSize: 100,

  // Embedding model
  embeddingModel: 'text-embedding-3-large' as const
};

// ============================================================================
// TYPES
// ============================================================================

type DocumentChunk = {
  content: string;
  source: string;
  metadata: {
    category?: string;
    section?: string;
    title?: string;
    tags?: string[];
  };
};

type EmbeddedChunk = DocumentChunk & {
  embedding: number[];
};

// ============================================================================
// CHUNKING FUNCTIONS
// ============================================================================

/**
 * Estimate token count (rough approximation)
 */
function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Semantic chunking - splits on paragraph boundaries
 */
function semanticChunk(text: string, maxTokens: number = 500): string[] {
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
      currentChunk += (currentChunk ? '\n\n' : '') + para;
      currentTokens += paraTokens;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Markdown-aware chunking - preserves headings
 */
function markdownChunk(markdown: string, maxTokens: number = 500): string[] {
  const sections = markdown.split(/(?=^#{1,3}\s)/m);
  const chunks: string[] = [];

  for (const section of sections) {
    const lines = section.split('\n');
    const heading = lines.find(line => line.match(/^#{1,3}\s/)) || '';
    const content = section.replace(heading, '').trim();

    if (estimateTokens(section) <= maxTokens) {
      chunks.push(section.trim());
    } else {
      // Split long sections while keeping heading
      const subchunks = semanticChunk(
        content,
        maxTokens - estimateTokens(heading)
      );
      chunks.push(
        ...subchunks.map(chunk =>
          heading ? `${heading}\n\n${chunk}` : chunk
        )
      );
    }
  }

  return chunks.filter(chunk => chunk.trim().length > 0);
}

// ============================================================================
// METADATA EXTRACTION
// ============================================================================

/**
 * Extract metadata from file path and content
 */
function extractMetadata(
  filePath: string,
  content: string
): DocumentChunk['metadata'] {
  // Infer category from file path
  const category = filePath.includes('beans') ? 'beans'
                 : filePath.includes('brewing') ? 'brewing'
                 : filePath.includes('equipment') ? 'equipment'
                 : filePath.includes('faq') ? 'faq'
                 : 'general';

  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : path.basename(filePath, path.extname(filePath));

  // Extract section from heading
  const sectionMatch = content.match(/^#{1,3}\s+(.+)$/m);
  const section = sectionMatch ? sectionMatch[1] : undefined;

  return {
    category,
    title,
    section
  };
}

// ============================================================================
// EMBEDDING FUNCTIONS
// ============================================================================

/**
 * Create embeddings for a batch of texts
 */
async function createEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: CONFIG.embeddingModel,
      input: texts
    });

    return response.data.map(d => d.embedding);
  } catch (error) {
    console.error('Error creating embeddings:', error);
    throw error;
  }
}

/**
 * Batch process chunks into embeddings
 */
async function batchEmbed(chunks: DocumentChunk[]): Promise<EmbeddedChunk[]> {
  const embeddedChunks: EmbeddedChunk[] = [];

  // Process in batches
  for (let i = 0; i < chunks.length; i += CONFIG.embeddingBatchSize) {
    const batch = chunks.slice(i, i + CONFIG.embeddingBatchSize);
    const texts = batch.map(chunk => chunk.content);

    console.log(`  Embedding batch ${Math.floor(i / CONFIG.embeddingBatchSize) + 1}...`);

    const embeddings = await createEmbeddings(texts);

    for (let j = 0; j < batch.length; j++) {
      embeddedChunks.push({
        ...batch[j],
        embedding: embeddings[j]
      });
    }

    // Rate limiting - wait a bit between batches
    if (i + CONFIG.embeddingBatchSize < chunks.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return embeddedChunks;
}

// ============================================================================
// DATABASE STORAGE
// ============================================================================

/**
 * Store embeddings in your vector database
 * TODO: Implement based on your chosen database (pgvector, Pinecone, Qdrant)
 */
async function storeEmbeddings(embeddedChunks: EmbeddedChunk[]): Promise<void> {
  console.log(`  Storing ${embeddedChunks.length} embeddings...`);

  // TODO: Replace with your actual database storage logic
  // Example for pgvector:
  /*
  import { Pool } from 'pg';
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  for (const chunk of embeddedChunks) {
    await pool.query(
      `INSERT INTO documents (content, embedding, source, metadata)
       VALUES ($1, $2, $3, $4)`,
      [
        chunk.content,
        JSON.stringify(chunk.embedding),
        chunk.source,
        JSON.stringify(chunk.metadata)
      ]
    );
  }
  */

  // Example for Pinecone:
  /*
  import { Pinecone } from '@pinecone-database/pinecone';
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pinecone.index('coffee-docs');

  const vectors = embeddedChunks.map((chunk, i) => ({
    id: `${chunk.source}-${i}`,
    values: chunk.embedding,
    metadata: {
      content: chunk.content,
      source: chunk.source,
      ...chunk.metadata
    }
  }));

  await index.upsert(vectors);
  */

  // Example for Qdrant:
  /*
  import { QdrantClient } from '@qdrant/js-client-rest';
  const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY
  });

  const points = embeddedChunks.map((chunk, i) => ({
    id: Date.now() + i,
    vector: chunk.embedding,
    payload: {
      content: chunk.content,
      source: chunk.source,
      ...chunk.metadata
    }
  }));

  await qdrant.upsert('coffee-docs', { points });
  */

  console.log(`  ✅ Stored ${embeddedChunks.length} embeddings`);
}

// ============================================================================
// FILE PROCESSING
// ============================================================================

/**
 * Process a single file
 */
async function processFile(filePath: string): Promise<DocumentChunk[]> {
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath);

  // Choose chunking strategy based on file type
  let chunks: string[];
  if (ext === '.md') {
    chunks = markdownChunk(content, CONFIG.maxChunkTokens);
  } else {
    chunks = semanticChunk(content, CONFIG.maxChunkTokens);
  }

  // Create document chunks with metadata
  const documentChunks: DocumentChunk[] = chunks.map(chunk => ({
    content: chunk,
    source: filePath,
    metadata: extractMetadata(filePath, chunk)
  }));

  return documentChunks;
}

/**
 * Recursively find all files in directory
 */
function findFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (CONFIG.allowedExtensions.includes(path.extname(filePath))) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

// ============================================================================
// MAIN INDEXING FUNCTION
// ============================================================================

async function indexDocuments() {
  console.log('🚀 Starting document indexing...');
  console.log(`   Directory: ${CONFIG.docsDirectory}`);
  console.log(`   Max chunk tokens: ${CONFIG.maxChunkTokens}`);
  console.log('');

  // Find all files to process
  const files = findFiles(CONFIG.docsDirectory);
  console.log(`📁 Found ${files.length} files to process`);
  console.log('');

  let totalChunks = 0;

  // Process each file
  for (const file of files) {
    console.log(`📄 Processing: ${file}`);

    try {
      // Create chunks
      const chunks = await processFile(file);
      console.log(`   Created ${chunks.length} chunks`);

      // Embed chunks
      const embeddedChunks = await batchEmbed(chunks);

      // Store in database
      await storeEmbeddings(embeddedChunks);

      totalChunks += chunks.length;
    } catch (error) {
      console.error(`   ❌ Failed to process ${file}:`, error);
    }

    console.log('');
  }

  console.log('✅ Indexing complete!');
  console.log(`   Total files processed: ${files.length}`);
  console.log(`   Total chunks created: ${totalChunks}`);
}

// ============================================================================
// RUN
// ============================================================================

// Verify environment
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY not found in environment');
  process.exit(1);
}

if (!fs.existsSync(CONFIG.docsDirectory)) {
  console.error(`❌ Error: Documentation directory not found: ${CONFIG.docsDirectory}`);
  process.exit(1);
}

// Run indexing
indexDocuments()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Indexing failed:', error);
    process.exit(1);
  });
