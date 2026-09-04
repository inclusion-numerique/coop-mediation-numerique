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
