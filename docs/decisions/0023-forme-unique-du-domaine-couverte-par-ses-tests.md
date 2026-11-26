---
status: "accepted"
date: 2026-11-26
decision-makers:
  - Marc Gavanier
---

# Une forme unique du domaine, couverte entièrement par ses tests

## Context and Problem Statement

L'[ADR-004](./0004-architecture-par-features-et-abilities.md) place la
logique d'un cas d'usage dans le domaine de son ability, qui reçoit ses
dépendances par des ports ; l'[ADR-005](./0005-domaine-en-value-objects-brandes.md)
modélise ce domaine en value objects brandés ; l'[ADR-018](./0018-seuls-les-points-d-entree-composent.md)
réserve la composition aux points d'entrée. Ces décisions disent où vit la
logique, pas quelle forme elle prend.

Un inventaire des domaines, mené sur les 69 orchestrateurs de cas d'usage du
dépôt, a montré que chacun avait trouvé sa forme :

- La signature variait : deux étages ou un seul, arguments positionnels ou
  objet, primitif nu, étage sans argument, alias de signature exporté.
- Les ports étaient décrits en ligne, à côté de l'orchestrateur ou dans un
  fichier dédié, sous trois conventions de nommage.
- L'heure entrait de quatre façons : dans l'objet d'entrée, en argument
  positionnel, par un port, ou lue directement dans le domaine.
- Des dépendances avaient des valeurs par défaut, et des données de test
  vivaient dans le domaine.
- Le domaine levait et attrapait des exceptions, et une erreur était une
  classe.
- Le résultat était tantôt un succès ou un échec explicite, tantôt une union
  maison ou une valeur nue ; 18 orchestrateurs qui écrivaient ne rendaient
  rien de ce qu'ils avaient décidé d'écrire.
- Les erreurs étaient des constructeurs, des constantes, des littéraux ou des
  chaînes, et certaines étaient définies plusieurs fois dans une même feature.
- Des décisions métier restaient dans des implémentations, et des
  implémentations en appelaient d'autres.

Ces écarts rendaient chaque domaine à relire comme un cas particulier. Ils
empêchaient surtout de le tester par le haut : une décision qui part à un
port d'écriture sans revenir dans le résultat ne se vérifie qu'en espionnant
l'appel, ce que l'[ADR-008](./0008-strategie-de-tests.md) exclut. Des tests de
bas niveau compensaient, et rien ne garantissait que tout le domaine soit
exercé.

Enfin, la règle d'une seule implémentation par port, posée avec l'ADR-008
pour écarter la base en mémoire, interdisait aussi le cas où la production
choisit réellement entre deux techniques.

## Decision Drivers

- Lire n'importe quel domaine sans en apprendre la forme.
- Tester chaque décision par la valeur rendue, sans mock ni espion.
- Ce qu'un outil peut vérifier est vérifié par l'outil, pas par la relecture.
- Garder le contrat des server actions et l'interface inchangés.

## Considered Options

- Une forme unique du domaine, couverte entièrement par des tests par le haut
- Laisser chaque domaine libre de sa forme, et la relire au cas par cas
- Rendre les écritures visibles par des événements de domaine
- Mesurer la couverture du domaine avec toutes les suites de tests

## Decision Outcome

Option retenue : « Une forme unique du domaine, couverte entièrement par des
tests par le haut ». Tout orchestrateur de cas d'usage prend la même forme,
rend sa décision dans son résultat, et le domaine entier est couvert par des
tests unitaires qui l'exercent par son point d'appel le plus haut.

### Une seule signature d'orchestrateur

L'orchestrateur porte le nom de son cas d'usage. Il a deux étages : le
premier reçoit les ports, déstructurés ; le second reçoit un seul objet
d'entrée nommé, même quand il ne porte qu'un identifiant. Son type de retour
est écrit dans la signature, sans alias exporté. Aucun port optionnel, et
aucune valeur par défaut, ni dans l'orchestrateur ni ailleurs dans le
domaine : une taille de lot devient une constante du domaine, ou une entrée
si le point d'entrée la règle.

### Des ports nommés, à un seul endroit

