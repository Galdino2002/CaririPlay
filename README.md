# CaririPlay

MVP mobile para gerenciamento de campos society e quadras esportivas na região do Cariri (Crato, Juazeiro do Norte e Barbalha).

## Stack
- React Native + Expo
- TypeScript com modo strict
- AsyncStorage para persistência local de demonstração
- Dados mockados nesta primeira fase
- Supabase planejado para uma etapa futura

## Escopo do MVP
- Painel do proprietário com resumo das reservas
- Catálogo de estabelecimentos e quadras
- Agenda por dia e horários
- Criar, confirmar e cancelar reservas
- Cadastro e gerenciamento de quadras
- Bloqueio de horários
- Dados de demonstração persistidos localmente

## Rodar localmente
```bash
npm install
npx expo start
```

Para abrir no Android, instale o Expo Go e leia o QR Code apresentado pelo Expo.

## Estado do projeto
A aplicação começa com dados fictícios. Não há autenticação real nem backend nesta fase. A integração futura com Supabase deverá incluir autenticação, políticas RLS e validação de conflitos de horários no banco para evitar reservas duplicadas.

## Modelo de negócio
O proprietário paga uma mensalidade pela plataforma. O pagamento da reserva é realizado diretamente ao estabelecimento; a plataforma não processa pagamentos no MVP.
