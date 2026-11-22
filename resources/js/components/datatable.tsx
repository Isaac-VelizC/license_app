import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from 'lucide-react';
import { Fragment, memo } from 'react';
import type { ReactNode } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import SectionEmpty from './section-empty';

export type SortDirection = 'asc' | 'desc';

export interface Column<T, TSortField extends string = string> {
    id: string;

    header: ReactNode;

    className?: string;
    headerClassName?: string;

    cell: (item: T) => ReactNode;

    /**
     * Campo reconocido por el backend.
     *
     * Si no se proporciona, la columna
     * no será ordenable.
     */
    sortField?: TSortField;
}

interface TableBodyContentProps<T, TSortField extends string = string> {
    data: T[];

    columns: Column<T, TSortField>[];

    rowKey: (item: T) => string | number;

    customRowRender?: (item: T, index: number) => ReactNode;
}

export interface DataTableProps<
    T,
    TSortField extends string = string,
> extends TableBodyContentProps<T, TSortField> {
    loading?: boolean;

    emptyTitle?: string;
    emptyDescription?: string;
    filteredEmptyDescription?: string;

    /**
     * Se conserva para mantener
     * compatibilidad con tablas existentes.
     */
    searchValue?: string;

    /**
     * Permite indicar filtros adicionales:
     * fechas, estados, métodos de pago, etc.
     */
    hasActiveFilters?: boolean;

    clearSearch?: () => void;
    clearFilters?: () => void;

    sortBy?: TSortField;
    sortDirection?: SortDirection;

    onSort?: (field: TSortField) => void;
}

function TableBodyContentComponent<T, TSortField extends string = string>({
    data,
    columns,
    rowKey,
    customRowRender,
}: TableBodyContentProps<T, TSortField>): React.JSX.Element {
    return (
        <TableBody>
            {data.map((item, index) => {
                const key = rowKey(item);

                if (customRowRender) {
                    return (
                        <Fragment key={key}>
                            {customRowRender(item, index)}
                        </Fragment>
                    );
                }

                return (
                    <TableRow key={key}>
                        {columns.map((column) => (
                            <TableCell
                                key={column.id}
                                className={column.className}
                            >
                                {column.cell(item)}
                            </TableCell>
                        ))}
                    </TableRow>
                );
            })}
        </TableBody>
    );
}

const TableBodyContent = memo(
    TableBodyContentComponent,
) as typeof TableBodyContentComponent;

export function DataTable<T, TSortField extends string = string>({
    data,
    columns,
    rowKey,
    customRowRender,

    loading = false,

    emptyTitle = 'No se encontraron registros',

    emptyDescription,

    filteredEmptyDescription = 'No existen registros que coincidan con los filtros seleccionados.',

    searchValue = '',
    hasActiveFilters,

    clearSearch,
    clearFilters,

    sortBy,
    sortDirection,
    onSort,
}: DataTableProps<T, TSortField>): React.JSX.Element {
    const hasData = data.length > 0;

    const totalColumns = Math.max(columns.length, 1);

    const isFiltered = hasActiveFilters ?? Boolean(searchValue.trim());

    const handleClearFilters = clearFilters ?? clearSearch;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {columns.map((column) => (
                        <TableHead
                            key={column.id}
                            className={
                                column.headerClassName ?? column.className
                            }
                        >
                            {column.sortField && onSort ? (
                                <DataTableSortButton
                                    label={column.header}
                                    active={sortBy === column.sortField}
                                    direction={sortDirection}
                                    onClick={() => {
                                        onSort(column.sortField as TSortField);
                                    }}
                                />
                            ) : (
                                column.header
                            )}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>

            {loading ? (
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={totalColumns}>
                            <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="size-4 animate-spin" />
                                Cargando registros...
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            ) : hasData ? (
                <TableBodyContent
                    data={data}
                    columns={columns}
                    rowKey={rowKey}
                    customRowRender={customRowRender}
                />
            ) : (
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={totalColumns}>
                            <SectionEmpty
                                title={emptyTitle}
                                description={
                                    isFiltered
                                        ? filteredEmptyDescription
                                        : (emptyDescription ??
                                          'No hay registros cargados en el sistema')
                                }
                                isFilter={isFiltered}
                                action={
                                    isFiltered && handleClearFilters
                                        ? {
                                              label: 'Limpiar filtros',

                                              onClick: handleClearFilters,
                                          }
                                        : undefined
                                }
                            />
                        </TableCell>
                    </TableRow>
                </TableBody>
            )}
        </Table>
    );
}

interface DataTableSortButtonProps {
    label: ReactNode;

    active: boolean;

    direction?: SortDirection;

    onClick: () => void;
}

function DataTableSortButton({
    label,
    active,
    direction,
    onClick,
}: DataTableSortButtonProps): React.JSX.Element {
    return (
        <button
            type="button"
            className="-ml-3 flex h-8 items-center gap-4 uppercase"
            onClick={onClick}
        >
            {label}

            {!active ? (
                <ArrowUpDown className="ml-2 size-3.5 text-muted-foreground" />
            ) : direction === 'asc' ? (
                <ArrowUp className="ml-2 size-3.5" />
            ) : (
                <ArrowDown className="ml-2 size-3.5" />
            )}
        </button>
    );
}
