import { IdentiteEmployeuse } from '@/features/employeuse/domain/identite-employeuse'
import type { SiretApiResponse } from '@/features/employeuse/implementations/api-entreprise/siret.payload'
import type { EtablissementSirene } from '../../domain/etablissement-sirene'

const ABSENCE_SERIALISEE = 'null'

const ETAT_FERME = 'F'

const voieDe = ({
  numero_voie,
  indice_repetition_voie,
  type_voie,
  libelle_voie,
  complement_adresse,
}: SiretApiResponse['data']['adresse']): string | null =>
  [
    numero_voie,
    indice_repetition_voie,
    type_voie,
    libelle_voie,
    complement_adresse,
  ]
    .filter((part) => Boolean(part) && part !== ABSENCE_SERIALISEE)
    .join(' ') || null

export const etablissementSireneDepuis = ({
  siret,
  etat_administratif,
  unite_legale: { personne_morale_attributs },
  adresse,
}: SiretApiResponse['data']): EtablissementSirene =>
  etat_administratif === ETAT_FERME
    ? { _tag: 'Ferme' }
    : {
        _tag: 'Ouvert',
        identite: IdentiteEmployeuse.safe({
          siret,
          denomination: personne_morale_attributs?.raison_sociale ?? null,
          adresse: {
            voie: voieDe(adresse),
            commune: adresse.libelle_commune ?? '',
            codePostal: adresse.code_postal || null,
            codeInsee: adresse.code_commune || null,
          },
        }),
      }
