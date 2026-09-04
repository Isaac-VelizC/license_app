import Heading from "@/components/heading";
import { Button } from "@/components/ui";
import type { ClientEntity } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowLeft,
    CheckCircle2,
    KeyIcon,
    Pencil,
    PlusIcon,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import ClientForm from "./components/client-form";
import MetricCard from "@/components/metric-card";
import { dashboard } from "@/routes/admin";
import { index as indexClient } from "@/routes/admin/clients";
import { index as indexLicense } from "@/routes/admin/licenses";
import ClientCard from "./components/client-card";
import LicenseTable from "./components/license-table";

export default function ClientDetail({ client }: { client: ClientEntity }) {
    const [isEditingOpen, setIsEditingOpen] = useState<boolean>(false);

    const licenses = client.licenses ?? [];

    // Basado en is_valid (calculado en backend), no en el status crudo:
    // una licencia 'active' con expires_at vencido (trial sin convertir)
    // ya NO cuenta como activa, aunque su status siga siendo 'active'.
    const activeLicensesCount = licenses.filter((l) => l.is_valid).length;

    // "Necesitan atención" = todo lo que no funciona: revocadas, suspendidas,
    // o trials vencidos sin licencia real todavía.
    const needsAttentionCount = licenses.filter((l) => !l.is_valid).length;

    const licenseMetrics = [
        {
            label: "Total licencias",
            value: licenses.length,
            description: "Emitidas históricamente",
            icon: KeyIcon,
            valueClassName: "text-foreground",
        },
        {
            label: "Activas",
            value: activeLicensesCount,
            description: "Operativas actualmente",
            icon: CheckCircle2,
            iconClassName: "text-emerald-500",
            valueClassName: "text-emerald-600",
        },
        {
            label: "Necesitan atención",
            value: needsAttentionCount,
            description: "Revocadas, suspendidas o vencidas",
            icon: XCircle,
            iconClassName: "text-destructive",
            valueClassName: "text-destructive",
        },
    ];

    return (
        <>
            <Head title={`Cliente - ${client.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <Link
                        href={indexClient().url}
                        className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="mr-1.5 size-4" />
                        Volver a Clientes
                    </Link>
                    <Heading
                        title={client.name}
                        description={
                            client.company_name
                                ? `Empresa: ${client.company_name}`
                                : "Ficha detallada e historial de software asignado."
                        }
                        actions={
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditingOpen(true)}
                                >
                                    <Pencil className="mr-1.5 size-4" />
                                    Editar Cliente
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        router.visit(indexLicense().url)
                                    }
                                >
                                    <PlusIcon className="mr-1.5 size-4" />
                                    Emitir Licencia
                                </Button>
                            </div>
                        }
                    />
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <ClientCard client={client} />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2">
                        {licenseMetrics.map((metric) => (
                            <MetricCard key={metric.label} {...metric} />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm">
                    <div>
                        <h3 className="text-base font-semibold text-foreground">
                            Licencias contratadas ({licenses.length})
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Software, planes y llaves asignadas a este cliente.
                        </p>
                    </div>

                    <LicenseTable licenses={licenses} />
                </div>
            </div>

            <ClientForm
                isOpen={isEditingOpen}
                onClose={() => setIsEditingOpen(false)}
                editingClient={client}
            />
        </>
    );
}

ClientDetail.layout = {
    breadcrumbs: [
        { title: "Panel Central", href: dashboard() },
        { title: "Clientes", href: indexClient().url },
        { title: "Detalle", href: "#" },
    ],
};
