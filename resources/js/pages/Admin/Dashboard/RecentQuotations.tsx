import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quotation } from '@/types';
import { Link } from '@inertiajs/react';

interface RecentQuotationsProps {
    quotations: Quotation[];
}

export default function RecentQuotations({ quotations }: RecentQuotationsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Cotações Recentes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
                {quotations.map((quotation) => (
                    <div key={quotation.id} className="flex items-center gap-4">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage src={`/avatars/${quotation.id}.png`} alt="Avatar" />
                            <AvatarFallback>Q</AvatarFallback>
                        </Avatar>
                        <Link href={route('admin.quotations.show', quotation.id)} className="grid gap-1">
                            <p className="text-sm font-medium leading-none">{quotation.quotation_number }</p>
                            <p className="text-sm font-medium leading-none">{quotation.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{quotation.status}</p>
                        </Link>
                        <div className="ml-auto font-medium">{quotation.total_amount}</div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
