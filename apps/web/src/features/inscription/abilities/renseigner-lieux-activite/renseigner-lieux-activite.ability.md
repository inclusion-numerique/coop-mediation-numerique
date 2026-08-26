# Feature: Renseigner ses lieux d’activité

## Rule: Renseigner ses lieux d’activité franchit l’étape

### Scenario: Renseigner un lieu franchit l’étape et le rattache

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité est disponible
* When je renseigne ce lieu comme lieu d’activité
* Then l’étape lieux d’activité est franchie
* And ce lieu est un de mes lieux d’activité actifs

## Rule: Renseigner remplace l’ensemble des lieux d’activité

### Scenario: Un lieu retiré de la liste est clôturé

* Given je suis un médiateur en cours d’inscription
* And j’ai déjà un lieu d’activité rattaché
* And un lieu d’activité est disponible
* When je renseigne ce lieu comme lieu d’activité
* Then l’étape lieux d’activité est franchie
* And ce lieu est un de mes lieux d’activité actifs
* And mon ancien lieu d’activité est retiré

## Rule: Un nouveau lieu (nom + adresse géocodée) est matérialisé

### Scenario: Renseigner un nouveau lieu le crée et le rattache

* Given je suis un médiateur en cours d’inscription
* When je renseigne un nouveau lieu nommé "Maison France Services"
* Then l’étape lieux d’activité est franchie
* And un lieu d’activité nommé "Maison France Services" est créé et rattaché

## Rule: L’id interne prime sur l’id de cartographie nationale

L’id de cartographie nationale n’est pas posé à la création d’un lieu : c’est le
job nightly de la carto qui, après agrégation des sources, normalisation et
déduplication, l’attribue au lieu publié puis le resynchronise dans la coop. Son
absence ne dit donc rien de l’existence du lieu, et sa présence ne prime jamais
sur l’id interne — seule identité certaine d’un lieu de la coop.

### Scenario: Un lieu de la coop est rattaché par son id, jamais par un doublon de même id carto

* Given je suis un médiateur en cours d’inscription
* And un doublon plus ancien porte un id de cartographie nationale
* And un lieu d’activité est disponible, annoté de ce même id de cartographie nationale
* When je renseigne ce lieu comme lieu d’activité
* Then l’étape lieux d’activité est franchie
* And ce lieu est un de mes lieux d’activité actifs
* And aucun autre lieu d’activité n’a été créé

### Scenario: Un lieu de la carto introuvable dans l’Entrepôt est matérialisé depuis son adresse

* Given je suis un médiateur en cours d’inscription
* When je renseigne un lieu de la cartographie nationale introuvable dans l’Entrepôt, nommé "Tiers-lieu du Marais"
* Then l’étape lieux d’activité est franchie
* And un lieu d’activité nommé "Tiers-lieu du Marais" est créé et rattaché

## Rule: Un lieu déjà présent dans la coop n’est jamais recréé

Un lieu venu de la cartographie nationale ou de l’annuaire des entreprises ne
porte pas l’id du lieu coop qui lui correspond, et l’id de cartographie
nationale ne peut pas jouer ce rôle : le lieu créé dans la coop puis publié ne
le porte pas encore. On corrèle donc sur ce qui désigne un établissement — son
SIRET dans la commune, puis son nom.

### Scenario: Un lieu de la carto que la coop connaît déjà est rattaché, pas recréé

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité est disponible
* When je renseigne ce lieu par son entrée de cartographie nationale
* Then l’étape lieux d’activité est franchie
* And ce lieu est un de mes lieux d’activité actifs
* And aucun autre lieu d’activité n’a été créé

### Scenario: Un lieu de l’annuaire des entreprises que la coop connaît déjà est rattaché, pas recréé

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité est disponible, identifié par son SIRET
* When je renseigne un lieu de l’annuaire des entreprises portant ce SIRET
* Then l’étape lieux d’activité est franchie
* And ce lieu est un de mes lieux d’activité actifs
* And aucun autre lieu d’activité n’a été créé

### Scenario: Le même nouveau lieu renseigné deux fois n’est créé qu’une fois

* Given je suis un médiateur en cours d’inscription
* When je renseigne deux fois le nouveau lieu nommé "Maison France Services"
* Then l’étape lieux d’activité est franchie
* And un seul lieu d’activité nommé "Maison France Services" est créé et rattaché

## Rule: Créer un lieu d’activité ne le crée que si la coop l’ignore

