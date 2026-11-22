import {
    SyntheticEvent,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
} from 'react';
import { useForm } from '@inertiajs/react';
import { Eye, FileText, Loader2, Pencil, Upload, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button, Input, Label } from '@/components/ui';
import InputError from '@/components/input-error';

import type {
    LegalDocumentApp,
    LegalDocumentEntity,
    LegalDocumentFormData,
} from '@/types';
import { Selectable } from '@/components/selectable';

interface Props {
    apps: LegalDocumentApp[];
    storeUrl: string;
    document?: LegalDocumentEntity;
    updateUrl?: string;
}

const TYPES_OPTIONS = [
    { label: 'Términos y condiciones', value: 'terms' },
    { label: 'Política de privacidad', value: 'privacy' },
    { label: 'Acuerdo de licencia', value: 'eula' },
];

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

type EditorTab = 'edit' | 'preview';

export default function LegalDocumentForm({
    apps,
    storeUrl,
    document,
    updateUrl,
}: Props) {
    const isEditing = Boolean(document);

    const { data, setData, post, put, processing, errors } =
        useForm<LegalDocumentFormData>({
            app_id: document ? String(document.app_id) : '',
            type: document?.type ?? 'terms',
            version: document?.version ?? '',
            title: document?.title ?? '',
            content: document?.content ?? '',
        });

    const [activeTab, setActiveTab] = useState<EditorTab>('edit');
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [readingFile, setReadingFile] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const appsOptions = useMemo(
        () =>
            apps.map((app) => ({
                label: app.name,
                value: String(app.id),
            })),
        [apps],
    );

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setFileError(null);

        if (!/\.md$/i.test(file.name)) {
            setFileError('Selecciona un archivo Markdown (.md).');
            event.target.value = '';
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setFileError('El archivo no debe superar 1 MB.');
            event.target.value = '';
            return;
        }

        if (data.content.trim()) {
            const confirmed = window.confirm(
                'Importar el archivo reemplazará el contenido actual. ¿Deseas continuar?',
            );

            if (!confirmed) {
                event.target.value = '';
                return;
            }
        }

        setReadingFile(true);

        try {
            const content = await file.text();

            if (!content.trim()) {
                setFileError('El archivo Markdown está vacío.');
                return;
            }

            if (content.includes('\uFFFD')) {
                setFileError(
                    'El archivo contiene caracteres no válidos. Verifica que esté guardado en UTF-8.',
                );
                return;
            }

            setData('content', content);
            setFileName(file.name);
            setActiveTab('preview');
        } catch {
            setFileError('No se pudo leer el archivo seleccionado.');
        } finally {
            setReadingFile(false);
            event.target.value = '';
        }
    };

    const removeFileReference = () => {
        setFileName(null);
        setFileError(null);
    };

    const submit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (processing) return;

        if (isEditing) {
            if (!updateUrl) return;

            put(updateUrl, {
                preserveScroll: true,
            });

            return;
        }

        post(storeUrl, {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6 pb-12">
            <div className="space-y-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="app_id" required>
                            Aplicación
                        </Label>

                        <Selectable
                            value={data.app_id}
                            onValueChange={(value) => setData('app_id', value)}
                            placeholder="Seleccionar aplicación"
                            showAll={false}
                            options={appsOptions}
                            required
                        />

                        <InputError message={errors.app_id} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="type" required>
                            Tipo de documento
                        </Label>

                        <Selectable
                            value={data.type}
                            onValueChange={(value) =>
                                setData(
                                    'type',
                                    value as LegalDocumentFormData['type'],
                                )
                            }
                            showAll={false}
                            options={TYPES_OPTIONS}
                            required
                        />

                        <InputError message={errors.type} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="version" required>
                            Versión
                        </Label>

                        <Input
                            id="version"
                            value={data.version}
                            onChange={(event) =>
                                setData('version', event.target.value)
                            }
                            placeholder="Ej. 1.0.0"
                            maxLength={20}
                            required
                        />

                        <InputError message={errors.version} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="title" required>
                            Título
                        </Label>

                        <Input
                            id="title"
                            value={data.title}
                            onChange={(event) =>
                                setData('title', event.target.value)
                            }
                            placeholder="Título del documento"
                            maxLength={255}
                            required
                        />

                        <InputError message={errors.title} />
                    </div>
                </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="content" required>
                                Contenido del documento
                            </Label>

                            <p className="text-xs text-muted-foreground">
                                Redacta el documento en Markdown o importa un
                                archivo .md.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".md,text/markdown"
                                onChange={handleFileChange}
                                className="hidden"
                                aria-label="Importar archivo Markdown"
                            />

                            <Button
                                type="button"
                                variant="outline"
                                color="neutral"
                                disabled={processing || readingFile}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {readingFile ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Upload className="size-4" />
                                )}
                                Importar .md
                            </Button>
                        </div>
                    </div>

                    {fileName && (
                        <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
                            <div className="flex min-w-0 items-center gap-2">
                                <FileText className="size-4 shrink-0 text-muted-foreground" />

                                <span className="truncate text-sm">
                                    {fileName}
                                </span>

                                <span className="text-xs text-muted-foreground">
                                    Importado
                                </span>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                color="neutral"
                                aria-label="Quitar referencia del archivo"
                                onClick={removeFileReference}
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    )}

                    {fileError && (
                        <p role="alert" className="text-sm text-destructive">
                            {fileError}
                        </p>
                    )}

                    <div className="overflow-hidden rounded-lg border">
                        <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-3 py-2">
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant={
                                        activeTab === 'edit'
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    color="neutral"
                                    onClick={() => setActiveTab('edit')}
                                >
                                    <Pencil className="size-4" />
                                    Editar
                                </Button>

                                <Button
                                    type="button"
                                    variant={
                                        activeTab === 'preview'
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    color="neutral"
                                    onClick={() => setActiveTab('preview')}
                                >
                                    <Eye className="size-4" />
                                    Vista previa
                                </Button>
                            </div>

                            <span className="text-xs text-muted-foreground">
                                Markdown
                            </span>
                        </div>

                        <div
                            className={
                                activeTab === 'edit' ? 'block' : 'hidden'
                            }
                        >
                            <textarea
                                id="content"
                                value={data.content}
                                onChange={(event) => {
                                    setData('content', event.target.value);
                                    setFileName(null);
                                }}
                                placeholder={
                                    '# Términos y condiciones\n\n' +
                                    '## 1. Introducción\n\n' +
                                    'Escribe aquí el contenido...'
                                }
                                rows={22}
                                maxLength={500000}
                                required
                                spellCheck
                                className="block min-h-120 w-full resize-y bg-background p-4 font-mono text-sm leading-7 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                            />
                        </div>

                        {activeTab === 'preview' && (
                            <div className="max-h-180 min-h-120 overflow-y-auto bg-background p-6">
                                {data.content.trim() ? (
                                    <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-h1:text-3xl prose-h2:text-2xl">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            skipHtml
                                        >
                                            {data.content}
                                        </ReactMarkdown>
                                    </article>
                                ) : (
                                    <div className="flex min-h-100 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                                        <FileText className="size-10 opacity-40" />

                                        <p className="text-sm">
                                            Todavía no hay contenido para
                                            mostrar.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
                            <span>
                                {data.content.length.toLocaleString('es-BO')}{' '}
                                caracteres
                            </span>

                            <span>
                                {data.content.trim()
                                    ? data.content.trim().split(/\s+/).length
                                    : 0}{' '}
                                palabras
                            </span>
                        </div>
                    </div>

                    <InputError message={errors.content} />
                </div>
            </div>

            <div className="flex justify-end border-t pt-6">
                <Button
                    type="submit"
                    disabled={
                        processing ||
                        readingFile ||
                        !data.app_id ||
                        !data.title.trim() ||
                        !data.version.trim() ||
                        !data.content.trim()
                    }
                >
                    {processing
                        ? 'Guardando...'
                        : isEditing
                          ? 'Guardar cambios'
                          : 'Guardar borrador'}
                </Button>
            </div>
        </form>
    );
}
