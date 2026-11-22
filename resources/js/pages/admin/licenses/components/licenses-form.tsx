import { FileChartLine } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import FormModal from '@/components/form-modal';
import { Selectable } from '@/components/selectable';
import { Label } from '@/components/ui';
import type { AppEntity, ClientEntity, LicenseFormData } from '@/types';
import { store } from '@/routes/admin/licenses';

interface LicensesFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    clients: ClientEntity[];
    apps: AppEntity[];
}

const INITIAL_FORM_STATE: LicenseFormData = {
    client_id: '',
    app_id: '',
    plan_id: '',
};

const LicensesForm = ({
    isOpen,
    onClose,
    clients,
    apps,
}: LicensesFormModalProps) => {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<LicenseFormData>(INITIAL_FORM_STATE);

    const clientsOptions = useMemo(
        () => clients.map((c) => ({ label: c.name, value: String(c.id) })),
        [clients],
    );

    // Solo apps activas pueden recibir licencias nuevas — coincide con la
    // regla que ya aplica LicenseRequest en el backend (Rule::exists...where is_active).
    const appsOptions = useMemo(
        () =>
            apps
                .filter((a) => a.is_active)
                .map((a) => ({ label: a.name, value: String(a.id) })),
        [apps],
    );

    const selectedApp = useMemo(
        () => apps.find((app) => String(app.id) === data.app_id),
        [apps, data.app_id],
    );

    // Excluye planes trial e inactivos: emitir manualmente un trial está
    // bloqueado en el backend (LicenseRequest::withValidator), y un plan
    // inactivo es uno que ya dejaste de vender (ej. "Mensual" antiguo).
    const availablePlans = useMemo(() => {
        if (!selectedApp?.plans) return [];

        return selectedApp.plans
            .filter((plan) => !plan.is_trial && plan.is_active)
            .map((plan) => ({ label: plan.name, value: String(plan.id) }));
    }, [selectedApp]);

    const selectedPlan = useMemo(
        () =>
            selectedApp?.plans?.find(
                (plan) => String(plan.id) === data.plan_id,
            ),
        [selectedApp, data.plan_id],
    );

    const handleAppChange = (val: string) => {
        setData((prev) => ({
            ...prev,
            app_id: val,
            plan_id: '', // limpia el plan previo para evitar inconsistencias
        }));
    };

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        post(store().url, {
            preserveScroll: true,
            onSuccess: () => handleClose(),
        });
    };

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    return (
        <FormModal
            open={isOpen}
            onOpenChange={handleClose}
            title="Emitir Nueva Licencia"
            description="Asigna un plan de software a un cliente y genera su clave de acceso."
            progress={processing}
            isEdit={false}
            icon={FileChartLine}
            labelButton="Emitir Licencia"
            onSubmit={handleSubmit}
        >
            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="client_id">Cliente</Label>
                        <Selectable
                            value={data.client_id}
                            onValueChange={(val) => setData('client_id', val)}
                            placeholder="Seleccionar cliente"
                            error={errors.client_id}
                            showAll={false}
                            options={clientsOptions}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="app_id">Aplicación</Label>
                        <Selectable
                            value={data.app_id}
                            onValueChange={handleAppChange}
                            placeholder="Seleccionar aplicación"
                            showAll={false}
                            options={appsOptions}
                            error={errors.app_id}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="plan_id">Plan de Licenciamiento</Label>
                    <Selectable
                        value={data.plan_id}
                        onValueChange={(val) => setData('plan_id', val)}
                        disabled={!data.app_id || availablePlans.length === 0}
                        showAll={false}
                        placeholder={
                            !data.app_id
                                ? 'Selecciona una app primero'
                                : availablePlans.length === 0
                                  ? 'Esta app no tiene planes disponibles para venta'
                                  : 'Seleccionar plan'
                        }
                        options={availablePlans}
                        error={errors.plan_id}
                    />
                </div>
                {selectedPlan && (
                    <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="grid grid-cols-3 gap-4 text-center sm:text-left">
                            <div>
                                <span className="block text-sm text-muted-foreground">
                                    Precio
                                </span>
                                <p className="font-medium">
                                    {selectedPlan.is_free
                                        ? 'Gratis'
                                        : selectedPlan.formatted_price}
                                </p>
                            </div>

                            <div>
                                <span className="block text-sm text-muted-foreground">
                                    Duración
                                </span>
                                <p className="font-medium">
                                    {selectedPlan.is_lifetime
                                        ? 'Vitalicio'
                                        : `${selectedPlan.duration_days} días`}
                                </p>
                            </div>

                            <div>
                                <span className="block text-sm text-muted-foreground">
                                    Dispositivos
                                </span>
                                <p className="font-medium">
                                    {selectedPlan.max_devices}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </FormModal>
    );
};

export default LicensesForm;
