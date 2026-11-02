import { Head, router } from "@inertiajs/react";
import {
    ArrowLeft,
    CalendarDays,
    FileText,
    Hash,
    Pencil,
    Send,
    Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Heading from "@/components/heading";
import { Button, Badge } from "@/components/ui";

import { dashboard } from "@/routes/admin";
import { index, publish, edit, destroy } from "@/routes/admin/legal-documents";

import { LEGAL_DOCUMENT_TYPES } from "@/types/admin/legal-document.contract";
import type { LegalDocumentEntity } from "@/types";
import { toast } from "sonner";
import { useConfirmAction } from "@/hooks/use-confirm-action";
import ConfirmModal from "@/components/confirm-modal";

interface Props {
    document: LegalDocumentEntity;
}

export default function Show({ document }: Props) {
    const isDraft = document.published_at === null;

    const {
        ask: askPublish,
        pendingItem: pendingPublication,
        cancel: cancelPublication,
        confirm: confirmPublication,
        processing: publishing,
    } = useConfirmAction<LegalDocumentEntity>({
        action: (item) => publish(item.id).url,
        onSuccess: () => {
            toast.success("Documento publicado correctamente.");
        },
    });

    const {
        ask: askDelete,
        pendingItem: pendingDeletion,
        cancel: cancelDeletion,
        confirm: confirmDeletion,
        processing: deleting,
    } = useConfirmAction<LegalDocumentEntity>({
        action: (item) => destroy(item.id).url,
        method: "delete"
    });

    const status = document.is_active
        ? { label: "Vigente", color: "success" as const }
        : isDraft
          ? { label: "Borrador", color: "warning" as const }
          : { label: "Versión anterior", color: "neutral" as const };

    const publishedDate = document.published_at
        ? new Intl.DateTimeFormat("es-BO", {
              dateStyle: "long",
              timeStyle: "short",
          }).format(new Date(document.published_at))
        : null;

    return (
        <>
            <Head title={document.title} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        color="neutral"
                        onClick={() => router.visit(index().url)}
                    >
                        <ArrowLeft className="size-4" />
                        Volver a documentos
                    </Button>
                </div>

                <Heading
                    title={document.title}
                    description="Consulta la información y el contenido de esta versión del documento legal."
                    actions={
                        isDraft ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.visit(edit(document.id).url)
                                    }
                                >
                                    <Pencil className="size-4" />
                                    Editar
                                </Button>

                                <Button
                                    type="button"
                                    disabled={publishing}
                                    onClick={() => askPublish(document)}
                                >
                                    <Send className="size-4" />
                                    Publicar documento
                                </Button>

                                <Button
                                    type="button"
                                    variant="destructive"
                                    // color="danger"
                                    disabled={deleting || publishing}
                                    onClick={() => askDelete(document)}
                                >
                                    <Trash2 className="size-4" />
                                    Eliminar
                                </Button>
                            </div>
                        ) : undefined
                    }
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="size-4" />
                            Aplicación
                        </div>

                        <p className="mt-2 font-semibold">
                            {document.app?.name ?? "No disponible"}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="size-4" />
                            Tipo de documento
                        </div>

                        <p className="mt-2 font-semibold">
                            {LEGAL_DOCUMENT_TYPES[document.type]}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Hash className="size-4" />
                            Versión
                        </div>

                        <p className="mt-2 font-mono font-semibold">
                            {document.version}
                        </p>
                    </div>

                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Estado</p>

                        <div className="mt-2">
                            <Badge variant="outline" color={status.color}>
                                {status.label}
                            </Badge>
                        </div>
                    </div>
                </div>

                {publishedDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="size-4" />
                        Publicado el {publishedDate}
                    </div>
                )}

                <div className="rounded-lg border bg-card">
                    <div className="flex items-center gap-2 border-b px-6 py-4">
                        <FileText className="size-4 text-muted-foreground" />

                        <h2 className="font-semibold">
                            Contenido del documento
                        </h2>
                    </div>

                    <div className="p-6">
                        <article
                            className="
                                prose prose-sm dark:prose-invert
                                max-w-none wrap-break-words
                                prose-headings:text-foreground
                                prose-h1:text-3xl
                                prose-h2:text-2xl
                                prose-h3:text-xl
                                prose-a:text-primary
                                prose-strong:text-foreground
                                prose-pre:overflow-x-auto
                            "
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                skipHtml
                                urlTransform={(url) =>
                                    /^(https?:|mailto:)/i.test(url) ? url : ""
                                }
                            >
                                {document.content}
                            </ReactMarkdown>
                        </article>
                    </div>
                </div>

                {isDraft && (
                    <p className="text-sm text-muted-foreground">
                        Este documento todavía es un borrador. Una vez
                        publicado, su contenido deberá permanecer inalterable.
                        Para realizar cambios posteriores tendrás que crear una
                        nueva versión.
                    </p>
                )}
            </div>

            <ConfirmModal
                isOpen={!!pendingPublication}
                onClose={cancelPublication}
                onConfirm={confirmPublication}
                processing={publishing}
                type="warning"
                title="¿Publicar documento legal?"
                descriptionText={
                    `Estás a punto de publicar "${pendingPublication?.title}" ` +
                    `(versión ${pendingPublication?.version}). ` +
                    "Una vez publicado, su contenido no podrá modificarse. " +
                    "Si existe otra versión vigente para esta aplicación y tipo, " +
                    "será reemplazada automáticamente."
                }
                confirmText="Publicar documento"
            />

            <ConfirmModal
                isOpen={!!pendingDeletion}
                onClose={cancelDeletion}
                onConfirm={confirmDeletion}
                processing={deleting}
                type="danger"
                title="¿Eliminar borrador?"
                descriptionText={`Se eliminará permanentemente "${pendingDeletion?.title}" (versión ${pendingDeletion?.version}). Esta acción no se puede deshacer.`}
                confirmText="Eliminar borrador"
            />
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: "Panel Central", href: dashboard() },
        { title: "Documentos Legales", href: index().url },
        { title: "Detalle", href: "#" },
    ],
};
