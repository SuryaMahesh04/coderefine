import { Message } from '../components/ChatPanel';

export type ChatSession = {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    messages: Message[];
};

const STORAGE_KEY = 'loom_chat_sessions';
const CURRENT_SESSION_KEY = 'loom_current_session_id';

export function getSessions(): ChatSession[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (e) {
        console.error("Failed to get chat sessions", e);
    }
    return [];
}

export function saveSession(session: ChatSession) {
    if (typeof window === 'undefined') return;
    try {
        const sessions = getSessions();
        const existingIdx = sessions.findIndex(s => s.id === session.id);
        if (existingIdx !== -1) {
            sessions[existingIdx] = { ...session, updatedAt: Date.now() };
        } else {
            sessions.unshift({ ...session, updatedAt: Date.now() });
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
        console.error("Failed to save chat session", e);
    }
}

export function deleteSession(id: string) {
    if (typeof window === 'undefined') return;
    try {
        const sessions = getSessions().filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        
        if (getCurrentSessionId() === id) {
            localStorage.removeItem(CURRENT_SESSION_KEY);
        }
    } catch (e) {
        console.error("Failed to delete chat session", e);
    }
}

export function getCurrentSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(CURRENT_SESSION_KEY);
}

export function setCurrentSessionId(id: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CURRENT_SESSION_KEY, id);
}

export function clearAllSessions() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_SESSION_KEY);
}
