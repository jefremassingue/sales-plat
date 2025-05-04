import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';

interface NotesTabProps {
  control: Control<any>;
}

export default function NotesTab({ control }: NotesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas e Termos</CardTitle>
        <CardDescription>
          Informações adicionais para a cotação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notas adicionais para o cliente"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Informações extras, especificações ou mensagens para o cliente
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Termos e Condições</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Termos e condições da cotação"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Termos legais, condições de pagamento, prazo de entrega, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
