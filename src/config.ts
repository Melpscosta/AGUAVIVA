export const WHATSAPP_NUMBER = '5511999999999'

export const WHATSAPP_MESSAGE =
  'Gostaria de ser parceiro do ÁguaViva. Acredito na missão de navegar por um oceano de mudança na sustentabilidade marinha.'

export function getWhatsAppUrl(number = WHATSAPP_NUMBER, message = WHATSAPP_MESSAGE) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export type StepIcon = 'volunteer' | 'explore' | 'reward'

export const STEPS = [
  {
    number: 1,
    title: 'Participe de ações',
    text: 'Escolha uma ação voluntária e participe gratuitamente de iniciativas de preservação marinha.',
    side: 'left' as const,
    icon: 'volunteer' as const,
  },
  {
    number: 2,
    title: 'Explore e contribua',
    text: 'Explore novos lugares enquanto participa de ações voluntárias, contribuindo com comunidades costeiras em troca de hospedagem, alimentação e transporte.',
    side: 'right' as const,
    icon: 'explore' as const,
  },
  {
    number: 3,
    title: 'Acumule recompensas',
    text: 'Acumule pontos ao concluir ações voluntárias e troque por benefícios como hospedagem, alimentação, transporte, passeios e experiências sustentáveis.',
    side: 'left' as const,
    icon: 'reward' as const,
  },
]
