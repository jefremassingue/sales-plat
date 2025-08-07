import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    href: string;
}

export default function StatCard({ title, value, icon: Icon, href }: StatCardProps) {
    return (
        <Link href={href}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                </CardContent>
            </Card>
        </Link>
    );
}
