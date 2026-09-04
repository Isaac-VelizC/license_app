import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, KeyRound, Layers, PlusIcon } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import PlanCard from "./components/plan-card";
import PlanForm from "./components/plan-form";
import { destroy } from "@/routes/admin/plans";
import { index } from "@/routes/admin/apps";
import { dashboard } from "@/routes/admin";
import type { AppEntity, PlanEntity } from "@/types";
import { useConfirmAction } from "@/hooks/use-confirm-action";
import ConfirmModal from "@/components/confirm-modal";

export default function AppDetails({ app }: { app: AppEntity }) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingPlan, setEditingPlan] = useState<PlanEntity | null>(null);

    const {
        ask: askDeletePlan,
        pendingItem: deletingPlan,
        cancel: cancelDeletePlan,
        confirm: confirmDeletePlan,
        processing: deleting,
    } = useConfirmAction<PlanEntity>({
        action: (plan) => destroy(plan.id).url,
        method: "delete",
    });

    const handleOpenCreateModal = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (plan: PlanEntity) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    return (
        <>
            <Head title={`Detalles - ${app.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-6">
                <div>
                    <Link
                        href={index().url}
                        className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 size-4" />
                        Volver a Aplicaciones
                    </Link>

                    <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    {app.name}
                                </h1>
                                <Badge
                                    variant="soft"
                                    color={app.is_active ? "success" : "danger"}
                                >
                                    {app.is_active ? "Activa" : "Inactiva"}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {app.description || "Sin descripción asignada."}
                            </p>

                            <div className="flex flex-wrap gap-4 pt-2 text-xs text-muted-foreground">
                                <span className="rounded bg-muted px-2 py-0.5 font-mono font-medium text-primary">
                                    slug: {app.slug}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Layers className="size-3.5" />
                                    {app.plans?.length ?? 0} Planes configurados
                                </span>
                                <span className="flex items-center gap-1">
                                    <KeyRound className="size-3.5" />
                                    {app.licenses_count ?? 0} Licencias emitidas
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={handleOpenCreateModal}
                            className="shrink-0"
                        >
                            <PlusIcon className="size-4" />
                            Nuevo Plan
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">
                            Planes y Licencias Disponibles
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {app.plans?.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onEdit={handleOpenEditModal}
                                onDelete={askDeletePlan}
                            />
                        ))}

                        {(!app.plans || app.plans.length === 0) && (
                            <div className="col-span-full flex flex-col items-center justify-center rounded-xl bg-card/50 p-12 text-center">
                                <div className="mb-3 rounded-full bg-muted p-3">
                                    <Layers className="size-6 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold text-foreground">
                                    Sin planes registrados
                                </h3>
                                <p className="mt-1 mb-4 max-w-sm text-sm text-muted-foreground">
                                    Esta aplicación aún no tiene planes de
                                    precios asociados. Crea el primero para
                                    poder emitir licencias.
                                </p>
                                <Button
                                    variant="outline"
                                    color="neutral"
                                    onClick={handleOpenCreateModal}
                                >
                                    <PlusIcon className="size-4" />
                                    Crear primer plan
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {app.id && (
                <PlanForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    appId={app.id}
                    editingPlan={editingPlan}
                />
            )}

            <ConfirmModal
                isOpen={!!deletingPlan}
                onClose={cancelDeletePlan}
                onConfirm={confirmDeletePlan}
                processing={deleting}
                type="deleted"
                title={`¿Eliminar "${deletingPlan?.name}"?`}
                descriptionText="Esta acción no se puede deshacer. Si el plan tiene licencias asociadas, el sistema rechazará la eliminación."
            />
        </>
    );
}

AppDetails.layout = {
    breadcrumbs: [
        { title: "Dashboard", href: dashboard().url },
        { title: "Aplicaciones", href: index().url },
        { title: "Detalles y Planes", href: "#" },
    ],
};
