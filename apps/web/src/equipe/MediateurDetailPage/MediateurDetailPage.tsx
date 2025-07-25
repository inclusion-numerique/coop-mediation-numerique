import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import Contract from '@app/web/components/conseiller-numerique/Contract'
import { ReferentStructure } from '@app/web/components/structure/ReferentStructure'
import { StructureEmployeuse } from '@app/web/components/structure/StructureEmployeuse'
import { AlerteFinContrat } from '@app/web/conseiller-numerique/getContractInfo'
import { contentId, defaultSkipLinks } from '@app/web/utils/skipLinks'
import type { Typologie } from '@prisma/client'
import classNames from 'classnames'
import Link from 'next/link'
import React from 'react'
import Identity from './Identity'
import { LieuxActivites } from './LieuxActivites'
import { Statistiques } from './Statistiques'

export const MediateurDetailPage = ({
  id,
  user,
  conseillerNumerique,
  statistiques,
  structureEmployeuse,
  contract,
  lieuxActivites,
  href,
  coordinateurView = false,
  coordinationEnd,
}: {
  id: string
  user: { name: string | null; email: string; phone: string | null }
  conseillerNumerique: { id: string; idPg: number | null } | null
  statistiques: { beneficiairesAccompagnes: number; accompagnements: number }
  structureEmployeuse: {
    id: string
    structure: {
      nom: string
      adresse: string
      commune: string
      codePostal: string
      codeInsee: string | null
      complementAdresse: string | null
      siret: string | null
      rna: string | null
      typologies: Typologie[]
      nomReferent: string | null
      courrielReferent: string | null
      telephoneReferent: string | null
    }
  } | null
  contract: {
    type: string
    start: string | null
    end: string | null
    finDeContrat: AlerteFinContrat | null
  } | null
  lieuxActivites: {
    id: string
    modification: Date
    structure: {
      id: string
      nom: string
      adresse: string
      complementAdresse?: string | null
      commune: string
      codePostal: string
      typologies: Typologie[]
      siret?: string | null
      rna?: string | null
      _count: { mediateursEnActivite: number }
    }
    creation: Date
  }[]
  href: string
  coordinationEnd?: Date
  coordinateurView?: boolean
}) => (
  <>
    <SkipLinksPortal links={defaultSkipLinks} />
    <div className="fr-container fr-container--800">
      <CoopBreadcrumbs
        parents={[{ label: 'Mon équipe', linkProps: { href } }]}
        currentPage={user.name ?? 'Médiateur'}
      />
      <main id={contentId} className="fr-mb-16w">
        <section className="fr-my-10v">
          <Identity
            {...user}
            coordinationEnd={coordinationEnd}
            mediateurId={id}
            isConseillerNumerique={conseillerNumerique?.id != null}
            href={href}
            coordinateurView={coordinateurView}
          />
        </section>
        {coordinateurView && (
          <section
            className={classNames(
              'fr-p-8v fr-border-radius--16',
              coordinationEnd == null
                ? 'fr-background-alt--brown-caramel'
                : 'fr-background-alt--grey',
            )}
          >
            <Statistiques
              mediateurId={id}
              coordinationEnd={coordinationEnd}
              {...statistiques}
            />
          </section>
        )}
        {coordinateurView && conseillerNumerique?.id != null && contract && (
          <section className="fr-mt-6v">
            <Contract
              isCoordinateur={false}
              {...contract}
              idPGConum={conseillerNumerique.idPg}
            />
          </section>
        )}
        {structureEmployeuse != null && (
          <section className="fr-mt-6v">
            <StructureEmployeuse
              isLieuActivite={false}
              id={structureEmployeuse.id}
              {...structureEmployeuse.structure}
            >
              {coordinateurView &&
                structureEmployeuse.structure.nomReferent != null && (
                  <>
                    <ReferentStructure {...structureEmployeuse.structure} />
                    {conseillerNumerique?.id != null && (
                      <em className="fr-text--xs fr-text-mention--grey fr-mb-0 fr-mt-6v">
                        Si vous constatez une erreur sur les informations
                        concernant cette structure, veuillez contacter le
                        support du dispositif conseiller numérique&nbsp;:&nbsp;
                        <Link href="mailto:conseiller-numerique@anct.gouv.fr">
                          conseiller-numerique@anct.gouv.fr
                        </Link>
                      </em>
                    )}
                  </>
                )}
            </StructureEmployeuse>
          </section>
        )}
        <section className="fr-mt-6v">
          <LieuxActivites
            lieuxActivites={lieuxActivites}
            mediateurId={id}
            coordinateurView={coordinateurView}
          />
        </section>
      </main>
    </div>
  </>
)
