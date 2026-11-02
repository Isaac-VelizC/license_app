import { router } from "@inertiajs/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Selectable } from "@/components/selectable";

import { index } from "@/actions/App/Http/Controllers/Admin/LegalAcceptanceController";

import {
    type LegalDocumentApp,
    type LegalDocumentType,
    type LegalAcceptanceFilters,
} from "@/types";
import { LEGAL_DOCUMENT_TYPES } from "@/types/admin/legal-document.contract";

interface Props {
    apps: LegalDocumentApp[];
    filters: LegalAcceptanceFilters;
}

export default function LegalAcceptancesFilters({ apps, filters }: Props) {
    const [appId, setAppId] = useState(filters.app_id ?? "");
    const [type, setType] = useState(filters.type ?? "");

    const applyFilters = (nextAppId: string, nextType: string) => {
        const params: Record<string, string> = {};

        if (nextAppId) params.app_id = nextAppId;
        if (nextType) params.type = nextType;

        router.get(index().url, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setAppId("");
        setType("");
        applyFilters("", "");
    };

    const appOptions = apps.map((app) => ({
        label: app.name,
        value: String(app.id),
    }));

    const typeOptions = Object.entries(LEGAL_DOCUMENT_TYPES).map(
        ([value, label]) => ({
            value,
            label,
        }),
    );

    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
                <div className="w-full sm:w-64">
                    <Selectable
                        value={appId}
                        onValueChange={(value) => {
                            setAppId(value);
                            applyFilters(value, type);
                        }}
                        labelAll="Todas las aplicaciones"
                        options={appOptions}
                    />
                </div>

                <div className="w-full sm:w-64">
                    <Selectable
                        value={type}
                        onValueChange={(value) => {
                            const nextType = value as LegalDocumentType | "";

                            setType(nextType);
                            applyFilters(appId, nextType);
                        }}
                        labelAll="Todos los documentos"
                        options={typeOptions}
                    />
                </div>

                {(appId || type) && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={clearFilters}
                    >
                        Limpiar filtros
                    </Button>
                )}
            </div>
        </div>
    );
}
