import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    href: string;
    color: string;
}

export default function StatCard({ title, value, icon: Icon, href, color }: StatCardProps) {
    return (
        <Link href={href}>
            <Card className={cn('border-l-4', `border-${color}-500`)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold">{title}</CardTitle>
                    <Icon className={cn('h-8 w-8 text-muted-foreground', `text-${color}-500`)} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                </CardContent>
            </Card>
        </Link>
    );
}
