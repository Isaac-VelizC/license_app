import { useMemo } from 'react';
import { Building2, KeyIcon, Mail, Pencil, Phone, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Column, DataTable } from '@/components/datatable';
import { Button } from '@/components/ui';
import { show } from '@/routes/admin/clients';
import type { ClientEntity } from '@/types';

interface ClientsTableProps {
    clients: ClientEntity[];
    deletingId: number | null;
    onEdit: (client: ClientEntity) => void;
    onDelete: (client: ClientEntity) => void;
    onClearSearch?: () => void;
}

const ClientsTable = ({
    clients,
    deletingId,
    onDelete,
    onEdit,
    onClearSearch,
}: ClientsTableProps) => {
    const columns = useMemo<Column<ClientEntity>[]>(
        () => [
            {
                id: 'name',
                header: 'Cliente',
                cell: (client) => (
                    <span className="font-semibold text-foreground">
                        {client.name}
                    </span>
                ),
            },
            {
                id: 'contact',
                header: 'Contacto',
                cell: (client) => (
                    <div className="flex flex-col gap-0.5 text-xs">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                            <Mail className="size-3 shrink-0 text-muted-foreground" />
                            {client.email}
                        </span>
                        {client.phone && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="size-3 shrink-0 text-muted-foreground" />
                                {client.phone}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                id: 'company_name',
                header: 'Empresa/Negocio',
                cell: (client) => {
                    const companyName = client.company_name;

                    return (
                        <div className="flex min-w-0 items-center gap-2">
                            <Building2
                                className={`size-4 shrink-0 ${
                                    companyName
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                }`}
                            />
                            {companyName ? (
                                <span
                                    className="min-w-0 truncate text-sm font-medium"
                                    title={companyName}
                                >
                                    {companyName}
                                </span>
                            ) : (
                                <span className="text-sm text-muted-foreground italic">
                                    Sin compañía
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                id: 'licenses_count',
                header: 'Licencias',
                cell: (client) => (
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                        <KeyIcon className="size-3.5 text-muted-foreground" />
                        <span>{client.licenses_count ?? 0}</span>
                    </div>
                ),
            },
            {
                id: 'actions',
                header: 'Acciones',
                headerClassName: 'text-right',
                className: 'text-right',
                cell: (client) => {
                    const isDeleting = deletingId === client.id;
                    return (
                        <div className="flex items-center justify-end gap-2">
                            <Link href={show(client.id).url}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    color="info"
                                    disabled={isDeleting}
                                >
                                    Ver Licencias
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                color="neutral"
                                disabled={isDeleting}
                                aria-label={`Editar ${client.name}`}
                                onClick={() => onEdit(client)}
                            >
                                <Pencil className="size-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                color="danger"
                                disabled={isDeleting}
                                aria-label={`Eliminar ${client.name}`}
                                onClick={() => onDelete(client)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [onEdit, onDelete, deletingId],
    );
    return (
        <DataTable
            data={clients}
            columns={columns}
            rowKey={(client) => client.id}
            clearSearch={onClearSearch}
            emptyTitle="No se encontraron clientes"
        />
    );
};

export default ClientsTable;
