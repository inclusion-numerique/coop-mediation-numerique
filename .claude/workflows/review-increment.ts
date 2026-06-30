export const meta = {
  name: 'review-increment',
  description:
    "Revue de conventions d'un incrément avant commit : convention-reviewer (structuré) puis vérification adversariale indépendante de chaque finding, pour éliminer les faux positifs.",
  whenToUse:
    "Avant de committer une tranche de refacto, pour une revue fiabilisée (find → verify). Args optionnel: { scope } (ex. 'main..HEAD' ; défaut = changements non commités).",
  phases: [
    { title: 'Review', detail: 'convention-reviewer sur le diff' },
    { title: 'Verify', detail: 'vérification adversariale de chaque finding' },
  ],
}

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    scope: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string', description: "ID de règle, ex. AB-1, DM-3" },
          severity: { type: 'string', enum: ['BLOCKER', 'WARN', 'INFO'] },
          target: { type: 'string', description: 'path:line ou path/' },
          finding: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['id', 'severity', 'target', 'finding', 'fix'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    real: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['real', 'reason'],
}

const scope =
  args && args.scope ? args.scope : 'les changements non commités (worktree + staged)'

phase('Review')
const review = await agent(
  `Relis le périmètre suivant et rends tes findings au format structuré : ${scope}. Applique ta procédure (lis la spec, détecte, confirme en lecture, exclus strictement §9).`,
  { agentType: 'convention-reviewer', schema: FINDINGS_SCHEMA, label: 'review' },
)

const all = (review && review.findings) || []
const toVerify = all.filter((f) => f.severity !== 'INFO')

phase('Verify')
const verified = (
  await parallel(
    toVerify.map((f) => () =>
      agent(
        `Vérification adversariale d'une violation présumée des conventions COOP (spec: .claude/conventions/feature-architecture.md).\n` +
          `Règle ${f.id} (${f.severity}) — cible ${f.target} — constat: « ${f.finding} ».\n` +
          `Lis la cible réelle et le texte de la règle ${f.id} dans la spec. La violation est-elle RÉELLE ? ` +
          `Réponds real:false si c'est un faux positif, une divergence assumée §9, ou un point hors-périmètre. En cas de doute, real:false.`,
        { schema: VERDICT_SCHEMA, label: `verify:${f.id}`, phase: 'Verify' },
      ).then((v) => ({ ...f, verdict: v })),
    )
  )
)
  .filter(Boolean)

const confirmed = verified.filter((v) => v.verdict && v.verdict.real)
const dropped = verified
  .filter((v) => !(v.verdict && v.verdict.real))
  .map((d) => ({ id: d.id, target: d.target, reason: d.verdict && d.verdict.reason }))

return {
  scope: (review && review.scope) || scope,
  counts: {
    blocker: confirmed.filter((c) => c.severity === 'BLOCKER').length,
    warn: confirmed.filter((c) => c.severity === 'WARN').length,
    dropped: dropped.length,
  },
  confirmed,
  dropped,
}
