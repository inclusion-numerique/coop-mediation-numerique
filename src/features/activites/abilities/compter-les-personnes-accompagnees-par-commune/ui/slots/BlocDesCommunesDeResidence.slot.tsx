import { CommunesDeResidence } from '../components/CommunesDeResidence'
import type { PersonnesParCommunePresentees } from '../presenters/personnes-par-commune.presenter'

export const BlocDesCommunesDeResidence = async ({
  residences,
}: {
  residences:
    | PersonnesParCommunePresentees
    | Promise<PersonnesParCommunePresentees>
}) => <CommunesDeResidence communes={await residences} />
