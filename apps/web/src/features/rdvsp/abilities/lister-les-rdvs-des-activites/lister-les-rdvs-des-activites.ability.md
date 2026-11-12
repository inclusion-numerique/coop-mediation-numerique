# Feature: Lister les rendez-vous des activités

> rdvsp fournit à la liste des activités les rendez-vous d'un compte RDV
> Service Public : la sélection à mêler à la chronologie, le détail des
> rendez-vous d'une page et le statut affiché des rendez-vous devenus des
> activités. Le statut « passé » n'est décidé qu'ici.

## Rule: Les rendez-vous du compte sont proposés, sauf ceux dont le compte rendu a été décliné

### Scenario: Un rendez-vous décliné n'est pas proposé

* Given un compte RDV ayant 2 rendez-vous en mars 2026
* And le compte rendu de son premier rendez-vous a été décliné
* When je sélectionne les rendez-vous du compte
* Then 1 rendez-vous est sélectionné

## Rule: Un rendez-vous échu dont la présence n'a pas été saisie est passé

### Scenario: Filtrer les rendez-vous passés

* Given un compte RDV ayant 2 rendez-vous en mars 2026
* And la présence à son second rendez-vous est honorée
* When je sélectionne les rendez-vous passés du compte
* Then 1 rendez-vous est sélectionné
* And le statut affiché de son premier rendez-vous est "passe"
* And le statut affiché de son second rendez-vous est "seen"
