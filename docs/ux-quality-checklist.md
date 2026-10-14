# CaririPlay — checklist de UX

Este documento transforma as 10 heurísticas de Nielsen em critérios verificáveis para o protótipo. Marcar um item como implementado não substitui teste com pessoas reais.

## 1. Visibilidade do estado do sistema
- [x] Mostrar status de reservas com rótulos claros.
- [x] Exibir carregamento inicial.
- [x] Informar sucesso e falha de operações importantes.
- [ ] Acrescentar feedback visual não modal para operações rápidas.
- [ ] Sincronizar atualizações em tempo real quando houver backend.

## 2. Correspondência entre sistema e mundo real
- [x] Usar termos familiares: quadra, horário, preço por hora, reserva.
- [x] Exibir valores em reais e datas no formato brasileiro.
- [x] Explicar que o pagamento ocorre diretamente no estabelecimento.
- [ ] Substituir dados de demonstração por informações verificadas de estabelecimentos reais.

## 3. Controle e liberdade do usuário
- [x] Permitir voltar da seleção de horário para explorar.
- [x] Permitir cancelar uma reserva de demonstração com confirmação.
- [x] Permitir fechar o formulário de nova quadra.
- [ ] Persistir o rascunho de reserva ao navegar entre telas.
- [ ] Aplicar regras de cancelamento definidas por cada estabelecimento.

## 4. Consistência e padrões
- [x] Centralizar cores, tipografia, espaçamentos e raios em tokens.
- [x] Reutilizar botões, textos, status e seletores de horário.
- [x] Usar ícones Lucide em vez de emojis decorativos.
- [ ] Extrair os blocos de domínio de App.tsx para módulos próprios antes de ampliar o produto.

## 5. Prevenção de erros
- [x] Validar nome, telefone, preço e horário no fluxo local.
- [x] Ocultar horários que já possuem uma reserva ativa nos dados carregados.
- [x] Verificar novamente o horário antes de gravar a reserva local.
- [ ] Validar conflitos de forma atômica no banco de dados antes de uso multiusuário.
- [ ] Impedir sobreposição de reservas de duração variável e respeitar bloqueios/horário de funcionamento.

## 6. Reconhecimento em vez de memorização
- [x] Manter preço, modalidade e dados principais visíveis durante a reserva.
- [x] Exibir datas e horários disponíveis para seleção.
- [x] Exibir os status das reservas.
- [ ] Manter filtros e favoritos após reiniciar o aplicativo.
- [x] Exibir endereço textual, regras e comodidades na página de detalhes.
- [ ] Mostrar política de cancelamento definida por cada estabelecimento.

## 7. Flexibilidade e eficiência
- [x] Oferecer atalhos para Society, Vôlei e exploração.
- [x] Permitir busca e filtros no catálogo.
- [x] Oferecer ações diretas na gestão de reservas.
- [x] Permitir repetir reserva semanal por quatro semanas na demonstração.
- [ ] Adicionar atalhos para horários recentes.
- [ ] Testar a quantidade de toques e o tempo para completar a tarefa.

## 8. Design estético e minimalista
- [x] Usar hierarquia tipográfica e espaçamento consistente.
- [x] Destacar preço, disponibilidade e ação principal.
- [x] Usar cartões e estados vazios consistentes.
- [ ] Validar o visual em telas pequenas, grandes e com fonte ampliada.
- [ ] Testar contraste e legibilidade com ferramentas de acessibilidade.

## 9. Ajudar a reconhecer, diagnosticar e recuperar erros
- [x] Usar mensagens que explicam o que deve ser corrigido.
- [x] Preservar campos preenchidos quando a gravação da reserva falha.
- [x] Oferecer ação de limpar filtros quando a busca não encontra resultados.
- [ ] Adicionar recuperação de rede e repetição segura após a integração com backend.
- [ ] Registrar erros técnicos sem expor dados pessoais ao usuário.

## 10. Ajuda e documentação
- [x] Explicar o fluxo de reserva e o modelo de pagamento no README.
- [ ] Adicionar FAQ curto no aplicativo.
- [ ] Mostrar regras e instruções do estabelecimento antes da confirmação.
- [ ] Oferecer contato de suporte e do estabelecimento.

## Atomic Design

- **Átomos:** `AppButton`, `AppText`, `StatusBadge`, tokens.
- **Moléculas:** `SectionHeading`, `TimeSlot`, campos de formulário.
- **Organismos:** cartão de quadra, cartão de reserva, formulário de reserva, navegação.
- **Templates:** composição da experiência do cliente e da área do proprietário.
- **Páginas:** Início, Explorar, Detalhes, Reserva, Minhas reservas, Favoritos, Avaliações, Notificações, Painel, Agenda, Quadras, Promoções, Equipe e Administração demonstrativa.

## Critérios de teste manual
1. Uma pessoa que nunca viu o app consegue encontrar uma quadra sem orientação?
2. Consegue identificar preço e duração antes de enviar a solicitação?
3. Consegue escolher uma data e um horário livre e entender o status final?
4. Se o horário ficar ocupado, recebe uma explicação e consegue selecionar outro?
5. O proprietário consegue confirmar, cancelar e concluir uma reserva?
6. O proprietário consegue adicionar uma quadra, alterar preço e ocultá-la do catálogo?
8. O proprietário consegue bloquear um horário de manutenção e removê-lo depois?
9. O cliente consegue avaliar uma reserva concluída sem avaliar a mesma reserva duas vezes?
10. A recorrência ignora horários ocupados e informa quantas solicitações foram criadas?
7. A interface é compreensível com fonte ampliada e leitor de tela?

## Limites atuais
O protótipo é local e usa dados fictícios. A alternância Cliente/Gestão não é autenticação. Os controles de disponibilidade não protegem contra acessos simultâneos em dispositivos diferentes. Não publicar como serviço real antes de conectar backend seguro, configurar autorização e testar conflitos no banco.
