export interface ProductVersionEntity {
    id: number;
    version: string;
    file_name: string;
    release_notes: string;
    is_active: boolean;
    released_at: string;
    created_at: string;
    updated_at: string;
}

export type ProductVersionForm = {
    app_id: number;
    version: string;
    file: File | null;
    release_notes: string;
    is_active: boolean;
    released_at: string;
};
