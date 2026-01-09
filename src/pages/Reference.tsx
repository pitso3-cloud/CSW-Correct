import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Book, FileText } from 'lucide-react';
import clsx from 'clsx';

const manualStructure = [
    {
        id: 'ch2',
        title: 'Chapter 2: Standard Layout Principles',
        children: [
            { id: 'ch2-intro', title: 'Introduction' },
            { id: 'ch2-branding', title: 'Government Branding' },
            { id: 'ch2-margins', title: 'Margins' },
            { id: 'ch2-font', title: 'Font Type and Point Size' },
            { id: 'ch2-spacing', title: 'Spacing' },
            { id: 'ch2-security', title: 'Security Classifications' },
        ]
    },
    {
        id: 'ch3',
        title: 'Chapter 3: Routine Correspondence',
        children: [
            { id: 'ch3-memo', title: 'Memorandum' },
            { id: 'ch3-routine', title: 'Routine Letter' },
            { id: 'ch3-formal', title: 'Formal Letter' },
        ]
    }
];

export function Reference() {
    const [expanded, setExpanded] = useState<string[]>(['ch2']);
    const [selected, setSelected] = useState('ch2-branding');

    const toggleExpand = (id: string) => {
        setExpanded(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex h-full">
            <div className="w-80 bg-card border-r border-border h-full overflow-y-auto p-4">
                <h2 className="font-semibold mb-4 px-2">CSW Manual 2021</h2>
                <div className="space-y-1">
                    {manualStructure.map(chapter => (
                        <div key={chapter.id}>
                            <button
                                onClick={() => toggleExpand(chapter.id)}
                                className="flex items-center gap-2 w-full p-2 hover:bg-accent rounded-lg text-left"
                            >
                                {expanded.includes(chapter.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                <Book size={16} className="text-primary" />
                                <span className="font-medium text-sm line-clamp-1">{chapter.title}</span>
                            </button>

                            {expanded.includes(chapter.id) && (
                                <div className="ml-6 space-y-1 mt-1 border-l border-border pl-2">
                                    {chapter.children.map(section => (
                                        <button
                                            key={section.id}
                                            onClick={() => setSelected(section.id)}
                                            className={clsx(
                                                "flex items-center gap-2 w-full p-2 rounded-lg text-left text-sm transition-colors",
                                                selected === section.id
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                            )}
                                        >
                                            <FileText size={14} />
                                            <span className="line-clamp-1">{section.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-background p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-card border border-border p-8 rounded-xl shadow-sm">
                        <h1 className="text-2xl font-bold mb-4 text-primary">Government Branding</h1>
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <p className="leading-relaxed text-muted-foreground">
                                Government branding (GB) has been implemented to ensure a uniform corporate identity for the South African Government.
                                The specific branding principles for the DOD ensure that all services and divisions maintain a consistent visual identity while
                                acknowledging their specific emblems.
                            </p>

                            <div className="my-6 p-4 bg-accent/20 border border-primary/20 rounded-lg">
                                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                    Key Principle
                                </h4>
                                <p className="text-sm">
                                    The Service/Division emblem appears on the top left, while the DOD Coat of Arms (if applicable for general correspondence)
                                    or the unit logo follows specific alignment rules defined in Appendix A.
                                </p>
                            </div>

                            <h3 className="text-lg font-semibold mt-6 mb-2">Margins & Alignment</h3>
                            <p className="text-muted-foreground">
                                When using official letterheads, the margins must be set to 2.0cm, but care must be taken that the header content
                                (branding images) does not overlap with the text. The "First Page" header is distinct from subsequent pages.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}