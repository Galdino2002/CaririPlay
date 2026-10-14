# CaririPlay — checklist de UX e validação do MVP

## Cliente
- [ ] Início direciona para modalidades, catálogo e busca.
- [ ] Busca encontra quadras por nome, estabelecimento, cidade, bairro e comodidades.
- [ ] Filtros de modalidade, preço e iluminação podem ser combinados e limpos.
- [ ] Detalhes deixam claro quando dados, avaliações e verificação são demonstrativos.
- [ ] Reserva exige nome, telefone válido, data e horário.
- [ ] Horários ocupados ou bloqueados não podem ser selecionados nos dados locais.
- [ ] Recorrência explica que cada solicitação depende de disponibilidade e confirmação.
- [ ] Resumo mostra total e prévia ilustrativa de comissão/split sem alegar cobrança real.
- [ ] Confirmação e ajuda informam que o checkout real ainda não está ativo.
- [ ] Minhas reservas informa que a consulta por nome/telefone é provisória e não segura para produção.
- [ ] Favoritos, notificações e avaliações têm estados vazios, mensagens de erro e confirmação.

## Proprietário e gestão
- [ ] Painel diferencia reservas pendentes, confirmadas e concluídas.
- [ ] Agenda permite bloquear e desbloquear horários demonstrativos.
- [ ] Gestão pode confirmar, recusar, concluir e cancelar reservas locais.
- [ ] Cadastro, preço, ativação, promoções e equipe funcionam apenas no dispositivo.
- [ ] Interface explica que permissões de equipe não são controles reais de acesso.
- [ ] Valores exibidos são estimativas, não receita conciliada ou dinheiro recebido.

## Administração
- [ ] Área de administração é explicitamente demonstrativa.
- [ ] Verificação de estabelecimento e suporte não alteram sistemas externos.
- [ ] Acesso real deverá ser protegido por autenticação, autorização e auditoria no servidor.

## Antes de liberar para usuários reais
- [ ] Instalar dependências e executar npm run typecheck.
- [ ] Testar Android/Expo Go em telas pequenas, teclado aberto e navegação entre papéis.
- [ ] Testar persistência local após reiniciar o app e falhas de armazenamento.
- [ ] Adicionar testes unitários para preço, descontos, comissão e estados de checkout.
- [ ] Implementar API e validação atômica de disponibilidade no servidor.
- [ ] Configurar autenticação, RLS, limites de requisição, auditoria e proteção de dados pessoais.
- [ ] Integrar provedor marketplace em homologação, incluindo cadastro de estabelecimentos, webhooks idempotentes, estornos e conciliação.
- [ ] Revisar política de cancelamento, taxas, repasses e responsabilidades com apoio jurídico/contábil.
- [ ] Fazer teste ponta a ponta e piloto com estabelecimentos reais antes de produção.
