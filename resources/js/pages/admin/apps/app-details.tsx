import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, KeyRound, Layers, Package, PlusIcon } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import PlanCard from "./components/plan-card";
import { destroy as destroyPlan, create, edit } from "@/routes/admin/plans";
import { destroy as destroyProductVersion } from "@/routes/admin/product";
import { index } from "@/routes/admin/apps";
import { dashboard } from "@/routes/admin";
import type { AppEntity, PlanEntity, ProductVersionEntity } from "@/types";
import { useConfirmAction } from "@/hooks/use-confirm-action";
import ConfirmModal from "@/components/confirm-modal";
import ProductVersionCard from "./components/product-version-card";
import ProductVersionForm from "./components/product-version-form";

export default function AppDetails({ app }: { app: AppEntity }) {
    // ---------------------------------------------------------
    // PLANES
    // ---------------------------------------------------------

    const {
        ask: askDeletePlan,
        pendingItem: deletingPlan,
        cancel: cancelDeletePlan,
        confirm: confirmDeletePlan,
        processing: deletingPlanProcessing,
    } = useConfirmAction<PlanEntity>({
        action: (plan) => destroyPlan(plan.id).url,
        method: "delete",
    });

    const redirectToPlanForm = (planId?: number) => {
        if (planId && app.id) {
            router.visit(edit({ app: app.id, plan: planId }).url);
        } else {
            router.visit(create(app.id).url);
        }
    };

    // ---------------------------------------------------------
    // PRODUCT VERSIONS
    // ---------------------------------------------------------

    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

    const [editingVersion, setEditingVersion] =
        useState<ProductVersionEntity | null>(null);

    const {
        ask: askDeleteVersion,
        pendingItem: deletingVersion,
        cancel: cancelDeleteVersion,
        confirm: confirmDeleteVersion,
        processing: deletingVersionProcessing,
    } = useConfirmAction<ProductVersionEntity>({
        action: (version) => destroyProductVersion(version.id).url,
        method: "delete",
    });

    const handleOpenCreateVersionModal = () => {
        setEditingVersion(null);
        setIsVersionModalOpen(true);
    };

    const handleOpenEditVersionModal = (version: ProductVersionEntity) => {
        setEditingVersion(version);
        setIsVersionModalOpen(true);
    };

    return (
        <>
            <Head title={`Detalles - ${app.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* =====================================================
                    HEADER
                ====================================================== */}

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
                                    {app.plans?.length ?? 0} Planes
                                </span>

                                <span className="flex items-center gap-1">
                                    <Package className="size-3.5" />
                                    {app.product_versions?.length ?? 0}{" "}
                                    Versiones
                                </span>

                                <span className="flex items-center gap-1">
                                    <KeyRound className="size-3.5" />
                                    {app.licenses_count ?? 0} Licencias
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={() => redirectToPlanForm()}
                            className="shrink-0"
                        >
                            <PlusIcon className="size-4" />
                            Nuevo Plan
                        </Button>
                    </div>
                </div>

                {/* =====================================================
                    PLANES
                ====================================================== */}

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Planes
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                Configura las opciones comerciales de esta
                                aplicación.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {app.plans?.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onEdit={() => redirectToPlanForm(plan.id)}
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
                                    precios asociados.
                                </p>

                                <Button
                                    variant="outline"
                                    color="neutral"
                                    onClick={() => redirectToPlanForm()}
                                >
                                    <PlusIcon className="size-4" />
                                    Crear primer plan
                                </Button>
                            </div>
                        )}
                    </div>
                </section>

                {/* =====================================================
                    PRODUCT VERSIONS
                ====================================================== */}

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Versiones del producto
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                Administra las versiones e instaladores
                                disponibles de esta aplicación.
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            onClick={handleOpenCreateVersionModal}
                        >
                            <PlusIcon className="size-4" />
                            Nueva versión
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {app.product_versions?.map((version) => (
                            <ProductVersionCard
                                key={version.id}
                                version={version}
                                onEdit={handleOpenEditVersionModal}
                                onDelete={askDeleteVersion}
                            />
                        ))}

                        {(!app.product_versions ||
                            app.product_versions.length === 0) && (
                            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
                                <div className="mb-3 rounded-full bg-muted p-3">
                                    <Package className="size-6 text-muted-foreground" />
                                </div>

                                <h3 className="font-semibold text-foreground">
                                    Sin versiones registradas
                                </h3>

                                <p className="mt-1 mb-4 max-w-md text-sm text-muted-foreground">
                                    Registra la primera versión de
                                    {` ${app.name}`} para comenzar a gestionar
                                    sus instaladores.
                                </p>

                                <Button
                                    variant="outline"
                                    color="neutral"
                                    onClick={handleOpenCreateVersionModal}
                                >
                                    <PlusIcon className="size-4" />
                                    Registrar primera versión
                                </Button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            {/* =========================================================
                PRODUCT VERSION FORM
            ========================================================== */}

            {app.id && (
                <ProductVersionForm
                    isOpen={isVersionModalOpen}
                    onClose={() => setIsVersionModalOpen(false)}
                    appId={app.id}
                    editingVersion={editingVersion}
                />
            )}

            {/* =========================================================
                DELETE PLAN
            ========================================================== */}

            <ConfirmModal
                isOpen={!!deletingPlan}
                onClose={cancelDeletePlan}
                onConfirm={confirmDeletePlan}
                processing={deletingPlanProcessing}
                type="deleted"
                title={`¿Eliminar "${deletingPlan?.name}"?`}
                descriptionText="Esta acción no se puede deshacer. Si el plan tiene licencias asociadas, el sistema rechazará la eliminación."
            />

            {/* =========================================================
                DELETE PRODUCT VERSION
            ========================================================== */}

            <ConfirmModal
                isOpen={!!deletingVersion}
                onClose={cancelDeleteVersion}
                onConfirm={confirmDeleteVersion}
                processing={deletingVersionProcessing}
                type="deleted"
                title={`¿Eliminar versión ${deletingVersion?.version}?`}
                descriptionText="Esta acción eliminará la versión y su instalador. Si existen licencias asociadas, el sistema rechazará la eliminación."
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
