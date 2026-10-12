import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Head, router } from "@inertiajs/react";
import { destroy } from "@/routes/admin/clients";
import type { ClientEntity, PaginatedData } from "@/types";
import Heading from "@/components/heading";
import { Button, InputSearch } from "@/components/ui";
import ClientsTable from "./components/clients-table";
import { dashboard } from "@/routes/admin";
import { index } from "@/routes/admin/clients";
import { useDebounceSearch } from "@/hooks/use-debounce-search";
import ClientForm from "./components/client-form";
import ConfirmModal from "@/components/confirm-modal";
import { useConfirmAction } from "@/hooks/use-confirm-action";

interface Props {
    clients: PaginatedData<ClientEntity>;
    filters: { search: string };
}

export default function ClientsPage({ clients, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingClient, setEditingClient] = useState<ClientEntity | null>(null);
    const { searchValue, setSearchValue, clearSearch, isSearching } =
        useDebounceSearch(filters.search || "", {
            delay: 500,
            only: ["clients", "filters"],
            minChars: 2,
        });

    const {
        ask: askDeleteClient,
        pendingItem: deletingClient,
        cancel: cancelDelete,
        confirm: confirmDelete,
        processing: deleting,
    } = useConfirmAction<ClientEntity>({
        action: (client) => destroy(client.id).url,
        method: 'delete',
    });

    const handleOpenCreate = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (client: ClientEntity) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    return (
        <>
            <Head title="Gestión de Clientes" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-6">
                <Heading
                    title="Clientes"
                    description="Administra tu base de clientes y supervisa el estado de sus licencias."
                    actions={
                        <Button onClick={handleOpenCreate} className="shrink-0">
                            <PlusIcon className="size-4" />
                            Nuevo Cliente
                        </Button>
                    }
                />

                <div className="flex justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm">
                    <InputSearch
                        search={searchValue}
                        onSearchChange={setSearchValue}
                        onClear={clearSearch}
                        loading={isSearching}
                        className="w-full sm:max-w-lg"
                    />
                </div>
                <ClientsTable
                    clients={clients.data}
                    deletingId={deleting ? deletingClient?.id ?? null : null}
                    onEdit={handleOpenEdit}
                    onDelete={askDeleteClient}
                    onClearSearch={clearSearch}
                />

                {/*clients.meta.last_page > 1 && (
                    <Pagination links={clients.meta.links} />
                )*/}
            </div>

            <ClientForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingClient={editingClient}
            />

            <ConfirmModal
                isOpen={!!deletingClient}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                processing={deleting}
                type="deleted"
                title={`¿Eliminar a "${deletingClient?.name}"?`}
                descriptionText="Esta acción no se puede deshacer. Si el cliente tiene licencias asociadas, el sistema rechazará la eliminación."
            />
        </>
    );
}

ClientsPage.layout = {
    breadcrumbs: [
        { title: "Panel Central", href: dashboard() },
        { title: "Clientes", href: index().url },
    ],
};
