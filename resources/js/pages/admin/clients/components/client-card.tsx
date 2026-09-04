import { memo } from "react";
import { Building2, FileText, Mail, Phone, User } from "lucide-react";
import type { ClientEntity } from "@/types";

const ClientCard = memo(({ client }: { client: ClientEntity }) => {
    return (
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm lg:col-span-1">
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <User className="size-4 text-primary" />
                Datos del Cliente
            </h3>

            <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Mail className="size-4 shrink-0" />
                    <a
                        href={`mailto:${client.email}`}
                        className="font-medium text-foreground hover:underline"
                    >
                        {client.email}
                    </a>
                </div>

                <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Phone className="size-4 shrink-0" />
                    <span>{client.phone || "Sin teléfono registrado"}</span>
                </div>

                <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Building2 className="size-4 shrink-0" />
                    <span>{client.company_name || "Sin empresa"}</span>
                </div>

                {client.notes && (
                    <div className="mt-4 rounded-lg bg-muted/50 p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <FileText className="size-3.5" />
                            Notas Internas
                        </div>
                        <p className="text-xs whitespace-pre-wrap text-foreground">
                            {client.notes}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
});

ClientCard.displayName = "ClientCard";
export default ClientCard;
