---
status: "accepted"
date: 2026-11-25
decision-makers:
  - Marc Gavanier
---

# Les imports sont bornés par l'outil

## Context and Problem Statement

L'[ADR-004](./0004-architecture-par-features-et-abilities.md) interdit les
dépendances entre features et entre abilities,
l'[ADR-007](./0007-app-ne-contient-que-le-routage.md) réduit les routes au
routage, et l'[ADR-018](./0018-seuls-les-points-d-entree-composent.md)
réserve la composition aux points d'entrée. L'[ADR-019](./0019-structure-de-src-verifiee-par-l-outil.md)
fait vérifier la structure par l'outil, mais pas ce que chaque fichier a le
droit d'importer.

Pendant la mise en conformité, Biome refusait quelques sens interdits. Il ne
voit que le chemin importé, jamais celui du fichier qui importe : « une
feature n'importe aucune autre feature » y demandait une règle par feature.
Il ne voit pas non plus le graphe : ni les cycles, ni ce qu'un fichier
atteint de proche en proche.

Une contrainte posée à un agent peut aussi le pousser à changer la règle
plutôt que le code.

## Decision Drivers

- Le plus restrictif par défaut ; chaque exception au cas par cas, au plus
  près de ce qui en a besoin : une library précise, pour un dossier précis.
- Les exceptions doivent rester relisibles par une personne.
- Une règle ne change pas sans qu'une personne l'ait validée.

## Considered Options

- dependency-cruiser, imports admis écrits par cible (option retenue)
- Les règles d'imports de Biome
- fallow
- dependency-cruiser, imports admis écrits par dossier, par feature ou par
  couche

## Decision Outcome

Option retenue : « dependency-cruiser, imports admis écrits par cible ».

dependency-cruiser vérifie le graphe des imports, en local et en CI. Chaque
zone part de l'interdiction et n'admet que ce qui est écrit.

### Des zones, chacune la plus restrictive possible

- Partout : aucun cycle, aucun import non résolu ou non déclaré, rien hors du
  code applicatif, aucun test importé par du code qui n'en est pas un.
- Les routes et les server actions n'importent que ce qu'elles composent.
- Une feature n'importe ni les routes ni une autre feature ; une ability
  n'importe pas une autre ability ; la racine d'une feature n'importe pas ses
  abilities.
- Chaque couche d'une feature n'importe que ses couches voisines admises ;
  une implémentation n'importe que sa propre technique.
- Une library n'importe que ce que sa ligne admet, et jamais une feature ni
  la configuration. Un module de configuration de même.
- Les jobs et le CLI ne composent que ce qui est admis pour eux.
- Chaque paquet sensible, client de base généré compris, n'est importé que
  dans les dossiers qui lui sont réservés, tests compris.

### Les tests ont les droits de ce qu'ils testent

Un test unitaire n'importe que ce que son unité a le droit d'importer, et
aucune fixture. Un test de composition importe toute ability de sa feature,
jamais une autre feature.

### Le code de Node n'atteint pas l'interface, le client n'atteint pas le serveur

Le code chargé par Node n'atteint, même indirectement, ni le système de
design ni une feuille de style. Un module client n'atteint, même
indirectement, ni un module serveur ni l'accès à la base.

### Un import de type obéit aux mêmes règles

Un import de type disparaît à l'exécution, mais il crée la même dépendance de
conception : il suit les mêmes règles qu'un import de valeur.

### Un socle par couche, des exceptions écrites par cible

Chaque couche admet un socle : les outils qui la définissent, comme les
outils de modélisation pour le domaine. Le reste est une exception écrite par
cible, avec la liste exacte des dossiers qui l'importent ; la config en tire
une règle par dossier. Les règles et les exceptions vivent dans des fichiers
séparés : les règles se relisent une fois, les exceptions sont des données.

### Les exceptions se relisent par familles

Une personne ne relit pas des centaines de lignes une à une. Les exceptions
se présentent par familles, avec pour chacune un verdict : admise en bloc
dans le socle d'une couche, gardée ligne à ligne pour que le couplage reste
visible, ou corrigée dans le code. Les tables se reconstruisent à partir des
seuls imports encore refusés, si bien qu'une exception devenue inutile
disparaît.

### Une règle ne change qu'avec une validation humaine

Tout changement d'une règle d'architecture, de structure ou d'imports passe
par une personne. Un agent qui veut modifier une règle doit le faire
confirmer : la confirmation est demandée par l'outil de l'agent, quel que
soit son mode. En CI, un tel changement ne peut fusionner qu'après un job
d'approbation, que seule une personne valide.

### Consequences

- Good, because chaque sens interdit de l'architecture casse la CI, cycles et
  atteintes indirectes compris.
- Good, because une exception est une donnée lisible : qui importe quoi, et
  pourquoi elle reste.
- Good, because un agent ne peut ni contourner une règle sans le dire, ni la
  changer sans qu'une personne la valide.

- Bad, because dependency-cruiser analyse le code avec l'API de TypeScript,
  que la version native de TypeScript n'offre pas : une version antérieure de
  TypeScript reste installée pour lui.
- Bad, because l'outil refuse certaines expressions régulières jugées
  dangereuses : une règle s'écrit parfois en deux motifs.
- Bad, because toute nouvelle dépendance demande une ligne de table, donc une
  validation.

### Confirmation

La commande de lint des imports tourne dans la commande de lint générale et
dans la CI ; des imports interdits posés exprès servent de contre-essai à
chaque nouvelle zone.

## Pros and Cons of the Options

### Les règles d'imports de Biome

Elles ne voient que le chemin importé. Interdire les imports entre features
demandait une règle par feature, et aucune ne voit un cycle ni une atteinte
indirecte.

### fallow

Récent, prometteur sur la détection du code mort et des dépendances, il
n'exprimait pas encore des règles par zone avec des exceptions aussi fines.
Il est à réévaluer plus tard.

### dependency-cruiser, imports admis écrits par dossier, par feature ou par couche

Par dossier, les exceptions se comptent par centaines de lignes, impossibles
à relire. Par feature ou par couche, une library admise pour un seul domaine
l'est pour tous : c'est exactement ce que la règle voulait éviter. Écrites
par cible, les lignes restent par dossier mais se relisent cible par cible.

## More Information

### Où trouver le détail

Les règles normatives sur les imports sont dans les
[conventions d'architecture des features](../../.claude/conventions/feature-architecture.md).
Les règles vérifiées sont dans la
[config de dependency-cruiser](../../.dependency-cruiser.cjs), et les imports
admis dans le [dossier de ses tables](../../.dependency-cruiser/).

### Références

- [ADR-004 : Architecture par features et abilities](./0004-architecture-par-features-et-abilities.md)
- [ADR-007 : `app/` ne contient que le routage Next](./0007-app-ne-contient-que-le-routage.md)
- [ADR-018 : Seuls les points d'entrée composent](./0018-seuls-les-points-d-entree-composent.md)
- [ADR-019 : La structure du code est vérifiée par l'outil](./0019-structure-de-src-verifiee-par-l-outil.md)
- [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)

### Historique

- 2026-11-25, Marc Gavanier : rédaction initiale de l'ADR.
