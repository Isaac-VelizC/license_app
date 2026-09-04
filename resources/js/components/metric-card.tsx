import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type MetricCardProps = {
    label: string;
    value: number;
    description: string;
    icon: LucideIcon;
    iconClassName?: string;
    valueClassName?: string;
};

const MetricCard = ({
    label,
    value,
    description,
    icon: Icon,
    iconClassName,
    valueClassName,
}: MetricCardProps) => {
    return (
        <div className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                    {label}
                </span>

                <Icon className={cn('size-4 text-primary', iconClassName)} />
            </div>

            <p className={cn('mt-4 text-3xl font-bold', valueClassName)}>
                {value}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
    );
};

export default MetricCard;
