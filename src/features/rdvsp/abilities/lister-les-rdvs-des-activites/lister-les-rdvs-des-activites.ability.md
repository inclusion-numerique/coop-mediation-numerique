# Fonctionnalité: Lister les rendez-vous des activités

> rdvsp fournit à la liste des activités les rendez-vous d'un compte RDV
> Service Public : la sélection à mêler à la chronologie, le détail des
> rendez-vous d'une page et le statut affiché des rendez-vous devenus des
> activités. Le statut « passé » n'est décidé qu'ici.

## Règle: Les rendez-vous du compte sont proposés, sauf ceux dont le compte rendu a été décliné

### Scénario: Un rendez-vous décliné n'est pas proposé

* Étant donné un compte RDV ayant 2 rendez-vous en mars 2026
* Et le compte rendu de son premier rendez-vous a été décliné
* Quand je sélectionne les rendez-vous du compte
* Alors 1 rendez-vous est sélectionné

## Règle: La fiche d'un bénéficiaire ne propose que les rendez-vous de son usager RDV

### Scénario: Seul le rendez-vous auquel participe l'usager est proposé

* Étant donné un compte RDV ayant 2 rendez-vous en mars 2026
* Et un usager RDV participe à son second rendez-vous
* Quand je sélectionne les rendez-vous de cet usager
* Alors 1 rendez-vous est sélectionné

### Scénario: Un bénéficiaire sans usager RDV n'a aucun rendez-vous

* Étant donné un compte RDV ayant 2 rendez-vous en mars 2026
* Quand je sélectionne les rendez-vous d'aucun usager
* Alors 0 rendez-vous est sélectionné

## Règle: Un rendez-vous échu dont la présence n'a pas été saisie est passé

### Scénario: Filtrer les rendez-vous passés

* Étant donné un compte RDV ayant 2 rendez-vous en mars 2026
* Et la présence à son second rendez-vous est honorée
* Quand je sélectionne les rendez-vous passés du compte
* Alors 1 rendez-vous est sélectionné
* Et le statut affiché de son premier rendez-vous est "passe"
* Et le statut affiché de son second rendez-vous est "seen"

## Règle: Les statistiques retrouvent les rendez-vous par leur statut

### Scénario: Seuls les rendez-vous honorés sont retrouvés pour les statistiques

* Étant donné un compte RDV ayant 2 rendez-vous en mars 2026
* Et la présence à son second rendez-vous est honorée
* Quand je retrouve les rendez-vous honorés pour les statistiques
* Alors seul son second rendez-vous est retrouvé
