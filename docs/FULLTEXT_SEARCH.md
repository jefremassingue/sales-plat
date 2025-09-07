# Full-Text Search para Produtos

## Visão Geral

Este projeto agora inclui funcionalidade de busca full-text para produtos usando MySQL FULLTEXT indexes. Esta implementação oferece busca mais inteligente e relevante em comparação com queries LIKE tradicionais.

## Recursos Implementados

### 1. Índices FULLTEXT
- **Índices individuais**: Para cada campo (name, description, technical_details, features, sku)
- **Índice combinado**: Para busca geral em todos os campos simultaneamente

### 2. Métodos do Modelo Product

#### `fullTextSearch($search, $mode = 'IN BOOLEAN MODE')`
Executa busca full-text usando MySQL MATCH AGAINST.

```php
// Busca básica
$products = Product::fullTextSearch('luva segurança')->get();

// Busca com modo específico
$products = Product::fullTextSearch('equipamento', 'IN NATURAL LANGUAGE MODE')->get();
```

#### `searchForEcommerce($search)`
Busca otimizada para produtos ativos com inventário para e-commerce.

```php
// Busca inteligente para produtos disponíveis no e-commerce
$products = Product::searchForEcommerce('termo de busca')->get();
```

#### `smartSearch($search)`
Busca combinada que tenta full-text primeiro e cai para LIKE se não encontrar resultados.

```php
$products = Product::smartSearch('termo de busca')->get();
```

#### Scope `fullTextSearchActive($search)`
Busca full-text apenas em produtos ativos.

```php
$products = Product::where('active', true)
    ->fullTextSearchActive('termo')
    ->get();
```

### 3. Controller Atualizado

O `ProductController` foi atualizado para usar busca full-text automaticamente:

- **Termos ≥ 3 caracteres**: Usa busca full-text com relevância
- **Termos < 3 caracteres**: Usa busca LIKE tradicional
- **Ordenação por relevância**: Quando há busca full-text, a relevância é preservada

## Vantagens da Busca Full-Text

### 1. Performance
- Índices otimizados para busca textual
- Melhor performance em grandes volumes de dados

### 2. Relevância
- Resultados ordenados por relevância automática
- Suporte a operadores booleanos (+palavra -palavra)

### 3. Flexibilidade
- Busca em múltiplos campos simultaneamente
- Suporte a palavras parciais com wildcards

## Exemplos de Uso

### Busca Simples
```php
// URL: /products?search=luva
// Encontra produtos que contenham "luva" em qualquer campo indexado
```

### Busca com Múltiplas Palavras
```php
// URL: /products?search=segurança proteção
// Encontra produtos que contenham ambas as palavras
```

### Busca com Operadores
```php
// Busca avançada no código
$products = Product::fullTextSearch('+segurança -descartável')->get();
// Deve conter "segurança" mas não "descartável"
```

## Modo de Funcionamento

### 1. Request com Search
Quando uma requisição inclui `?search=termo`:

1. **Termo ≥ 3 chars**: Usa MATCH AGAINST com BOOLEAN MODE
2. **Termo < 3 chars**: Usa LIKE tradicional
3. **Sem ordenação específica**: Preserva relevância full-text
4. **Com ordenação**: Aplica ordenação solicitada

### 2. Fallback Automático
Se a busca full-text não retornar resultados, o sistema pode fazer fallback para LIKE.

## Comandos Úteis

### Testar Busca Full-Text
```bash
php artisan test:fulltext-search "termo de busca"
```

### Verificar Índices
```sql
SHOW INDEX FROM products WHERE Key_name LIKE '%fulltext%';
```

## Configuração do MySQL

Para melhor performance, verifique estas configurações do MySQL:

```sql
-- Tamanho mínimo de palavra para indexação (padrão: 4)
SHOW VARIABLES LIKE 'ft_min_word_len';

-- Palavras que são ignoradas na indexação
SHOW VARIABLES LIKE 'ft_stopword_file';
```

## Limitações

1. **MySQL específico**: Funciona apenas com MySQL/MariaDB
2. **Tamanho mínimo**: Palavras muito curtas podem ser ignoradas
3. **Stopwords**: Palavras comuns (a, de, para) são ignoradas
4. **Caracteres especiais**: Alguns caracteres são tratados especialmente

## Troubleshooting

### Busca não retorna resultados esperados
1. Verifique se os índices foram criados corretamente
2. Confirme que as palavras têm tamanho suficiente
3. Teste com o comando `test:fulltext-search`

### Performance lenta
1. Verifique se os índices FULLTEXT estão sendo usados
2. Use EXPLAIN para analisar queries
3. Considere ajustar configurações do MySQL

## Manutenção

### Recriar Índices
Se necessário recriar os índices:

```bash
php artisan migrate:rollback --step=1
php artisan migrate
```

### Monitoramento
Use logs do MySQL e ferramentas de profiling para monitorar performance das queries full-text.