On n’arrive au formulaire de création qu’après une recherche restée sans
résultat — mais c’est une garde de l’écran, pas une preuve : rien n’empêche d’y
venir directement, ni d’y ressaisir un lieu que la recherche n’avait pas su
rendre. La corrélation reste donc le dernier rempart.

### Scenario: Créer un lieu que la coop ignore le crée et le rattache

* Given je suis un médiateur en cours d’inscription
* When je crée un lieu d’activité que la coop ignore
* Then le lieu créé est un de mes lieux d’activité actifs

### Scenario: Créer un lieu déjà connu sous une autre dénomination rattache l’existant

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité est disponible, dénommé comme une mairie
* When je crée un lieu d’activité dénommé comme la commune, à la même adresse
* Then ce lieu est un de mes lieux d’activité actifs
* And aucun autre lieu d’activité n’a été créé

## Rule: Un lieu retiré de la cartographie ne réapparaît pas par ré-inscription

Rendre un lieu visible sur la cartographie nationale se décide ; le retirer aussi.
Une suppression est un acte de modération. La ré-inscription ne doit jamais la
défaire silencieusement : un lieu supprimé n'est relevé que sur corrélation forte
(même SIRET, ou même dénomination à la même adresse), et il revient invisible de
la cartographie — la visibilité se re-décide.

### Scenario: Un lieu supprimé, corrélé fortement, est relevé mais reste invisible

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité identique a été retiré de la cartographie par la modération
* When je crée un lieu d’activité identique à ce lieu retiré
* Then le lieu créé est un de mes lieux d’activité actifs
* And ce lieu n’est pas visible sur la cartographie nationale
* And je n’ai qu’un seul lieu d’activité actif

### Scenario: Un simple homonyme ne ressuscite pas un lieu supprimé

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité supprimé porte un nom qu’un autre lieu contient
* When je crée un lieu d’activité dont le nom contient celui du lieu supprimé, à une autre adresse
* Then le lieu supprimé n’a pas été relevé
* And je n’ai qu’un seul lieu d’activité actif

## Rule: Deux antennes d’une même enseigne restent deux lieux

Une enseigne ouvre plusieurs sites dans une même commune : « LA POSTE » ou
« COMMUNE DE TOULON » y ont plusieurs adresses, chacune son SIRET. Rapprocher un
lieu de son homonyme sur le seul nom les fusionnerait et perdrait l’adresse du
lieu absorbé. En cas de doute on ne fusionne pas : un doublon se détecte et se
répare, une fusion à tort ne laisse aucune trace.

### Scenario: Un SIRET différent interdit le rapprochement

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité est disponible, identifié par son SIRET
* When je renseigne un lieu de l’annuaire des entreprises de même nom et même adresse, mais d’un autre SIRET
* Then l’étape lieux d’activité est franchie
* And un second lieu d’activité a été créé
* And je n’ai qu’un seul lieu d’activité actif

### Scenario: Un homonyme à une autre adresse reste un lieu distinct

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité est disponible
* When je crée un lieu d’activité de même nom, à une autre adresse
* Then un second lieu d’activité a été créé
* And je n’ai qu’un seul lieu d’activité actif

## Rule: Un SIRET ne fait foi que si l’on sait d’où il vient

Seuls les SIRET issus de l’API entreprise, de ProConnect ou d’une structure
administrative du schéma `main` sont fiables ; celui de la cartographie
nationale ne l’est pas. En base, cette provenance se lit sur la date de
vérification du SIRET : sans elle, le SIRET ne dit rien — ni pour rapprocher
deux lieux, ni pour les distinguer.

### Scenario: Un SIRET non vérifié ne sépare pas deux lieux par ailleurs identiques

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité est disponible, portant un SIRET de provenance inconnue
* When je renseigne un lieu de l’annuaire des entreprises de même nom et même adresse, mais d’un autre SIRET
* Then l’étape lieux d’activité est franchie
* And ce lieu est un de mes lieux d’activité actifs
* And aucun autre lieu d’activité n’a été créé

## Rule: La commune se reconnaît au-delà de son code INSEE

Paris, Lyon et Marseille sont désignées tantôt par leur code de commune, tantôt
par celui de l’arrondissement ; une commune nouvelle change de code sans
déménager. Le périmètre de recherche s’appuie donc aussi sur le code postal et
le libellé de commune. Deux villages partageant un code postal restent, eux,
deux communes distinctes.

