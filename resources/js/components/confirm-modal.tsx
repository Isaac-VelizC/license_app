import React from 'react';
import { AlertTriangle, Info, CheckCircle2, Loader2, Trash2, XIcon } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertTitle } from './ui/alert';

export type ModalVariant =
    'danger' | 'warning' | 'info' | 'success' | 'deleted' | 'cancelled';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    processing?: boolean;
    type?: ModalVariant;
    title?: string;
    itemName?: string;
    confirmText?: string;
    descriptionText?: string;
    alertText?: string | null; // Pasa null para no mostrar la alerta
    icon?: React.ReactNode;
}

// Configuración de estilos e iconos por variante
const VARIANT_CONFIG: Record<
    ModalVariant,
    {
        icon: React.ReactNode;
        iconBg: string;
        iconColor: string;
        buttonColor: 'danger' | 'warning' | 'primary' | 'neutral' | 'success';
        alertVariant: 'destructive' | 'warning' | 'default';
        defaultTitle: string;
        defaultConfirmText: string;
    }
> = {
    danger: {
        icon: <AlertTriangle className="h-6 w-6 text-destructive" />,
        iconBg: 'bg-destructive/10',
        iconColor: 'text-destructive',
        buttonColor: 'danger',
        alertVariant: 'destructive',
        defaultTitle: 'Confirmar acción destructiva',
        defaultConfirmText: 'Confirmar',
    },
    deleted: {
        icon: <Trash2 className="h-6 w-6 text-destructive" />,
        iconBg: 'bg-destructive/10',
        iconColor: 'text-destructive',
        buttonColor: 'danger',
        alertVariant: 'destructive',
        defaultTitle: 'Confirmar eliminación',
        defaultConfirmText: 'Sí, eliminar',
    },
    warning: {
        icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-500',
        buttonColor: 'warning',
        alertVariant: 'warning',
        defaultTitle: 'Confirmar advertencia',
        defaultConfirmText: 'Continuar',
    },
    cancelled: {
        icon: <XIcon className="h-6 w-6 text-amber-500" />,
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-500',
        buttonColor: 'warning',
        alertVariant: 'warning',
        defaultTitle: 'Confirmar cancelación',
        defaultConfirmText: 'Sí, cancelar',
    },
    info: {
        icon: <Info className="h-6 w-6 text-blue-500" />,
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        buttonColor: 'primary',
        alertVariant: 'default',
        defaultTitle: 'Confirmar acción',
        defaultConfirmText: 'Aceptar',
    },
    success: {
        icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
        buttonColor: 'success',
        alertVariant: 'default',
        defaultTitle: 'Confirmar operación',
        defaultConfirmText: 'Procesar',
    },
};

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    processing = false,
    type = 'danger',
    title,
    itemName,
    confirmText,
    descriptionText,
    alertText,
    icon,
}: Props) {
    const config = VARIANT_CONFIG[type] || VARIANT_CONFIG.danger;

    // Resolución de valores con fallback prioritario
    const modalTitle = title || config.defaultTitle;
    const confirmLabel = confirmText || config.defaultConfirmText;
    const modalDescription =
        descriptionText ||
        `¿Estás seguro de que deseas realizar esta acción${itemName ? ` en ${itemName}` : ''}?`;

    // Evitar cerrar con la tecla Esc o click afuera si está procesando
    const handleOpenChange = (open: boolean) => {
        if (!open && !processing) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="overflow-hidden sm:max-w-md">
                {/* CAPA OVERLAY DE PROCESAMIENTO */}
                {processing && (
                    <div className="absolute inset-0 z-50 flex animate-in flex-col items-center justify-center bg-background/80 p-6 text-center backdrop-blur-sm duration-200 fade-in">
                        <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
                            <Spinner className="absolute inset-0 h-full w-full opacity-20" />
                            {icon || config.icon}
                        </div>
                        <p className="animate-pulse text-sm font-medium text-muted-foreground">
                            Procesando{itemName ? ` ${itemName}` : ''}...
                        </p>
                    </div>
                )}

                <DialogHeader className="pt-2">
                    <div className="flex items-start gap-4">
                        {/* Icono de Alerta con Fondo Dinámico */}
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}
                        >
                            {icon || config.icon}
                        </div>

                        <div className="flex-1">
                            <DialogTitle className="text-lg leading-6 font-semibold">
                                {modalTitle}
                            </DialogTitle>
                            <DialogDescription className="pt-2 text-sm text-muted-foreground">
                                {modalDescription}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* BLOQUE ALERTA (Solo se muestra si hay alertText o un texto predeterminado útil) */}
                {alertText !== null &&
                    (alertText || type === 'deleted' || type === 'danger') && (
                        <Alert variant={config.alertVariant} className="mt-2">
                            <AlertTitle className="text-xs">
                                {alertText ||
                                    'Esta acción modificará el estado actual del registro.'}
                            </AlertTitle>
                        </Alert>
                    )}

                {/* FOOTER CON BOTONES */}
                <DialogFooter className="mt-4 gap-4">
                    <Button
                        variant="ghost"
                        color="neutral"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Cancelar
                    </Button>
                    <Button
                        color={config.buttonColor}
                        variant="outline"
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ConfirmModal;
