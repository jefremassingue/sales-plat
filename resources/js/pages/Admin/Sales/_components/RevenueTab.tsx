import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sale } from '@/types/index.d';
import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Plus, Trash2, Save } from 'lucide-react'; // Ícone 'Save' adicionado
import { useToast } from '@/components/ui/use-toast';
import { router, useForm, usePage } from '@inertiajs/react';

// Extended Sale interface for revenue calculations
interface ExtendedSale extends Sale {
    commission_rate?: number;
    backup_rate?: number;
    total_cost?: number;
    commission_amount?: number;
    backup_amount?: number;
    expenses?: Array<{
        id: string;
        description: string;
        amount: number;
        created_at: string;
    }>;
    items: Array<Sale['items'][0] & {
        cost?: number;
    }>;
}

interface RevenueTabProps {
    sale: ExtendedSale;
    formatCurrency: (value: number | null | undefined, withSymbol?: boolean) => string;
}

export function RevenueTab({ sale, formatCurrency }: RevenueTabProps) {
    const { toast } = useToast();
    const { props } = usePage() as { props: { flash?: { success?: string; error?: string } } };

    // --- ESTADOS DA UI ---
    const [editingCosts, setEditingCosts] = useState<Record<string, boolean>>({});
    const [newCosts, setNewCosts] = useState<Record<string, string>>({});
    const [addingExpense, setAddingExpense] = useState(false);
    
    // Estado para controlar a edição da comissão e backup
    const [isEditingRates, setIsEditingRates] = useState(false);

    // --- FORMULÁRIOS INERTIA ---

    // Formulário para adicionar despesas
    const { data: expenseData, setData: setExpenseData, post: postExpense, processing: processingExpense, reset: resetExpenseForm } = useForm({
        description: '',
        amount: '',
    });

    // Formulário para editar as taxas de comissão e backup
    const { data: ratesData, setData: setRatesData, post: postRates, processing: processingRates, reset: resetRatesForm, errors: ratesErrors } = useForm({
        commission_rate: sale.commission_rate || 1.5,
        backup_rate: sale.backup_rate || 10,
    });

    // Efeito para exibir mensagens (flash messages)
    useEffect(() => {
        if (props.flash?.success) {
            toast({ title: 'Sucesso', description: props.flash.success, variant: 'success' });
        }
        if (props.flash?.error) {
            toast({ title: 'Erro', description: props.flash.error, variant: 'destructive' });
        }
    }, [props.flash, toast]);
    
    // Efeito para garantir que o formulário de taxas tenha sempre os dados mais recentes da venda
    useEffect(() => {
        setRatesData({
            commission_rate: sale.commission_rate || 1.5,
            backup_rate: sale.backup_rate || 10,
        });
    }, [sale, setRatesData]);

    // --- CÁLCULOS FINANCEIROS ---
    const netRevenue = (sale.total || 0) - (sale.tax_amount || 0);
    const grossProfit = netRevenue - (sale.total_cost || 0);
    const operationalDeductions = 
        (sale.commission_amount || 0) + 
        (sale.backup_amount || 0) + 
        (sale.expenses?.reduce((sum: number, expense: { amount: number }) => sum + expense.amount, 0) || 0);
    const netProfit = grossProfit - operationalDeductions;
    const totalDeductions = (sale.tax_amount || 0) + operationalDeductions;
    const grossProfitMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
    const netProfitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

    // --- HANDLERS DE AÇÕES ---
    const updateItemCost = (itemId: string, newCost: string) => {
        router.post(`/admin/sales/${sale.id}/items/${itemId}/update-cost`, {
            cost: parseFloat(newCost) || 0,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCosts(prev => ({ ...prev, [itemId]: false }));
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).join(' ');
                toast({
                    title: 'Erro de Validação',
                    description: errorMessage || 'Ocorreu um erro ao atualizar o custo.',
                    variant: 'destructive',
                });
            }
        });
    };

    const handleAddExpenseSubmit = (e: FormEvent) => {
        e.preventDefault();
        postExpense(`/admin/sales/${sale.id}/add-expense`, {
            preserveScroll: true,
            onSuccess: () => {
                resetExpenseForm();
                setAddingExpense(false);
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).join(' ');
                 toast({
                    title: 'Erro de Validação',
                    description: errorMessage || 'Ocorreu um erro ao adicionar a despesa.',
                    variant: 'destructive',
                });
            }
        });
    };

    const removeExpense = (expenseId: string) => {
        router.delete(`/admin/sales/${sale.id}/expenses/${expenseId}`, {
            preserveScroll: true,
        });
    };

    // Handler para atualizar as taxas de comissão e backup
    const handleUpdateRates = (e: FormEvent) => {
        e.preventDefault();
        // Rota do backend para onde os dados serão enviados
        postRates(`/admin/sales/${sale.id}/update-rates`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingRates(false); // Fecha o formulário ao salvar com sucesso
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).join(' ');
                toast({
                    title: 'Erro de Validação',
                    description: errorMessage || 'Ocorreu um erro ao atualizar as taxas.',
                    variant: 'destructive',
                });
            }
        });
    };
    
    // Handler para cancelar a edição das taxas
    const cancelRateEdit = () => {
        resetRatesForm(); // Reseta o formulário para os valores iniciais
        setIsEditingRates(false);
    };

    return (
        <div className="space-y-6 pt-6">
            {/* Cards de Resumo Financeiro */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Receita Total (Fatura)</div>
                        <div className="text-2xl font-bold text-primary">{formatCurrency(sale.total)}</div>
                        <div className="text-xs text-muted-foreground mt-1">Valor faturado ao cliente</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-500/5 border-slate-500/20">
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Receita Líquida (Base)</div>
                        <div className="text-2xl font-bold text-slate-600">{formatCurrency(netRevenue)}</div>
                        <div className="text-xs text-muted-foreground mt-1">Receita s/ IVA para cálculo</div>
                    </CardContent>
                </Card>
                <Card className="bg-orange-500/5 border-orange-500/20">
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Custo dos Produtos</div>
                        <div className="text-2xl font-bold text-orange-500">{formatCurrency(sale.total_cost)}</div>
                        <div className="text-xs text-muted-foreground mt-1">Custo de aquisição (COGS)</div>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/5 border-green-500/20">
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Lucro Bruto</div>
                        <div className="text-2xl font-bold text-green-500">{formatCurrency(grossProfit)}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Margem Bruta: {(grossProfitMargin || 0).toFixed(1)}%
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-cyan-500/5 border-cyan-500/20">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                           <div>
                                <div className="text-sm text-muted-foreground">Comissão Vendedores</div>
                                <div className="text-2xl font-bold text-cyan-600">{formatCurrency(sale.commission_amount)}</div>
                           </div>
                            {/* <Button size="icon" variant="ghost" onClick={() => setIsEditingRates(true)} className="h-7 w-7 flex-shrink-0">
                                <Pencil className="h-4 w-4" />
                            </Button> */}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Comissão sobre a venda ({sale.commission_rate || 1.5}%)
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-indigo-500/5 border-indigo-500/20">
                    <CardContent className="p-4">
                         <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-muted-foreground">Reserva Empresa</div>
                                <div className="text-2xl font-bold text-indigo-500">{formatCurrency(sale.backup_amount)}</div>
                            </div>
                            {/* <Button size="icon" variant="ghost" onClick={() => setIsEditingRates(true)} className="h-7 w-7 flex-shrink-0">
                                <Pencil className="h-4 w-4" />
                            </Button> */}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Valor retido na empresa ({sale.backup_rate || 10}%)
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/20">
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Deduções Totais</div>
                        <div className="text-2xl font-bold text-blue-500">{formatCurrency(totalDeductions)}</div>
                         <div className="text-xs text-muted-foreground mt-1">IVA + Despesas Oper.</div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-500/5 border-purple-500/20">
                    <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Lucro Líquido (Empresa)</div>
                        <div className="text-2xl font-bold text-purple-500">{formatCurrency(netProfit)}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Margem Líquida: {(netProfitMargin || 0).toFixed(1)}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Produtos com Custo Editável */}
            <Card>
                <CardHeader>
                    <CardTitle>Produtos e Custos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        {sale.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {item.quantity} x {formatCurrency(item.unit_price)} = {formatCurrency(item.total)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Custo Unitário</div>
                                        {editingCosts[item.id] ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    defaultValue={item.cost || 0}
                                                    onChange={(e) => setNewCosts(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                    className="w-24 h-8 text-sm"
                                                />
                                                <Button size="sm" onClick={() => updateItemCost(item.id, newCosts[item.id] || String(item.cost))} className="h-8">Salvar</Button>
                                                <Button size="sm" variant="outline" onClick={() => setEditingCosts(prev => ({ ...prev, [item.id]: false }))} className="h-8">Cancelar</Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{formatCurrency(item.cost)}</span>
                                                <Button size="icon" variant="ghost" onClick={() => setEditingCosts(prev => ({ ...prev, [item.id]: true }))} className="h-6 w-6 p-0">
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Custo Total</div>
                                        <div className="font-medium">{formatCurrency((item.cost || 0) * item.quantity)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4">
                        <div className="flex justify-between font-medium">
                            <span>Custo Total dos Produtos:</span>
                            <span>{formatCurrency(sale.total_cost)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Deduções Operacionais com Edição */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Deduções Operacionais e Despesas</CardTitle>
                        {!isEditingRates && (
                             <Button variant="outline" size="sm" onClick={() => setIsEditingRates(true)}>
                                <Pencil className="h-3 w-3 mr-2" />
                                Editar Taxas
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isEditingRates ? (
                        <form onSubmit={handleUpdateRates} className="p-4 bg-card rounded-lg space-y-4 border border-dashed">
                           <h4 className="font-medium text-center">Editando Taxas</h4>
                           <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                               <div className="space-y-1">
                                    <label htmlFor="commission_rate" className="text-sm font-medium text-muted-foreground">Taxa de Comissão (%)</label>
                                    <Input
                                        id="commission_rate"
                                        type="number"
                                        step="0.01"
                                        value={ratesData.commission_rate}
                                        onChange={(e) => setRatesData('commission_rate', parseFloat(e.target.value) || 0)}
                                        className="w-full"
                                    />
                                    {ratesErrors.commission_rate && <p className="text-xs text-destructive">{ratesErrors.commission_rate}</p>}
                               </div>
                               <div className="space-y-1">
                                    <label htmlFor="backup_rate" className="text-sm font-medium text-muted-foreground">Taxa de Reserva (%)</label>
                                    <Input
                                        id="backup_rate"
                                        type="number"
                                        step="0.01"
                                        value={ratesData.backup_rate}
                                        onChange={(e) => setRatesData('backup_rate', parseFloat(e.target.value) || 0)}
                                        className="w-full"
                                    />
                                    {ratesErrors.backup_rate && <p className="text-xs text-destructive">{ratesErrors.backup_rate}</p>}
                               </div>
                           </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button size="sm" type="button" variant="outline" onClick={cancelRateEdit}>Cancelar</Button>
                                <Button size="sm" type="submit" disabled={processingRates}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processingRates ? 'Salvando...' : 'Salvar Taxas'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Comissão ({sale.commission_rate || 1.5}%):</span>
                                <span className="font-medium text-destructive">-{formatCurrency(sale.commission_amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Reserva Empresa ({sale.backup_rate || 10}%):</span>
                                <span className="font-medium text-destructive">-{formatCurrency(sale.backup_amount)}</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Despesas Adicionais</h4>
                            <Button size="sm" variant="outline" onClick={() => setAddingExpense(!addingExpense)}>
                                <Plus className="h-4 w-4 mr-1" />
                                Adicionar
                            </Button>
                        </div>
                        {addingExpense && (
                            <form onSubmit={handleAddExpenseSubmit} className="flex gap-2 mb-3 p-3 border rounded flex-end">
                                <Input placeholder="Descrição" value={expenseData.description} onChange={(e) => setExpenseData('description', e.target.value)} className="flex-1"/>
                                <Input type="number" step="0.01" placeholder="Valor" value={expenseData.amount} onChange={(e) => setExpenseData('amount', e.target.value)} className="w-28"/>
                                <Button size="sm" type="submit" disabled={processingExpense}>{processingExpense ? '...' : 'Salvar'}</Button>
                                <Button size="sm" variant="ghost" type="button" onClick={() => setAddingExpense(false)}>Cancelar</Button>
                            </form>
                        )}
                        {sale.expenses && sale.expenses.length > 0 ? (
                            <div className="space-y-2">
                                {sale.expenses.map((expense) => (
                                    <div key={expense.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                        <div>
                                            <div className="font-medium">{expense.description}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(expense.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-destructive">-{formatCurrency(expense.amount)}</span>
                                            <Button size="icon" variant="ghost" onClick={() => removeExpense(expense.id)} className="h-7 w-7 text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-medium">
                                        <span>Total de Despesas Adicionais:</span>
                                        <span className="text-destructive">-{formatCurrency(sale.expenses.reduce((sum, expense) => sum + expense.amount, 0))}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground py-2">Nenhuma despesa adicional registrada.</p>
                        )}
                    </div>
                    <div className="border-t pt-4">
                        <div className="flex justify-between font-medium text-lg">
                            <span>Total Deduções Operacionais:</span>
                            <span className="text-destructive">-{formatCurrency(operationalDeductions)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detalhamento da Fatura */}
            <Card>
                <CardHeader><CardTitle>Detalhamento da Fatura</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span>{formatCurrency(sale.subtotal)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Descontos:</span><span className="text-destructive">-{formatCurrency(sale.discount_amount)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Impostos (IVA):</span><span>+{formatCurrency(sale.tax_amount)}</span></div>
                        {sale.shipping_amount > 0 && (<div className="flex justify-between"><span className="text-muted-foreground">Frete:</span><span>{formatCurrency(sale.shipping_amount)}</span></div>)}
                        <div className="border-t pt-2"><div className="flex justify-between font-medium"><span>Total da Fatura:</span><span>{formatCurrency(sale.total)}</span></div></div>
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-medium">Pagamentos Recebidos</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Valor Pago:</span><span className="text-emerald-600 font-semibold">{formatCurrency(parseFloat(sale.amount_paid) || 0)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Valor Pendente:</span><span className={sale.amount_due > 0 ? 'text-destructive font-semibold' : 'text-emerald-600 font-semibold'}>{formatCurrency(sale.amount_due)}</span></div>
                            <div className="border-t pt-2"><div className="flex justify-between font-medium"><span>Percentual Recebido:</span><span>{sale.total > 0 ? (((parseFloat(sale.amount_paid) || 0) / (Number(sale.total) || 1)) * 100).toFixed(1) : '0'}%</span></div></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}