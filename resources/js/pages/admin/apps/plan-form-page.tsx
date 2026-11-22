import { useEffect, useMemo } from 'react';
import {
    Tag,
    DollarSign,
    Calendar,
    Smartphone,
    QrCode,
    GitBranch,
    Save,
    ArrowLeft,
} from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Input, Label, Switch } from '@/components/ui';
import { store, update } from '@/routes/admin/plans';
import { show } from '@/routes/admin/apps';
import type { PlanEntity, PlanFormData } from '@/types';
import Heading from '@/components/heading';
import { dashboard } from '@/routes/admin';
import { Selectable } from '@/components/selectable';
import { toast } from 'sonner';

type ProductVersionOption = {
    id: number;
    version: string;
};

type PlanFormModalProps = {
    appId: number;
    editingPlan: PlanEntity | null;
    productVersions: ProductVersionOption[];
};
export default function PlanFormPage({
    appId,
    editingPlan,
    productVersions,
}: PlanFormModalProps) {
    const isEditing = Boolean(editingPlan);

    if (!appId) return null;

    // 1. Inicializamos el useForm directamente con los valores de editingPlan si existen
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<PlanFormData>({
            name: editingPlan?.name ?? '',
            price: editingPlan
                ? (editingPlan.price_cents / 100).toFixed(2)
                : '',
            duration_days: editingPlan?.duration_days ?? '',
            max_devices: editingPlan?.max_devices ?? 1,
            is_trial: editingPlan?.is_trial ?? false,
            qr_image: null,
            stripe_price_id: editingPlan?.stripe_price_id ?? '',
            product_version_id: editingPlan?.product_version_id ?? null,
            updates_until_version: editingPlan?.updates_until_version ?? '',
            is_active: editingPlan?.is_active ?? false,
        });

    const isLifetime = data.duration_days === '' || data.duration_days === null;

    // 2. Simplificamos el useEffect solo para limpiar errores si cambia el plan a editar
    useEffect(() => {
        clearErrors();
    }, [editingPlan, clearErrors]);

    const toggleLifetime = (checked: boolean) => {
        setData('duration_days', checked ? '' : 30);
    };

    const toggleTrial = (checked: boolean) => {
        setData((prev) => ({
            ...prev,
            is_trial: checked,
            duration_days:
                checked && !prev.duration_days ? 7 : prev.duration_days,
        }));
    };

    const versionsOptions = useMemo(() => {
        return [
            { value: '', label: 'Ninguna (Versión general)' },
            ...productVersions.map((version) => ({
                value: String(version.id),
                label: version.version,
            })),
        ];
    }, [productVersions]);

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (data.is_active) {
            if (!data.product_version_id || !data.updates_until_version) {
                toast.error(
                    'Para activar el plan, son obligatorios: la versión de producto y las actualizaciones incluidas.',
                );
                return;
            }

            const hasExistingQr = editingPlan && editingPlan.qr_image_url;
            if (!data.is_trial && !data.qr_image && !hasExistingQr) {
                toast.error(
                    'Para activar un plan de pago, es obligatoria la imagen del código QR.',
                );
                return;
            }
        }

        if (editingPlan) {
            post(update(editingPlan.id).url);
        } else {
            post(store(appId).url, {
                onSuccess: () => {
                    reset();
                },
            });
        }
    };

    return (
        <>
            <Head title={isEditing ? 'Editar plan' : 'Crear plan'} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Cabecera */}
                <div className="border-b pb-4">
                    <Link
                        href={show(appId).url}
                        className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 size-4" />
                        Volver a detalles de la aplicación
                    </Link>
                    <Heading
                        title={isEditing ? 'Editar plan' : 'Crear plan'}
                        description={
                            isEditing
                                ? 'Modifica los detalles de este plan de licenciamiento.'
                                : 'Crea un nuevo plan comercial para esta aplicación.'
                        }
                    />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 pb-12">
                    {/* GRID PRINCIPAL: 2 Columnas en pantallas lg */}
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                        {/* COLUMNA IZQUIERDA (7 columnas): Información General y Versiones */}
                        <div className="space-y-6 lg:col-span-7">
                            {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
                            <div className="space-y-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                                <div className="flex items-center gap-2 border-b pb-3 font-semibold text-foreground">
                                    <Tag className="h-5 w-5 text-primary" />
                                    <h3>Información General</h3>
                                </div>

                                {/* Nombre */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="plan-name" required>
                                        Nombre del Plan
                                    </Label>
                                    <Input
                                        id="plan-name"
                                        value={data.name}
                                        disabled={processing}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="Ej: Licencia Anual Profesional"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* Precio */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="plan-price">
                                            Precio (USD)
                                        </Label>
                                        <Input
                                            id="plan-price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            leftIcon={DollarSign}
                                            value={data.price}
                                            disabled={
                                                processing || data.is_trial
                                            }
                                            onChange={(e) =>
                                                setData('price', e.target.value)
                                            }
                                            placeholder="0.00"
                                            required={!data.is_trial}
                                        />
                                        {data.is_trial && (
                                            <p className="text-xs text-muted-foreground">
                                                Gratuito por ser trial.
                                            </p>
                                        )}
                                        <InputError message={errors.price} />
                                    </div>

                                    {/* Máximo de dispositivos */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="plan-max-devices">
                                            Máx. Dispositivos
                                        </Label>
                                        <Input
                                            id="plan-max-devices"
                                            type="number"
                                            min="1"
                                            value={data.max_devices}
                                            disabled={processing}
                                            leftIcon={Smartphone}
                                            onChange={(e) =>
                                                setData(
                                                    'max_devices',
                                                    Number(e.target.value),
                                                )
                                            }
                                            required
                                        />
                                        <InputError
                                            message={errors.max_devices}
                                        />
                                    </div>
                                </div>

                                {/* Switch de Trial */}
                                <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
                                    <div className="space-y-0.5">
                                        <Label
                                            htmlFor="plan-is-trial"
                                            className="text-sm font-medium"
                                        >
                                            ¿Es un plan de prueba?
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Solo un trial activo por app.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.is_trial}
                                        disabled={processing}
                                        onChange={toggleTrial}
                                    />
                                </div>
                                <InputError message={errors.is_trial} />
                            </div>

                            {/* SECCIÓN 2: CONTROL DE VERSIONES */}
                            <div className="space-y-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                                <div className="border-b pb-3">
                                    <div className="flex items-center gap-2 font-semibold text-foreground">
                                        <GitBranch className="h-5 w-5 text-primary" />
                                        <h3>Control de Versiones</h3>
                                    </div>
                                    {data.is_trial && (
                                        <p className="text-xs text-warning">
                                            Es necesario una version de producto
                                            para una plan de prueba
                                        </p>
                                    )}
                                </div>

                                {/* Versión del producto */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="plan-product-version"
                                        required={data.is_trial}
                                    >
                                        Versión inicial del producto
                                    </Label>
                                    <Selectable
                                        value={
                                            data.product_version_id !== null &&
                                            data.product_version_id !==
                                                undefined
                                                ? String(
                                                      data.product_version_id,
                                                  )
                                                : ''
                                        }
                                        defaultValue=""
                                        disabled={processing}
                                        required={data.is_trial}
                                        onValueChange={(e) =>
                                            setData(
                                                'product_version_id',
                                                e ? Number(e) : null,
                                            )
                                        }
                                        showAll={false}
                                        options={versionsOptions}
                                        placeholder="Seleccionar versión..."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Versión inicial entregada al adquirir el
                                        plan.
                                    </p>
                                    <InputError
                                        message={errors.product_version_id}
                                    />
                                </div>

                                {/* Condicional: Mostrar solo si hay una versión de producto seleccionada */}
                                {data.product_version_id !== null &&
                                    data.product_version_id !== undefined && (
                                        <div className="animate-fadeIn space-y-1.5 pt-2">
                                            <Label htmlFor="plan-updates-until-version">
                                                Actualizaciones incluidas hasta
                                                (Versión)
                                            </Label>
                                            <Input
                                                id="plan-updates-until-version"
                                                value={
                                                    data.updates_until_version
                                                }
                                                disabled={processing}
                                                required={data.is_trial}
                                                onChange={(e) =>
                                                    setData(
                                                        'updates_until_version',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ej: 2.5.0 o 2.x"
                                                maxLength={50}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Límite de versión al que el
                                                cliente podrá actualizar sin
                                                coste.
                                            </p>
                                            <InputError
                                                message={
                                                    errors.updates_until_version
                                                }
                                            />
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* COLUMNA DERECHA (5 columnas): Vigencia, QR y Botón de Envío */}
                        <div className="space-y-6 lg:col-span-5">
                            {/* SECCIÓN 3: VIGENCIA Y DURACIÓN */}
                            <div className="space-y-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                                <div className="flex items-center gap-2 border-b pb-3 font-semibold text-foreground">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <h3>Vigencia y Duración</h3>
                                </div>

                                <div className="bg-surface flex flex-col gap-3 rounded-2xl border border-border p-5 shadow-sm transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold text-foreground">
                                                Licencia Vitalicia
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Acceso permanente al software
                                                sin fecha de caducidad.
                                            </p>
                                        </div>

                                        <Switch
                                            checked={isLifetime}
                                            disabled={
                                                processing || data.is_trial
                                            }
                                            onChange={toggleLifetime}
                                        />
                                    </div>

                                    {/* Mensaje de aviso cuando es un plan de prueba */}
                                    {data.is_trial && (
                                        <div className="flex items-center gap-2 rounded-xl border border-warning/20 bg-warning/10 px-3.5 py-2.5 text-xs font-semibold text-warning">
                                            <span>⚠️</span>
                                            <span>
                                                No es posible aplicar la opción
                                                vitalicia a un plan de prueba.
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {!isLifetime && (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="plan-duration">
                                            Duración en días
                                        </Label>
                                        <Input
                                            id="plan-duration"
                                            type="number"
                                            min="1"
                                            value={data.duration_days ?? ''}
                                            disabled={processing}
                                            onChange={(e) =>
                                                setData(
                                                    'duration_days',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ej: 365"
                                            required={!isLifetime}
                                        />
                                        <InputError
                                            message={errors.duration_days}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* SECCIÓN 4: COMPROBANTE / QR DE PAGO */}
                            {!data.is_trial && (
                                <div className="space-y-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                                    <div className="flex items-center gap-2 border-b pb-3 font-semibold text-foreground">
                                        <QrCode className="h-5 w-5 text-primary" />
                                        <h3>QR de Pago</h3>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {(data.qr_image ||
                                            editingPlan?.qr_image_url) && (
                                            <div className="w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                                                <img
                                                    src={
                                                        data.qr_image
                                                            ? URL.createObjectURL(
                                                                  data.qr_image,
                                                              )
                                                            : editingPlan!
                                                                  .qr_image_url!
                                                    }
                                                    alt="QR"
                                                    className="aspect-square w-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="w-full space-y-1.5">
                                            <Label htmlFor="plan-qr-image">
                                                Imagen QR
                                            </Label>
                                            <Input
                                                id="plan-qr-image"
                                                type="file"
                                                accept="image/*"
                                                disabled={processing}
                                                onChange={(e) =>
                                                    setData(
                                                        'qr_image',
                                                        e.target.files?.[0] ??
                                                            null,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <InputError message={errors.qr_image} />
                                </div>
                            )}

                            {/** SECCIÓN 5: ESTADO  */}
                            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium text-foreground">
                                        Estado del Plan
                                    </p>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Habilítalo solo cuando el plan esté
                                        configurado por completo y listo para
                                        ser adquirido por los clientes.
                                    </p>
                                </div>

                                <Switch
                                    checked={data.is_active}
                                    onChange={(checked) =>
                                        setData('is_active', checked)
                                    }
                                />
                            </div>

                            {/* BOTÓN DE ACCIÓN */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEditing
                                        ? 'Guardar Cambios del Plan'
                                        : 'Crear Plan Comercial'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

PlanFormPage.layout = {
    breadcrumbs: [
        { title: 'Panel central', href: dashboard() },
        { title: 'Aplicaciones', href: '/admin/apps' },
        { title: 'Nuevo plan' },
    ],
};
