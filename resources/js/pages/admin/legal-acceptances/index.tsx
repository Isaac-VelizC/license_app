import { Head, router } from '@inertiajs/react';

import Heading from '@/components/heading';

import { dashboard } from '@/routes/admin';
import { index } from '@/routes/admin/legal-acceptances';

import { LEGAL_DOCUMENT_TYPES } from '@/types/admin/legal-document.contract';
import {
    LegalAcceptanceEntity,
    PaginatedData,
    LegalDocumentApp,
    LegalAcceptanceFilters,
} from '@/types';
import { type Column, DataTable } from '@/components/datatable';
import LegalAcceptancesFilters from './components/legal-acceptances-filters';

interface Props {
    acceptances: PaginatedData<LegalAcceptanceEntity>;
    apps: LegalDocumentApp[];
    filters: LegalAcceptanceFilters;
}

export default function Index({ acceptances, apps, filters }: Props) {
    const columns: Column<LegalAcceptanceEntity>[] = [
        {
            id: 'document',
            header: 'Documento',
            cell: (item) => (
                <div>
                    <p className="font-medium">{item.legal_document.title}</p>
                    <p className="text-xs text-muted-foreground">
                        {LEGAL_DOCUMENT_TYPES[item.legal_document.type]}
                    </p>
                </div>
            ),
        },
        {
            id: 'app',
            header: 'Aplicación',
            cell: (item) => item.legal_document.app.name,
        },
        {
            id: 'version',
            header: 'Versión',
            cell: (item) => (
                <span className="font-mono text-sm">
                    {item.legal_document.version}
                </span>
            ),
        },
        {
            id: 'hwid',
            header: 'Dispositivo',
            cell: (item) => (
                <span className="font-mono text-xs" title={item.hwid}>
                    {item.hwid.length > 12
                        ? `${item.hwid.slice(0, 8)}…${item.hwid.slice(-4)}`
                        : item.hwid}
                </span>
            ),
        },
        {
            id: 'accepted_at',
            header: 'Aceptado el',
            cell: (item) =>
                new Intl.DateTimeFormat('es-BO', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                }).format(new Date(item.accepted_at)),
        },
    ];

    return (
        <>
            <Head title="Aceptaciones legales" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-6">
                <Heading
                    title="Aceptaciones legales"
                    description="Historial de documentos legales aceptados por los dispositivos."
                />

                <LegalAcceptancesFilters apps={apps} filters={filters} />

                <DataTable
                    data={acceptances.data}
                    columns={columns}
                    rowKey={(data) => data.id}
                />

                {acceptances.last_page > 1 && (
                    <div className="flex justify-end gap-2">
                        {acceptances.links.map((link, index) => (
                            <button
                                key={index}
                                type="button"
                                disabled={!link.url || link.active}
                                onClick={() => {
                                    if (link.url) {
                                        router.visit(link.url, {
                                            preserveScroll: true,
                                        });
                                    }
                                }}
                                className={
                                    'rounded-md border px-3 py-1.5 text-sm ' +
                                    (link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted')
                                }
                            >
                                {link.label
                                    .replace('&laquo;', '«')
                                    .replace('&raquo;', '»')}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Panel Central', href: dashboard() },
        { title: 'Aceptaciones legales', href: index().url },
    ],
};
