import { Head, Link, useForm } from "@inertiajs/react";
import {
    BadgeCheck,
    CircleDollarSign,
    ClipboardCheck,
    Copy,
    KeyRound,
    Mail,
    PackageCheck,
    ReceiptText,
} from "lucide-react";

import Heading from "@/components/heading";
import { Badge, Button, Textarea } from "@/components/ui";
import { markAsPaid } from "@/routes/admin/order";
import { formatDateTime } from "@/lib/utils";
import InputError from "@/components/input-error";
import { dashboard } from "@/routes/admin";
import { index } from "@/routes/admin/order";
import type { OrderDetailEntity } from "@/types/admin/order.contract";
import licenses from "@/routes/admin/licenses";

type OrderDetailProps = {
    order: OrderDetailEntity;
};

export default function OrderDetail({ order }: OrderDetailProps) {
    const form = useForm({
        payment_reference: order.payment_reference ?? "",
    });

    const canMarkAsPaid = order.status === "pending";

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const confirmed = window.confirm(
            `¿Confirmas que el pago de la orden ${order.order_number} fue verificado? Esta acción generará la licencia.`,
        );

        if (!confirmed) {
            return;
        }

        form.post(markAsPaid(order.id).url, {
            preserveScroll: true,
        });
    };

    const copyLicenseKey = async () => {
        if (!order.license?.license_key) {
            return;
        }

        await navigator.clipboard.writeText(order.license.license_key);
    };

    return (
        <>
            <Head title={`Orden ${order.order_number}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-6">
                <Heading
                    title={`Orden ${order.order_number}`}
                    description={`Creada el ${formatDateTime(order.created_at)}`}
                    actions={
                        <>
                            <Badge variant="soft" color={order.status_color}>
                                {order.status_label}
                            </Badge>
                            {order.license && (
                                <Link
                                    href={licenses.show(order.license?.id).url}
                                >
                                    <Button variant={"link"} size={"sm"}>
                                        Ver Licencia
                                    </Button>
                                </Link>
                            )}
                        </>
                    }
                />

                <div className="grid gap-6 xl:grid-cols-3">
                    <div className="space-y-6 xl:col-span-2">
                        <section className="rounded-lg border border-border bg-card space-y-4 p-5">
                            <div className="flex items-center gap-2">
                                <CircleDollarSign className="size-4 text-muted-foreground" />
                                <h2 className="text-sm font-semibold text-foreground">
                                    Resumen de la orden
                                </h2>
                            </div>

                            <div className="mt-5 grid gap-5 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Plan
                                    </p>

                                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                        <PackageCheck className="size-4 text-muted-foreground" />
                                        {order.plan.name}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Dispositivos
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-foreground">
                                        {order.plan.max_devices}{" "}
                                        {order.plan.max_devices === 1
                                            ? "dispositivo"
                                            : "dispositivos"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Monto
                                    </p>

                                    <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                                        {order.amount}
                                    </p>
                                </div>
                            </div>

                            {order.plan.is_lifetime && (
                                <div className="mt-5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                                    Esta orden incluye una licencia de por vida.
                                </div>
                            )}
                        </section>

                        <section className="rounded-lg border border-border bg-card space-y-4 p-5">
                            <div className="flex items-center gap-2">
                                <Mail className="size-4 text-muted-foreground" />
                                <h2 className="text-sm font-semibold text-foreground">
                                    Cliente
                                </h2>
                            </div>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <InfoItem label="Nombre">
                                    {order.client.name}
                                </InfoItem>

                                <InfoItem label="Correo electrónico">
                                    <a
                                        href={`mailto:${order.client.email}`}
                                        className="text-primary hover:underline"
                                    >
                                        {order.client.email}
                                    </a>
                                </InfoItem>

                                <InfoItem label="Teléfono">
                                    {order.client.phone ? (
                                        <a
                                            href={`tel:${order.client.phone}`}
                                            className="text-primary hover:underline"
                                        >
                                            {order.client.phone}
                                        </a>
                                    ) : (
                                        "No registrado"
                                    )}
                                </InfoItem>

                                <InfoItem label="Empresa">
                                    {order.client.company_name ??
                                        "No registrada"}
                                </InfoItem>
                            </div>
                        </section>

                        {order.license && (
                            <section className="rounded-lg border border-border bg-card space-y-4 p-5">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="size-4 text-muted-foreground" />
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Licencia generada
                                    </h2>
                                </div>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <InfoItem label="Clave de licencia">
                                        <div className="flex items-center gap-2">
                                            <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">
                                                {order.license.license_key}
                                            </code>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={copyLicenseKey}
                                                title="Copiar clave de licencia"
                                            >
                                                <Copy className="size-4" />
                                                <span className="sr-only">
                                                    Copiar clave de licencia
                                                </span>
                                            </Button>
                                        </div>
                                    </InfoItem>

                                    <InfoItem label="Vencimiento">
                                        {order.license.expires_at
                                            ? formatDateTime(
                                                  order.license.expires_at,
                                              )
                                            : "Sin vencimiento"}
                                    </InfoItem>
                                </div>
                            </section>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <section className="rounded-lg border border-border bg-card space-y-4 p-5">
                            <div className="flex items-center gap-2">
                                <ClipboardCheck className="size-4 text-muted-foreground" />
                                <h2 className="text-sm font-semibold text-foreground">
                                    Verificación de pago
                                </h2>
                            </div>

                            {order.status === "paid" ? (
                                <div className="mt-5 space-y-4">
                                    <div className="flex items-start gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3">
                                        <BadgeCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />

                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                Pago verificado
                                            </p>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Pagada el{" "}
                                                {formatDateTime(order.paid_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/*order.verified_by && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <UserRoundCheck className="size-4 shrink-0" />
                                            Verificado por{" "}
                                            {order.verified_by.name}
                                        </div>
                                    )*/}

                                    {order.payment_reference && (
                                        <InfoItem label="Referencia de pago">
                                            <code className="block break-all rounded-md bg-muted px-3 py-2 font-mono text-xs text-foreground">
                                                {order.payment_reference}
                                            </code>
                                        </InfoItem>
                                    )}

                                    {/*order.payment_proof_path && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <a
                                                href={order.payment_proof_path}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <FileText className="mr-2 size-4" />
                                                Ver comprobante
                                            </a>
                                        </Button>
                                    )*/}
                                </div>
                            ) : canMarkAsPaid ? (
                                <form
                                    className="mt-5 space-y-4"
                                    onSubmit={handleSubmit}
                                >
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="payment_reference"
                                            className="text-xs font-medium text-foreground"
                                        >
                                            Referencia del pago
                                        </label>

                                        <Textarea
                                            id="payment_reference"
                                            value={form.data.payment_reference}
                                            onChange={(event) =>
                                                form.setData(
                                                    "payment_reference",
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            placeholder="N.º de transacción, banco o una nota..."
                                        />

                                        <InputError
                                            message={
                                                form.errors.payment_reference
                                            }
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="w-full"
                                    >
                                        {form.processing
                                            ? "Verificando pago..."
                                            : "Marcar como pagada"}
                                    </Button>

                                    <p className="text-center text-xs text-muted-foreground">
                                        Esta acción generará la licencia de la
                                        orden.
                                    </p>
                                </form>
                            ) : (
                                <div className="mt-5 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                                    Esta orden no puede marcarse como pagada
                                    porque su estado es{" "}
                                    <span className="font-medium">
                                        {order.status_label}
                                    </span>
                                    .
                                </div>
                            )}
                        </section>

                        <section className="rounded-lg border border-border bg-card space-y-4 p-5">
                            <div className="flex items-center gap-2">
                                <ReceiptText className="size-4 text-muted-foreground" />
                                <h2 className="text-sm font-semibold text-foreground">
                                    Información
                                </h2>
                            </div>

                            <dl className="mt-5 space-y-4 text-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-muted-foreground">
                                        Orden
                                    </dt>
                                    <dd className="font-mono font-medium text-foreground">
                                        {order.order_number}
                                    </dd>
                                </div>

                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-muted-foreground">
                                        Creada
                                    </dt>
                                    <dd className="text-right text-foreground">
                                        {formatDateTime(order.created_at)}
                                    </dd>
                                </div>

                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-muted-foreground">
                                        Vencimiento
                                    </dt>
                                    <dd className="text-right text-foreground">
                                        {order.expires_at
                                            ? formatDateTime(order.expires_at)
                                            : "Sin vencimiento"}
                                    </dd>
                                </div>
                            </dl>
                        </section>
                    </aside>
                </div>
            </div>
        </>
    );
}

type InfoItemProps = {
    label: string;
    children: React.ReactNode;
};

function InfoItem({ label, children }: InfoItemProps) {
    return (
        <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="mt-1 wrap-break-words text-sm font-medium text-foreground">
                {children}
            </div>
        </div>
    );
}

OrderDetail.layout = {
    breadcrumbs: [
        { title: "Panel Central", href: dashboard().url },
        { title: "Órdenes", href: index().url },
        { title: "Detalles del orden", href: "#" },
    ],
};
