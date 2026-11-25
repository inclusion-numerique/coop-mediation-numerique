import { readFile, writeFile } from 'node:fs/promises'
import { makeBadge } from 'badge-maker'

const [lcov, badge] = process.argv.slice(2)

const COMPTEURS = ['LF', 'LH', 'FNF', 'FNH', 'BRF', 'BRH']

const compteur = (ligne) => {
  const [cle, valeur] = ligne.split(':')
  return COMPTEURS.includes(cle) ? { [cle]: Number(valeur) } : {}
}

const totaux = (await readFile(lcov, 'utf8'))
  .split('\n')
  .map(compteur)
  .reduce(
    (acc, ligne) =>
      Object.fromEntries(
        COMPTEURS.map((cle) => [cle, acc[cle] + (ligne[cle] ?? 0)]),
      ),
    Object.fromEntries(COMPTEURS.map((cle) => [cle, 0])),
  )

const taux = (couverts, total) =>
  total === 0 ? 100 : Math.floor((couverts / total) * 1000) / 10

const lignes = taux(totaux.LH, totaux.LF)

const COULEURS = [
  { seuil: 80, couleur: 'brightgreen' },
  { seuil: 60, couleur: 'yellow' },
  { seuil: 0, couleur: 'red' },
]

const { couleur } = COULEURS.find(({ seuil }) => lignes >= seuil)

await writeFile(
  badge,
  makeBadge({ label: 'couverture', message: `${lignes} %`, color: couleur }),
)

process.stdout.write(
  `${[
    '## Couverture des tests unitaires, d’intégration et Cucumber',
    '',
    '| Mesure | Taux | Couvertes | Total |',
    '| --- | --- | --- | --- |',
    `| Lignes | ${lignes} % | ${totaux.LH} | ${totaux.LF} |`,
    `| Fonctions | ${taux(totaux.FNH, totaux.FNF)} % | ${totaux.FNH} | ${totaux.FNF} |`,
    `| Branches | ${taux(totaux.BRH, totaux.BRF)} % | ${totaux.BRH} | ${totaux.BRF} |`,
  ].join('\n')}\n`,
)
