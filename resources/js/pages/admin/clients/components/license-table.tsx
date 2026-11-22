import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    AppWindow,
    Calendar,
    CheckIcon,
    CopyIcon,
    ExternalLink,
    InfinityIcon,
    Laptop,
} from 'lucide-react';
import { DataTable } from '@/components/datatable';
import { Badge, Button } from '@/components/ui';
import type { LicenseEntity } from '@/types';
import { show } from '@/routes/admin/licenses';
import { formatDate } from '@/lib/utils';

type ClientLicensesTableProps = {
    licenses: LicenseEntity[];
};

const LicenseTable = ({ licenses }: ClientLicensesTableProps) => {
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const handleCopyKey = async (license: LicenseEntity) => {
        try {
            await navigator.clipboard.writeText(license.license_key);

            // Confirmar que se copió correctamente
            setCopiedId(license.id);

            // Restablecer estado después de 1.5 segundos
            setTimeout(() => {
                setCopiedId((currentId) =>
                    currentId === license.id ? null : currentId,
                );
            }, 1500);
        } catch (error) {
            console.error('Error al copiar la licencia:', error);
        }
    };

    const columns = useMemo(
        () => [
            {
                id: 'software',
                header: 'Software / Plan',
                cell: (license: LicenseEntity) => (
                    <div className="flex items-center gap-2">
                        <AppWindow className="size-4 shrink-0 text-muted-foreground" />

                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-foreground">
                                    {license.app?.name ?? 'App'}
                                </span>
                                {license.is_trial && (
                                    <Badge
                                        variant="soft"
                                        color="warning"
                                        className="text-[10px]"
                                    >
                                        Prueba
                                    </Badge>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {license.plan?.name ?? 'Plan base'}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                id: 'license_key',
                header: 'Clave de licencia',
                cell: (license: LicenseEntity) => (
                    <button
                        type="button"
                        onClick={() => handleCopyKey(license)}
                        className="group flex items-center gap-1.5 font-mono text-xs font-medium text-foreground"
                        title="Copiar clave"
                    >
                        {license.license_key}
                        {copiedId === license.id ? (
                            <CheckIcon className="size-3.5 text-emerald-500" />
                        ) : (
                            <CopyIcon className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        )}
                    </button>
                ),
            },
            {
                id: 'status',
                header: 'Estado',
                // is_valid manda: una licencia 'active' vencida por tiempo
                // (trial sin convertir) debe verse como no-funcional, no como activa.
                cell: (license: LicenseEntity) => (
                    <Badge variant="soft" color={license.status_color}>
                        {license.status_label}
                    </Badge>
                ),
            },
            {
                id: 'expiration',
                header: 'Vencimiento',
                cell: (license: LicenseEntity) =>
                    license.is_lifetime ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <InfinityIcon className="size-3.5" />
                            <span>Vitalicio</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="size-3.5 text-muted-foreground" />
                            <span>{formatDate(license.expires_at)}</span>
                        </div>
                    ),
            },
            {
                id: 'max_devices',
                header: 'Equipos',
                cell: (license: LicenseEntity) => (
                    <div className="flex items-center gap-1 text-xs font-medium">
                        <Laptop className="size-3.5 text-muted-foreground" />
                        <span>
                            {license.devices_used ?? 0} / {license.max_devices}
                        </span>
                    </div>
                ),
            },
            {
                id: 'actions',
                header: 'Acción',
                headerClassName: 'text-right',
                className: 'text-right',
                cell: (license: LicenseEntity) => (
                    <Link href={show(license.id).url}>
                        <Button
                            variant="ghost"
                            size="sm"
                            title="Ver detalle de licencia"
                        >
                            <ExternalLink className="size-4" />
                        </Button>
                    </Link>
                ),
            },
        ],
        [copiedId],
    );

    return (
        <DataTable
            data={licenses}
            columns={columns}
            rowKey={(license) => license.id}
            emptyTitle="Este cliente aún no cuenta con licencias emitidas."
        />
    );
};

export default LicenseTable;
