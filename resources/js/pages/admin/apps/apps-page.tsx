import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { toggle } from "@/routes/admin/apps";
import Heading from "@/components/heading";
import { Button } from "@/components/ui";
import { dashboard } from "@/routes/admin";
import AppsTable from "./components/apps-table";
import type { PaginatedData, AppEntity } from "@/types";
import AppsForm from "./components/apps-form";

export default function AppsPage({ apps }: { apps: PaginatedData<AppEntity> }) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingApp, setEditingApp] = useState<AppEntity | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const openCreateModal = () => {
        setEditingApp(null);
        setIsModalOpen(true);
    };

    const openEditModal = (app: AppEntity) => {
        setEditingApp(app);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingApp(null);
    };

    return (
        <>
            <Head title="Gestión de Aplicaciones" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-6">
                <Heading
                    title="Aplicaciones"
                    description="Administra los productos Electron y sus licencias"
                    actions={
                        <Button onClick={openCreateModal}>
                            <PlusIcon className="size-4" />
                            Nueva Aplicación
                        </Button>
                    }
                />

                <AppsTable
                    apps={apps.data}
                    togglingId={togglingId}
                    onEdit={openEditModal}
                />

                {/*apps.meta.last_page > 1 && (
                    <Pagination links={apps.meta.links} />
                )*/}
            </div>
            <AppsForm
                isOpen={isModalOpen}
                onClose={closeModal}
                editingApp={editingApp}
            />
        </>
    );
}

AppsPage.layout = {
    breadcrumbs: [
        { title: "Panel Central", href: dashboard() },
        { title: "Aplicaciones", href: "#" },
    ],
};
