# ADR-003 : Registre des lieux de l'Entrepôt

## Auteurs et historique

| Date | Auteur | Action |
|------|--------|--------|
| 2026-09-11 | Marc Gavanier | Rédaction initiale : extraction de la section « Registre des lieux de l'Entrepôt » de `CONTRIBUTING.md` |

## Statut

Accepté — double écriture en place (`feat/registre-lieux-main`).

## Contexte

`coop.lieu_inclusion` garde la vérité de la coop. `main.lieu_inclusion_registre`, possédé par
l'Entrepôt, porte la vérité servie à tous les autres consommateurs (Mon Inclusion Numérique, API de
la carte nationale, data.gouv) : `main.lieu_inclusion` en est une projection directe.

`coop` et `main` sont deux schémas d'une même base, atteints par un même client Prisma. Un
rattrapage quotidien existe côté Entrepôt, mais il ne couvre que l'**identité** du lieu — pas ses
champs métier. Sans écriture explicite dans le registre, une valeur métier corrigée côté coop reste
donc invisible pour les consommateurs.

## Décision

### Double écriture applicative, en une seule transaction

L'application écrit dans `coop.lieu_inclusion` et dans `main.lieu_inclusion_registre` dans **une
seule transaction**. Le code vit dans
`apps/web/src/features/lieux-activite/implementation/prisma/registre/`.

### Le compilateur tient les colonnes, pas la documentation

Les colonnes du registre ouvertes au rôle `coop` sont tenues à deux endroits, et à deux seulement :

- les `GRANT` PostgreSQL posés par l'Entrepôt — une écriture sur une colonne fermée
  (`updated_at_carto`, `updated_at_min`, `mediateurs_en_activite`, `emplois`… alimentées par
  d'autres producteurs) est refusée par la base ;
- le type `ColonnesDuRegistre` (`…/registre/lieu.registre.transfer.ts`), qui exclut ces colonnes et
  fait échouer la compilation avant la base.

Aucune liste de colonnes n'est recopiée en markdown : elle dériverait à la première colonne ajoutée.

### Les dates disent la vérité

`updated_at_coop` reflète une modification **réelle** du contenu. On ne bumpe jamais
`coop.lieu_inclusion.modification` ni `updated_at_coop` en masse sans changement de valeur : ces
dates arbitrent la fraîcheur entre sources côté Entrepôt.

`main.lieu_inclusion_registre.updated_at` est une colonne **générée**
(`GREATEST(updated_at_carto, updated_at_coop, updated_at_min)`) : on ne l'écrit jamais.

### Adresses : mutualisées, jamais modifiées en place

`main.adresse` est partagée avec les autres producteurs. On appelle
`main.trouver_ou_creer_adresse_lieu` et on repointe `adresse_id` ; on ne modifie jamais une adresse
existante en place.

### Périmètre d'écriture

Rien d'autre : aucune écriture dans `main.lieu_appariement` ni dans les autres tables `main.*` des
lieux.

### Une dérogation assumée

Le job `normalize-sirets` efface `coop.lieu_inclusion.siret` sans toucher
`main.lieu_inclusion_registre.siret_a_l_enrichissement`, qui garde sa valeur jusqu'à la prochaine
édition de la section « Informations générales ». Ce SIRET n'est qu'une entrée déclarative pour
l'enrichissement ; le SIRET canonique est celui de la `structure_administrative` associée.

### Règle opératoire

> **Tout script SQL, backfill ou migration qui touche `coop.lieu_inclusion` en dehors de
> l'application doit passer par l'application, ou être signalé à l'équipe Dataspace.**

Un backfill se fait dates inchangées, et se signale.

## Alternatives écartées

### Un trigger PostgreSQL ou une réplication vers `main`

L'adoption d'une inscription déjà présente dans le registre est une **logique applicative**
(corrélation, arbitrage de la ligne existante). Un trigger la contourne et casse cette adoption. La
double écriture applicative garde la décision là où elle est décidable.

### S'en remettre au rattrapage quotidien de l'Entrepôt

Il ne couvre que l'identité du lieu. Les champs métier (services, horaires, présentation, contact…)
resteraient sur leur ancienne valeur chez tous les consommateurs.

## Conséquences

- Une correction passée en SQL direct laisse le référentiel sur l'ancienne valeur, et les
  consommateurs avec : d'où la règle opératoire ci-dessus.
- Un bump de dates en masse fausse durablement les arbitrages de fraîcheur entre sources — celui des
  6 et 7 juillet 2026, sur 12 086 lieux, produit encore ses effets.
- Ouvrir une nouvelle colonne du registre à l'écriture demande deux gestes : un `GRANT` côté
  Entrepôt, et son ajout dans `ColonnesDuRegistre`.

## Références

- `apps/web/src/features/lieux-activite/implementation/prisma/registre/`
- `docs/runbook-migrations-entrepot.md`
