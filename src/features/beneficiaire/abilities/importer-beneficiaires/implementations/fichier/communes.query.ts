import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { once } from 'lodash-es'
import { staticFile } from '@/libraries/chemins/static-directory'

export type Commune = {
  codeInsee: string
  nom: string
  codePostal: string // Can be multiple, comma separated
}

const filePath = staticFile('communes.csv')

const createCommuneReadline = () => {
  const fileStream = createReadStream(filePath)
  const readline = createInterface({
    input: fileStream,
    crlfDelay: Number.POSITIVE_INFINITY, // Recognize all instances of CR LF ('\r\n') in input as a single line break
  })
  return readline
}

const parseCommuneCsvLine = (line: string): Commune => {
  const [codeInsee = '', nom = ''] = line.split(',', 2)
  return {
    codeInsee,
    nom,
    codePostal: line.slice(codeInsee.length + nom.length + 2),
  }
}

// CodeInsee, Commune, CodePostal
type SerializedCommune = [string, string, string]

const chargerLesCommunes = once(
  async (): Promise<ReadonlyMap<string, SerializedCommune>> =>
    new Map(
      (await Array.fromAsync(createCommuneReadline()))
        .map(parseCommuneCsvLine)
        .map((commune): [string, SerializedCommune] => [
          commune.codeInsee,
          [commune.codeInsee, commune.nom, commune.codePostal],
        ]),
    ),
)

const cleanupCommuneCodePostal = (commune: Commune) => {
  if (commune.codePostal.startsWith('"') && commune.codePostal.endsWith('"')) {
    commune.codePostal = commune.codePostal.slice(1, -1).trim() // Remove quotes and trim whitespace
  }
  return commune
}

export const clientDesCommunes = async () => {
  const communeMap = await chargerLesCommunes()

  return {
    findCommuneByInsee: (code: string): Commune | null => {
      const commune = communeMap.get(code)
      if (!commune) {
        return null
      }
      return cleanupCommuneCodePostal({
        codeInsee: commune[0],
        nom: commune[1],
        codePostal: commune[2],
      })
    },
  }
}
