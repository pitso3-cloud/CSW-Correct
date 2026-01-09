import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Info, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import clsx from 'clsx';

type Issue = {
    checkId: string;
    severity: 'Critical' | 'Error' | 'Warning' | 'Info';
    message: string;
    reference: string;
};

type ComplianceReport = {
    filePath: string;
    score: number;
    issues: Issue[];
};

export function Checker() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<ComplianceReport | null>(null);
    const [error, setError] = useState<string | null>(null);

    const filePath = location.state?.filePath;

    useEffect(() => {
        if (!filePath) {
            navigate('/');
            return;
        }

        const checkDocument = async () => {
            try {
                if (!window.electronAPI || typeof window.electronAPI.checkDocument !== 'function') {
                    setError('Electron API unavailable — open the app in Electron to analyze documents.');
                    setLoading(false);
                    return;
                }

                const result = await window.electronAPI.checkDocument(filePath);
                setReport(result);
            } catch (err) {
                setError('Failed to process document. ' + (err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        checkDocument();
    }, [filePath, navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Loader2 size={48} className="text-primary animate-spin mb-4" />
                <h2 className="text-xl font-semibold">Analyzing Document...</h2>
                <p className="text-muted-foreground">Checking against CSW Standards</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
                    <AlertCircle />
                    <p>{error}</p>
                </div>
                <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-accent rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">{report?.filePath.split(/[\\\/]/).pop()}</h1>
                        <p className="text-muted-foreground text-sm">Document Compliance Report</p>
                    </div>
                </div>
                {report && (
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                            <p className={clsx("text-3xl font-bold", getScoreColor(report.score))}>
                                {report.score}%
                            </p>
                        </div>
                        <div className={clsx("w-16 h-16 rounded-full border-4 flex items-center justify-center", getScoreBorder(report.score))}>
                            <FileText size={24} className={getScoreColor(report.score)} />
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {report?.issues.length === 0 ? (
                    <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-xl text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-green-700 dark:text-green-300">Perfect Compliance!</h3>
                        <p className="text-green-600 dark:text-green-400">No issues found. This document meets all CSW standards.</p>
                    </div>
                ) : (
                    report?.issues.map((issue, idx) => (
                        <div key={idx} className="bg-card border border-border p-6 rounded-xl shadow-sm flex gap-4">
                            <div className="mt-1">
                                {issue.severity === 'Critical' && <AlertCircle className="text-red-500" size={24} />}
                                {issue.severity === 'Error' && <AlertCircle className="text-orange-500" size={24} />}
                                {issue.severity === 'Warning' && <Info className="text-yellow-500" size={24} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={clsx("px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider", getSeverityBadge(issue.severity))}>
                                        {issue.severity}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono">{issue.checkId}</span>
                                </div>
                                <h4 className="font-semibold text-lg">{issue.message}</h4>
                                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground bg-accent/50 p-2 rounded w-fit">
                                    <BookOpenIcon size={14} />
                                    <span>Reference: {issue.reference}</span>
                                </div>
                            </div>
                            <button className="px-4 py-2 self-start border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                                Fix it
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function BookOpenIcon({ size, className }: { size?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
    )
}

function getScoreColor(score: number) {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-orange-500";
    return "text-red-600";
}

function getScoreBorder(score: number) {
    if (score >= 90) return "border-green-600";
    if (score >= 70) return "border-orange-500";
    return "border-red-600";
}

function getSeverityBadge(severity: string) {
    switch (severity) {
        case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
        case 'Error': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
        case 'Warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
        default: return 'bg-blue-100 text-blue-800';
    }
}