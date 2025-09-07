<?php

/**
 * Configuração de sinônimos para busca de produtos
 * 
 * Retorna um array onde cada chave é o termo principal
 * e o valor é um array de sinônimos para esse termo
 */

return [
    // Equipamentos de Proteção Individual (EPI)
    'capacete' => ['capacetes', 'capacetinho', 'headset', 'elmo', 'casco', 'proteção da cabeça'],
    'luva' => ['luvas', 'luvinhas', 'gloves', 'proteção das mãos', 'mãos', 'proteção manual'],
    'bota' => ['botas', 'sapato', 'sapatos', 'calçado', 'boots', 'proteção dos pés', 'calçado de segurança'],
    'colete' => ['coletes', 'vest', 'proteção do corpo', 'colete refletivo', 'colete de segurança'],
    'óculos' => ['óculos de segurança', 'proteção dos olhos', 'glasses', 'safety glasses', 'vista', 'ocular', 'proteção ocular'],
    'máscara' => ['máscaras', 'respirador', 'proteção respiratória', 'mask'],
    'protetor' => ['protetores', 'proteção', 'safety', 'protection'],

    // Ferramentas Manuais
    'chave' => ['chaves', 'key', 'tool', 'chave de fenda', 'chave inglesa'],
    'martelo' => ['martelos', 'hammer', 'marreta'],
    'furadeira' => ['furadeiras', 'drill', 'broca', 'perfurador'],
    'serra' => ['serras', 'saw', 'serrote'],
    'alicate' => ['alicates', 'pliers', 'alicate universal'],
    'chave-de-fenda' => ['chave de fenda', 'screwdriver', 'fenda'],
    'chave-philips' => ['chave philips', 'phillips', 'cruz'],

    // Materiais de Construção
    'cimento' => ['cement', 'massa', 'argamassa', 'concreto'],
    'tinta' => ['tintas', 'paint', 'verniz', 'esmalte'],
    'parafuso' => ['parafusos', 'screw', 'fixação', 'fixador'],
    'prego' => ['pregos', 'nail', 'fixação'],
    'tubo' => ['tubos', 'pipe', 'cano', 'canos', 'tubulação'],
    'tijolo' => ['tijolos', 'brick', 'bloco', 'blocos'],
    'areia' => ['sand', 'agregado'],
    'brita' => ['pedra', 'agregado', 'cascalho'],

    // Materiais Elétricos
    'cabo' => ['cabos', 'fio', 'fios', 'wire', 'cordão', 'cabo elétrico'],
    'tomada' => ['tomadas', 'plug', 'socket', 'tomada elétrica'],
    'interruptor' => ['interruptores', 'switch', 'chave elétrica'],
    'lâmpada' => ['lâmpadas', 'luz', 'bulb', 'iluminação', 'lampada'],
    'disjuntor' => ['disjuntores', 'breaker', 'proteção elétrica'],
    'quadro' => ['quadros', 'painel', 'quadro elétrico'],

    // Hidráulica
    'torneira' => ['torneiras', 'tap', 'registro'],
    'vaso' => ['vasos', 'toilet', 'sanitário', 'vaso sanitário'],
    'pia' => ['pias', 'sink', 'lavatório'],
    'chuveiro' => ['chuveiros', 'shower', 'ducha'],
    'conexão' => ['conexões', 'fitting', 'junção'],

    // Cores
    'azul' => ['blue', 'azulado'],
    'vermelho' => ['red', 'avermelhado'],
    'verde' => ['green', 'esverdeado'],
    'amarelo' => ['yellow', 'amarelado'],
    'preto' => ['black', 'negro'],
    'branco' => ['white', 'branca'],
    'cinza' => ['gray', 'grey', 'cinzento'],
    'laranja' => ['orange', 'alaranjado'],

    // Materiais
    'plástico' => ['plastic', 'pvc'],
    'metal' => ['metálico', 'metallic', 'ferro', 'aço'],
    'madeira' => ['wood', 'wooden', 'madeirado'],
    'borracha' => ['rubber', 'emborrachado'],
    'vidro' => ['glass', 'cristal'],
    'alumínio' => ['aluminum', 'aluminium', 'alu'],
    'inox' => ['inoxidável', 'stainless', 'aço inox'],

    // Unidades e Medidas
    'metro' => ['m', 'metros', 'mt'],
    'centímetro' => ['cm', 'centímetros'],
    'milímetro' => ['mm', 'milímetros'],
    'quilograma' => ['kg', 'quilogramas', 'kilo', 'quilo'],
    'litro' => ['l', 'litros', 'lt'],
    'polegada' => ['pol', 'polegadas', 'inch'],

    // Características e Propriedades
    'industrial' => ['profissional', 'professional', 'comercial'],
    'segurança' => ['proteção', 'safety', 'protection', 'seguro'],
    'resistente' => ['durável', 'forte', 'robusto'],
    'impermeável' => ['à prova d\'água', 'waterproof', 'resistente à água'],
    'antiderrapante' => ['anti-slip', 'aderente', 'grip'],

    // Aplicações
    'construção' => ['obra', 'building', 'construction'],
    'elétrica' => ['elétrico', 'electrical', 'energia'],
    'hidráulica' => ['hidráulico', 'hydraulic', 'água'],
    'jardim' => ['jardinagem', 'garden', 'paisagismo'],
    'limpeza' => ['cleaning', 'higiene', 'faxina'],

    // Tipos de Produto
    'kit' => ['conjunto', 'set', 'pacote'],
    'jogo' => ['set', 'conjunto', 'kit'],
    'peça' => ['peças', 'parte', 'componente'],
    'acessório' => ['acessórios', 'accessory', 'complemento'],

    // Marcas e Qualidade (genéricos)
    'original' => ['genuíno', 'authentic', 'legítimo'],
    'importado' => ['imported', 'internacional'],
    'nacional' => ['brasileiro', 'local', 'nacional'],

    // Teste - Móveis
    'chair' => ['cadeira', 'assento', 'poltrona'],
    'cadeira' => ['chair', 'assento', 'poltrona'],
];
