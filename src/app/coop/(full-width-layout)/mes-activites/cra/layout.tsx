import type { PropsWithChildren } from 'react'
import { rechercherStructureEmployeuseAction } from '@/app/_actions/employeuse/rechercher-structure-employeuse.action'
import { renseignerStructureEmployeuseAction } from '@/app/_actions/employeuse/renseigner-structure-employeuse.action'
import { RECHERCHER_UNE_STRUCTURE_EMPLOYEUSE_ACTION_KEY } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/rechercher-une-structure-employeuse.key'
import { RENSEIGNER_STRUCTURE_EMPLOYEUSE_ACTION_KEY } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/renseigner-structure-employeuse.key'
import { ClientBinder } from '@/libraries/nextjs/injection'

const Layout = ({ children }: PropsWithChildren) => (
  <ClientBinder
    bind={RENSEIGNER_STRUCTURE_EMPLOYEUSE_ACTION_KEY}
    to={renseignerStructureEmployeuseAction}
  >
    <ClientBinder
      bind={RECHERCHER_UNE_STRUCTURE_EMPLOYEUSE_ACTION_KEY}
      to={rechercherStructureEmployeuseAction}
    >
      {children}
    </ClientBinder>
  </ClientBinder>
)

export default Layout
