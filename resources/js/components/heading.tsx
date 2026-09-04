import type { ReactNode } from 'react';

interface HeadingProps {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
    actions?: ReactNode;
}

export default function Heading({
    title,
    description,
    variant = 'default',
    actions,
}: HeadingProps) {
    const isSmall = variant === 'small';

    return (
        <header className={`flex flex-col gap-4 ${isSmall ? '' : 'mb-8'} md:flex-row md:items-center md:justify-between`}>
            <div className="min-w-0">
                <h2 className={isSmall ? 'text-base font-medium' : 'text-xl font-semibold tracking-tight'}>
                    {title}
                </h2>

                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            {actions && (
                <div className="flex flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </header>
    );
}
