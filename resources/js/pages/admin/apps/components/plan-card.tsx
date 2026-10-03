import { memo } from "react";
import {
    PackageCheck,
    Pencil,
    RefreshCw,
    Smartphone,
    TimerReset,
    Trash2,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { PlanEntity } from "@/types";

type PlanCardProps = {
    plan: PlanEntity;
    onEdit: (plan: PlanEntity) => void;
    onDelete: (plan: PlanEntity) => void;
};

const PlanCard = memo(({ plan, onDelete, onEdit }: PlanCardProps) => {
    return (
        <div
            className={cn(
                "space-y-4 rounded-lg border p-4",
                !plan.is_active && "opacity-60",
            )}
        >
            <div>
                <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-bold">{plan.name}</h2>
                    <div className="flex flex-wrap gap-1.5">
                        {plan.is_trial && (
                            <Badge variant="soft" color="warning">
                                Prueba
                            </Badge>
                        )}

                        {!plan.is_active && (
                            <Badge variant="outline" color="neutral">
                                Inactivo
                            </Badge>
                        )}

                        <Badge variant="outline" color="info">
                            {plan.is_lifetime
                                ? "Vitalicio"
                                : `${plan.duration_days} días`}
                        </Badge>

                        <Badge
                            variant="outline"
                            color={plan.qr_image_url ? "success" : "neutral"}
                        >
                            {plan.qr_image_url ? "QR configurado" : "Sin QR"}
                        </Badge>
                    </div>
                </div>
                <p>
                    {plan.is_free ? (
                        <span className="text-2xl font-extrabold text-foreground">
                            Gratis
                        </span>
                    ) : (
                        <>
                            <span className="text-2xl font-extrabold text-foreground">
                                {plan.formatted_price}
                            </span>
                        </>
                    )}
                </p>
            </div>
            <div className="space-y-3 border-t border-border/60 pt-4 text-sm">
                {/*!plan.stripe_price_id && !plan.is_trial && (
                    <div className="flex items-center text-amber-600 dark:text-amber-500">
                        <AlertTriangle className="mr-2.5 size-4 shrink-0" />
                        <span className="text-xs">
                            Sin precio de Stripe — no aparecerá en el checkout.
                        </span>
                    </div>
                )*/}
                <div className="flex items-center text-muted-foreground">
                    <Smartphone className="mr-2.5 size-4 shrink-0 text-primary" />
                    <span>
                        Hasta{" "}
                        <strong className="text-foreground">
                            {plan.max_devices}
                        </strong>{" "}
                        {plan.max_devices === 1
                            ? "dispositivo"
                            : "dispositivos"}
                    </span>
                </div>

                <div className="flex items-center text-muted-foreground">
                    <PackageCheck className="mr-2.5 size-4 shrink-0 text-primary" />
                    <span>
                        Versión incluida:{" "}
                        <strong className="text-foreground">
                            {plan.product_version?.version ?? "Sin asignar"}
                        </strong>
                    </span>
                </div>

                <div className="flex items-center text-muted-foreground">
                    <RefreshCw className="mr-2.5 size-4 shrink-0 text-primary" />
                    <span>
                        Actualizaciones hasta:{" "}
                        <strong className="text-foreground">
                            {plan.updates_until_version ??
                                "Sin límite definido"}
                        </strong>
                    </span>
                </div>

                <div className="flex items-center text-muted-foreground">
                    <TimerReset className="mr-2.5 size-4 shrink-0 text-primary" />
                    <span>
                        Modalidad:{" "}
                        <strong className="text-foreground">
                            {plan.is_trial
                                ? "Periodo de prueba"
                                : plan.is_lifetime
                                  ? "Licencia permanente"
                                  : "Suscripción por tiempo"}
                        </strong>
                    </span>
                </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
                <Button
                    variant="ghost"
                    size="sm"
                    color="neutral"
                    onClick={() => onEdit(plan)}
                >
                    <Pencil className="size-3.5" />
                    Editar
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    color="danger"
                    onClick={() => onDelete(plan)}
                >
                    <Trash2 className="size-3.5" />
                    Eliminar
                </Button>
            </div>
        </div>
    );
});

PlanCard.displayName = "PlanCard";
export default PlanCard;
