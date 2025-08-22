import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';

interface Brand {
    id: number;
    name: string;
    logo_url?: string;
}

interface BrandSelectProps {
    value: string | null;
    onChange: (value: string) => void;
    brands: Brand[];
    error?: string;
}

export default function BrandSelect({ value, onChange, brands, error }: BrandSelectProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor="brand_id" className="required">Marca *</Label>
            <Select value={value ?? ''} onValueChange={onChange}>
                <SelectTrigger className={error ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione uma marca" />
                </SelectTrigger>
                <SelectContent>
                    {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()} className="flex items-center gap-2">
                            <Avatar className="h-5 w-5 mr-2">
                                {brand.logo_url ? (
                                    <AvatarImage src={brand.logo_url} alt={brand.name} />
                                ) : (
                                    <AvatarFallback>{brand.name[0]}</AvatarFallback>
                                )}
                            </Avatar>
                            {brand.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
    );
}
