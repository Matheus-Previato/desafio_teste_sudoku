# Sudoku Binário — testes como especificação

Repositório de entrega: **`desafio_teste_sudoku`**.

Total de casos: **25**.

## Colaborador

Matheus Previato Hermenegildo — GitHub [Matheus-Previato](https://github.com/Matheus-Previato). Entrega organizada como trabalho individual. Em uma entrega em dupla, os dois integrantes devem ser identificados e suas contribuições devem existir no histórico do próprio repositório.

## Objetivo da entrega

Este repositório fornece especificação e testes de comportamento em **JavaScript**, para que a implementação também seja produzida em JavaScript a partir deles. O conjunto usa o executor nativo `node:test` e as asserções `node:assert/strict`, com módulos ES.

Os arquivos fornecidos são testes, documentação e configuração de execução. A implementação deverá ser criada em **`src/game.js`**, exportando as funções descritas abaixo. A primeira execução de `npm test` registra `ERR_MODULE_NOT_FOUND` enquanto esse arquivo estiver ausente. Depois de criado o módulo, as asserções especificam os comportamentos que precisam passar.

## Execução

Requer Node.js 22 ou superior. Na raiz do repositório:

```bash
npm run check
npm test
```

`npm run check` valida a sintaxe do arquivo de testes. `npm test` executa os casos, após a implementação existir. As ferramentas usadas pertencem ao próprio Node.js e dispensam dependências de teste externas.

## Convenções do contrato

Os estados são objetos de dados serializáveis, com arrays comuns. As funções que realizam ações recebem o estado e retornam o próximo estado. Devem preservar o objeto recebido e seus arrays internos. Em ações inválidas, devem lançar uma exceção sem modificar o estado. Os testes aceitam qualquer classe de exceção quando usam `assert.throws`.

As funções e os campos abaixo formam a interface observável exigida pelos testes. Campos adicionais podem existir. As fixtures dos testes compõem situações específicas a partir do construtor e substituem campos públicos. A implementação deve tomar decisões com base nesses campos, de forma que as fixtures sejam utilizáveis. Helpers e geradores presentes no arquivo de testes servem à preparação dos cenários e às asserções.

## Especificação do desafio

Sudoku binário **6 × 6**, também conhecido como Takuzu. As casas contêm `0`, `1` ou `null`, que indica casa vazia. Coordenadas começam em zero.

- Cada linha e cada coluna completa deve conter exatamente três zeros e três uns.
- Três valores iguais consecutivos são proibidos tanto na horizontal quanto na vertical.
- Linhas completas devem ser distintas entre si. A mesma regra vale para colunas completas. Linhas e colunas podem compartilhar o mesmo padrão entre grupos.
- Linhas ou colunas incompletas podem repetir padrões, mas não podem ultrapassar três ocorrências de um valor nem formar uma trinca.
- Pistas iniciais são fixas. Casas originalmente vazias podem receber, trocar ou apagar valores, usando `null` para apagar.
- Uma jogada que viola as regras é rejeitada. O jogo termina ao completar um tabuleiro válido. Após vitória, uma ação com coordenadas e valor válidos preserva o jogo.
- A validação trata as regras locais e a distinção de linhas e colunas. Geração de puzzles, busca de solução e garantia de solução única ficam fora das operações exigidas.

### Interface exigida

| Exportação | Contrato |
|---|---|
| `createGame(puzzle)` | Recebe uma matriz 6 × 6 válida, copia os dados, identifica pistas e define o estado inicial. Lança exceção para puzzle inválido. |
| `setCell(game, row, col, value)` | Insere `0`, `1` ou `null` em casa editável e retorna o próximo estado. |
| `isValidBoard(board)` | Retorna booleano. Formato ou valor inválido resulta em `false`. Tabuleiro parcial válido resulta em `true`. |
| `isComplete(board)` | Retorna `true` somente para um tabuleiro 6 × 6 cheio e válido. |

O estado contém `board`, matriz dos valores, `fixed`, matriz booleana das pistas, e `status`, com valores `playing` ou `won`. O construtor copia os arrays de entrada para que modificações posteriores no puzzle original não alterem o jogo.

## Funcionamento dos casos de teste

Cada caso usa `test(...)` para preparar um estado, realizar uma ação e comparar o resultado esperado com `assert`. Os identificadores abaixo correspondem aos nomes executados pelo Node.js.

| Caso | Comportamento verificado |
|---|---|
| SB01 | Tabuleiro vazio 6x6 é válido e incompleto |
| SB02 | Solução completa atende às regras binárias |
| SB03 | Aceita puzzle parcialmente preenchido |
| SB04 | Preserva as pistas iniciais e marca casas editáveis |
| SB05 | Inserir zero ou um em casa editável atualiza o tabuleiro |
| SB06 | Permite corrigir e limpar casas inseridas pelo jogador |
| SB07 | Proíbe alterar ou apagar pista original |
| SB08 | Rejeita três zeros ou três uns consecutivos em linha |
| SB09 | Rejeita três valores iguais consecutivos em coluna |
| SB10 | Detecta trincas no início e no fim da linha e da coluna |
| SB11 | Rejeita mais de três ocorrências de um valor em linha incompleta |
| SB12 | Rejeita mais de três ocorrências de um valor em coluna incompleta |
| SB13 | Linhas completas devem ser diferentes entre si |
| SB14 | Colunas completas devem ser diferentes entre si |
| SB15 | Padrões iguais ainda incompletos são permitidos |
| SB16 | Forma e valores inválidos são rejeitados |
| SB17 | Inserção que cria trinca é rejeitada sem alterar o jogo |
| SB18 | Coordenadas e valores de jogada inválidos lançam exceção |
| SB19 | Preencher o último espaço com valor correto vence a partida |
| SB20 | Completar várias casas preserva pistas e vence somente no final |
| SB21 | Tabuleiro cheio inválido não é considerado completo |
| SB22 | Construtor copia o puzzle e jogadas preservam o estado de entrada |
| SB23 | Partida vencida permanece inalterada em nova jogada válida |
| SB24 | Jogada que excede três ocorrências é rejeitada |
| SB25 | Jogada que duplica linha ou coluna completa é rejeitada |

## Orientação para implementar a partir dos testes

1. Leia as regras, o contrato e todos os casos em `tests/game.test.js`.
2. Crie `src/game.js` como módulo ES e exporte a interface exigida.
3. Execute `npm test`, implemente cada comportamento e repita até todos os casos passarem.
4. Preserve os testes, os resultados esperados e as regras declaradas. Testes adicionais podem ser acrescentados para comportamentos novos compatíveis.
5. Uma interface visual pode usar as funções do módulo depois que as regras estiverem corretas.

## Estado da verificação desta entrega

A sintaxe dos testes foi verificada com Node.js. A execução na ausência de `src/game.js` foi conferida e apresenta a falha de importação esperada. A aprovação dos casos depende da implementação futura. A contagem de casos descreve o conjunto de especificações entregue.

## Entrega no GitHub

Crie um repositório público com o nome exato **`desafio_teste_sudoku`**. Extraia o pacote e envie o conteúdo desta pasta para a raiz do repositório. O `README.md`, o `package.json` e a pasta `tests` devem aparecer diretamente nessa raiz.

O código dos testes fica em `tests/game.test.js`. O módulo futuro esperado fica em `src/game.js`.

Para uma dupla, cada integrante deve enviar suas próprias contribuições pelo GitHub e constar na seção de colaboradores. O histórico de alterações é o registro das contribuições.
