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
- Busca por nome e filtros de modalidade
- Favoritos durante a sessão atual
- Fluxo de reserva com data, horário, nome, telefone e observação
- Preço estimado antes de solicitar
- Status de reserva e cancelamento no protótipo
- Mensagens de validação, confirmação, falha e estado vazio

### Experiência do proprietário
- Painel com indicadores de hoje e solicitações pendentes
- Agenda diária por quadra
- Listagem de reservas
- Confirmar, recusar, concluir e cancelar reservas
- Adicionar quadras e definir modalidade e preço
- Ativar ou desativar quadras no catálogo

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

- A troca entre “Cliente” e “Gestão” é apenas uma simulação visual; não é autenticação nem controle de acesso.
- Os dados ficam no dispositivo por meio do AsyncStorage e não são sincronizados com outros usuários.
- A prevenção de conflito de horários funciona apenas nos dados locais e não protege contra reservas simultâneas em dispositivos diferentes.
- O catálogo utiliza quadras e estabelecimento fictícios; não há fotos reais, avaliações verificadas, geolocalização ou disponibilidade publicada por estabelecimentos reais.
- Favoritos ainda não são persistidos após fechar o app.
- A tela “Minhas reservas” localiza demonstrações pelo nome e, quando informado, pelo telefone; isso deve ser substituído por uma conta/autorização segura antes de uso real.
- O projeto ainda precisa passar por instalação de dependências, verificação TypeScript e teste no Expo Go. Não considerar produção até essa validação.

## Próxima etapa técnica

1. Executar `npm install` e `npm run typecheck`.
2. Testar os fluxos em Android e ajustar os erros encontrados.
3. Conectar Supabase Auth e banco de dados.
4. Aplicar Row Level Security para isolar os dados de cada estabelecimento.
5. Fazer a validação atômica de disponibilidade e conflitos no banco de dados.
6. Adicionar testes de usabilidade com clientes e proprietários reais.

## Modelo de negócio

O estabelecimento paga uma mensalidade pela plataforma. O cliente paga a reserva diretamente ao estabelecimento. O CaririPlay não processa pagamentos no MVP.
