import { type AnomalieSituee, parChamp, type Releve } from '../../domain'

const LARGEUR_CODE = 30

const pourcent = (part: number, total: number): string =>
  total === 0 ? '—' : `${((part / total) * 100).toFixed(1)} %`

const enTete = (releve: Releve): readonly string[] => [
  `lieux mesurés  ${releve.lieuxMesures}`,
  `sans anomalie  ${releve.lieuxSains} (${pourcent(releve.lieuxSains, releve.lieuxMesures)})`,
  `écartés        ${releve.lieuxEcartes} (${pourcent(releve.lieuxEcartes, releve.lieuxMesures)})`,
  '',
  `${'code'.padEnd(LARGEUR_CODE)} ${'lieux'.padStart(6)} ${'occurr.'.padStart(8)}  gravité`,
]

const postes = (releve: Releve): readonly string[] =>
  releve.postes.map(
    ({ code, lieux, occurrences, gravite }) =>
      `${code.padEnd(LARGEUR_CODE)} ${String(lieux).padStart(6)} ${String(occurrences).padStart(8)}  ${gravite}`,
  )

const lieuxDistincts = (anomalies: readonly AnomalieSituee[]): number =>
  new Set(anomalies.map(({ lieuId }) => lieuId)).size

const duPlusLourd = (
  [, gauche]: readonly [string, number],
  [, droite]: readonly [string, number],
): number => droite - gauche

const colonnesDesListes = (releve: Releve): readonly string[] => {
  const listes = releve.anomalies.filter(
    ({ code }) => code === 'liste-desordonnee',
  )

  if (listes.length === 0) return []

  return [
    '',
    'listes à ranger, colonne par colonne :',
    ...[...parChamp(listes)]
      .map(([colonne, anomalies]): readonly [string, number] => [
        colonne,
        lieuxDistincts(anomalies),
      ])
      .sort(duPlusLourd)
      .map(
        ([colonne, lieux]) =>
          `  ${colonne.padEnd(LARGEUR_CODE)} ${String(lieux).padStart(6)}`,
      ),
  ]
}

export const releveEnLignes = (releve: Releve): readonly string[] => [
  ...enTete(releve),
  ...postes(releve),
  ...colonnesDesListes(releve),
]
