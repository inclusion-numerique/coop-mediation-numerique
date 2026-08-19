import crypto from 'node:crypto'
import { signatureValide } from './verifier-signature'

const SECRET = 'secret-partage'

const corpsBrut = JSON.stringify({
  data: { id: 42 },
  meta: { model: 'Rdv', event: 'updated' },
})

const signerAvec = (secret: string, contenu: string) =>
  crypto.createHmac('sha256', secret).update(contenu, 'utf8').digest('hex')

describe('signature d’une notification RDV Service Public', () => {
  it('accepte une signature calculée avec le secret partagé', () => {
    expect(
      signatureValide({
        corpsBrut,
        signature: signerAvec(SECRET, corpsBrut),
        secret: SECRET,
      }),
    ).toBe(true)
  })

  it('refuse une signature calculée avec un autre secret', () => {
    expect(
      signatureValide({
        corpsBrut,
        signature: signerAvec('autre-secret', corpsBrut),
        secret: SECRET,
      }),
    ).toBe(false)
  })

  it('refuse un corps modifié après signature', () => {
    expect(
      signatureValide({
        corpsBrut: corpsBrut.replace('42', '43'),
        signature: signerAvec(SECRET, corpsBrut),
        secret: SECRET,
      }),
    ).toBe(false)
  })

  it('refuse une notification sans signature', () => {
    expect(
      signatureValide({ corpsBrut, signature: null, secret: SECRET }),
    ).toBe(false)
  })

  // Une comparaison à temps constant lève sur des longueurs inégales : le cas
  // doit être écarté avant, pas propagé en exception.
  it('refuse une signature tronquée sans lever', () => {
    expect(
      signatureValide({
        corpsBrut,
        signature: signerAvec(SECRET, corpsBrut).slice(0, 10),
        secret: SECRET,
      }),
    ).toBe(false)
  })

  // Sans secret configuré, aucune signature ne peut être vérifiée : refuser est
  // la seule réponse sûre — accepter reviendrait à rouvrir la route.
  it('refuse tout quand aucun secret n’est configuré', () => {
    expect(
      signatureValide({
        corpsBrut,
        signature: signerAvec('', corpsBrut),
        secret: '',
      }),
    ).toBe(false)
  })
})
