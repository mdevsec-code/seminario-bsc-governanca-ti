// As 5 questoes do seminario. Usadas pelo projetor (index.html) e pelo aluno (jogar.html).
// A posicao da resposta certa foi alternada de proposito: 2, 3, 1, 4, 2.
export const LIMITE_MS = 30000;

export const QUESTOES = [
  {
    t: 'No IT Balanced Scorecard, a perspectiva de Contribuição Corporativa responde principalmente a qual pergunta?',
    o: [
      'O usuário está satisfeito com o service desk?',
      'Como a diretoria enxerga o valor gerado pela TI?',
      'Nossos processos de entrega são eficientes?',
      'Nossa equipe está pronta para novas tecnologias?'
    ],
    c: 1,
    why: 'A Contribuição Corporativa é a tradução da perspectiva financeira do BSC clássico: ela olha a TI pelos olhos de quem investe. As outras três alternativas descrevem, na ordem, Orientação ao Usuário, Excelência Operacional e Orientação Futura.'
  },
  {
    t: 'Qual destes é um indicador de tendência, e não de resultado?',
    o: [
      'Retorno do portfólio de projetos digitais',
      'Receita do canal digital no trimestre',
      'Percentual de analistas certificados em dados e IA',
      'Participação de mercado do e-commerce'
    ],
    c: 2,
    why: 'Capacitação é um impulsionador: é acionável hoje e o efeito aparece depois, nas demais perspectivas. Retorno, receita e participação de mercado confirmam o que já aconteceu.'
  },
  {
    t: 'O que diferencia um Balanced Scorecard de uma simples lista de indicadores?',
    o: [
      'As relações de causa e efeito no mapa estratégico',
      'A quantidade mínima de indicadores por área',
      'O uso de painéis atualizados em tempo real',
      'A auditoria externa obrigatória dos indicadores'
    ],
    c: 0,
    why: 'Sem o mapa estratégico, quatro perspectivas são apenas quatro abas de uma planilha. O que torna o scorecard um instrumento de gestão é a cadeia de hipóteses testáveis que liga aprendizado a processos, processos a cliente e cliente a resultado financeiro.'
  },
  {
    t: 'Na cascata proposta por Van Grembergen, qual é a função do IT Strategic Balanced Scorecard?',
    o: [
      'Substituir o scorecard corporativo da organização',
      'Medir apenas a disponibilidade da infraestrutura',
      'Controlar o orçamento de licenças de software',
      'Consolidar os scorecards de TI e alimentar o BSC corporativo'
    ],
    c: 3,
    why: 'Ele é a camada tradutora: recebe os indicadores operacionais e de projeto e os converte em linguagem de valor de negócio, que então sobe para o scorecard corporativo. É esse elo que materializa o alinhamento estratégico entre TI e negócio.'
  },
  {
    t: 'Qual é a principal lacuna apontada na literatura recente sobre BSC na governança de TI?',
    o: [
      'Falta de ferramentas para montar scorecards',
      'Mensurar o valor de ativos digitais intangíveis',
      'Excesso de publicações e saturação do tema',
      'Incompatibilidade entre BSC e métodos ágeis'
    ],
    c: 1,
    why: 'É exatamente o recorte do artigo. Ferramenta não é o problema, o tema não está saturado e a literatura mostra convivência entre scorecard e agilidade. O que falta é instrumento aceito para precificar o intangível digital.'
  }
];

export function pontos(acertou, ms) {
  if (!acertou) return 0;
  const frac = Math.min(1, Math.max(0, ms / LIMITE_MS));
  return Math.round(500 + 500 * (1 - frac));
}
