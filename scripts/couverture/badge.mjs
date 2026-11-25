import { readFile, writeFile } from 'node:fs/promises'
import { makeBadge } from 'badge-maker'

const [lcov, badge] = process.argv.slice(2)

const champ = (ligne) => {
  const separateur = ligne.indexOf(':')
  return [ligne.slice(0, separateur), ligne.slice(separateur + 1)]
}

const passages = (valeur) => (valeur === '-' ? 0 : Number(valeur))

const LECTEURS = {
  lignes: {
    DA: (parties) => [parties[0], passages(parties[1])],
    BRDA: (parties) => [parties[0], passages(parties[3])],
  },
  fonctions: {
    FNA: (parties) => [parties.slice(2).join(','), passages(parties[1])],
  },
  branches: {
    BRDA: (parties) => [parties.slice(0, 3).join(','), passages(parties[3])],
  },
}

const elementsDuFichier = (lecteurs) => (enregistrement) =>
  enregistrement
    .map(champ)
    .filter(([cle]) => cle in lecteurs)
    .map(([cle, valeur]) => lecteurs[cle](valeur.split(',')))
    .reduce(
      (acc, [element, passe]) => ({
        ...acc,
        [element]: (acc[element] ?? false) || passe > 0,
      }),
      {},
    )

const enregistrements = (await readFile(lcov, 'utf8'))
  .split('end_of_record')
  .map((enregistrement) => enregistrement.split('\n').filter(Boolean))
  .filter((enregistrement) => enregistrement.length > 0)

const compter = (lecteurs) =>
  enregistrements
    .map(elementsDuFichier(lecteurs))
    .map(Object.values)
    .reduce(
      (acc, couverts) => ({
        total: acc.total + couverts.length,
        couverts: acc.couverts + couverts.filter(Boolean).length,
      }),
      { total: 0, couverts: 0 },
    )

const totaux = Object.fromEntries(
  Object.entries(LECTEURS).map(([mesure, lecteurs]) => [
    mesure,
    compter(lecteurs),
  ]),
)

const taux = ({ couverts, total }) =>
  total === 0 ? 100 : Math.round((couverts / total) * 1000) / 10

const lignes = taux(totaux.lignes)

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

const MESURES = [
  ['Lignes', 'lignes'],
  ['Fonctions', 'fonctions'],
  ['Branches', 'branches'],
]

process.stdout.write(
  `${[
    '## Couverture des tests unitaires, d’intégration et Cucumber',
    '',
    '| Mesure | Taux | Couvertes | Total |',
    '| --- | --- | --- | --- |',
    ...MESURES.map(
      ([titre, mesure]) =>
        `| ${titre} | ${taux(totaux[mesure])} % | ${totaux[mesure].couverts} | ${totaux[mesure].total} |`,
    ),
  ].join('\n')}\n`,
)
