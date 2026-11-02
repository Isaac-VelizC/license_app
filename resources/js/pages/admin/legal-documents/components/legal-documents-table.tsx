import { useMemo } from "react";
import { router } from "@inertiajs/react";
import { Eye, FileText } from "lucide-react";

import { type Column, DataTable } from "@/components/datatable";
import { Badge, Button } from "@/components/ui";

import { show } from "@/actions/App/Http/Controllers/Admin/LegalDocumentController";
import { type LegalDocumentEntity } from "@/types";
import { LEGAL_DOCUMENT_TYPES } from "@/types/admin/legal-document.contract";

interface Props {
    documents: LegalDocumentEntity[];
}

export default function LegalDocumentsTable({ documents }: Props) {
    const columns = useMemo<Column<LegalDocumentEntity>[]>(
        () => [
            {
                id: "title",
                header: "Documento",
                cell: (document) => (
                    <div className="flex items-center gap-3">
                        <FileText className="size-4 shrink-0 text-muted-foreground" />

                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                                {document.title}
                            </span>

                            <span className="text-xs text-muted-foreground">
                                {LEGAL_DOCUMENT_TYPES[document.type]}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                id: "app",
                header: "Aplicación",
                cell: (document) => (
                    <span className="text-sm">
                        {document.app?.name ?? "Sin aplicación"}
                    </span>
                ),
            },
            {
                id: "version",
                header: "Versión",
                cell: (document) => (
                    <span className="font-mono text-xs font-medium">
                        {document.version}
                    </span>
                ),
            },
            {
                id: "status",
                header: "Estado",
                cell: (document) => {
                    const status = document.is_active
                        ? {
                              label: "Vigente",
                              color: "success" as const,
                          }
                        : document.published_at
                          ? {
                                label: "Anterior",
                                color: "neutral" as const,
                            }
                          : {
                                label: "Borrador",
                                color: "warning" as const,
                            };

                    return (
                        <Badge variant="outline" color={status.color}>
                            {status.label}
                        </Badge>
                    );
                },
            },
            {
                id: "actions",
                header: "Acciones",
                headerClassName: "text-right",
                className: "text-right",
                cell: (document) => (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            color="info"
                            onClick={() => router.visit(show(document.id).url)}
                        >
                            <Eye className="size-4" />
                            Ver detalle
                        </Button>
                    </div>
                ),
            },
        ],
        [],
    );

    return (
        <DataTable
            data={documents}
            columns={columns}
            rowKey={(document) => document.id}
            emptyTitle="No se encontraron documentos legales"
        />
    );
}
