import { databasePasswordSecretName } from '@app/config/secrets/databasePasswordSecretName'

describe('databasePasswordSecretName', () => {
  it('keeps the secret name of main', () => {
    expect(databasePasswordSecretName('main')).toEqual('DATABASE_PASSWORD_MAIN')
  })

  it('keeps the secret name of dev', () => {
    expect(databasePasswordSecretName('dev')).toEqual('DATABASE_PASSWORD_DEV')
  })

  it('gives each preview its own secret, named after its namespace', () => {
    expect(databasePasswordSecretName('fix-nam-japyar')).toEqual(
      'DATABASE_PASSWORD_FIX_NAM_JAPYAR',
    )
  })

  it('names the secret like an environment variable, as dotenv:from-secrets writes it to .env', () => {
    expect(databasePasswordSecretName('feat-a-zbqwsb')).toMatch(
      /^[A-Z][A-Z0-9_]*$/,
    )
  })
})
