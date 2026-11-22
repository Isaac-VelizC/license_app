import {
    AppWindow,
    Building2,
    Calendar,
    InfinityIcon,
    Laptop,
    Sparkles,
    User,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { LicenseEntity } from '@/types';

const LicensesGridMetrix = ({ license }: { license: LicenseEntity }) => {
    const activeDevicesCount =
        license.activations?.filter((a) => a.is_active).length ?? 0;
    const maxDevices = license.max_devices || 1;
    const deviceUsagePercent = Math.min(
        (activeDevicesCount / maxDevices) * 100,
        100,
    );

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Cliente */}
            <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="size-4 text-primary" />
                    <span className="text-xs font-medium">
                        Cliente Asignado
                    </span>
                </div>
                {license.client ? (
                    <>
                        <p className="mt-2 font-semibold text-foreground">
                            {license.client.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {license.client.email ?? '—'}
                        </p>
                        {license.client.company_name && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                <Building2 className="size-3" />
                                <span>{license.client.company_name}</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-500">
                        <Sparkles className="size-3.5" />
                        <span className="font-medium">Sin convertir</span>
                    </div>
                )}
            </div>

            {/* Aplicación & Plan */}
            <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <AppWindow className="size-4 text-primary" />
                    <span className="text-xs font-medium">Software & Plan</span>
                </div>
                <p className="mt-2 font-semibold text-foreground">
                    {license.app?.name ?? 'App'}
                </p>
                <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        {license.plan?.name ?? 'Plan Genérico'}
                    </Badge>
                    {license.is_trial && (
                        <Badge
                            variant="soft"
                            color="warning"
                            className="text-xs"
                        >
                            Prueba
                        </Badge>
                    )}
                </div>
            </div>

            {/* Equipos / Uso */}
            <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Laptop className="size-4 text-primary" />
                    <span className="text-xs font-medium">Equipos Activos</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">
                        {activeDevicesCount}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        / {license.max_devices} máx.
                    </span>
                </div>
                <div
                    className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
                    role="progressbar"
                    aria-valuenow={activeDevicesCount}
                    aria-valuemin={0}
                    aria-valuemax={license.max_devices}
                >
                    <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${deviceUsagePercent}%` }}
                    />
                </div>
            </div>

            {/* Vigencia */}
            <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    {license.is_lifetime ? (
                        <InfinityIcon className="size-4 text-primary" />
                    ) : (
                        <Calendar className="size-4 text-primary" />
                    )}
                    <span className="text-xs font-medium">
                        {license.is_lifetime ? 'Vigencia' : 'Expiración'}
                    </span>
                </div>
                <p
                    className={`mt-2 font-semibold ${
                        license.is_lifetime
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-foreground'
                    }`}
                >
                    {license.is_lifetime
                        ? 'Vitalicio'
                        : formatDate(license.expires_at)}
                </p>
                {license.starts_at && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        Desde: {formatDate(license.starts_at)}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LicensesGridMetrix;
