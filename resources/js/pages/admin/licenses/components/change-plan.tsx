import { useEffect, useMemo } from 'react';
import { CheckIcon, ClockIcon, Sliders } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import FormModal from '@/components/form-modal';
import InputError from '@/components/input-error';
import { changePlan } from '@/routes/admin/licenses';
import type { PlanEntity } from '@/types';

interface ChangePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    licenseId: number;
    currentPlanId: number | null;
    plans: PlanEntity[];
}

export function ChangePlanModal({
    isOpen,
    onClose,
    licenseId,
    currentPlanId,
    plans,
}: ChangePlanModalProps) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        plan_id: currentPlanId,
    });

    // Excluye trial e inactivos por defensividad — el backend ya los filtra
    // en LicenseController@show, pero si `plans` llega de otro punto de
    // entrada sin ese filtro, el modal no debe ofrecerlos igual.
    const selectablePlans = useMemo(
        () => plans.filter((plan) => !plan.is_trial && plan.is_active),
        [plans],
    );

    useEffect(() => {
        if (isOpen) {
            setData('plan_id', currentPlanId);
        }
    }, [isOpen, currentPlanId, setData]);

    const handleClose = () => {
        if (!processing) {
            reset();
            onClose();
        }
    };

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (!data.plan_id || data.plan_id === currentPlanId) return;

        patch(changePlan(licenseId).url, {
            preserveScroll: true,
            onSuccess: () => handleClose(),
        });
    };

    return (
        <FormModal
            open={isOpen}
            onOpenChange={handleClose}
            title="Cambiar Plan de Licencia"
            description="Selecciona el nuevo plan para ajustar los recursos y límites de dispositivos."
            icon={Sliders}
            progress={processing}
            labelButton="Confirmar cambio"
            onSubmit={handleSubmit}
        >
            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
                <div className="my-6 max-h-90 space-y-3 overflow-y-auto pr-1">
                    {selectablePlans.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            No hay otros planes disponibles en este momento.
                        </p>
                    ) : (
                        selectablePlans.map((plan) => {
                            const isCurrent = plan.id === currentPlanId;
                            const isSelected = plan.id === data.plan_id;

                            return (
                                <div
                                    key={plan.id}
                                    onClick={() =>
                                        !isCurrent &&
                                        setData('plan_id', plan.id)
                                    }
                                    className={`relative flex cursor-pointer items-start justify-between rounded-xl border p-4 transition-all ${
                                        isCurrent
                                            ? 'cursor-not-allowed border-border bg-muted/50 opacity-70'
                                            : isSelected
                                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                              : 'border-border hover:border-muted-foreground/30 hover:bg-accent/30'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                                isSelected
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-muted-foreground/40'
                                            }`}
                                        >
                                            {isSelected && (
                                                <CheckIcon className="h-3 w-3" />
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {plan.name}
                                                </span>
                                                {isCurrent && (
                                                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                                        Plan Actual
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                                                Hasta {plan.max_devices}{' '}
                                                dispositivo(s)
                                            </p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <div className="flex items-baseline justify-end gap-0.5">
                                            <span className="text-lg font-bold tracking-tight text-foreground">
                                                {plan.is_free
                                                    ? 'Gratis'
                                                    : plan.formatted_price}
                                            </span>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                            <ClockIcon className="h-3 w-3 text-muted-foreground/60" />
                                            {plan.is_lifetime
                                                ? 'Vitalicio'
                                                : `${plan.duration_days} días`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <InputError message={errors.plan_id} />
            </div>
        </FormModal>
    );
}

export default ChangePlanModal;
