import { router } from "@inertiajs/react";
import { useMemo } from "react";
import { FilterX } from "lucide-react";

import { Button } from "@/components/ui/button";

import { index } from "@/actions/App/Http/Controllers/Admin/LegalDocumentController";
import { LegalDocumentApp } from "@/types";
import { Selectable } from "@/components/selectable";
import { TYPES_OPTIONS } from "@/lib/type-options";

export interface LegalDocumentFilters {
    app_id: string;
    type: string;
    status: string;
}

interface Props {
    apps: LegalDocumentApp[];
    filters: LegalDocumentFilters;
}

const STATUS_OPTIONS = [
    { label: "Vigente", value: "active" },
    { label: "Borrador", value: "draft" },
    { label: "Versión anterior", value: "archived" },
];

export default function LegalDocumentsFilters({ apps, filters }: Props) {
    const appsOptions = useMemo(
        () => apps.map((c) => ({ label: c.name, value: String(c.id) })),
        [apps],
    );

    const applyFilters = (field: keyof LegalDocumentFilters, value: string) => {
        const next = {
            ...filters,
            [field]: value === "all" ? "" : value,
        };

        router.get(
            index().url,
            Object.fromEntries(
                Object.entries(next).filter(([, value]) => value !== ""),
            ),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        router.get(
            index().url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Selectable
                    value={filters.app_id || "all"}
                    onValueChange={(value) => applyFilters("app_id", value)}
                    placeholder="Aplicación"
                    labelAll="Todas las aplicaciones"
                    options={appsOptions}
                />

                <Selectable
                    value={filters.type || "all"}
                    onValueChange={(value) => applyFilters("type", value)}
                    placeholder="Tipo"
                    labelAll="Todos los tipos"
                    options={TYPES_OPTIONS}
                />

                <Selectable
                    value={filters.status || "all"}
                    onValueChange={(value) => applyFilters("status", value)}
                    placeholder="Estado"
                    labelAll="Todos los estados"
                    options={STATUS_OPTIONS}
                />

                {hasFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                    >
                        <FilterX className="size-4" />
                        Limpiar
                    </Button>
                )}
            </div>
        </div>
    );
}
