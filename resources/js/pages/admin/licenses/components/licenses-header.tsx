import { Link, router } from '@inertiajs/react';
import { memo, useState } from 'react';
import {
    ArrowLeft,
    PauseCircle,
    PlayCircle,
    RefreshCw,
    Sliders,
    XCircle,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui';
import {
    index as licenseIndex,
    reactivate,
    renew,
    revoke,
    suspend,
} from '@/routes/admin/licenses';
import type { LicenseEntity, PlanEntity } from '@/types';
import ConfirmModal, { ModalVariant } from '@/components/confirm-modal';
import ChangePlanModal from './change-plan';

type ActionType = 'renew' | 'suspend' | 'reactivate' | 'revoke';

interface Props {
    license: LicenseEntity;
    plans?: PlanEntity[];
}

const LicensesHeader = memo(({ license, plans = [] }: Props) => {
    const [confirmAction, setConfirmAction] = useState<ActionType | null>(null);
    const [isChangePlanOpen, setIsChangePlanOpen] = useState<boolean>(false);
    const [processing, setProcessing] = useState<boolean>(false);

    const ACTION_CONFIG: Record<
        ActionType,
        {
            title: string;
            type: ModalVariant;
            descriptionText: string;
            confirmText: string;
            url: string;
            alertText?: string | null;
        }
    > = {
        renew: {
            title: 'Renovar Licencia',
            type: 'info',
            descriptionText: '¿Deseas renovar la vigencia de esta licencia?',
            confirmText: 'Sí, renovar',
            url: renew(license.id).url,
            alertText:
                'Se actualizará la fecha de expiración según los términos del plan.',
        },
        suspend: {
            title: 'Suspender Licencia',
            type: 'warning',
            descriptionText:
                '¿Deseas suspender esta licencia temporalmente? Se pausará el acceso a los dispositivos.',
            confirmText: 'Sí, suspender',
            url: suspend(license.id).url,
            alertText:
                'Los dispositivos sincronizados perderán el acceso hasta que la licencia sea reactivada.',
        },
        reactivate: {
            title: 'Reactivar Licencia',
            type: 'success',
            descriptionText:
                '¿Deseas reactivar esta licencia para restaurar el acceso?',
            confirmText: 'Sí, reactivar',
            url: reactivate(license.id).url,
            alertText: null,
        },
        revoke: {
            title: 'Revocar Licencia',
            type: 'danger',
            descriptionText:
                '¿Estás seguro de revocar esta licencia? Se denegará de forma permanente el acceso a todos los dispositivos registrados.',
            confirmText: 'Sí, revocar licencia',
            url: revoke(license.id).url,
            alertText: 'Esta acción es permanente y no se podrá deshacer.',
        },
    };

    const handleExecuteAction = () => {
        if (!confirmAction) return;

        const config = ACTION_CONFIG[confirmAction];

        router.patch(
            config.url,
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => {
                    setProcessing(false);
                    setConfirmAction(null);
                },
            },
        );
    };

    const currentConfig = confirmAction ? ACTION_CONFIG[confirmAction] : null;

    const isRevoked = license.status === 'revoked';
    const isSuspended = license.status === 'suspended';

    return (
        <div>
            <Link
                href={licenseIndex().url}
                className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="mr-1.5 size-4" />
                Volver a listado
            </Link>

            <Heading
                title="Detalle de la Licencia"
                description="Consulta los parámetros de suscripción, historial de uso y equipos registrados."
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Renovar — solo tiene sentido si el plan expira por tiempo */}
                        {!license.is_lifetime && !isRevoked && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setConfirmAction('renew')}
                            >
                                <RefreshCw className="mr-1.5 size-4 text-emerald-500" />
                                Renovar
                            </Button>
                        )}

                        {/* Cambiar Plan — no aplica a una licencia ya revocada permanentemente */}
                        {!isRevoked && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsChangePlanOpen(true)}
                            >
                                <Sliders className="mr-1.5 size-4 text-blue-500" />
                                Cambiar plan
                            </Button>
                        )}

                        {/* Suspender / Reactivar — 3 estados reales, no 2:
                            revocada no puede reactivarse (regla del backend) */}
                        {isRevoked ? null : isSuspended ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setConfirmAction('reactivate')}
                            >
                                <PlayCircle className="mr-1.5 size-4 text-emerald-500" />
                                Reactivar
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setConfirmAction('suspend')}
                            >
                                <PauseCircle className="mr-1.5 size-4 text-amber-500" />
                                Suspender
                            </Button>
                        )}

                        {/* Revocar */}
                        {!isRevoked && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setConfirmAction('revoke')}
                            >
                                <XCircle className="mr-1.5 size-4" />
                                Revocar
                            </Button>
                        )}
                    </div>
                }
            />

            <ConfirmModal
                isOpen={Boolean(confirmAction)}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleExecuteAction}
                processing={processing}
                type={currentConfig?.type ?? 'info'}
                title={currentConfig?.title}
                itemName={`Licencia (${license.license_key})`}
                confirmText={currentConfig?.confirmText}
                descriptionText={currentConfig?.descriptionText}
                alertText={currentConfig?.alertText}
            />

            <ChangePlanModal
                isOpen={isChangePlanOpen}
                onClose={() => setIsChangePlanOpen(false)}
                licenseId={license.id}
                currentPlanId={license.plan?.id ?? null}
                plans={plans}
            />
        </div>
    );
});

LicensesHeader.displayName = 'LicensesHeader';
export default LicensesHeader;
