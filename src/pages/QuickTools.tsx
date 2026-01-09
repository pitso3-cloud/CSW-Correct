import React, { useState, useEffect } from 'react';
import { Search, Shield, ChevronDown, ListFilter, BookOpen } from 'lucide-react';
import clsx from 'clsx';

type Abbreviation = {
    abbreviation: string;
    full_term: string;
    category: string;
};

type Rank = {
    service: string;
    rank_name: string;
    abbreviation: string;
    pay_grade: number;
};

export function QuickTools() {
    const [activeTab, setActiveTab] = useState<'abbr' | 'ranks'>('abbr');
    const [abbrQuery, setAbbrQuery] = useState('');
    const [abbrResults, setAbbrResults] = useState<Abbreviation[]>([]);
    const [rankService, setRankService] = useState('Army');
    const [rankResults, setRankResults] = useState<Rank[]>([]);

    useEffect(() => {
        const fetchAbbr = async () => {
            try {
                const results = await window.electronAPI?.getAbbreviations
                    ? await window.electronAPI.getAbbreviations(abbrQuery)
                    : [];
                setAbbrResults(results);
            } catch (err) {
                console.warn('getAbbreviations failed', err);
                setAbbrResults([]);
            }
        };
        const debounce = setTimeout(fetchAbbr, 300);
        return () => clearTimeout(debounce);
    }, [abbrQuery]);

    useEffect(() => {
        const fetchRanks = async () => {
            try {
                const results = await window.electronAPI?.getRanks
                    ? await window.electronAPI.getRanks(rankService)
                    : [];
                setRankResults(results);
            } catch (err) {
                console.warn('getRanks failed', err);
                setRankResults([]);
            }
        };
        fetchRanks();
    }, [rankService]);

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
            <header className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quick Reference Tools</h1>
                    <p className="text-muted-foreground mt-1">Instant lookups for CSW standards</p>
                </div>
            </header>

            <div className="flex bg-muted/20 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('abbr')}
                    className={clsx(
                        "px-6 py-2 rounded-md font-medium text-sm transition-all",
                        activeTab === 'abbr' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Abbreviations
                </button>
                <button
                    onClick={() => setActiveTab('ranks')}
                    className={clsx(
                        "px-6 py-2 rounded-md font-medium text-sm transition-all",
                        activeTab === 'ranks' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Ranks & Insignia
                </button>
            </div>

            {activeTab === 'abbr' && (
                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
                        <input
                            type="text"
                            placeholder="Search abbreviations (e.g. C LOG, SANDF)..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg"
                            value={abbrQuery}
                            onChange={(e) => setAbbrQuery(e.target.value)}
                        />
                    </div>

                    <div className="bg-card border border-border rounded-xl flex-1 overflow-auto shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 sticky top-0 backdrop-blur-sm">
                                <tr>
                                    <th className="p-4 font-semibold text-muted-foreground w-1/4">Abbreviation</th>
                                    <th className="p-4 font-semibold text-muted-foreground w-1/2">Full Term</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Category</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {abbrResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-muted-foreground">No matches found.</td>
                                    </tr>
                                ) : (
                                    abbrResults.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-accent/50 transition-colors">
                                            <td className="p-4 font-mono font-bold text-primary">{item.abbreviation}</td>
                                            <td className="p-4 font-medium">{item.full_term}</td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                <span className="bg-muted px-2 py-1 rounded text-xs uppercase font-bold tracking-wide">{item.category}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'ranks' && (
                <div className="space-y-6">
                    <div className="flex gap-2">
                        {['Army', 'Navy', 'Air Force', 'SAMHS'].map(service => (
                            <button
                                key={service}
                                onClick={() => setRankService(service)}
                                className={clsx(
                                    "px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2",
                                    rankService === service
                                        ? "bg-primary/10 border-primary text-primary"
                                        : "bg-card border-border hover:border-primary/50 text-muted-foreground"
                                )}
                            >
                                <Shield size={14} className={rankService === service ? "fill-current" : ""} />
                                {service}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rankResults.map((rank, idx) => (
                            <div key={idx} className="bg-card border border-border p-5 rounded-xl flex items-center gap-4 hover:shadow-md transition-all group">
                                <div className="w-12 h-12 bg-accent/50 rounded-lg flex items-center justify-center font-bold text-xl text-primary/50 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                    {rank.abbreviation.substring(0, 2)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{rank.rank_name}</h3>
                                    <p className="text-muted-foreground font-mono text-sm">{rank.abbreviation}</p>
                                </div>
                                <div className="ml-auto text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded">
                                    GR-{rank.pay_grade}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}