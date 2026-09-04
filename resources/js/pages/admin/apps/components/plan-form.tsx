import { useEffect } from "react";
import { TagIcon } from "lucide-react";
import FormModal from "@/components/form-modal";
import { useForm } from "@inertiajs/react";
import InputError from "@/components/input-error";
import { Input, Label, Switch } from "@/components/ui";
import { store, update } from "@/routes/admin/plans";
import type { PlanEntity, PlanFormData } from "@/types";

type PlanFormModalProps = {
    appId: number;
    editingPlan: PlanEntity | null;
    isOpen: boolean;
    onClose: () => void;
};

const PlanForm = ({
    appId,
    editingPlan,
    isOpen,
    onClose,
}: PlanFormModalProps) => {
    const isEditing = Boolean(editingPlan);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<PlanFormData>({
            name: "",
            price: "",
            duration_days: "",
            max_devices: 1,
            is_trial: false,
            stripe_price_id: "",
        });

    const isLifetime = data.duration_days === "" || data.duration_days === null;

    useEffect(() => {
        if (isOpen) {
            clearErrors();

            if (editingPlan) {
                setData({
                    name: editingPlan.name,
                    price: (editingPlan.price_cents / 100).toFixed(2),
                    duration_days: editingPlan.duration_days ?? "",
                    max_devices: editingPlan.max_devices,
                    is_trial: editingPlan.is_trial,
                    stripe_price_id: editingPlan.stripe_price_id ?? "",
                });
            } else {
                reset();
            }
        }
    }, [isOpen, editingPlan, reset, clearErrors, setData]);

    const toggleLifetime = (checked: boolean) => {
        setData("duration_days", checked ? "" : 30);
    };

    const toggleTrial = (checked: boolean) => {
        setData((prev) => ({
            ...prev,
            is_trial: checked,
            // Un trial no puede ser vitalicio — si estaba en "vitalicio",
            // le da un valor por defecto de 7 días al marcarlo.
            duration_days:
                checked && !prev.duration_days ? 7 : prev.duration_days,
        }));
    };

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (editingPlan) {
            put(update(editingPlan.id).url, {
                onSuccess: () => onClose(),
            });
        } else {
            post(store(appId).url, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <FormModal
            open={isOpen}
            onOpenChange={onClose}
            title={isEditing ? "Editar Plan" : "Nuevo Plan"}
            description=""
            icon={TagIcon}
            progress={processing}
            isEdit={isEditing}
            labelButton={isEditing ? "Guardar Cambios" : "Crear Plan"}
            onSubmit={handleSubmit}
        >
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
                {/* Nombre */}
                <div className="space-y-1.5">
                    <Label htmlFor="plan-name">Nombre</Label>
                    <Input
                        id="plan-name"
                        value={data.name}
                        disabled={processing}
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="Ej: Licencia Vitalicia"
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                {/* Precio */}
                <div className="space-y-1.5">
                    <Label htmlFor="plan-price">Precio (USD)</Label>
                    <Input
                        id="plan-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.price}
                        disabled={processing || data.is_trial}
                        onChange={(e) => setData("price", e.target.value)}
                        placeholder="0.00"
                        required
                    />
                    {data.is_trial && (
                        <p className="text-xs text-muted-foreground">
                            Los planes de prueba son gratuitos automáticamente.
                        </p>
                    )}
                    <InputError message={errors.price} />
                </div>

                {/* Es trial */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                        <Label htmlFor="plan-is-trial">Plan de prueba</Label>
                        <p className="text-xs text-muted-foreground">
                            Solo puede existir un plan de prueba por aplicación.
                        </p>
                    </div>
                    <Switch
                        // id="plan-is-trial"
                        checked={data.is_trial}
                        disabled={processing}
                        onChange={toggleTrial}
                    />
                </div>
                <InputError message={errors.is_trial} />

                {/* Vitalicio / Duración */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="plan-duration">Duración (días)</Label>
                        <div className="flex items-center gap-2">
                            <Label
                                htmlFor="plan-lifetime"
                                className="text-xs text-muted-foreground"
                            >
                                Vitalicio
                            </Label>
                            <Switch
                                // id="plan-lifetime"
                                checked={isLifetime}
                                disabled={processing || data.is_trial}
                                onChange={toggleLifetime}
                            />
                        </div>
                    </div>
                    <Input
                        id="plan-duration"
                        type="number"
                        min="1"
                        value={isLifetime ? "" : (data.duration_days ?? "")}
                        disabled={processing || isLifetime}
                        onChange={(e) =>
                            setData("duration_days", e.target.value)
                        }
                        placeholder={isLifetime ? "Sin vencimiento" : "Ej: 30"}
                        required={!isLifetime}
                    />
                    <InputError message={errors.duration_days} />
                </div>

                {/* Máximo de dispositivos */}
                <div className="space-y-1.5">
                    <Label htmlFor="plan-max-devices">
                        Máximo de dispositivos
                    </Label>
                    <Input
                        id="plan-max-devices"
                        type="number"
                        min="1"
                        value={data.max_devices}
                        disabled={processing}
                        onChange={(e) =>
                            setData("max_devices", Number(e.target.value))
                        }
                        required
                    />
                    <InputError message={errors.max_devices} />
                </div>

                {/* Stripe Price ID (opcional) */}
                <div className="space-y-1.5">
                    <Label htmlFor="plan-stripe-price">
                        ID de precio en Stripe
                    </Label>
                    <Input
                        id="plan-stripe-price"
                        value={data.stripe_price_id}
                        disabled={processing}
                        onChange={(e) =>
                            setData("stripe_price_id", e.target.value)
                        }
                        placeholder="price_1AbC..."
                        className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                        Necesario para que este plan aparezca en el checkout de
                        compra.
                    </p>
                    <InputError message={errors.stripe_price_id} />
                </div>
            </div>
        </FormModal>
    );
};

export default PlanForm;
