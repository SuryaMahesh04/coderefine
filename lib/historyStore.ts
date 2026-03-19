export type HistoryBug = {
    severity: string;
    filename: string;
    line: number;
    message: string;
    category: string;
};

export type HistoryEdit = {
    filename: string;
    line: number;
    original: string;
    rewritten: string;
    reason: string;
    category: string;
};

export type AnalysisHistoryEntry = {
    id: string;
    timestamp: number;
    scores: {
        security: number;
        performance: number;
        quality: number;
        overallRating: number;
    };
    bugs: HistoryBug[];
    filesAnalyzed: string[];
    appliedEdits: HistoryEdit[];
};

const STORAGE_KEY = 'coderefine_analysis_history';

export function getHistory(): AnalysisHistoryEntry[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (e) {
        console.error("Failed to parse history", e);
    }
    return [];
}

export function saveHistoryEntry(entry: AnalysisHistoryEntry) {
    if (typeof window === 'undefined') return;
    try {
        const history = getHistory();
        history.push(entry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.error("Failed to save history entry", e);
    }
}

export function appendEditsToLatestHistory(edits: HistoryEdit[]) {
    if (typeof window === 'undefined' || !edits || edits.length === 0) return;
    try {
        const history = getHistory();
        if (history.length > 0) {
            const latest = history[history.length - 1];
            // ensure we don't accidentally duplicate
            const existingIds = new Set(latest.appliedEdits.map(e => `${e.filename}:${e.line}:${e.rewritten}`));
            for (const edit of edits) {
                const editId = `${edit.filename}:${edit.line}:${edit.rewritten}`;
                if (!existingIds.has(editId)) {
                    latest.appliedEdits.push(edit);
                }
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        }
    } catch (e) {
        console.error("Failed to append edits to history", e);
    }
}

export function clearHistory() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}
