import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Mail, User, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface User {
    id: string;
    name: string;
    email: string;
}

interface ExistingCustomer {
    id: string;
    name: string;
    email: string;
    user_name: string;
    created_at: string;
}

interface Props {
    user: User;
    existingCustomer: ExistingCustomer | null;
}

export default function CustomerVerification({ existingCustomer }: Props) {
    const [selectedOption, setSelectedOption] = useState<'verify' | 'new-email' | null>(null);

    const verificationForm = useForm();
    const newEmailForm = useForm({
        new_email: '',
    });

    const handleVerificationRequest = (e: React.FormEvent) => {
        e.preventDefault();
        verificationForm.post(route('customer.verification.request'));
    };

    const handleNewEmail = (e: React.FormEvent) => {
        e.preventDefault();
        newEmailForm.post(route('customer.verification.new-email'));
    };

    return (
        <SiteLayout>
            <Head title="Verificação de Customer" />
            
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <AlertTriangle className="mx-auto h-12 w-12 text-amber-600 mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Verificação de Customer Necessária
                        </h1>
                        <p className="text-lg text-gray-600">
                            Encontramos um conflito com seu email. Escolha uma das opções abaixo para continuar.
                        </p>
                    </div>

                    {/* Informações do conflito */}
                    {existingCustomer && (
                        <Card className="mb-8 border-amber-200 bg-amber-50">
                            <CardHeader>
                                <CardTitle className="flex items-center text-amber-800">
                                    <AlertTriangle className="h-5 w-5 mr-2" />
                                    Customer Existente Encontrado
                                </CardTitle>
                                <CardDescription className="text-amber-700">
                                    Já existe um customer com o email <strong>{existingCustomer.email}</strong> 
                                    associado a outro usuário.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center text-sm text-amber-700">
                                    <User className="h-4 w-4 mr-2" />
                                    <span><strong>Nome:</strong> {existingCustomer.name}</span>
                                </div>
                                <div className="flex items-center text-sm text-amber-700">
                                    <User className="h-4 w-4 mr-2" />
                                    <span><strong>Usuário associado:</strong> {existingCustomer.user_name}</span>
                                </div>
                                <div className="flex items-center text-sm text-amber-700">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span><strong>Criado em:</strong> {format(new Date(existingCustomer.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Opções de resolução */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Opção 1: Solicitar Verificação */}
                        <Card className={`cursor-pointer transition-all ${selectedOption === 'verify' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
                              onClick={() => setSelectedOption('verify')}>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Mail className="h-5 w-5 mr-2 text-blue-600" />
                                    Solicitar Verificação
                                </CardTitle>
                                <CardDescription>
                                    Solicite que o administrador verifique se você é o proprietário deste customer.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Um email será enviado para o administrador para verificar sua identidade e resolver o conflito.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                            {selectedOption === 'verify' && (
                                <CardFooter>
                                    <form onSubmit={handleVerificationRequest} className="w-full">
                                        <Button 
                                            type="submit" 
                                            className="w-full"
                                            disabled={verificationForm.processing}
                                        >
                                            {verificationForm.processing ? 'Enviando...' : 'Solicitar Verificação'}
                                        </Button>
                                    </form>
                                </CardFooter>
                            )}
                        </Card>

                        {/* Opção 2: Usar Email Diferente */}
                        <Card className={`cursor-pointer transition-all ${selectedOption === 'new-email' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'}`}
                              onClick={() => setSelectedOption('new-email')}>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Mail className="h-5 w-5 mr-2 text-green-600" />
                                    Usar Email Diferente
                                </CardTitle>
                                <CardDescription>
                                    Atualize seu email para um endereço diferente e crie um novo perfil de customer.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Seu email será atualizado e um novo perfil de customer será criado imediatamente.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                            {selectedOption === 'new-email' && (
                                <CardFooter>
                                    <form onSubmit={handleNewEmail} className="w-full space-y-4">
                                        <div>
                                            <Label htmlFor="new_email">Novo Email</Label>
                                            <Input
                                                id="new_email"
                                                type="email"
                                                value={newEmailForm.data.new_email}
                                                onChange={(e) => newEmailForm.setData('new_email', e.target.value)}
                                                placeholder="seu-novo-email@exemplo.com"
                                                required
                                            />
                                            {newEmailForm.errors.new_email && (
                                                <p className="text-sm text-red-600 mt-1">{newEmailForm.errors.new_email}</p>
                                            )}
                                        </div>
                                        <Button 
                                            type="submit" 
                                            className="w-full"
                                            disabled={newEmailForm.processing}
                                        >
                                            {newEmailForm.processing ? 'Atualizando...' : 'Atualizar Email e Continuar'}
                                        </Button>
                                    </form>
                                </CardFooter>
                            )}
                        </Card>
                    </div>

                    {/* Informações adicionais */}
                    <Card className="mt-8 border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="text-blue-800">Precisa de Ajuda?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-blue-700 mb-4">
                                Se você acredita que este customer deveria estar associado à sua conta, 
                                recomendamos escolher a opção "Solicitar Verificação".
                            </p>
                            <p className="text-blue-700">
                                Se você prefere usar um email diferente, escolha "Usar Email Diferente" 
                                e você poderá acessar seu perfil imediatamente.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SiteLayout>
    );
}
