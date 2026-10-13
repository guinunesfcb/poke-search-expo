# PokeSearch

Aplicativo mobile desenvolvido em **React Native**, **Expo** e **TypeScript** para consulta e exploração de Pokémon consumindo diretamente a [PokéAPI](https://pokeapi.co/api/v2).

---

## 🎯 Objetivo

O **PokeSearch** foi concebido como um MVP móvel com foco acadêmico e profissional, demonstrando boas práticas de engenharia de software mobile: consumo de APIs REST nativas (via Fetch API), renderização otimizada com `FlatList`, controle rigoroso de concorrência e cancelamento de requisições (`AbortController`), tipagem estrita com TypeScript, e padrões modernos de design e acessibilidade.

---

## 🚀 Funcionalidades

- **Busca Individual**: Permite buscar um Pokémon digitando seu nome (ex: `pikachu`, `mr-mime`) ou seu ID numérico da Pokédex (ex: `25`, `150`).
- **Validação de Entrada**: Normaliza entradas (trim de espaços, minúsculas em nomes, manutenção de hífens válidos e IDs numéricos) e rejeita pesquisas vazias com feedback amigável em português.
- **Exibição Detalhada**:
  - Imagem oficial com alta fidelidade (prioridade para *official-artwork*, seguida por *sprite default* e *fallback nativo* de placeholder estilizado).
  - Identificador da Pokédex formatado (ex: `#0025`).
  - Nome capitalizado com hífens convertidos para espaços legíveis.
  - Número de ordem (`order`).
  - Altura convertida de decímetros para metros no padrão brasileiro (ex: `0,7 m`).
  - Peso convertido de hectogramas para quilogramas no padrão brasileiro (ex: `6,9 kg`).
  - Lista de habilidades destacadas visualmente, com identificação textual explícita para habilidades ocultas (`(Oculta)`).
- **Listagem Completa ("Exibir todos")**:
  - Carrega a Pokédex em lotes paginados de 20 Pokémon por vez (`PAGE_SIZE = 20`).
  - Paginação incremental sob demanda via `onEndReached` da `FlatList`.
  - Tratamento de término da lista com mensagem visual discreta.
- **Estratégia de Renderização Unificada**: Uma única `FlatList` é utilizada tanto para o resultado da busca individual quanto para a listagem paginada, garantindo alta performance e consistência de código.
- **Pull-to-Refresh**:
  - No modo **Busca**: recarrega a última busca válida efetuada.
  - No modo **Todos**: reinicia a paginação a partir do offset zero e atualiza a listagem sem duplicações.
- **Tratamento Resiliente de Erros**:
  - 404 diferenciado ("Pokémon não encontrado. Verifique o nome ou ID informado.").
  - Falha de conexão e erros de rede com mensagens claras em português e botão "Tentar novamente".
  - Falhas parciais na paginação mantêm os itens já carregados com opção de tentar novamente a página no rodapé.
- **Controle de Concorrência**: Requisições anteriores são abortadas automaticamente ao realizar novas buscas ou alternar modos, evitando condições de corrida (*race conditions*).
- **Acessibilidade**: Roles semânticas (`search`, `button`, `image`, `alert`), labels descritivos para leitores de tela e áreas de toque adequadas.

---

## 🛠️ Tecnologias Utilizadas

- **React Native** (0.86.3)
- **Expo** (SDK 57)
- **TypeScript** (5.x/6.x com checagem estrita)
- **React Hooks** (`useState`, `useEffect`, `useCallback`, `useRef`, `React.memo`)
- **FlatList**, **TextInput**, **Pressable**, **RefreshControl**, **ActivityIndicator**, **SafeAreaView**
- **Fetch API nativa** com **AbortController**
- **StyleSheet** nativo do React Native

---

## 📁 Estrutura de Pastas

```
PokeSearch/
├── assets/                  # Assets visuais do aplicativo Expo
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── EmptyState.tsx   # Estado visual vazio e orientações iniciais
│   │   ├── ErrorState.tsx   # Mensagens de erro com ação de tentar novamente
│   │   ├── LoadingFooter.tsx# Rodapé com indicador de paginação ou fim de lista
│   │   ├── PokemonCard.tsx  # Card do Pokémon formatado com acessibilidade
│   │   └── SearchBar.tsx    # Campo de busca acessível com botão limpar
│   ├── constants/
│   │   └── api.ts           # Constantes da API (URL base e tamanho de página)
│   ├── screens/
│   │   └── PokemonSearchScreen.tsx # Tela principal e controle de fluxo
│   ├── services/
│   │   └── pokeApi.ts       # Camada de comunicação com a PokéAPI e mapeamento
│   ├── types/
│   │   └── pokemon.ts       # Tipagens TypeScript (API externa e domínio interno)
│   └── utils/
│       └── formatters.ts    # Funções de formatação (ID, nomes, altura, peso)
├── App.tsx                  # Ponto de entrada do aplicativo
├── app.json                 # Configuração do Expo
├── package.json             # Dependências e scripts
├── tsconfig.json            # Configuração do TypeScript
├── .gitignore               # Arquivos e pastas ignorados pelo Git
└── README.md                # Documentação completa do projeto
```

---

## 📋 Pré-requisitos

Para executar o projeto localmente, certifique-se de possuir instalado:

- **Node.js**: versão 18 ou superior (testado com sucesso no Node 24);
- **npm**: gerenciador de pacotes;
- **Git**: para versionamento de código;
- Dispositivo físico com o app **Expo Go** (Android ou iOS) ou emulador/simulador configurado.

---

## 💻 Instalação

Clone o repositório e instale as dependências:

```bash
# Entrar no diretório do projeto
cd PokeSearch

# Instalar dependências
npm install
```

---

## ⚙️ Comandos Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm install` | Instala todas as dependências do projeto |
| `npx expo start` | Inicia o servidor Metro Bundler do Expo |
| `npx expo start --android` | Inicia o projeto diretamente no emulador Android conectado |
| `npx expo start --ios` | Inicia o projeto no simulador iOS (requer macOS) |
| `npx expo start --web` | Executa o aplicativo na versão web no navegador |
| `npx tsc --noEmit` | Executa a verificação estrita de tipos do TypeScript sem gerar arquivos |
| `npx expo-doctor@latest` | Valida a integridade, compatibilidade e dependências do ambiente Expo |

---

## 🔍 Detalhes de Implementação

### 1. Busca por Nome ou ID
O endpoint utilizado para busca individual é:
```http
GET https://pokeapi.co/api/v2/pokemon/{name-or-id}
```
Exemplos:
- `GET https://pokeapi.co/api/v2/pokemon/pikachu`
- `GET https://pokeapi.co/api/v2/pokemon/25`

Antes de enviar a requisição, o termo é validado:
- Espaços extras são removidos com `trim()`;
- Nomes são convertidos para minúsculas;
- IDs numéricos têm sua formatação preservada;
- Buscas vazias são impedidas antes de disparar qualquer chamada de rede.

### 2. Botão "Exibir todos" e Paginação
O endpoint de listagem paginada é:
```http
GET https://pokeapi.co/api/v2/pokemon?limit=20&offset={offset}
```
Para cada página de 20 registros, os detalhes individuais são requisitados em paralelo com `Promise.allSettled`. Se algum detalhe individual falhar momentaneamente, os demais itens válidos são preservados. A listagem remove possíveis duplicidades por `id` e ordena em ordem crescente.

A paginação é controlada via `onEndReached` e protegida por referências (`useRef`) para impedir múltiplas requisições concorrentes para o mesmo offset.

### 3. Conversão de Medidas e Formatação
- **Altura (`height`)**: A PokéAPI retorna a altura em decímetros. É convertida para metros dividindo por 10 e formatada com vírgula (ex: `7` decímetros -> `0,7 m`).
- **Peso (`weight`)**: A PokéAPI retorna o peso em hectogramas. É convertido para quilogramas dividindo por 10 e formatado com vírgula (ex: `69` hectogramas -> `6,9 kg`).
- **Identificador (`id`)**: Exibido com prefixo `#` e preenchido com 4 dígitos (ex: `25` -> `#0025`).

### 4. Controle de Concorrência
O aplicativo utiliza instâncias de `AbortController`:
- Ao disparar uma nova pesquisa, requisições de buscas anteriores são abortadas;
- Ao alternar entre o modo de busca e o modo de exibição geral, requisições do modo anterior são canceladas;
- Respostas canceladas intencionalmente não geram mensagens de erro para o usuário.

---

## 📱 Como Executar

### Expo Go (Dispositivo Físico)
1. Execute `npx expo start` no terminal;
2. Instale o app **Expo Go** em seu celular (disponível na Google Play Store e Apple App Store);
3. No Android: leia o QR Code exibido no terminal pelo app Expo Go;
4. No iOS: abra o aplicativo nativo de Câmera e aponte para o QR Code para abrir no Expo Go.

### Android (Emulador)
1. Certifique-se de que o Android Studio e um AVD estejam em execução;
2. Execute `npx expo start --android`.

### iOS (Simulador)
1. Certifique-se de estar em um ambiente macOS com Xcode e CocoaPods configurados;
2. Execute `npx expo start --ios`.

### Web (Navegador)
1. Caso deseje executar no navegador:
   `npx expo start --web`

---

## 📸 Capturas de Tela

> As capturas de tela poderão ser adicionadas nesta seção após a execução em dispositivos físicos ou emuladores.

*(A interface apresenta cabeçalho vermelho temático estilo Pokédex, cards brancos com bordas suaves e sombras, badges de identificação e botões acessíveis).*

---

## 🌿 Versionamento com Git

O histórico de commits do projeto adota mensagens semânticas:
- `chore: initialize Expo TypeScript project`
- `feat: add Pokemon types and API service`
- `feat: add Pokemon search by name or id`
- `feat: add paginated Pokemon list`
- `feat: add Pokemon card and UI states`
- `docs: add project documentation`

---

## ⚠️ Limitações Conhecidas

- A PokéAPI possui limitação de taxa (*rate limiting*) que, embora generosa para uso individual, pode responder com lentidão se houver requisições massivas seguidas.

---

## 💡 Possíveis Melhorias Futuras

- Filtro avançado por tipo de Pokémon (ex: Elétrico, Fogo, Água);
- Armazenamento em cache local com `AsyncStorage` para funcionamento offline dos Pokémon já visualizados;
- Reprodução do som (cries) oficial do Pokémon retornado pela API;
- Adição de testes automatizados com Jest e React Native Testing Library.
