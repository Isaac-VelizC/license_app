import { ArrowLeft } from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import LegalDocumentForm from './components/legal-document-form';
import type { LegalDocumentApp } from '@/types/admin/legal-document.contract';
import Heading from '@/components/heading';
import { index } from '@/routes/admin/legal-documents';
import { dashboard } from '@/routes/admin';

interface Props {
    apps: LegalDocumentApp[];
}

export default function Create({ apps }: Props) {
    return (
        <>
            <Head title="Nuevo documento legal" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="border-b pb-4">
                    <Link
                        href={index().url}
                        className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 size-4" />
                        Volver a documentos legales
                    </Link>
                    <Heading
                        title="Nuevo documento legal"
                        description="Crea una nueva versión de los términos y condiciones, política de privacidad o acuerdo de licencia."
                    />
                </div>

                <LegalDocumentForm apps={apps} storeUrl={index().url} />
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Panel Central', href: dashboard() },
        { title: 'Documentos Legales', href: index().url },
        { title: 'Formulario', href: '#' },
    ],
};
