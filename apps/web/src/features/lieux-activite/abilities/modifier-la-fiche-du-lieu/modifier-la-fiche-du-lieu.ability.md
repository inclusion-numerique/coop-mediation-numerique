# Feature: Corriger la fiche d'un lieu d'activité

La fiche d'un lieu se consulte d'un bloc et se corrige section par section :
informations générales, visibilité sur la cartographie, informations pratiques,
description, services et accompagnement, modalités d'accès, publics accueillis.

## Rule: Une section enregistrée ne touche qu'à elle-même

> Le routeur tRPC réétalait la ligne entière relue avant l'écriture, ce qui
> faisait écraser une section par une autre enregistrée peu après.

### Scenario: Enregistrer les informations pratiques laisse le téléphone en place

* Given une fiche de lieu avec un site web, un téléphone et un courriel
* When le médiateur rattaché enregistre les informations pratiques avec un nouveau site web
* Then le site web du lieu est le nouveau
* And le téléphone et le courriel du lieu sont inchangés

### Scenario: Enregistrer les modalités d'accès laisse le site web en place

* Given une fiche de lieu avec un site web, un téléphone et un courriel
* When le médiateur rattaché enregistre les modalités d'accès sans téléphone
* Then le site web du lieu est inchangé

## Rule: Un champ peut être vidé

> La projection legacy écrivait `undefined` pour une valeur absente, que Prisma
> ignore : le champ se réaffichait à l'identique après effacement.

### Scenario: Effacer le site web

* Given une fiche de lieu avec un site web, un téléphone et un courriel
* When le médiateur rattaché enregistre les informations pratiques sans site web
* Then le lieu n'a plus de site web

## Rule: Les modalités d'accès venues de la cartographie survivent à une édition

> Le formulaire ne sait exprimer que « se présenter », « téléphoner » et
> « contacter par mail ». Les autres viennent des imports et ne lui appartiennent
> pas.

### Scenario: La prise de rendez-vous en ligne est conservée

* Given une fiche de lieu avec un site web, un téléphone et un courriel
* When le médiateur rattaché enregistre les modalités d'accès sans téléphone
* Then le lieu propose toujours la prise de rendez-vous en ligne

## Rule: N'importe quel utilisateur de la coop peut corriger n'importe quelle fiche

> Choix délibéré, et non un oubli de contrôle : l'annuaire est tenu en commun.
> Un médiateur qui travaille régulièrement avec un lieu voisin sans y exercer
> constate un horaire faux ; il le corrige depuis la fiche, sans passer par
> quiconque. Ce scénario existe pour que la règle reste lisible et qu'on ne la
> « répare » pas un jour en croyant boucher une faille.

### Scenario: Un médiateur qui n'exerce pas dans ce lieu corrige tout de même la fiche

* Given une fiche de lieu avec un site web, un téléphone et un courriel
* When un médiateur étranger au lieu enregistre la description
* Then la description du lieu est enregistrée

## Rule: Une fiche supprimée ne se consulte plus

### Scenario: Le lieu supprimé est introuvable

* Given une fiche de lieu avec un site web, un téléphone et un courriel
* When ce lieu est supprimé
* Then la fiche du lieu est introuvable

## Rule: L'immatriculation d'un lieu survit à l'enregistrement de ses informations générales

> Le formulaire ne rangeait dans sa saisie que les immatriculations en forme de
> RNA : le SIRET choisi dans l'Annuaire des entreprises n'y figurait pas, et
> l'enregistrement l'effaçait — avec le nom d'usage, qui n'a plus d'objet sans
> immatriculation.
>
> Un SIRET vient TOUJOURS de l'Annuaire, seul à pouvoir l'attester, et il emporte
> le nom et l'adresse de l'établissement. À défaut de SIRET, le nom se saisit
> librement. Dans les deux cas l'adresse est reconnue par la Base Adresse
> Nationale.

### Scenario: Le SIRET choisi dans l'Annuaire est enregistré

* Given une fiche de lieu avec un site web, un téléphone et un courriel
* When le médiateur rattaché enregistre les informations générales avec un établissement de l'Annuaire
* Then le lieu porte le SIRET de cet établissement
* And le lieu porte le nom d'usage saisi

### Scenario: Déclarer qu'il n'y a pas de SIRET

* Given une fiche de lieu immatriculée
* When le médiateur rattaché enregistre les informations générales en déclarant l'absence de SIRET
* Then le lieu n'a plus d'immatriculation
* And le lieu n'a plus de nom d'usage
* And le nom du lieu est celui qui a été saisi

## Rule: On ne retire pas le dernier service d'un lieu visible

> La règle existait à la création, où tout se saisit d'un coup, et manquait à la
> modification : on pouvait créer un lieu invisible sans service, puis le rendre
> visible.
>
> Elle ne garde pourtant pas la bascule de visibilité, seulement les services.
> C'est que les sections où l'on renseigne les services ne se déplient qu'une
> fois le lieu rendu visible : refuser la bascule faute de service enfermait le
> médiateur dehors, sans aucun chemin pour satisfaire la règle. La fiche affiche
> un avertissement tant qu'aucun service n'est renseigné.
>
> Elle se mesure sur le lieu APRÈS modification, et non sur la saisie : c'est ce
> qui reste au lieu qui compte, pas ce qui a été soumis.

### Scenario: Rendre visible un lieu qui annonce un service

* Given une fiche de lieu avec un site web, un téléphone et un courriel
* When le médiateur rattaché rend le lieu visible sur la cartographie
* Then le lieu est visible sur la cartographie

### Scenario: Rendre visible un lieu sans service lui donne un socle

* Given une fiche de lieu sans service
* When le médiateur rattaché rend le lieu visible sur la cartographie
* Then le lieu est visible sur la cartographie
* And le lieu annonce les services du socle

### Scenario: Une autre section s'enregistre sans parler des services

> Le message des services manquants remontait sur toutes les sections, alors que
> celle qui les porte vient en avant-dernier.

* Given une fiche de lieu sans service
* When le médiateur rattaché modifie la description du lieu
* Then la modification est acceptée

### Scenario: Retirer le dernier service d'un lieu visible est refusé

* Given une fiche de lieu visible sur la cartographie
* When le médiateur rattaché retire tous les services
* Then la modification est refusée
* And le lieu annonce toujours son service
