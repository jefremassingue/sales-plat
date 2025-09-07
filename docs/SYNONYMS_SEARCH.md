# Sistema de Sinônimos para Busca de Produtos

Este documento explica como implementar e usar o sistema de sinônimos para melhorar a busca de produtos.

## Visão Geral

O sistema de sinônimos permite expandir os termos de busca incluindo palavras relacionadas, melhorando significativamente os resultados da pesquisa. Por exemplo, quando um usuário busca por "luva", o sistema também procura por "luvas", "gloves", "proteção das mãos", etc.

## Arquivos Implementados

### 1. Helper Principal
- **Arquivo**: `app/Helpers/SearchSynonyms.php`
- **Função**: Gerencia a expansão de termos e criação de queries

### 2. Configuração de Sinônimos
- **Arquivo**: `config/search_synonyms.php`
- **Função**: Armazena o mapeamento de termos e sinônimos

### 3. Modelo Product Atualizado
- **Arquivo**: `app/Models/Product.php`
- **Função**: Métodos de busca atualizados para usar sinônimos

### 4. Comandos Artisan
- `app/Console/Commands/ManageSynonyms.php` - Gerenciamento via CLI
- `app/Console/Commands/TestSynonymSearch.php` - Testes de funcionalidade

### 5. Controller Admin
- **Arquivo**: `app/Http/Controllers/Admin/SynonymController.php`
- **Função**: Interface web para gerenciar sinônimos

## Como Usar

### 1. Busca Básica com Sinônimos

```php
// Busca simples com sinônimos habilitados (padrão)
$products = Product::smartSearch('luva', true);

// Busca sem sinônimos
$products = Product::smartSearch('luva', true, false);

// Busca full-text com sinônimos
$products = Product::fullTextSearch('capacete azul', 'IN BOOLEAN MODE', true);
```

### 2. Gerenciamento via CLI

```bash
# Listar todos os sinônimos
php artisan synonyms:manage list

# Adicionar sinônimos
php artisan synonyms:manage add --term="martelo" --synonyms="hammer,marreta,malho"

# Remover sinônimos específicos
php artisan synonyms:manage remove --term="martelo" --synonyms="malho"

# Remover todos os sinônimos de um termo
php artisan synonyms:manage remove --term="martelo"

# Testar expansão de sinônimos
php artisan synonyms:manage test --search="luva azul"
```

### 3. Teste de Funcionalidade

```bash
# Testar busca com termo específico
php artisan test:synonyms "capacete"

# Este comando mostrará:
# - Expansão de sinônimos
# - Query boolean gerada
# - Resultados com e sem sinônimos
# - Comparação de quantidade de resultados
```

### 4. Gerenciamento Programático

```php
use App\Helpers\SearchSynonyms;

// Adicionar sinônimos dinamicamente
SearchSynonyms::addSynonyms('parafuso', ['screw', 'fixador', 'parafusos']);

// Expandir um termo
$expandedTerms = SearchSynonyms::expandTerm('luva');
// Retorna: ['luva', 'luvas', 'gloves', 'proteção das mãos', ...]

// Expandir uma frase
$expandedPhrase = SearchSynonyms::expandPhrase('luva azul');
// Retorna: "luva luvas gloves proteção das mãos azul blue"

// Criar query boolean para MySQL
$booleanQuery = SearchSynonyms::createBooleanQuery('capacete segurança');
// Retorna: "(+capacete* +capacetes* +headset*) (+segurança* +proteção* +safety*)"
```

## Configuração de Sinônimos

### Estrutura do Arquivo `config/search_synonyms.php`

```php
return [
    'capacete' => ['capacetes', 'headset', 'elmo', 'casco', 'proteção da cabeça'],
    'luva' => ['luvas', 'gloves', 'proteção das mãos'],
    'bota' => ['botas', 'sapato', 'calçado', 'boots'],
    // ... mais sinônimos
];
```

### Boas Práticas para Sinônimos

1. **Plurais e Singulares**: Sempre incluir variações
2. **Termos em Inglês**: Adicionar traduções quando relevante
3. **Variações de Escrita**: Incluir grafias alternativas
4. **Sinônimos Técnicos**: Incluir termos específicos da área
5. **Abreviações**: Incluir versões abreviadas e completas

## Interface Web (Admin)

### Rotas Disponíveis
- `GET /admin/synonyms` - Lista sinônimos
- `POST /admin/synonyms` - Adiciona sinônimos
- `PUT /admin/synonyms/{term}` - Atualiza sinônimos
- `DELETE /admin/synonyms/{term}` - Remove sinônimos
- `POST /admin/synonyms/test` - Testa expansão
- `GET /admin/synonyms/export` - Exporta configuração
- `POST /admin/synonyms/import` - Importa configuração

## Vantagens do Sistema

### 1. Melhoria na Taxa de Conversão
- Usuários encontram produtos mesmo com termos diferentes
- Reduz "zero resultados" em buscas

### 2. Flexibilidade Linguística
- Suporte a múltiplos idiomas
- Termos técnicos e populares

### 3. Facilidade de Manutenção
- Interface web para administradores
- Comandos CLI para desenvolvedores
- Arquivo de configuração centralizizado

### 4. Performance Otimizada
- Carregamento lazy dos sinônimos
- Cache automático da configuração
- Compatível com full-text search do MySQL

## Exemplos de Uso Prático

### Cenário 1: E-commerce
```php
// Usuário busca "chave inglesa"
// Sistema encontra produtos com:
// - "chave inglesa"
// - "chave ajustável"
// - "adjustable wrench"
// - "chave"

$products = Product::smartSearch('chave inglesa', true);
```

### Cenário 2: Busca Multilíngue
```php
// Usuário busca "safety glasses"
// Sistema encontra produtos com:
// - "óculos de segurança"
// - "proteção ocular"
// - "safety glasses"
// - "óculos"

$products = Product::smartSearch('safety glasses', true);
```

### Cenário 3: Termos Técnicos vs Populares
```php
// Usuário busca "capacete"
// Sistema encontra produtos com:
// - "capacete de segurança"
// - "EPI cabeça"
// - "headset"
// - "proteção craniana"

$products = Product::smartSearch('capacete', true);
```

## Monitoramento e Métricas

### Comandos de Análise
```bash
# Verificar sinônimos mais usados
php artisan synonyms:analytics

# Comparar performance com/sem sinônimos
php artisan synonyms:performance-test

# Sugerir novos sinônimos baseado em buscas
php artisan synonyms:suggest
```

### Métricas Importantes
- Taxa de clique em resultados
- Número de buscas com zero resultados
- Tempo de permanência em páginas de produto
- Conversões por termo de busca

## Futuras Melhorias

1. **Machine Learning**: Auto-sugestão de sinônimos baseado em comportamento
2. **Análise Semântica**: Uso de NLP para detectar relações entre palavras
3. **Sinônimos Contextuais**: Sinônimos diferentes por categoria de produto
4. **A/B Testing**: Testar diferentes conjuntos de sinônimos
5. **API Externa**: Integração com dicionários de sinônimos online
