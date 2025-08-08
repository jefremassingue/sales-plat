import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sale } from '@/types';
import { Link } from '@inertiajs/react';

interface RecentSalesProps {
    sales: Sale[];
}

export default function RecentSales({ sales }: RecentSalesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Vendas Recentes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
                {sales.map((sale) => (
                    <div key={sale.id} className="flex items-center gap-4">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage src={`/avatars/${sale.id}.png`} alt="Avatar" />
                            <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                        <Link href={route('admin.sales.show', sale.id)} className="grid gap-1">
                            <p className="text-sm leading-none font-medium">{sale.sale_number}</p>
                            <p className="text-sm leading-none font-medium">{sale.customer?.name}</p>
                            <p className="text-muted-foreground text-sm">{sale.status}</p>
                        </Link>
                        <div className="ml-auto font-medium">{sale.total_amount}</div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
