import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sale } from '@/types';

interface RecentSalesProps {
    sales: Sale[];
}

export default function RecentSales({ sales }: RecentSalesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
                {sales.map((sale) => (
                    <div key={sale.id} className="flex items-center gap-4">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage src={`/avatars/${sale.id}.png`} alt="Avatar" />
                            <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">{sale.customer.name}</p>
                            <p className="text-sm text-muted-foreground">{sale.status}</p>
                        </div>
                        <div className="ml-auto font-medium">{sale.total_amount}</div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
