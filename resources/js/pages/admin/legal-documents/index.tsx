import { Head, router } from "@inertiajs/react";
import { PlusIcon } from "lucide-react";

import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";

import {
    create,
    index,
} from "@/actions/App/Http/Controllers/Admin/LegalDocumentController";
import type {
    LegalDocumentApp,
    LegalDocumentEntity,
    PaginatedData,
} from "@/types";
import { dashboard } from "@/routes/admin";
import LegalDocumentsTable from "./components/legal-documents-table";
import LegalDocumentsFilters, {
    LegalDocumentFilters,
} from "./components/legal-documents-filters";

interface Props {
    documents: PaginatedData<LegalDocumentEntity>;
    apps: LegalDocumentApp[];
    filters: LegalDocumentFilters;
}

export default function LegalDocumentsPage({
    documents,
    apps,
    filters,
}: Props) {
    return (
        <>
            <Head title="Documentos Legales" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-6">
                <Heading
                    title="Documentos Legales"
                    description="Administra los términos, políticas y acuerdos de licencia de tus aplicaciones."
                    actions={
                        <Button
                            onClick={() => router.visit(create().url)}
                            className="shrink-0"
                        >
                            <PlusIcon className="size-4" />
                            Nuevo Documento
                        </Button>
                    }
                />

                <LegalDocumentsFilters apps={apps} filters={filters} />

                <LegalDocumentsTable documents={documents.data} />

            </div>
        </>
    );
}

LegalDocumentsPage.layout = {
    breadcrumbs: [
        { title: "Panel Central", href: dashboard() },
        { title: "Documentos Legales", href: index().url },
    ],
};
