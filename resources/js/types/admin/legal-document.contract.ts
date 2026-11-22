export type LegalDocumentType = 'terms' | 'privacy' | 'eula';

export interface LegalDocumentApp {
    id: number;
    name: string;
    slug: string;
}

export interface LegalDocumentEntity {
    id: number;
    app_id: number;
    type: LegalDocumentType;
    version: string;
    title: string;
    content: string;
    content_hash: string;
    is_active: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;

    app?: LegalDocumentApp;
}

export interface LegalDocumentFormData {
    app_id: string;
    type: LegalDocumentType;
    version: string;
    title: string;
    content: string;
}

export const LEGAL_DOCUMENT_TYPES: Record<LegalDocumentType, string> = {
    terms: 'Términos y condiciones',
    privacy: 'Política de privacidad',
    eula: 'Acuerdo de licencia',
};
