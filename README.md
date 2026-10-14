# CaririPlay

Marketplace mobile para descobrir e reservar quadras society e de vôlei no Cariri, começando por Crato, Juazeiro do Norte e Barbalha.

## Stack

- React Native + Expo SDK 54
- TypeScript em modo strict
- AsyncStorage para persistência local da demonstração
- Lucide React Native para ícones
- Design system próprio com tokens e componentes reutilizáveis
- Dados mockados nesta etapa; Supabase planejado para a próxima fase

## O que está implementado no protótipo

### Experiência do cliente
- Início com atalhos para modalidades e busca
- Catálogo de quadras ativas
- Busca por nome, bairro, cidade e comodidades; filtros de modalidade, preço máximo e iluminação
- Detalhes da quadra com descrição, regras, comodidades, localização textual, preço e avaliações
- Favoritos persistidos no dispositivo
- Reserva com data, horário, nome, telefone, observação e preço estimado
- Solicitações recorrentes semanais por quatro semanas, ignorando horários ocupados na demonstração
- Avaliação local após reserva concluída, com uma avaliação por reserva
- Central de avisos locais, atualizações de status e criação manual de lembretes demonstrativos
- Compartilhamento da quadra pelo menu nativo do celular
- Central de ajuda com FAQ sobre reserva, pagamento, recorrência, cancelamento e limites da demonstração
- Mensagens de validação, confirmação, falha e estado vazio

### Experiência do proprietário
- Painel com reservas, pendências, estimativa financeira, ocupação e cancelamentos
- Agenda por dia com bloqueio de horários para manutenção e remoção de bloqueios
- Listagem e gestão de reservas: confirmar, recusar, concluir e cancelar
- Cadastro de quadras, preço e ativação/desativação no catálogo
- Criação e ativação de promoções com desconto percentual
- Lista local de equipe com papéis demonstrativos de Administrador, Atendente e Leitura

### Administração da plataforma (demonstração)
- Painel resumido de estabelecimentos, reservas, assinatura e suporte
- Aprovação demonstrativa de estabelecimento e pausa/reativação da assinatura
- Auditoria local baseada em avisos do protótipo
- Aviso explícito de que acesso administrativo deve ser limitado por necessidade e privacidade

### Design system / Atomic Design
- Tokens para cores, tipografia, espaçamento e raios
- Átomos: `AppButton`, `AppText`, `StatusBadge`
- Moléculas: `SectionHeading`, `TimeSlot`
- Componentes de domínio: cartão de quadra, cartão de reserva e estados vazios
- Estados de interação e rótulos de acessibilidade nos principais controles

## Executar localmente

```bash
npm install
npx expo start
```

No Android, instale o Expo Go e leia o QR Code apresentado pelo Expo.

## Importante: limitações desta demonstração

- A troca entre “Cliente”, “Gestão” e “Admin” é apenas uma simulação visual; não é autenticação nem controle de acesso.
- Os dados ficam no dispositivo por meio do AsyncStorage e não são sincronizados com outros usuários.
- A prevenção de conflito de horários funciona apenas nos dados locais e não protege contra reservas simultâneas em dispositivos diferentes.
- O catálogo utiliza quadras e estabelecimento fictícios; não há fotos reais, mapa integrado, geolocalização ou disponibilidade publicada por estabelecimentos reais.
- Dados, avaliações, favoritos, promoções, bloqueios e equipe ficam apenas neste dispositivo; não há sincronização entre pessoas ou aparelhos.
- As notificações são avisos internos da demonstração, não notificações push agendadas do sistema.
- Os papéis de equipe são apenas demonstrativos e não aplicam autorização real.
- Avaliações iniciais de catálogo são dados fictícios; a verificação real dependerá de conta e reserva confirmada no backend.
- A tela “Minhas reservas” localiza demonstrações pelo nome e, quando informado, pelo telefone; isso deve ser substituído por uma conta/autorização segura antes de uso real.
- O projeto ainda precisa passar por instalação de dependências, verificação TypeScript e teste no Expo Go. Não considerar produção até essa validação.

## Próxima etapa técnica

1. Aguardar o workflow TypeScript do GitHub Actions e corrigir quaisquer erros encontrados.
2. Testar os fluxos em Android com Expo Go, incluindo recorrência, bloqueios, avaliações e promoções.
3. Conectar Supabase Auth e banco de dados.
4. Aplicar Row Level Security para isolar os dados de cada estabelecimento.
5. Fazer a validação atômica de disponibilidade e conflitos no banco de dados.
6. Adicionar testes de usabilidade com clientes e proprietários reais.

## Modelo de negócio

O modelo de negócio em avaliação é o pagamento pelo CaririPlay com divisão automática (split) entre plataforma e estabelecimento por um provedor marketplace. Nesta etapa isso ainda não está implementado: o aplicativo usa dados locais e não cobra, não repassa valores e não confirma pagamentos reais. A comissão de 5% no módulo de domínio é apenas uma hipótese demonstrativa para validar o modelo.


## Arquitetura e pagamentos (preparação sem banco)

- `docs/ARCHITECTURE.md`: separação de camadas, fronteiras do mock e requisitos de segurança para uma futura API.
- `docs/PAYMENTS_AND_COMMISSION.md`: fluxo futuro de marketplace, comissão, conciliação e decisões pendentes.
- `docs/UX_ACCEPTANCE_CHECKLIST.md`: critérios para testar os fluxos atuais e lista de requisitos antes de produção.
- `src/domain/checkout.ts`: cálculo de orçamento em centavos e tipos de domínio independentes da interface.
- `src/services/checkoutSimulator.ts`: adaptador local de simulação; não faz requisições, não persiste transações e não confirma reservas.
- A tela de reserva exibe uma prévia ilustrativa de comissão e parcela do estabelecimento, deixando explícito que nenhuma cobrança ou transferência ocorre.

**Importante:** nenhum banco foi conectado ou criado nesta alteração. Não existe pagamento real. Antes de produção, será necessário implementar validação atômica da disponibilidade no servidor, autenticação/autorização, políticas de acesso, integração marketplace, webhooks assinados, idempotência, estornos, conciliação e testes de segurança.
