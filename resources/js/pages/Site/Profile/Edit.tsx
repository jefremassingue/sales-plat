import React from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import SiteLayout from '@/layouts/site-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, User, Building, MapPin, Phone } from 'lucide-react'

interface Customer {
    id: string
    name: string
    email: string
    phone?: string
    mobile?: string
    company_name?: string
    tax_id?: string
    address?: string
    city?: string
    province?: string
    postal_code?: string
    country?: string
    birth_date?: string
    contact_person?: string
    billing_address?: string
    shipping_address?: string
    website?: string
    client_type: 'individual' | 'company'
    notes?: string
    active: boolean
}

interface Props {
    customer: Customer
}

export default function EditProfile({ customer }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        mobile: customer.mobile || '',
        company_name: customer.company_name || '',
        tax_id: customer.tax_id || '',
        address: customer.address || '',
        city: customer.city || '',
        province: customer.province || '',
        postal_code: customer.postal_code || '',
        country: customer.country || '',
        birth_date: customer.birth_date || '',
        contact_person: customer.contact_person || '',
        billing_address: customer.billing_address || '',
        shipping_address: customer.shipping_address || '',
        website: customer.website || '',
        client_type: customer.client_type || 'individual',
        notes: customer.notes || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(route('profile.update'))
    }

    return (
        <SiteLayout>
            <Head title="Editar Perfil" />
            
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/profile">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
                        <p className="text-gray-600 mt-2">Atualize suas informações pessoais</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Informações Básicas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Informações Básicas
                            </CardTitle>
                            <CardDescription>
                                Dados principais do seu perfil
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome Completo *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="client_type">Tipo de Cliente *</Label>
                                    <Select 
                                        value={data.client_type} 
                                        onValueChange={(value) => setData('client_type', value as 'individual' | 'company')}
                                    >
                                        <SelectTrigger className={errors.client_type ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="individual">Pessoa Física</SelectItem>
                                            <SelectItem value="company">Empresa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.client_type && (
                                        <p className="text-sm text-red-600">{errors.client_type}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                        className={errors.birth_date ? 'border-red-500' : ''}
                                    />
                                    {errors.birth_date && (
                                        <p className="text-sm text-red-600">{errors.birth_date}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informações da Empresa (se aplicável) */}
                    {data.client_type === 'company' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Informações da Empresa
                                </CardTitle>
                                <CardDescription>
                                    Dados específicos da empresa
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="company_name">Nome da Empresa</Label>
                                        <Input
                                            id="company_name"
                                            type="text"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            className={errors.company_name ? 'border-red-500' : ''}
                                        />
                                        {errors.company_name && (
                                            <p className="text-sm text-red-600">{errors.company_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tax_id">CNPJ/NIF</Label>
                                        <Input
                                            id="tax_id"
                                            type="text"
                                            value={data.tax_id}
                                            onChange={(e) => setData('tax_id', e.target.value)}
                                            className={errors.tax_id ? 'border-red-500' : ''}
                                        />
                                        {errors.tax_id && (
                                            <p className="text-sm text-red-600">{errors.tax_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_person">Pessoa de Contato</Label>
                                        <Input
                                            id="contact_person"
                                            type="text"
                                            value={data.contact_person}
                                            onChange={(e) => setData('contact_person', e.target.value)}
                                            className={errors.contact_person ? 'border-red-500' : ''}
                                        />
                                        {errors.contact_person && (
                                            <p className="text-sm text-red-600">{errors.contact_person}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            type="url"
                                            value={data.website}
                                            onChange={(e) => setData('website', e.target.value)}
                                            className={errors.website ? 'border-red-500' : ''}
                                            placeholder="https://example.com"
                                        />
                                        {errors.website && (
                                            <p className="text-sm text-red-600">{errors.website}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Contato */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="w-5 h-5" />
                                Contato
                            </CardTitle>
                            <CardDescription>
                                Informações de contato
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className={errors.phone ? 'border-red-500' : ''}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Celular</Label>
                                    <Input
                                        id="mobile"
                                        type="tel"
                                        value={data.mobile}
                                        onChange={(e) => setData('mobile', e.target.value)}
                                        className={errors.mobile ? 'border-red-500' : ''}
                                    />
                                    {errors.mobile && (
                                        <p className="text-sm text-red-600">{errors.mobile}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Endereço */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Endereço
                            </CardTitle>
                            <CardDescription>
                                Informações de endereço
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Endereço</Label>
                                <Input
                                    id="address"
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className={errors.address ? 'border-red-500' : ''}
                                    placeholder="Rua, número, bairro"
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-600">{errors.address}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Cidade</Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className={errors.city ? 'border-red-500' : ''}
                                    />
                                    {errors.city && (
                                        <p className="text-sm text-red-600">{errors.city}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="province">Província/Estado</Label>
                                    <Input
                                        id="province"
                                        type="text"
                                        value={data.province}
                                        onChange={(e) => setData('province', e.target.value)}
                                        className={errors.province ? 'border-red-500' : ''}
                                    />
                                    {errors.province && (
                                        <p className="text-sm text-red-600">{errors.province}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Código Postal</Label>
                                    <Input
                                        id="postal_code"
                                        type="text"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        className={errors.postal_code ? 'border-red-500' : ''}
                                    />
                                    {errors.postal_code && (
                                        <p className="text-sm text-red-600">{errors.postal_code}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">País</Label>
                                <Input
                                    id="country"
                                    type="text"
                                    value={data.country}
                                    onChange={(e) => setData('country', e.target.value)}
                                    className={errors.country ? 'border-red-500' : ''}
                                    placeholder="Moçambique"
                                />
                                {errors.country && (
                                    <p className="text-sm text-red-600">{errors.country}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Endereços Específicos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Endereços Específicos</CardTitle>
                            <CardDescription>
                                Endereços para faturação e entrega (opcional)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="billing_address">Endereço de Faturação</Label>
                                <Textarea
                                    id="billing_address"
                                    value={data.billing_address}
                                    onChange={(e) => setData('billing_address', e.target.value)}
                                    className={errors.billing_address ? 'border-red-500' : ''}
                                    rows={3}
                                />
                                {errors.billing_address && (
                                    <p className="text-sm text-red-600">{errors.billing_address}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shipping_address">Endereço de Entrega</Label>
                                <Textarea
                                    id="shipping_address"
                                    value={data.shipping_address}
                                    onChange={(e) => setData('shipping_address', e.target.value)}
                                    className={errors.shipping_address ? 'border-red-500' : ''}
                                    rows={3}
                                />
                                {errors.shipping_address && (
                                    <p className="text-sm text-red-600">{errors.shipping_address}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Observações */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Observações</CardTitle>
                            <CardDescription>
                                Informações adicionais sobre o perfil
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Observações</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className={errors.notes ? 'border-red-500' : ''}
                                    rows={4}
                                    placeholder="Informações adicionais..."
                                />
                                {errors.notes && (
                                    <p className="text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botões de Ação */}
                    <div className="flex justify-end gap-4">
                        <Link href="/profile">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </div>
        </SiteLayout>
    )
}