Chaque port est un type nommé, déclaré avec les autres ports de son cas
d'usage ; un port partagé par plusieurs cas d'usage est déclaré au niveau de
la feature. Le type qui les rassemble porte le nom du cas d'usage suivi de
« Ports ».

### L'heure est une donnée de l'entrée

L'instant présent entre dans le domaine comme un champ de l'objet d'entrée ;
deux instants distincts sont deux champs. Le domaine ne lit jamais l'horloge,
et un value object qui dépend de l'année courante la reçoit en paramètre.
Seul le point d'entrée lit l'heure. Une date fausse se voit ainsi dans le
résultat, et un test fixe l'instant sans artifice.

### Ni exception, ni classe dans le domaine

Le domaine ne lève ni n'attrape d'exception, et n'a pas de classe. Un port
dont l'échec est une issue prévue par le domaine rend un échec tagué ; son
implémentation attrape l'exception du service et la traduit. Une panne
imprévue, comme une base indisponible, peut lever : le domaine ne l'attrape
jamais, et elle remonte au point d'entrée, puis à la télémétrie. Chaque issue
prévue d'un cas d'usage est alors une valeur que le test observe.

### Un résultat qui porte la décision

Tout orchestrateur rend un succès ou un échec explicite, même quand il ne
peut pas échouer. La valeur de succès porte la décision : ce que
l'orchestrateur a transmis aux ports d'écriture, sous un type nommé. Il n'y a
pas d'événement de domaine. La server action convertit ce succès vers la
forme qu'elle renvoie déjà : son contrat, l'interface et les messages
d'erreur ne changent pas.

### Des erreurs taguées, définies une fois

Une erreur est une valeur taguée, produite par un constructeur, déclarée avec
les autres erreurs de son cas d'usage, ou de sa feature quand plusieurs cas
d'usage la partagent : elle n'y est définie qu'une fois. L'union des échecs
d'un cas d'usage est déclarée au même endroit.

### Toute décision métier dans le domaine

Les implémentations lisent ou écrivent, et ne décident rien ; une
implémentation n'en branche jamais une autre, comme l'ADR-018 le pose. Le
domaine compose ses propres fonctions pures et l'orchestrateur de son cas
d'usage, jamais celui d'un autre. La configuration du fournisseur
d'authentification, qui joue le rôle d'un point d'entrée, est le seul cas
limite admis.

### Une implémentation par port, sauf choix réel de la production

Un port a une seule implémentation, sauf quand l'environnement de production
choisit entre plusieurs techniques réelles ; ce choix se fait au point
d'entrée. Il n'y a jamais d'implémentation en mémoire : les scénarios jouent
contre la vraie base, comme l'ADR-008 le pose.

### Le domaine couvert entièrement par le haut

Les tests unitaires du domaine vivent dans le domaine et l'exercent par son
point d'appel le plus haut : l'orchestrateur, sinon le constructeur ou la
fonction exportée. Les doublures des ports sont écrites à la main et sans
logique : une valeur fixe, ou l'identité. Aucun test ne vérifie seulement ce
qu'une doublure a rendu. Un test ne contient ni condition, ni boucle, ni
transformation de liste, ni variable réassignée, ni mutation ; il n'a qu'une
assertion ; ses tables de cas sont typées sans assertion de type ; ses
valeurs passent par les constructeurs du domaine.

Le domaine est couvert à 100 % en lignes, branches, fonctions et
instructions, et un seuil du lanceur de tests l'impose.

Ce qu'un orchestrateur passe à un port de lecture, comme un critère de
recherche ou une date de consultation, n'entre pas dans la décision : les
scénarios le vérifient contre la vraie base. Ce qu'il passe à un port
d'écriture est dans son résultat, et le test unitaire le vérifie.

### Consequences

- Good, because tous les domaines se lisent de la même façon, et un écart se
  voit à la relecture comme à l'outil.
- Good, because chaque décision se vérifie par la valeur rendue, sans
  espionner un appel, ce qui rend inutiles les tests de bas niveau qui le
  compensaient.
