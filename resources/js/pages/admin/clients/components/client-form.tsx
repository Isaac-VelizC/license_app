import React, { memo, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { User2 } from 'lucide-react';
import FormModal from '@/components/form-modal';
import { Input, Label, Textarea } from '@/components/ui';
import InputError from '@/components/input-error';
import { store, update } from '@/routes/admin/clients';
import type { ClientEntity, ClientFormData } from '@/types';
import { isValidPhoneNumber, PhoneInput } from '@/components/ui/phone-input';

interface ClientsFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingClient: ClientEntity | null;
}

const ClientForm = memo(
    ({ isOpen, onClose, editingClient }: ClientsFormModalProps) => {
        const isEditing = Boolean(editingClient);

        const {
            data,
            setData,
            post,
            put,
            processing,
            errors,
            setError,
            reset,
            clearErrors,
        } = useForm<ClientFormData>({
            name: '',
            email: '',
            phone: '',
            company_name: '',
            notes: '',
        });

        useEffect(() => {
            if (!isOpen) return;

            clearErrors();

            if (editingClient) {
                setData({
                    name: editingClient.name || '',
                    email: editingClient.email || '',
                    phone: editingClient.phone || '',
                    company_name: editingClient.company_name || '',
                    notes: editingClient.notes || '',
                });
            } else {
                reset();
            }
        }, [isOpen, editingClient, reset, clearErrors, setData]);

        const handleSubmit = (e: React.SyntheticEvent) => {
            e.preventDefault();

            if (data.phone && !isValidPhoneNumber(data.phone)) {
                setError('phone', 'Introduce un número de teléfono válido.');
                return;
            }

            if (isEditing && editingClient) {
                put(update(editingClient.id).url, {
                    onSuccess: () => handleClose(),
                });
            } else {
                post(store().url, {
                    onSuccess: () => handleClose(),
                });
            }
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
                title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
                description={
                    isEditing
                        ? 'Actualiza los datos de contacto o la información general del cliente.'
                        : 'Registra un nuevo cliente para asociarle licencias y aplicaciones.'
                }
                progress={processing}
                icon={User2}
                labelButton={
                    isEditing ? 'Actualizar Cliente' : 'Guardar Cliente'
                }
                onSubmit={handleSubmit}
            >
                <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
                    {/* Nombre Completo */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">
                            Nombre Completo / Razón Social
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Ej: John Doe / Empresa S.A."
                            value={data.name}
                            disabled={processing}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>
                    {/* Email y Teléfono */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="cliente@ejemplo.com"
                                value={data.email}
                                disabled={processing}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.email} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                            <PhoneInput
                                id="phone"
                                name="phone"
                                value={data.phone}
                                onChange={(value) => {
                                    setData('phone', value);
                                    clearErrors('phone');
                                }}
                                error={errors.phone}
                                placeholder="Introduce el teléfono"
                            />
                        </div>
                    </div>
                    {/* Nombre de la Empresa */}
                    <div className="space-y-1.5">
                        <Label htmlFor="company">
                            Empresa{' '}
                            <span className="text-xs font-normal text-muted-foreground">
                                (Opcional)
                            </span>
                        </Label>
                        <Input
                            id="company"
                            type="text"
                            placeholder="Ej: Tech Solutions Inc."
                            value={data.company_name}
                            disabled={processing}
                            onChange={(e) =>
                                setData('company_name', e.target.value)
                            }
                        />
                        <InputError message={errors.company_name} />
                    </div>
                    {/* Notas internas */}
                    <div className="space-y-1.5">
                        <Label htmlFor="notes">
                            Notas{' '}
                            <span className="text-xs font-normal text-muted-foreground">
                                (Opcional, solo visible en el panel admin)
                            </span>
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Contexto de soporte, acuerdos especiales, historial de contacto..."
                            value={data.notes}
                            disabled={processing}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            error={errors.notes}
                        />
                        <InputError message={errors.notes} />
                    </div>
                </div>
            </FormModal>
        );
    },
);

ClientForm.displayName = 'ClientForm';
export default ClientForm;
