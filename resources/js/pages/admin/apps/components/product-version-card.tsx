import { memo } from "react";
import { Package, Pencil, Trash2 } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type { ProductVersionEntity } from "@/types";

interface Props {
    version: ProductVersionEntity;
    onEdit: (version: ProductVersionEntity) => void;
    onDelete: (version: ProductVersionEntity) => void;
}

const ProductVersionCard = memo(({ version, onEdit, onDelete }: Props) => {
    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Package className="size-5 text-muted-foreground" />
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                                v{version.version}
                            </h3>
                            <Badge
                                variant={"soft"}
                                color={
                                    version.is_active ? "success" : "neutral"
                                }
                            >
                                {version.is_active ? "Activa" : "Inactiva"}
                            </Badge>
                        </div>
                        <p
                            className="mt-1 truncate text-sm text-muted-foreground"
                            title={version.file_name}
                        >
                            {version.file_name}
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(version)}
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(version)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>
            <div className="mt-4 border-t border-border pt-4">
                {version.release_notes ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                        {version.release_notes}
                    </p>
                ) : (
                    <p className="text-sm italic text-muted-foreground">
                        Sin notas de versión.
                    </p>
                )}
                <div className="mt-3 text-xs text-muted-foreground">
                    {version.released_at
                        ? `Publicada: ${new Date(
                              version.released_at,
                          ).toLocaleDateString("es-BO")}`
                        : "Aún no publicada"}
                </div>
            </div>
        </div>
    );
});

ProductVersionCard.displayName = "ProductVersionCard";
export default ProductVersionCard;
