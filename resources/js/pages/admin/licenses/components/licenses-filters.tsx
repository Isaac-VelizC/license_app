import { Selectable } from "@/components/selectable";
import { Button, InputSearch } from "@/components/ui";
import { useDebounceSearch } from "@/hooks/use-debounce-search";
import { AppEntity, ClientEntity, LicenseFilters } from "@/types";
import { Filter, RotateCcw } from "lucide-react";
import { useCallback, useMemo } from "react";

interface LicensesFiltersProps {
    filters: LicenseFilters;
    apps: AppEntity[];
    clients: ClientEntity[];
    onFilterChange: (
        newFilters: Partial<LicenseFilters> & { page?: number },
    ) => void;
    onClearAll: () => void;
}

const STATUS_OPTIONS = [
    { label: "Activa", value: "active" },
    { label: "Suspendida", value: "suspended" },
    { label: "Revocada", value: "revoked" },
];

const LicensesFilters = ({
    filters,
    apps = [],
    clients = [],
    onFilterChange,
    onClearAll,
}: LicensesFiltersProps) => {
    const { searchValue, setSearchValue, clearSearch, isSearching } =
        useDebounceSearch(filters.search || "", {
            delay: 500,
            only: ["licenses", "filters"],
            minChars: 2,
        });

    const clientsOptions = useMemo(
        () => clients.map((c) => ({ label: c.name, value: String(c.id) })),
        [clients],
    );

    const appsOptions = useMemo(
        () => apps.map((a) => ({ label: a.name, value: String(a.id) })),
        [apps],
    );

    const handleSelectChange = useCallback(
        (field: keyof LicenseFilters, value: string) => {
            onFilterChange({ [field]: value, page: 1 });
        },
        [onFilterChange],
    );

    const hasActiveFilters = Boolean(
        searchValue ||
        (filters.app_id && Number(filters.app_id) > 0) ||
        (filters.client_id && Number(filters.client_id) > 0) ||
        filters.status,
    );

    const handleResetFilters = useCallback(() => {
        clearSearch();
        onClearAll();
    }, [clearSearch, onClearAll]);

    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InputSearch
                    search={searchValue}
                    onSearchChange={(v) => setSearchValue(v)}
                    placeholder="Buscar por cliente o app..."
                    onClear={clearSearch}
                    loading={isSearching}
                    className="w-full sm:max-w-lg"
                />

                <Selectable
                    value={String(filters.app_id || "")}
                    onValueChange={(val) => handleSelectChange("app_id", val)}
                    placeholder="Filtrar por App"
                    options={appsOptions}
                    labelAll="Todas las aplicaciones"
                />

                <Selectable
                    value={String(filters.client_id || "")}
                    onValueChange={(val) =>
                        handleSelectChange("client_id", val)
                    }
                    placeholder="Filtrar por Cliente"
                    options={clientsOptions}
                    labelAll="Todos los clientes"
                />

                <Selectable
                    value={filters.status || ""}
                    onValueChange={(val) => handleSelectChange("status", val)}
                    placeholder="Filtrar por Estado"
                    labelAll="Todos los estados"
                    options={STATUS_OPTIONS}
                />
            </div>
            {hasActiveFilters && (
                <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                        <Filter className="size-3.5 text-primary" />
                        Filtros activos aplicados
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetFilters}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <RotateCcw className="mr-1 size-3" />
                        Limpiar filtros
                    </Button>
                </div>
            )}
        </div>
    );
};

export default LicensesFilters;
