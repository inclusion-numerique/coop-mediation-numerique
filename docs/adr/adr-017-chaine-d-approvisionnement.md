# ADR-017 : Chaîne d'approvisionnement des dépendances

## Auteurs et historique

| Date       | Auteur           | Action                                                                                                                                 |
| ---------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 2025-05-03 | Équipe du projet | Scripts d'installation limités à une liste de paquets (`onlyBuiltDependencies`, `aef966237`)                                           |
| 2025-11-28 | Équipe du projet | Quarantaine de 15 jours (`minimumReleaseAge: 21600`) et premières exclusions (`230695f31`)                                             |
| 2026-10-06 | Marc Gavanier    | Exceptions de quarantaine échues levées ; correctifs transitifs forcés par `overrides` (`6dce9dd02`)                                   |
| 2026-10-06 | Marc Gavanier    | Passage à pnpm 12 : `allowBuilds` tranche chaque script d'installation (`18db26e56`)                                                   |
| 2026-10-06 | Marc Gavanier    | Dependabot en mises à jour groupées et hebdomadaires, avec le même délai de 15 jours (`640efbc39`)                                     |
| 2026-10-07 | Marc Gavanier    | Dependabot cantonné au rôle de détecteur : les montées se font dans des PR créées à la main                                            |
| 2026-11-17 | Marc Gavanier    | gitleaks au pré-commit (`7ba3d83db`, #734)                                                                                             |
| 2026-11-17 | Marc Gavanier    | Plus de CDN : documentation de l'API servie par le composant React de Scalar (`395c1fdd6`, #736), remixicon retiré (`655406209`, #735) |
| 2026-11-17 | Marc Gavanier    | Rédaction de l'ADR a posteriori, d'après l'historique git                                                                              |

## Statut

Accepté — en place, sauf l'épinglage des actions GitHub par empreinte, qui reste à faire.

## Contexte

L'application dépend de plusieurs milliers de paquets npm, directs et transitifs. Depuis 2025, les
attaques de la chaîne d'approvisionnement npm se multiplient : comptes de mainteneurs compromis, vers
qui publient des versions piégées (Shai-Hulud). Le code malveillant s'exécute souvent dans un script
`preinstall` ou `postinstall`, dès l'installation, sur le poste de développement comme en CI.

Ces versions restent en ligne peu de temps : elles sont en général repérées et retirées en quelques
heures ou quelques jours.

D'autres portes d'entrée existent :

- un script chargé depuis un CDN au moment de la visite, sans version fixée ;
- une montée de dépendance fusionnée sans relecture ;
- un secret commité par erreur.

## Décision

### Une quarantaine de 15 jours avant toute installation

`pnpm-workspace.yaml` pose `minimumReleaseAge: 21600`, en minutes, soit 15 jours. pnpm refuse
d'installer une version publiée depuis moins longtemps. Une version piégée a le temps d'être
repérée et retirée avant d'atteindre le dépôt.

On n'abaisse jamais ce délai, même ponctuellement pour débloquer une installation. Quand un paquet
doit échapper à la quarantaine, on l'ajoute à `minimumReleaseAgeExclude`, nommément. Deux cas
justifient une exclusion :

- une bibliothèque publiée par l'ANCT depuis sa propre CI, avec attestation de provenance ;
- un paquet dont il faut une version récente, avec les paquets natifs par plateforme qu'il publie en
  même temps (`@typescript/*` avec `typescript`, `@next/*` avec `next`). Sans eux, l'installation
  échoue sur le binaire.

Une exclusion qui n'a plus de raison d'être est levée (`6dce9dd02`).

### Les scripts d'installation refusés par défaut

pnpm 12 n'exécute aucun script d'installation sans décision explicite. `allowBuilds` liste les
paquets autorisés (`true`) et ceux refusés (`false`). Un paquet qui en demande un sans figurer dans
la liste fait échouer l'installation.

Une autorisation ne s'ajoute qu'avec une raison de compilation native avérée (Prisma, esbuild,
sharp, `@swc/core`…). Un script inutile est refusé, comme celui de `vue-demi`, qui ne sert qu'à
basculer vers Vue 2 (#736).

### Les vulnérabilités transitives corrigées par `overrides`

Quand une dépendance transitive vulnérable ne se met pas à jour d'elle-même, `overrides` force la
version corrigée, bornée à la plage concernée (`"undici@<7.29.1": ^7.29.1`).

### Dependabot comme détecteur

Dependabot ouvre chaque semaine des PR groupées pour npm, les actions GitHub, OpenTofu et les images
Docker, avec le même délai de 15 jours (`cooldown`). Ses alertes de sécurité signalent les failles
connues.

Ses PR ne sont pas fusionnées. Chaque montée se fait dans une PR créée à la main, qui peut regrouper,
découper ou bloquer les montées, et passe toute la CI. Dependabot ferme sa PR quand la dépendance
est montée sur `main`. Ses workflows n'ont donc besoin d'aucun secret.

Le check `Dependency review` bloque une PR qui introduit une faille critique. Il ne bloque pas les
sévérités inférieures : la quarantaine rend souvent un correctif récent inatteignable pendant
15 jours. Le suivi complet reste aux alertes Dependabot.

### Aucun script chargé depuis un CDN

Tout le code exécuté par le navigateur vient de dépendances npm, empaquetées par Next. Il passe donc
par la quarantaine et le verrouillage du lockfile.

- La documentation de l'API était rendue par `@scalar/nextjs-api-reference`, qui charge le
  visualiseur depuis jsdelivr, sans version : la dernière publication au moment de la visite, hors
  de toute quarantaine. Le composant React de Scalar le remplace (#736). Les polices et l'agent
  servis par Scalar sont désactivés, et jsdelivr sort de la politique de sécurité du contenu.
- Les icônes remixicon venaient d'un CDN. react-dsfr fournit les mêmes icônes `ri-` (#735).

### gitleaks au pré-commit

Le hook de pré-commit lance `gitleaks git --pre-commit --staged` sur les changements indexés. Il
refuse le commit si gitleaks n'est pas installé.

### Les actions GitHub épinglées par empreinte : à faire

Au 17/11/2026, les workflows référencent les actions tierces par une étiquette de version majeure
(`actions/checkout@v7`, `cypress-io/github-action@v7`…), pas par l'empreinte d'un commit. Une
étiquette peut être déplacée vers un autre commit par qui contrôle le dépôt de l'action. L'épinglage
par empreinte, avec la version en annotation, reste à faire ; Dependabot sait mettre à jour ce
format.

## Alternatives écartées

### Abaisser la quarantaine pour débloquer une installation

Une option `--config.minimumReleaseAge=0` ponctuelle ouvre le lockfile entier à toutes les versions
récentes, pas seulement au paquet visé. L'exclusion nommée garde la protection pour tout le reste.

### Autoriser les scripts d'installation par défaut

C'est le comportement historique de npm, et le vecteur des vers npm. Une liste explicite coûte une
ligne par paquet natif.

### Fusionner les PR de Dependabot

Il faudrait donner à ses workflows les secrets de la CI, et accepter son découpage des montées. Une
PR créée à la main garde la maîtrise du découpage et de la relecture.

### Garder le CDN en le fixant par version et intégrité (SRI)

Cela protège d'une modification du fichier, pas d'une version piégée choisie au moment de la
fixer. Le script échappe toujours à la quarantaine et au lockfile, et le domaine reste ouvert dans
la politique de sécurité du contenu.

## Conséquences

### Positives

- Une version piégée retirée en moins de 15 jours n'atteint ni les postes ni la CI.
- Un paquet ne peut pas exécuter de code à l'installation sans décision explicite.
- Le navigateur n'exécute que du code issu du lockfile.
- Un secret indexé est bloqué avant le commit.

### Négatives

- Un correctif de sécurité attend lui aussi 15 jours, sauf exclusion nommée. C'est pourquoi
  `Dependency review` ne bloque que les failles critiques.
- Les montées sont manuelles : elles demandent du temps à chaque vague de Dependabot.
- La liste d'exclusions et `allowBuilds` se tiennent à la main. Une exclusion oubliée garde une
  porte ouverte.
- Une dépendance qui suit un tag mobile casse toute résolution à froid tant que sa dernière version
  a moins de 15 jours. Ce fut le cas de `typescript@next`, tiré par CDKTF jusqu'à son retrait
  (#669). La CI ne le voit pas : elle installe avec un lockfile figé.
- gitleaks doit être installé sur chaque poste, hors de pnpm.
- Tant que les actions GitHub ne sont pas épinglées par empreinte, elles échappent à la quarantaine
  et au verrouillage.

## Références

- `pnpm-workspace.yaml`
- `.github/dependabot.yml`
- `.husky/pre-commit`
- [`CONTRIBUTING.md`](../../CONTRIBUTING.md)

## ADR liés

- [ADR-010 : Styles : utilitaires du DSFR et intégration officielle de react-dsfr](./adr-010-styles-dsfr.md)
- [ADR-015 : CI sur GitHub Actions, infrastructure en HCL avec OpenTofu](./adr-015-ci-github-actions-et-opentofu.md)
