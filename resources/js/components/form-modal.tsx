import { Loader2, PencilIcon } from 'lucide-react';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

type ModalProps = {
    // Header
    title: string;
    description: string;
    isEdit?: boolean;
    icon: React.ElementType;
    color?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    // Footer
    labelButton: string;
    progress: boolean;
    buttonColor?:
        | 'success'
        | 'primary'
        | 'secondary'
        | 'danger'
        | 'warning'
        | 'info'
        | 'neutral';
    isCancelButton?: boolean;
    isDisabled?: boolean;
    onSubmit: (e: React.SyntheticEvent) => void;   
};

const FormModal = ({
    title,
    description,
    isEdit = false,
    icon: Icon,
    color = 'blue',
    open,
    onOpenChange,
    children,
    progress,
    labelButton,
    buttonColor = 'primary',
    isCancelButton = true,
    isDisabled = false,
    onSubmit,
}: ModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:max-w-lg p-0 gap-0 overflow-hidden">
                <form onSubmit={onSubmit}>
                    <div className="border-b border-border/60 bg-muted/30 px-6 py-5">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                {/* Ícono según modo */}
                                <div
                                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/40`}
                                >
                                    {isEdit ? (
                                        <PencilIcon
                                            className={`size-4 text-${color}-600`}
                                        />
                                    ) : (
                                        <Icon className={`size-4 text-${color}-600`} />
                                    )}
                                </div>
                                <div>
                                    <DialogTitle className="text-base leading-tight font-semibold">
                                        {title}
                                    </DialogTitle>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>
                    {children}
                    <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-muted/20 px-6 py-4">
                        {isCancelButton && (
                            <Button
                                type="button"
                                variant="ghost"
                                color="neutral"
                                size="sm"
                                onClick={() => onOpenChange(false)}
                                disabled={progress}
                            >
                                Cancelar
                            </Button>
                        )}
                        <Button
                            type="submit"
                            color={buttonColor}
                            size="sm"
                            disabled={progress || isDisabled}
                            // onClick={onSubmit}
                        >
                            {progress ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    Guardando...
                                </>
                            ) : isEdit ? (
                                <>
                                    <Icon className="size-3.5" />
                                    {labelButton}
                                </>
                            ) : (
                                <>
                                    <Icon className="size-3.5" />
                                    {labelButton}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default FormModal;
