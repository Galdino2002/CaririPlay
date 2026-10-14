# Pagamentos e comissão — planejamento

## Modelo pretendido
O cliente paga pelo CaririPlay; um provedor marketplace divide o valor entre a plataforma e o estabelecimento. O estabelecimento recebe a parcela líquida conforme regras e prazos do provedor. Esse modelo substitui o pagamento direto ao estabelecimento discutido inicialmente.

## Simulação atual
- Comissão de referência no código: 5%, configurada em basis points.
- Os valores são calculados em centavos inteiros.
- A simulação informa explicitamente que nenhum pagamento real ocorreu.
- Não existe captura, split real, repasse, persistência financeira ou confirmação real de reserva.
- A taxa de 5% é hipótese de validação comercial, não uma taxa aprovada.

## Exemplo ilustrativo
Para reserva de R$ 100,00 e comissão demonstrativa de 5%: bruto R$ 100,00; comissão bruta da plataforma R$ 5,00; parcela bruta do estabelecimento R$ 95,00. Não estão incluídas taxas do provedor, antecipação, impostos, estornos, chargebacks ou outras despesas.

## Fluxo futuro recomendado
1. Aplicativo solicita orçamento ao backend usando o ID da reserva.
2. Backend valida estabelecimento, preço, regras de cancelamento e disponibilidade.
3. Backend calcula comissão a partir de configuração confiável no servidor.
4. Backend cria tentativa de pagamento no provedor marketplace.
5. Aplicativo apresenta checkout hospedado ou SDK oficial.
6. Webhook assinado e idempotente atualiza a tentativa de pagamento.
7. Reserva só é confirmada conforme política definida e estado validado pelo servidor.
8. Conciliação compara reservas, transações, taxas, repasses, reembolsos e chargebacks.

## Decisões pendentes antes da cobrança real
- Provedor marketplace compatível com split no Brasil.
- Cadastro/KYC e contas de recebimento dos estabelecimentos.
- Responsável por taxas, chargebacks, reembolsos e disputas.
- Momento de captura e expiração de reserva pendente.
- Política de cancelamento e devolução revisada juridicamente.
- Prazos de repasse, conciliação, obrigações fiscais e comprovantes.

## Estados
O estado `simulated` é exclusivo da demonstração e nunca significa pagamento aprovado. Não marcar reserva como paga com base em estado local, deep link ou retorno visual do checkout.
