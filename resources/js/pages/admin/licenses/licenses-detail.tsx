import { Head, router } from "@inertiajs/react";
import { CheckIcon, CopyIcon, KeyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Badge } from "@/components/ui";
import type { LicenseEntity, PlanEntity } from "@/types";
import LicensesHeader from "./components/licenses-header";
import { dashboard } from "@/routes/admin";
import { index as licenseIndex } from "@/routes/admin/licenses";
import ActivationsTable from "./components/activations-table";
import LicensesGridMetrix from "./components/licenses-grid-metrix";
import { useConfirmAction } from "@/hooks/use-confirm-action";
import ConfirmModal from "@/components/confirm-modal";

interface Props {
    license: LicenseEntity;
    plans: PlanEntity[];
}

export default function LicensesDetail({ license, plans }: Props) {
    const [copiedKey, setCopiedKey] = useState<boolean>(false);

    const {
        ask: askDeactivate,
        pendingItem: deactivatingActivation,
        cancel: cancelDeactivate,
        confirm: confirmDeactivateDevice,
        processing: deactivating,
    } = useConfirmAction<{ id: number; deviceName?: string | null }>({
        action: (activation) => '', //destroyActivation(activation.id).url,
        method: "delete",
    });

    const handleCopyKey = async () => {
        try {
            await navigator.clipboard.writeText(license.license_key);
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        } catch (err) {
            console.error("Error al copiar al portapapeles:", err);
            toast.error("No se pudo copiar la clave.");
        }
    };

    return (
        <>
            <Head title={`Licencia - ${license.license_key}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <LicensesHeader license={license} plans={plans} />

                {/* Banner de Clave de Licencia */}
                <div className="flex flex-col items-start justify-between gap-4 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Clave de Activación Primaria
                        </span>
                        <div className="flex items-center gap-3">
                            <KeyIcon className="size-5 text-primary" />
                            <span className="font-mono text-lg font-bold tracking-wider text-foreground sm:text-xl">
                                {license.license_key}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleCopyKey}
                                className="size-8"
                                title="Copiar Clave"
                                aria-label="Copiar clave de licencia"
                            >
                                {copiedKey ? (
                                    <CheckIcon className="size-4 text-emerald-500" />
                                ) : (
                                    <CopyIcon className="size-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <Badge variant="soft" color={license.status_color}>
                        {license.status_label}
                    </Badge>
                </div>

                <LicensesGridMetrix license={license} />

                <div className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm">
                    <div>
                        <h3 className="text-base font-semibold text-foreground">
                            Dispositivos Registrados (
                            {license.activations?.length ?? 0})
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Control de hardware (HWID) habilitado para esta
                            clave de licencias.
                        </p>
                    </div>

                    <ActivationsTable
                        activations={license.activations ?? []}
                        onDeactivate={(id, deviceName) => askDeactivate({ id, deviceName })}
                    />
                </div>
            </div>

            <ConfirmModal
                isOpen={!!deactivatingActivation}
                onClose={cancelDeactivate}
                onConfirm={confirmDeactivateDevice}
                processing={deactivating}
                type="warning"
                title={`¿Desconectar "${deactivatingActivation?.deviceName ?? "este dispositivo"}"?`}
                descriptionText="Este dispositivo dejará de tener acceso con esta licencia. El cupo quedará libre para activar uno nuevo."
                confirmText="Desconectar"
            />
        </>
    );
}

LicensesDetail.layout = {
    breadcrumbs: [
        { title: "Panel Central", href: dashboard() },
        { title: "Listados de licencias", href: licenseIndex() },
        { title: "Detalle", href: "#" },
    ],
};
