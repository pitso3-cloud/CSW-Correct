import { DocumentData } from './parser';
import { getRules } from './database';

export type Issue = {
    checkId: string;
    severity: 'Critical' | 'Error' | 'Warning' | 'Info';
    message: string;
    reference: string;
};

export type ComplianceReport = {
    filePath: string;
    score: number;
    issues: Issue[];
};

export async function validateDocument(data: DocumentData, filePath: string): Promise<ComplianceReport> {
    const issues: Issue[] = [];
    const rules = await getRules();

    const fullText = data.text;
    const upperText = fullText.toUpperCase();

    const securityLevels = ['RESTRICTED', 'CONFIDENTIAL', 'SECRET', 'TOP SECRET'];
    const hasSecurity = securityLevels.some(level => upperText.includes(level));
    if (!hasSecurity) {
        issues.push({
            checkId: 'STR-007',
            severity: 'Critical',
            message: 'Document is missing a visible Security Classification (e.g. RESTRICTED).',
            reference: 'Chapter 2, Para 40'
        });
    }

    const fileRefRegex = /[A-Z]+\s?[A-Z]*\/[A-Z]\/\d+(\/\d+)?/g;
    if (!fileRefRegex.test(upperText)) {
        issues.push({
            checkId: 'STR-002',
            severity: 'Warning',
            message: 'Could not detect a standard File Reference (e.g., C LOG/R/102/1).',
            reference: 'Chapter 2, Para 46'
        });
    }

    const dateRegex = /\d{1,2}\s?[A-Za-z]{3}\s?\d{2,4}/;
    if (!dateRegex.test(fullText)) {
        issues.push({
            checkId: 'STR-003',
            severity: 'Info',
            message: 'Ensure dates follow CSW format (e.g., 01 Jan 21 or 01JAN21).',
            reference: 'Chapter 2, Para 85'
        });
    }

    const passivePhrases = ['it was decided', 'errors were made', 'it is requested that'];
    passivePhrases.forEach(phrase => {
        if (upperText.includes(phrase.toUpperCase())) {
            issues.push({
                checkId: 'CNT-002',
                severity: 'Warning',
                message: `Passive voice detected: "${phrase}". Use active voice (e.g. "I request").`,
                reference: 'Chapter 1, Para 12'
            });
        }
    });

    if (data.type === 'docx' && data.metadata) {
        if (data.metadata.margins) {
            const tolerance = 60;
            const target = 1134;
            const { left, right, top, bottom } = data.metadata.margins;

            if (Math.abs(left - target) > tolerance || Math.abs(right - target) > tolerance) {
                issues.push({
                    checkId: 'FMT-001',
                    severity: 'Error',
                    message: `Margins incorrect. found L:${Math.round(left / 56.7) / 10}cm, R:${Math.round(right / 56.7) / 10}cm. Standard is 2.0cm.`,
                    reference: 'Chapter 2, Para 12'
                });
            }
        }

        if (data.metadata.fonts && data.metadata.fonts.length > 0) {
            const allowed = ['Arial'];
            const forbidden = data.metadata.fonts.filter(f => !allowed.some(a => f.toLowerCase().includes(a.toLowerCase())));
            if (forbidden.length > 0) {
                issues.push({
                    checkId: 'FMT-002',
                    severity: 'Error',
                    message: `Incorrect Font detected: ${forbidden[0]}. Must be Arial.`,
                    reference: 'Chapter 2, Para 15'
                });
            }
        }
    }

    let score = 100;
    issues.forEach(i => {
        if (i.severity === 'Critical') score -= 25;
        if (i.severity === 'Error') score -= 15;
        if (i.severity === 'Warning') score -= 5;
    });
    score = Math.max(0, score);

    return {
        filePath,
        score,
        issues
    };
}