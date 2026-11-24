export const TagScope = {
  Personnel: 'personnel',
  Equipe: 'd’équipe',
  Departemental: 'départemental',
  National: 'national',
} as const

export type TagScope = (typeof TagScope)[keyof typeof TagScope]
