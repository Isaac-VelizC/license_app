import { Head, router } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import LegalDocumentForm from "./components/legal-document-form";

import { dashboard } from "@/routes/admin";
import {
    index,
    show,
    store,
    update,
} from "@/actions/App/Http/Controllers/Admin/LegalDocumentController";

import type { LegalDocumentApp, LegalDocumentEntity } from "@/types";

interface Props {
    document: LegalDocumentEntity;
    apps: LegalDocumentApp[];
}

export default function Edit({ document, apps }: Props) {
    return (
        <>
            <Head title={`Editar ${document.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.visit(show(document.id).url)}
                    >
                        <ArrowLeft className="size-4" />
                        Volver al documento
                    </Button>
                </div>

                <Heading
                    title="Editar documento legal"
                    description={`Modifica el borrador de la versión ${document.version}.`}
                />

                <LegalDocumentForm
                    apps={apps}
                    storeUrl={store().url}
                    document={document}
                    updateUrl={update(document.id).url}
                />
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: "Panel Central", href: dashboard() },
        { title: "Documentos Legales", href: index().url },
        { title: "Editar", href: "#" },
    ],
};
