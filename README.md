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

O estabelecimento paga uma mensalidade pela plataforma. O cliente paga a reserva diretamente ao estabelecimento. O CaririPlay não processa pagamentos no MVP.
