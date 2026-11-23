import { getInscriptionEtat } from '@/features/inscription/implementations/prisma/get-inscription-etat.query'
import type { SynchroniserLaPersonne } from '@/features/inscription/implementations/prisma/synchroniser-la-personne.mutation'
import { choisirProfil } from '../domain/choisir-profil'
import { enregistrerProfilChoisi } from './prisma/enregistrer-profil-choisi.mutation'

export const choisirProfilAvec = (
  synchroniserLaPersonne: SynchroniserLaPersonne,
) =>
  choisirProfil({
    lireLEtat: getInscriptionEtat,
    enregistrerProfilChoisi: enregistrerProfilChoisi(synchroniserLaPersonne),
  })