- Good, because une branche du domaine qu'aucun test n'exerce bloque
  l'intégration.
- Good, because un test qui fixe l'heure ou fait échouer un port n'a besoin
  que d'une valeur.

- Bad, because les orchestrateurs qui ne rendaient rien doivent nommer le
  type de leur décision, et leur server action doit la convertir.
- Bad, because l'heure lue au point d'entrée se répète dans chacun d'eux.
- Bad, because chaque port dont l'échec est une issue prévue doit attraper et
  traduire l'exception du service qu'il appelle.
- Bad, because une couverture de 100 % impose d'écrire un test pour chaque
  branche défensive, ou de la supprimer.
- Bad, because tout le code existant doit être mis dans cette forme avant
  que les règles d'outil qui la vérifient puissent être activées.

### Confirmation

Le seuil de couverture du lanceur de tests vérifie, à l'étape des tests
unitaires de l'intégration continue, que chaque fichier du domaine est
couvert entièrement. Le linter vérifie, sur le seul domaine, l'absence de
lecture de l'horloge, de classe, d'exception levée ou attrapée et de valeur
par défaut, dans tout le domaine et pas seulement dans l'orchestrateur,
ainsi que le nom du type des ports ; sur les tests du domaine, l'absence de
mock ou d'espion, de logique et d'assertion de type, et que chaque test a au
moins une assertion, jamais sous condition, sans test isolé ni sauté. Le
contrôle de structure vérifie qu'un orchestrateur, seul à porter le nom de
son cas d'usage, a ses ports à côté de lui, et qu'aucune donnée de test ne
vit dans le domaine ; il n'exige pas de fichier d'erreurs, qu'un
orchestrateur qui ne peut pas échouer n'a pas. La forme des signatures, le
contenu du résultat, la forme et la place des erreurs, l'emplacement des
décisions métier et le nombre d'assertions par test restent à la relecture.

## Pros and Cons of the Options

### Laisser chaque domaine libre de sa forme, et la relire au cas par cas

Aucune réécriture, mais chaque relecture redécouvre une forme, aucun outil ne
peut vérifier une règle qui n'existe pas, et les décisions écrites sans
revenir dans le résultat restent intestables sans espion.

### Rendre les écritures visibles par des événements de domaine

Chaque orchestrateur aurait émis des événements décrivant ses écritures. Les
écritures deviennent observables, mais il faut un mécanisme de publication et
de consommation que rien d'autre dans le dépôt n'utilise ; rendre la décision
dans le résultat suffit.

### Mesurer la couverture du domaine avec toutes les suites de tests

Les scénarios et les tests d'intégration exercent aussi le domaine, et
l'[ADR-022](./0022-couverture-agregee-et-publiee.md) additionne déjà leurs
couvertures. Mais une branche atteinte seulement par un scénario n'est pas
vérifiée par une assertion sur sa valeur, et ces suites tournent sur une base
jetable, loin du retour rapide des tests unitaires.

## More Information

### Où trouver le détail

Les règles normatives, avec leurs identifiants, sont dans les sections 2, 4,
7 et 9 des
[conventions d'architecture des features](../../.claude/conventions/feature-architecture.md).
Les comportements de chaque cas d'usage sont décrits par les spécifications
des abilities, dans le [dossier des features](../../src/features/).

### Références

- [ADR-004 : Architecture par features et abilities](./0004-architecture-par-features-et-abilities.md)
- [ADR-005 : Domaine modélisé par des value objects brandés](./0005-domaine-en-value-objects-brandes.md)
- [ADR-008 : Un scénario BDD par ability, Vitest sans isolation ni mock](./0008-strategie-de-tests.md)
- [ADR-018 : Seuls les points d'entrée composent](./0018-seuls-les-points-d-entree-composent.md)
- [ADR-022 : Couverture agrégée et publiée](./0022-couverture-agregee-et-publiee.md)
- [Vitest, seuils de couverture](https://vitest.dev/config/coverage.html)
- [Biome, plugins GritQL](https://biomejs.dev/linter/plugins/)

### Historique

- 2026-11-26, Marc Gavanier : rédaction initiale de l'ADR.
