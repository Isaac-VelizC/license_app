import type { LegalDocumentType } from "./legal-document.contract";

export interface LegalAcceptanceEntity {
    id: number;
    legal_document_id: number;
    hwid: string;
    accepted_at: string;
    ip_address: string | null;
    user_agent: string | null;

    legal_document: {
        id: number;
        app_id: number;
        type: LegalDocumentType;
        version: string;
        title: string;
        app: {
            id: number;
            name: string;
            slug: string;
        };
    };
}

export interface LegalAcceptanceFilters {
    app_id?: string;
    type?: LegalDocumentType | "";
}
