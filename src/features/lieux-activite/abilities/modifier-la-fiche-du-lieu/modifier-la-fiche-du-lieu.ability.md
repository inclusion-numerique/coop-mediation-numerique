# Fonctionnalité: Corriger la fiche d'un lieu d'activité

La fiche d'un lieu se consulte d'un bloc et se corrige section par section :
informations générales, visibilité sur la cartographie, informations pratiques,
description, services et accompagnement, modalités d'accès, publics accueillis.

## Règle: Une section enregistrée ne touche qu'à elle-même

> Le routeur tRPC réétalait la ligne entière relue avant l'écriture, ce qui
> faisait écraser une section par une autre enregistrée peu après.

### Scénario: Enregistrer les informations pratiques laisse le téléphone en place

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Quand le médiateur rattaché enregistre les informations pratiques avec un nouveau site web
* Alors le site web du lieu est le nouveau
* Et le téléphone et le courriel du lieu sont inchangés

### Scénario: Enregistrer les modalités d'accès laisse le site web en place

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Quand le médiateur rattaché enregistre les modalités d'accès sans téléphone
* Alors le site web du lieu est inchangé

## Règle: Un champ peut être vidé

> La projection legacy écrivait `undefined` pour une valeur absente, que Prisma
> ignore : le champ se réaffichait à l'identique après effacement.

### Scénario: Effacer le site web

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Quand le médiateur rattaché enregistre les informations pratiques sans site web
* Alors le lieu n'a plus de site web

## Règle: Les modalités d'accès venues de la cartographie survivent à une édition

> Le formulaire ne sait exprimer que « se présenter », « téléphoner » et
> « contacter par mail ». Les autres viennent des imports et ne lui appartiennent
> pas.

### Scénario: La prise de rendez-vous en ligne est conservée

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Quand le médiateur rattaché enregistre les modalités d'accès sans téléphone
* Alors le lieu propose toujours la prise de rendez-vous en ligne

## Règle: N'importe quel utilisateur de la coop peut corriger n'importe quelle fiche

> Choix délibéré, et non un oubli de contrôle : l'annuaire est tenu en commun.
> Un médiateur qui travaille régulièrement avec un lieu voisin sans y exercer
> constate un horaire faux ; il le corrige depuis la fiche, sans passer par
> quiconque. Ce scénario existe pour que la règle reste lisible et qu'on ne la
> « répare » pas un jour en croyant boucher une faille.

### Scénario: Un médiateur qui n'exerce pas dans ce lieu corrige tout de même la fiche

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Quand un médiateur étranger au lieu enregistre la description
* Alors la description du lieu est enregistrée

## Règle: La fiche dit combien d'autres médiateurs exercent dans le lieu

> Une fiche modifiée vaut pour tous les médiateurs qui y exercent. En 2026, une
> permanence en mairie a été transformée en maison départementale par une
> conseillère du Département, emportant les 1 396 activités d'une autre
> conseillère rattachée au même lieu. La fiche prévient donc que d'autres
> personnes travaillent sur ce lieu. L'écran des informations générales demande
> en plus de cocher une confirmation avant d'enregistrer : c'est un garde-fou
> d'écran, pas une règle de l'enregistrement, qui reste ouvert à tous comme le
> dit la règle précédente.

### Scénario: Le médiateur seul dans son lieu ne le voit pas partagé

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Quand le médiateur rattaché consulte la fiche du lieu
* Alors la fiche compte 0 autre médiateur et 0 activité

### Scénario: Un médiateur étranger au lieu voit qu'un autre y exerce

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Quand un médiateur étranger au lieu consulte la fiche du lieu
* Alors la fiche compte 1 autre médiateur et 0 activité

### Scénario: Un médiateur qui a quitté le lieu n'est plus compté

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Et ce médiateur a quitté ce lieu
* Quand un médiateur étranger au lieu consulte la fiche du lieu
* Alors la fiche compte 0 autre médiateur et 0 activité

## Règle: Une fiche supprimée ne se consulte plus

### Scénario: Le lieu supprimé est introuvable

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Quand ce lieu est supprimé
* Alors la fiche du lieu est introuvable

## Règle: L'immatriculation d'un lieu survit à l'enregistrement de ses informations générales

> Le formulaire ne rangeait dans sa saisie que les immatriculations en forme de
> RNA : le SIRET choisi dans l'Annuaire des entreprises n'y figurait pas, et
> l'enregistrement l'effaçait — avec le nom d'usage, qui n'a plus d'objet sans
> immatriculation.
>
> Un SIRET vient TOUJOURS de l'Annuaire, seul à pouvoir l'attester, et il emporte
> le nom et l'adresse de l'établissement. À défaut de SIRET, le nom se saisit
> librement. Dans les deux cas l'adresse est reconnue par la Base Adresse
> Nationale.

### Scénario: Le SIRET choisi dans l'Annuaire est enregistré

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Quand le médiateur rattaché enregistre les informations générales avec un établissement de l'Annuaire
* Alors le lieu porte le SIRET de cet établissement
* Et le lieu porte le nom d'usage saisi

