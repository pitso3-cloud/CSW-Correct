// Lightweight dev shim for `window.electronAPI` and `window.ipcRenderer`.
// Loaded only in web (Vite) dev so components can run without Electron.

type Abbreviation = { abbreviation: string; full_term: string; category: string };
type Rank = { service: string; rank_name: string; abbreviation: string; pay_grade: number };

declare global {
    interface Window {
        electronAPI?: {
            getAbbreviations?: (query: string) => Promise<Abbreviation[]>;
            getRanks?: (service: string) => Promise<Rank[]>;
            checkDocument?: (filePath: string) => Promise<any>;
        };
        ipcRenderer?: {
            on: (channel: string, cb: (...args: any[]) => void) => void;
        };
    }
}

if (!window.electronAPI) {
    console.warn('electronAPI not found — attaching dev shim (browser mode)');

    const sampleAbbrs: Abbreviation[] = [
        { abbreviation: 'C LOG', full_term: 'Combat Logistics', category: 'Logistics' },
        { abbreviation: 'SANDF', full_term: 'South African National Defence Force', category: 'Organisation' },
        { abbreviation: 'HQ', full_term: 'Headquarters', category: 'Organisation' },
    ];

    const sampleRanks: Rank[] = [
        { service: 'Army', rank_name: 'Private', abbreviation: 'PTE', pay_grade: 1 },
        { service: 'Army', rank_name: 'Corporal', abbreviation: 'CPL', pay_grade: 2 },
        { service: 'Navy', rank_name: 'Able Seaman', abbreviation: 'AB', pay_grade: 1 },
    ];

    window.electronAPI = {
        getAbbreviations: async (query: string) => {
            if (!query) return sampleAbbrs;
            const q = query.toLowerCase();
            return sampleAbbrs.filter(a => a.abbreviation.toLowerCase().includes(q) || a.full_term.toLowerCase().includes(q));
        },
        getRanks: async (service: string) => {
            return sampleRanks.filter(r => r.service.toLowerCase() === (service || '').toLowerCase());
        },
        checkDocument: async (filePath: string) => {
            return {
                filePath,
                score: 85,
                issues: [
                    { checkId: 'CSW-001', severity: 'Warning', message: 'Use of passive voice detected.', reference: 'Chapter 3.2' },
                    { checkId: 'CSW-007', severity: 'Error', message: 'Missing document classification header.', reference: 'Chapter 1.1' },
                ],
            };
        }
    };
}

if (!window.ipcRenderer) {
    window.ipcRenderer = {
        on: (_channel: string, _cb: (...args: any[]) => void) => {
            // no-op in browser
        }
    };
}

export {};