import { readdir, readFile } from 'node:fs/promises'
import { join, matchesGlob, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createCoverageMap } from '@vitest/istanbul-lib-coverage'
import { create, createContext } from '@vitest/istanbul-lib-report'
import convert from 'ast-v8-to-istanbul'
import { parseAstAsync } from 'vitest/node'
import { FICHIERS_COUVERTS, FICHIERS_EXCLUS } from './perimetre.mjs'

const [dossierV8, dossierDuRapport] = process.argv.slice(2)

const SOURCE_MAP_EN_LIGNE =
  /\/\/# sourceMappingURL=data:application\/json;base64,([A-Za-z0-9+/=]+)\s*$/

const sourceMap = (code) => {
  const trouvee = code.match(SOURCE_MAP_EN_LIGNE)
  return trouvee
    ? JSON.parse(Buffer.from(trouvee[1], 'base64').toString('utf8'))
    : undefined
}

const cheminDuDepot = (url) =>
  relative(process.cwd(), fileURLToPath(url.split('?')[0]))

const estCouvert = (chemin) =>
  FICHIERS_COUVERTS.some((motif) => matchesGlob(chemin, motif)) &&
  !FICHIERS_EXCLUS.some((motif) => matchesGlob(chemin, motif))

const AIDES_DE_TSX = new Set(['__defProp', '__name'])

const estUneAideDeTsx = (noeud) =>
  noeud.type === 'VariableDeclarator' &&
  noeud.id.type === 'Identifier' &&
  AIDES_DE_TSX.has(noeud.id.name)

const convertir = async ({ url, functions, code }) =>
  convert({
    code,
    sourceMap: sourceMap(code),
    ast: await parseAstAsync(code),
    coverage: { url, functions },
    wrapperLength: 0,
    ignoreNode: (noeud) =>
      estUneAideDeTsx(noeud) ? 'ignore-this-and-nested-nodes' : undefined,
  })

const fichiers = await readdir(dossierV8)

const scripts = (
  await Promise.all(
    fichiers.map(async (fichier) =>
      JSON.parse(await readFile(join(dossierV8, fichier), 'utf8')),
    ),
  )
).flat()

const couvertures = await Promise.all(
  scripts.filter(({ url }) => estCouvert(cheminDuDepot(url))).map(convertir),
)

const carte = couvertures.reduce((acc, couverture) => {
  acc.merge(couverture)
  return acc
}, createCoverageMap({}))

const contexte = createContext({ dir: dossierDuRapport, coverageMap: carte })

create('lcovonly', { projectRoot: process.cwd() }).execute(contexte)
create('text-summary').execute(contexte)
