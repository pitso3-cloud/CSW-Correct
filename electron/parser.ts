import fs from 'fs-extra';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';

export type DocumentData = {
    text: string;
    metadata: {
        margins?: { top: number; bottom: number; left: number; right: number };
        fonts?: string[];
        spacing?: string[];
        isAllCaps?: boolean;
    };
    type: 'docx' | 'pdf' | 'txt' | 'unknown';
};

export async function parseDocument(filePath: string): Promise<DocumentData> {
    const ext = filePath.split('.').pop()?.toLowerCase();

    if (ext === 'docx') {
        return parseDocx(filePath);
    } else if (ext === 'pdf') {
        return parsePdf(filePath);
    } else {
        throw new Error('Unsupported file format');
    }
}

async function parseDocx(filePath: string): Promise<DocumentData> {
    const zip = new AdmZip(filePath);
    const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

    const docXmlContent = zip.readAsText('word/document.xml');
    const docObj = xmlParser.parse(docXmlContent);
    const text = extractTextFromXML(docObj);

    let fonts: Set<string> = new Set();
    try {
        const stylesXmlContent = zip.readAsText('word/styles.xml');
        if (stylesXmlContent) {
            const stylesObj = xmlParser.parse(stylesXmlContent);
            const traverseStyles = (obj: any) => {
                if (obj['@_w:ascii']) fonts.add(obj['@_w:ascii']);
                if (typeof obj === 'object') {
                    Object.values(obj).forEach(v => typeof v === 'object' && traverseStyles(v));
                }
            };
            traverseStyles(stylesObj);
        }
    } catch (e) {
        // styles.xml might be missing
    }

    const scanForFontsAndSpacing = (obj: any) => {
        if (!obj) return;
        if (obj['w:rFonts']) {
            if (obj['w:rFonts']['@_w:ascii']) fonts.add(obj['w:rFonts']['@_w:ascii']);
        }
        if (typeof obj === 'object') {
            Object.values(obj).forEach(v => scanForFontsAndSpacing(v));
        }
    };
    scanForFontsAndSpacing(docObj);

    let margins = undefined;
    try {
        const body = docObj['w:document']['w:body'];
        const sectPr = body['w:sectPr'];
        if (sectPr && sectPr['w:pgMar']) {
            margins = {
                top: parseInt(sectPr['w:pgMar']['@_w:top'] || '0'),
                bottom: parseInt(sectPr['w:pgMar']['@_w:bottom'] || '0'),
                left: parseInt(sectPr['w:pgMar']['@_w:left'] || '0'),
                right: parseInt(sectPr['w:pgMar']['@_w:right'] || '0'),
            };
        }
    } catch (e) {
        console.error('Error parsing margins', e);
    }

    return {
        text,
        metadata: {
            margins,
            fonts: Array.from(fonts),
            spacing: ['Single']
        },
        type: 'docx'
    };
}

async function parsePdf(filePath: string): Promise<DocumentData> {
    const dataBuffer = fs.readFileSync(filePath);
    const pdf = await import('pdf-parse');
    const data = await (pdf as any).default(dataBuffer);

    return {
        text: data.text,
        metadata: {},
        type: 'pdf'
    };
}

function extractTextFromXML(obj: any): string {
    let text = '';
    if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
            if (key === 'w:t') {
                const val = obj[key];
                if (typeof val === 'string') text += val + ' ';
                else if (typeof val === 'object' && val['#text']) text += val['#text'] + ' ';
            } else {
                text += extractTextFromXML(obj[key]);
            }
        }
    } else if (Array.isArray(obj)) {
        obj.forEach(item => text += extractTextFromXML(item));
    }
    return text;
}