### Scenario: Un lieu enregistré sous le code de la commune est reconnu depuis l’arrondissement

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité est disponible, enregistré sous le code INSEE de la commune
* When je crée un lieu d’activité de même nom et même adresse, sous le code INSEE de l’arrondissement
* Then ce lieu est un de mes lieux d’activité actifs
* And je n’ai qu’un seul lieu d’activité actif

### Scenario: Deux communes partageant un code postal restent distinctes

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité est disponible dans une commune voisine du même code postal
* When je crée un lieu d’activité de même nom et même adresse, dans ma commune
* Then un second lieu d’activité a été créé
* And je n’ai qu’un seul lieu d’activité actif

## Rule: Un libellé non diffusible ne désigne personne

L’INSEE rend « [Non diffusible] » pour les établissements qui refusent la
diffusion de leurs données — nom comme adresse. Deux établissements non
diffusibles ne sont pas le même : les rapprocher les fusionnerait tous.

### Scenario: Deux lieux non diffusibles ne sont pas rapprochés

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité non diffusible est disponible
* When je crée un lieu d’activité non diffusible à la même adresse
* Then un second lieu d’activité a été créé
* And je n’ai qu’un seul lieu d’activité actif

## Rule: Une adresse absente ne distingue pas deux lieux

Une employeuse de `main` sans adresse, un établissement non diffusible, un
payload de cartographie incomplet : l’adresse manque des deux côtés. Elle ne
départage alors rien, et le nom dans la commune reprend la main — sinon chaque
déclaration ajouterait une ligne. Mais une adresse absente d’un seul côté ne se
compare à rien : ce n’est pas une concordance.

### Scenario: Deux lieux sans adresse, de même nom dans la commune, n’en font qu’un

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité sans adresse est disponible
* When je crée un lieu d’activité de même nom, sans adresse
* Then ce lieu est un de mes lieux d’activité actifs
* And je n’ai qu’un seul lieu d’activité actif

### Scenario: Une adresse absente d’un seul côté ne vaut pas concordance

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité sans adresse est disponible
* When je crée un lieu d’activité de même nom, avec une adresse
* Then un second lieu d’activité a été créé
* And je n’ai qu’un seul lieu d’activité actif

## Rule: Un SIRET soumis par le navigateur n’est pas réputé vérifié

Le SIRET vient de l’annuaire des entreprises, mais il a transité par le
navigateur : le serveur ne peut pas distinguer celui que l’annuaire a rendu de
celui qu’on lui souffle. Il est donc stocké non vérifié — le job de
normalisation lui donnera sa valeur de preuve. L’horodater le dirait vérifié, et
dispenserait précisément ce job de le vérifier.

### Scenario: Le SIRET d’un lieu créé depuis l’annuaire reste à vérifier

* Given je suis un médiateur en cours d’inscription
* When je renseigne un lieu de l’annuaire des entreprises portant un SIRET
* Then l’étape lieux d’activité est franchie
* And le lieu créé porte ce SIRET, non vérifié
* And le lieu créé porte l’identifiant BAN de son adresse

## Rule: Deux libellés d’une même adresse désignent le même emplacement

L’adresse enregistrée n’est pas toujours celle que la Base Adresse Nationale
rend pour le même point : abréviations (« PL DU HUIT MAI 1945 » / « Place du
8 Mai 1945 »), complément en préfixe, numéro de voie absent d’un côté. Les
coordonnées, elles, tombent au même endroit — et la quasi-totalité des lieux en
portent. À dénomination correspondante et dans la même commune, deux points
distants de moins de cinquante mètres sont le même établissement.

### Scenario: Un lieu retrouvé par ses coordonnées malgré une adresse écrite autrement

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité est disponible, dont l’adresse est écrite en abrégé
* When je crée un lieu d’activité de même nom, à la même position mais sous l’adresse complète
* Then ce lieu est un de mes lieux d’activité actifs
* And je n’ai qu’un seul lieu d’activité actif

### Scenario: Un lieu du même nom à l’autre bout de la commune reste distinct

* Given je suis un médiateur en cours d’inscription
* And un lieu d’activité est disponible, dont l’adresse est écrite en abrégé
* When je crée un lieu d’activité de même nom, à une autre position de la commune
* Then un second lieu d’activité a été créé
* And je n’ai qu’un seul lieu d’activité actif
