/**
 * Simple Vector Store implementation for CodeRefine Knowledge Base.
 * In a production environment, this would use Pinecone, Weaviate, or pgvector.
 * For this parity demo, we use a lightweight semantic similarity approach.
 */

export interface KnowledgeSnippet {
    id: string;
    content: string;
    filePath: string;
    metadata: Record<string, any>;
    score?: number;
}

class VectorStore {
    private index: KnowledgeSnippet[] = [];

    // Simple "semantic" search mock using keyword matching and context relevance
    async search(query: string, limit: number = 3): Promise<KnowledgeSnippet[]> {
        const queryLower = query.toLowerCase();
        
        const results = this.index.map(snippet => {
            let score = 0;
            const words = queryLower.split(/\s+/);
            
            words.forEach(word => {
                if (snippet.content.toLowerCase().includes(word)) score += 1;
                if (snippet.filePath.toLowerCase().includes(word)) score += 2;
            });

            return { ...snippet, score };
        });

        return results
            .filter(r => r.score && r.score > 0)
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, limit);
    }

    async add(snippet: KnowledgeSnippet) {
        // Prevent duplicates
        if (!this.index.find(s => s.id === snippet.id)) {
            this.index.push(snippet);
        }
    }

    async clear() {
        this.index = [];
    }
}

export const knowledgeBase = new VectorStore();
