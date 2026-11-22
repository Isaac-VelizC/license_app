import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    AppWindow,
    Building2,
    Calendar,
    CheckIcon,
    CopyIcon,
    EyeIcon,
    Laptop,
    User,
} from 'lucide-react';
import { DataTable } from '@/components/datatable';
import { Badge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { show } from '@/routes/admin/licenses';
import type { LicenseEntity } from '@/types';

interface LicensesTableProps {
    licenses: LicenseEntity[];
    onClearSearch?: () => void;
}

const LicensesTable = ({ licenses, onClearSearch }: LicensesTableProps) => {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleCopyKey = async (license: LicenseEntity) => {
        try {
            await navigator.clipboard.writeText(license.license_key);

            // Confirmar que se copió correctamente
            setCopiedKey(license.license_key);

            // Restablecer estado después de 1.5 segundos
            setTimeout(() => {
                setCopiedKey(null);
            }, 1500);
        } catch (error) {
            console.error('Error al copiar la licencia:', error);
        }
    };

    const columns = useMemo(
        () => [
            {
                id: 'license_key',
                header: 'Clave de Licencia',
                cell: (license: LicenseEntity) => (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold tracking-wider text-foreground">
                                {license.license_key}
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
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <AppWindow className="size-3 shrink-0" />
                            <span className="font-medium text-foreground">
                                {license.app?.name ?? 'App'}
                            </span>
                            <span>•</span>
                            <span>{license.plan?.name ?? 'Plan'}</span>
                        </div>
                    </div>
                ),
            },
            {
                id: 'client',
                header: 'Cliente / Empresa',
                cell: (license: LicenseEntity) => (
                    <div className="flex flex-col gap-0.5 text-xs">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                            <User className="size-3.5 shrink-0 text-muted-foreground" />
                            {license.client?.name ?? 'Cliente Desconocido'}
                        </span>
                        {license.client?.company_name ? (
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <Building2 className="size-3 shrink-0" />
                                {license.client.company_name}
                            </span>
                        ) : (
                            <span className="text-muted-foreground italic">
                                Sin empresa
                            </span>
                        )}
                    </div>
                ),
            },
            {
                id: 'status',
                header: 'Estado',
                // Un mismo componente decide "¿qué se considera vencida?" en toda
                // la app (acá y en ClientLicensesTable) — status_color/status_label
                // por sí solos no reflejan vencimiento por tiempo (is_valid).
                cell: (license: LicenseEntity) => (
                    <Badge variant="soft" color={license.status_color}>
                        {license.status_label}
                    </Badge>
                ),
            },
            {
                id: 'expiration',
                header: 'Vigencia',
                cell: (license: LicenseEntity) => (
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                        {license.is_lifetime ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                Vitalicio
                            </span>
                        ) : (
                            <span className="text-foreground">
                                {formatDate(license.expires_at)}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                id: 'max_devices',
                header: 'Dispositivos',
                cell: (license: LicenseEntity) => (
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Laptop className="size-3.5 shrink-0 text-muted-foreground" />
                        <span>
                            {license.devices_used ?? 0} / {license.max_devices}
                        </span>
                    </div>
                ),
            },
            {
                id: 'actions',
                header: 'Acciones',
                headerClassName: 'text-right',
                className: 'text-right',
                cell: (license: LicenseEntity) => {
                    const isCopied = copiedKey === license.license_key;
                    return (
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyKey(license)}
                                title="Copiar clave"
                                aria-label="Copiar clave de licencia"
                            >
                                {isCopied ? (
                                    <CheckIcon className="size-3.5 text-emerald-500" />
                                ) : (
                                    <CopyIcon className="size-3.5" />
                                )}
                            </Button>

                            <Link href={show(license.id).url}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    color="neutral"
                                    title="Detalles de la licencia"
                                    aria-label="Ver detalles de la licencia"
                                >
                                    <EyeIcon className="size-4" />
                                </Button>
                            </Link>
                        </div>
                    );
                },
            },
        ],
        [copiedKey],
    );

    return (
        <DataTable
            data={licenses}
            columns={columns}
            rowKey={(license) => license.id}
            clearSearch={onClearSearch}
            emptyTitle="No se encontraron licencias emitidas"
        />
    );
};

export default LicensesTable;