### Scénario: Déclarer qu'il n'y a pas de SIRET

* Étant donné une fiche de lieu immatriculée
* Quand le médiateur rattaché enregistre les informations générales en déclarant l'absence de SIRET
* Alors le lieu n'a plus d'immatriculation
* Et le lieu n'a plus de nom d'usage
* Et le nom du lieu est celui qui a été saisi

## Règle: On ne retire pas le dernier service d'un lieu visible

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

### Scénario: Rendre visible un lieu qui annonce un service

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Quand le médiateur rattaché rend le lieu visible sur la cartographie
* Alors le lieu est visible sur la cartographie

### Scénario: Rendre visible un lieu sans service lui donne un socle

* Étant donné une fiche de lieu sans service
* Quand le médiateur rattaché rend le lieu visible sur la cartographie
* Alors le lieu est visible sur la cartographie
* Et le lieu annonce les services du socle

### Scénario: Une autre section s'enregistre sans parler des services

> Le message des services manquants remontait sur toutes les sections, alors que
> celle qui les porte vient en avant-dernier.

* Étant donné une fiche de lieu sans service
* Quand le médiateur rattaché modifie la description du lieu
* Alors la modification est acceptée

### Scénario: Retirer le dernier service d'un lieu visible est refusé

* Étant donné une fiche de lieu visible sur la cartographie
* Quand le médiateur rattaché retire tous les services
* Alors la modification est refusée
* Et le lieu annonce toujours son service

## Règle: Un lieu ne se partage qu'avec une adresse reconnue par la Base Adresse Nationale

> La cartographie envoie des usagers à une adresse : elle doit exister. Une
> adresse que la Base Adresse Nationale ne reconnaît pas — saisie avant que le
> sélecteur ne l'impose, ou retirée par la reprise des données faute d'avoir pu
> la retrouver — ne se partage pas. La fiche l'annonce, et le partage se
> débloque dès qu'une adresse est choisie dans la liste proposée.
>
> La garde ne porte que sur le partage : retirer un lieu de la cartographie
> reste toujours possible. Un lieu situé à la seule commune, lui, se partage :
> c'est une réponse de la Base Adresse Nationale, si pauvre soit-elle.

### Scénario: Rendre visible un lieu sans adresse reconnue est refusé

* Étant donné une fiche de lieu sans adresse reconnue par la Base Adresse Nationale
* Quand le médiateur rattaché rend le lieu visible sur la cartographie
* Alors la modification est refusée
* Et le lieu n'est pas visible sur la cartographie

### Scénario: Retirer de la cartographie un lieu sans adresse reconnue reste possible

* Étant donné une fiche de lieu visible sans adresse reconnue par la Base Adresse Nationale
* Quand le médiateur rattaché retire le lieu de la cartographie
* Alors la modification est acceptée

### Scénario: Un lieu situé à la seule commune se partage

* Étant donné une fiche de lieu située à la seule commune
* Quand le médiateur rattaché rend le lieu visible sur la cartographie
* Alors le lieu est visible sur la cartographie

## Règle: Chaque enregistrement se répercute au registre de l'Entrepôt

> Les deux écritures tiennent dans une seule transaction. Une section n'y écrit
> que ses propres colonnes, comme côté coop — à ceci près que le registre range
> en un seul `jsonb` ce que la coop tient en trois colonnes : enregistrer le site
> web y réécrit le contact entier, reconstruit depuis la fiche à jour.

### Scénario: Le site web enregistré paraît au registre sans emporter le reste du contact

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Quand le médiateur rattaché enregistre les informations pratiques avec un nouveau site web
* Alors le registre porte le nouveau site web, le téléphone et le courriel du lieu

### Scénario: Une section muette sur le contact ne le touche pas

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Quand le médiateur rattaché modifie la description du lieu
* Alors le registre porte la description du lieu
* Et le registre porte toujours le site web d'origine

### Scénario: Une inscription venue d'ailleurs passe à la coop dès qu'elle en porte les valeurs

> `source` dit d'où viennent les données qu'on lit dans l'inscription. Une fiche
> qui annoncerait `dora` en portant ce que le médiateur vient d'enregistrer
> tromperait ses lecteurs. Ce que la fiche était avant reste lisible dans la coop.

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Et cette fiche est déjà inscrite au registre sous la source « dora »
* Quand le médiateur rattaché modifie la description du lieu
* Alors le registre attribue l'inscription à la coop

### Scénario: Une inscription qu'une autre source avait éteinte revient à la vie

> Quelqu'un tient cette fiche à jour dans la coop : le lieu existe. Laisser
> l'inscription éteinte reviendrait à écrire dans une ligne que plus aucun
> consommateur ne lit — une modification sans effet, et sans rien pour le dire
> au médiateur qui vient de la faire.

* Étant donné une fiche de lieu avec un site web, un téléphone et un courriel
* Et cette fiche est inscrite au registre, mais une autre source l'y a supprimée
* Quand le médiateur rattaché modifie la description du lieu
* Alors le registre ne dit plus cette inscription supprimée
