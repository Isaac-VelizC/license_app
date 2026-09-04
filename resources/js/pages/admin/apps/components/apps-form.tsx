import React, { useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Grid3x3 } from "lucide-react";
import FormModal from "@/components/form-modal";
import { store, update } from "@/routes/admin/apps";
import type { AppEntity, AppFormData } from "@/types";
import { Input, Label, Textarea } from "@/components/ui";
import InputError from "@/components/input-error";

type AppFormModalProps = {
    editingApp: AppEntity | null;
    isOpen: boolean;
    onClose: () => void;
};

const AppsForm = ({ editingApp, isOpen, onClose }: AppFormModalProps) => {
    const isEditing = Boolean(editingApp);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<AppFormData>({
            name: "",
            slug: "",
            description: "",
        });

    const slugTouchedManually = useRef(false);

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            slugTouchedManually.current = false;

            if (editingApp) {
                setData({
                    name: editingApp.name,
                    slug: editingApp.slug,
                    description: editingApp.description || "",
                });
            } else {
                reset();
            }
        }
    }, [isOpen, editingApp, reset, clearErrors, setData]);

    const slugify = (value: string): string =>
        value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // quita tildes/diacríticos (á → a, ñ → n)
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;

        setData((prevData) => ({
            ...prevData,
            name,
            slug:
                !editingApp && !slugTouchedManually.current
                    ? slugify(name)
                    : prevData.slug,
        }));
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        slugTouchedManually.current = true;
        setData("slug", e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingApp) {
            put(update(editingApp.id).url, {
                onSuccess: () => onClose(),
            });
        } else {
            post(store().url, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <FormModal
            open={isOpen}
            onOpenChange={onClose}
            title={isEditing ? "Editar Aplicación" : "Nueva Aplicación"}
            description=""
            icon={Grid3x3}
            progress={processing}
            isEdit={isEditing}
            labelButton={editingApp ? "Guardar Cambios" : "Crear Aplicación"}
            onSubmit={handleSubmit}
        >
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
                {/* Nombre */}
                <div className="space-y-1.5">
                    <Label htmlFor="app-name">Nombre</Label>
                    <Input
                        id="app-name"
                        value={data.name}
                        disabled={processing}
                        onChange={handleNameChange}
                        placeholder="Ej: Vexto POS"
                        required
                    />
                    <InputError message={errors.name} />
                </div>
                {/* Slug */}
                <div className="space-y-1.5">
                    <Label htmlFor="app-slug">Slug Interno</Label>
                    <Input
                        id="app-slug"
                        value={data.slug}
                        disabled={processing}
                        onChange={handleSlugChange}
                        placeholder="ej: vexto-pos"
                        className="font-mono text-xs"
                        required
                    />
                    {isEditing && (
                        <p className="text-xs text-amber-600 dark:text-amber-500">
                            Cambiar el slug con licencias activas puede romper
                            la validación de clientes ya instalados.
                        </p>
                    )}
                    <InputError message={errors.slug} />
                </div>
                {/* Descripción */}
                <div className="space-y-1.5">
                    <Label htmlFor="app-description">Descripción</Label>
                    <Textarea
                        id="app-description"
                        value={data.description}
                        disabled={processing}
                        onChange={(e) => setData("description", e.target.value)}
                        placeholder="Breve descripción del software..."
                        rows={3}
                        error={errors.description}
                    />
                </div>
            </div>
        </FormModal>
    );
};

export default AppsForm;
