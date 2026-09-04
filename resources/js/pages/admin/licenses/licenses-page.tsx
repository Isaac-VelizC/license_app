import { useCallback, useState } from "react";
import { PlusIcon } from "lucide-react";
import type {
    AppEntity,
    ClientEntity,
    LicenseEntity,
    LicenseFilters,
    PaginatedData,
} from "@/types";
import { Head, router } from "@inertiajs/react";
import Heading from "@/components/heading";
import { Button } from "@/components/ui";
import LicensesFilters from "./components/licenses-filters";
import LicensesTable from "./components/licenses-table";
import { dashboard } from "@/routes/admin";
import { index } from "@/routes/admin/licenses";
import LicensesForm from "./components/licenses-form";

interface Props {
    licenses: PaginatedData<LicenseEntity>;
    clients: ClientEntity[];
    apps: AppEntity[];
    filters: LicenseFilters;
}

export default function LicensesPage({
    licenses,
    clients,
    apps,
    filters,
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenCreate = () => setIsModalOpen(true);

    const handleFiltersChange = useCallback(
        (newFilters: Partial<LicenseFilters> & { page?: number }) => {
            const updatedFilters = { ...filters, ...newFilters };

            // Limpia parámetros vacíos o "all" para mantener la URL legible
            const cleanParams = Object.entries(updatedFilters).reduce(
                (acc, [key, value]) => {
                    if (value && value !== "all") acc[key] = value;
                    return acc;
                },
                {} as Record<string, string | number>,
            );

            router.get(index().url, cleanParams, {
                preserveState: true,
                preserveScroll: true,
                only: ["licenses", "filters"],
            });
        },
        [filters],
    );

    const handleClearAllFilters = useCallback(() => {
        router.get(
            index().url,
            {},
            {
                preserveState: false,
                preserveScroll: true,
                only: ["licenses", "filters"],
            },
        );
    }, []);

    return (
        <>
            <Head title="Gestión de Licencias" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-6">
                <Heading
                    title="Licencias de Software"
                    description="Emite, monitorea y gestiona las licencias activas para tus clientes."
                    actions={
                        <Button onClick={handleOpenCreate} className="shrink-0">
                            <PlusIcon className="size-4" />
                            Nueva Licencia
                        </Button>
                    }
                />
                <LicensesFilters
                    filters={filters}
                    apps={apps}
                    clients={clients}
                    onFilterChange={handleFiltersChange}
                    onClearAll={handleClearAllFilters}
                />

                <LicensesTable
                    licenses={licenses.data}
                    onClearSearch={handleClearAllFilters}
                />

                {/*licenses.meta.last_page > 1 && (
                    <Pagination links={licenses.meta.links} />
                )*/}
            </div>

            <LicensesForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                clients={clients}
                apps={apps}
            />
        </>
    );
}

LicensesPage.layout = {
    breadcrumbs: [
        { title: 'Panel Central', href: dashboard() },
        { title: 'Licencias', href: index().url },
    ],
};