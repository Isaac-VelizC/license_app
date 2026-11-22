import { Head, Link } from '@inertiajs/react';

export default function NotFound() {
    return (
        <>
            <Head title="Página no encontrada" />

            <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
                <h1 className="text-7xl font-bold">404</h1>

                <h2 className="text-2xl font-semibold">Página no encontrada</h2>

                <p className="max-w-md text-muted-foreground">
                    La página que buscas no existe o ha sido movida.
                </p>

                <Link
                    href="/"
                    className="rounded-lg bg-primary px-5 py-3 text-primary-foreground"
                >
                    Volver al inicio
                </Link>
            </main>
        </>
    );
}
