import FormModal from "@/components/form-modal";
import InputError from "@/components/input-error";
import { Button, Input, Label, Switch, Textarea } from "@/components/ui";
import { store, update } from "@/routes/admin/product";
import type { ProductVersionEntity, ProductVersionForm } from "@/types";
import { useForm } from "@inertiajs/react";
import { DownloadCloud } from "lucide-react";
import { useEffect } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    appId: number;
    editingVersion: ProductVersionEntity | null;
}

export default function ProductVersionForm({
    isOpen,
    onClose,
    appId,
    editingVersion,
}: Props) {
    const isEditing = !!editingVersion;

    const form = useForm<ProductVersionForm>({
        app_id: appId,
        version: "",
        file: null,
        release_notes: "",
        is_active: false,
        released_at: "",
    });

    useEffect(() => {
        if (!isOpen) return;

        if (editingVersion) {
            form.setData({
                app_id: appId,
                version: editingVersion.version,
                file: null,
                release_notes: editingVersion.release_notes ?? "",
                is_active: editingVersion.is_active,
                released_at: editingVersion.released_at
                    ? editingVersion.released_at.slice(0, 10)
                    : "",
            });
        } else {
            form.reset();

            form.setData({
                app_id: appId,
                version: "",
                file: null,
                release_notes: "",
                is_active: false,
                released_at: "",
            });
        }

        form.clearErrors();
    }, [isOpen, editingVersion]);

    const handleSubmit = (event: React.SyntheticEvent) => {
        event.preventDefault();

        if (isEditing) {
            form.post(update(editingVersion!.id).url, {
                forceFormData: true,
                onSuccess: () => {
                    onClose();
                    form.reset();
                },
            });

            return;
        }

        form.post(store().url, {
            forceFormData: true,
            onSuccess: () => {
                onClose();
                form.reset();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <FormModal
            open={isOpen}
            onOpenChange={onClose}
            title={isEditing ? "Editar versión" : "Registrar versión"}
            description={
                isEditing
                    ? "Actualiza la información de la versión."
                    : "Registra una nueva versión del producto."
            }
            icon={DownloadCloud}
            progress={form.processing}
            isEdit={isEditing}
            labelButton={isEditing ? "Guardar Cambios" : "Registrar versión"}
            onSubmit={handleSubmit}
        >
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
                {/* Version */}
                <div className="space-y-1.5">
                    <Label htmlFor="version" required>
                        Versión
                    </Label>
                    <Input
                        id="version"
                        value={form.data.version}
                        disabled={isEditing}
                        placeholder="Ej. 1.2.0"
                        onChange={(e) =>
                            form.setData("version", e.target.value)
                        }
                        required
                    />
                    <InputError message={form.errors.version} />
                    {isEditing && (
                        <p className="text-xs text-muted-foreground">
                            La versión no puede modificarse después de ser
                            registrada.
                        </p>
                    )}
                </div>
                {/* FILE */}
                <div className="space-y-1.5">
                    <Label htmlFor="file">Instalador</Label>
                    <Input
                        id="file"
                        type="file"
                        accept=".exe,.zip"
                        onChange={(event) =>
                            form.setData(
                                "file",
                                event.target.files?.[0] ?? null,
                            )
                        }
                    />

                    <p className="mt-2 text-xs text-muted-foreground">
                        Selecciona el instalador de Windows.
                    </p>

                    {isEditing && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            Déjalo vacío si no deseas reemplazar el instalador
                            actual.
                        </p>
                    )}

                    <InputError message={form.errors.file} />
                </div>
                {/* RELEASE NOTES */}
                <div className="space-y-1.5">
                    <Label htmlFor="release_notes">Notas de versión</Label>
                    <Textarea
                        id="release_notes"
                        value={form.data.release_notes}
                        placeholder="Describe las mejoras, correcciones o cambios..."
                        rows={3}
                        onChange={(event) =>
                            form.setData("release_notes", event.target.value)
                        }
                    />
                    <InputError message={form.errors.release_notes} />
                </div>
                {/* RELEASE DATE */}
                <div className="space-y-1.5">
                    <Label htmlFor="released_at">Fecha de publicación</Label>
                    <Input
                        id="released_at"
                        type="date"
                        value={form.data.released_at}
                        onChange={(event) =>
                            form.setData("released_at", event.target.value)
                        }
                    />
                    <InputError message={form.errors.released_at} />
                </div>

                {/* ACTIVE */}

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                        <p className="text-sm font-medium">Versión activa</p>
                        <p className="text-xs text-muted-foreground">
                            Permite utilizar esta versión como versión
                            disponible del producto.
                        </p>
                    </div>

                    <Switch
                        checked={form.data.is_active}
                        onChange={(checked) =>
                            form.setData("is_active", checked)
                        }
                    />
                </div>
                <InputError message={form.errors.is_active} />
            </div>
        </FormModal>
    );
}
