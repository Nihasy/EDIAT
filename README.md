# Ediat Garage — site de vente & back-office

Site de vente de **voitures d'occasion importées** (Hyundai, Kia, SsangYong, Daewoo…), à Antananarivo, avec un
back-office pour gérer le stock et les demandes clients. Le site ne cite aucun pays d'origine : les véhicules
peuvent venir de plusieurs pays.

**Logo** : le logo officiel « Ediat Garage » (`LOGO/LOGO.jpeg`), agrandi ×4 et détouré (`LOGO/LOGO-upscale-4x.png`,
et la version avec contour blanc pour les fonds sombres `LOGO/LOGO-upscale-4x-contour.png`). Versions du site dans
`public/brand/` : `ediat-logo.webp` (fond clair, 15 Ko), `ediat-logo-dark.webp` (contour blanc, en-tête, pied de
page, filigrane des photos), `ediat-logo-lg.webp` (grands formats). Les icônes carrées (onglet, téléphone)
gardent le monogramme EG, illisible en entier à cette taille.

**Charte** : orange `#E97135` et bleu `#00ADD7` du logo, anthracite, titres en capitales condensées (Oswald).
Style sobre : ombres légères, pas de halo ni d'effet néon, cartes qui ne se soulèvent pas au survol, animations
courtes.

## Les trois disponibilités (fonctionnement « à la Moto Import »)

| Statut | Sur le site | Infos affichées |
| --- | --- | --- |
| **Disponible au showroom** (dispo de suite) | badge vert, en tête de liste, section dédiée sur l'accueil | « Réserver un essai » |
| **En cours d'arrivage** | badge cyan, section « Bientôt à Tana » | date d'arrivée prévue (« fin novembre ») |
| **Sur commande** | badge orange, catalogue d'import | délai (45 à 75 jours par défaut) et acompte |
| **Réservé** | visible, photo grisée | « Demander un modèle similaire » |
| **Vendu** | retiré du catalogue, visible dans « Récemment vendus » | fiche toujours accessible (preuve sociale) |
| **Brouillon** | invisible (404) | — |

Un véhicule ne peut pas être mis en ligne sans au moins une photo.

## Pages publiques

Mise en page « photos d'abord », pensée pour le téléphone (inspirée des places de marché comme Autowini), vérifiée
de 320 px à 1920 px, téléphone en paysage compris.

- **Accueil** : bannière photo plein écran sous un en-tête transparent (défilement automatique avec barre de
  progression, swipe, photos chargées une diapositive à l'avance), recherche,
  pastilles de disponibilité, icônes par type de véhicule, ronds des marques (logos), rangées de véhicules à faire
  glisser (showroom, arrivage, sur commande, vendus), bannière **Ediat Facility** « Roulez aujourd'hui, payez à votre
  rythme ! » (Crédit PME PAMF), import en 4 icônes, engagements, « Récemment vendus » (dernières ventes en tête).
- **/voitures** : grille de photos en 2 colonnes sur téléphone (3 sur tablette, 4 sur grand écran), barre fixe avec
  bouton **Filtres** (panneau plein écran sur téléphone, colonne à gauche sur ordinateur), disponibilité et tri.
  Filtres : marque, type, carburant, boîte, budget, année, km, avec compteurs. Rien ne correspond → « Le faire
  importer » ou WhatsApp.
- **/voitures/kia-sportage-…-12** : galerie photo (swipe), caractéristiques, équipements, prix, « à partir de … / mois »,
  simulateur Ediat Facility, demande d'essai / de rappel, véhicules similaires à faire glisser, barre WhatsApp + appel fixée en bas
  sur mobile, données structurées Google (schema.org `Car`).
- **/sur-commande** : déroulé de l'import, formulaire de recherche personnalisée (marque, modèle, année, budget…),
  exemples du catalogue sur commande, FAQ.
- **/financement** : page Ediat Facility en partenariat avec la **PAMF** (Crédit PME), simulateur (prix, apport,
  durée → mensualité, montant emprunté, frais de dossier, coût total), demande envoyée avec la simulation.
- **/contact** : formulaire, adresse, horaires, itinéraire. Ediat Garage ne fait **pas de reprise** : aucune
  mention sur le site (les anciennes demandes de reprise restent lisibles dans le back-office).

Chaque formulaire enregistre une **demande** dans le back-office, puis propose de continuer sur WhatsApp.

- **/favoris** : les véhicules gardés avec le cœur (enregistrés dans le navigateur, sans compte) et un
  **comparatif** de 2 ou 3 véhicules (meilleur prix, plus faible kilométrage et année la plus récente en vert).

### Ergonomie (règles UI UX Pro Max)

- **Badges** : statut = couleur + icône + mot (jamais la couleur seule) ; arguments de vente (prix en baisse en %,
  coup de cœur, nouveau, faible kilométrage) au plus 1 par carte, 4 sur la fiche.
- **Chargements** : photos en fondu sur un fond animé discret ; squelettes à la forme exacte des cartes ; la carte
  ou la bannière touchée affiche un indicateur pendant l'ouverture ; le catalogue s'estompe avec « Mise à jour… »
  pendant un changement de filtre ; animations coupées si l'appareil demande moins de mouvement.
- **Navigation** : barre d'onglets en bas d'écran sur téléphone et tablette (Accueil, Véhicules, Favoris, Facility,
  WhatsApp), remplacée sur la fiche véhicule par la barre Favori / Appeler / WhatsApp ; photos en plein écran
  (swipe, flèches, vignettes, Échap) ; bouton Partager (menu de partage du téléphone, sinon copie du lien).
- **Mouvement** : transitions entre pages (fondu), photo de la carte qui « vole » jusqu'à la fiche, sections qui
  apparaissent au défilement ; tout est coupé si l'appareil demande moins de mouvement.
- **Photos** : affichées en entier (jamais recadrées) sur un fond flou de la même photo ; photos en hauteur prises
  au téléphone placées à droite dans la bannière.
- **Fenêtres** (plein écran photo, panneau Filtres) : focus gardé à l'intérieur, Échap ferme, retour au bouton
  d'ouverture ; le menu mobile se ferme d'un tap à côté.
- **iPhone** : barre d'état opaque une fois ajouté à l'écran d'accueil, barres du bas au-dessus de l'indicateur.
- Zones tactiles de 44 px, texte de 11 px minimum, icônes SVG (aucun emoji ni caractère × ‹ › dans l'interface),
  défilement doux, place de la barre de défilement réservée (pas de saut de mise en page).

Le skill est installé dans `.claude/skills/ui-ux-pro-max/` (données et guide) ; le serveur MCP 21st.dev est déclaré
dans `.mcp.json` (il lit la clé dans la variable d'environnement `API_KEY_21ST`, à créer depuis 21st.dev/mcp).

## Back-office (`/admin`)

- **Tableau de bord** : stock par statut, valeur du showroom, ventes et marge du mois, demandes à traiter.
- **Véhicules** : liste avec recherche, onglets par statut, changement de statut direct ou groupé.
  Fiche véhicule : statut, photos (ordre, photo principale), marque/modèle/version, technique, prix, ancien prix
  barré, **prix de revient et notes privés** (jamais affichés), mensualité calculée ou imposée (ex. celle de
  l'affiche), équipements en un clic. Actions : **Copier le texte Facebook** (post prêt à coller avec prix,
  mensualité, lien), copier le lien, dupliquer, supprimer. Les demandes reçues sur ce véhicule sont listées à côté.
- **Demandes** : toutes les demandes (intérêt, essai, sur commande, financement, contact) avec statut
  Nouveau / En cours / Conclu / Sans suite, note interne, bouton **Répondre sur WhatsApp** (message pré-rempli).
- **Paramètres** : WhatsApp, téléphone, adresse, horaires, lien Google Maps, bandeau d'annonce, réseaux sociaux,
  délai et acompte des commandes, réglages **Ediat Facility** (banque partenaire, produit, taux annuel, frais de
  dossier, prêt minimum et maximum, durées, apport demandé, arrondi, conditions) avec exemple de calcul.

Quitter une fiche véhicule avec des modifications non enregistrées demande une confirmation.

### Calcul de la mensualité (PAMF Crédit PME)

Même calcul que le simulateur de la PAMF (pamf.mg/simulation-pret), vérifié sur leur exemple :
15 000 001 Ar sur 36 mois → 682 096 Ar.

```
emprunté   = (prix − apport) × (1 + frais de dossier)          frais : 3 %
t          = taux annuel / 360 × 31                             taux : 32 %
mensualité = emprunté × t × (1 + t)^n / ((1 + t)^n − 1)         n = durée en mois (36 au plus)
```

Le prêt (prix − apport) doit rester entre **15 000 001 et 600 000 000 Ar** : en dessous, le véhicule n'affiche pas
de mensualité et le simulateur propose d'en parler sur WhatsApp. « À partir de … / mois » = apport minimum et durée
la plus longue, montant exact (arrondi 1 Ar, comme sur pamf.mg), sauf si une mensualité est saisie sur le véhicule.
Réglages par défaut : sans apport, 32 %/an, frais 3 %, 12 / 24 / 36 mois. Les réglages enregistrés avant le
partenariat (18 %, 6 à 24 mois) sont remplacés automatiquement (`FINANCE_VERSION` dans `src/lib/finance.ts`).

## Lancer en local

```bash
npm install
npm run dev          # http://localhost:3000 — back-office : /admin (mot de passe local : ediat)
```

En local, la base (PGlite) et les photos sont stockées dans `.data/` (jamais commité). Après une écriture directe
dans la base (script), arrêter le serveur, supprimer `.next` puis relancer pour vider le cache du site.

## Mise en ligne sur Vercel

1. **Add New → Project**, importer ce dépôt GitHub (Next.js est détecté automatiquement).
2. **Storage → Neon (Postgres)** : créer une base et la connecter au projet (ajoute `DATABASE_URL`).
3. **Storage → Blob** : créer un store et le connecter (ajoute `BLOB_READ_WRITE_TOKEN`) pour les photos.
4. **Settings → Environment Variables** : `ADMIN_PASSWORD` (long et secret), et `SITE_URL` une fois le nom de
   domaine branché (ex. `https://ediatgarage.mg`).
5. Déployer, puis aller sur `/admin/parametres` pour mettre le vrai numéro WhatsApp, l'adresse et les horaires.

Les tables sont créées automatiquement au premier chargement.

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Base Postgres (Neon). Absente en local → PGlite dans `.data/`. |
| `BLOB_READ_WRITE_TOKEN` | Stockage des photos (Vercel Blob). Absent en local → `.data/uploads/`. |
| `ADMIN_PASSWORD` | Mot de passe du back-office (obligatoire en production). |
| `ADMIN_SECRET` | Optionnel : clé de signature des sessions (sinon dérivée du mot de passe). |
| `SITE_URL` | Adresse publique (liens partagés, sitemap, adresses canoniques Google). À mettre dès que le nom de domaine est branché. |
| `GOOGLE_SITE_VERIFICATION` | Code de la balise HTML de Google Search Console. |
| `NEXT_PUBLIC_GOOGLE_TAG_ID` | Balise Google : `G-…` (Analytics 4) ou `AW-…` (Google Ads). Absente → aucun script Google. |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | `AW-…`, si la balise principale est GA4. |
| `NEXT_PUBLIC_GOOGLE_ADS_LEAD` | `AW-…/libellé` : conversion « demande envoyée » (tous les formulaires). |
| `NEXT_PUBLIC_GOOGLE_ADS_CONTACT` | `AW-…/libellé` : conversion « clic WhatsApp ou appel ». |

## Référencement Google (SEO / SEA)

- **Titres et descriptions** par page, ciblés « voitures d'occasion à Antananarivo » ; adresse canonique et aperçu
  de partage (WhatsApp, Facebook) propres à chaque page (`src/lib/seo.ts`, `pageMeta`).
- **Pages indexées** : accueil, catalogue, une page par marque (`/voitures?marque=Hyundai`), par type
  (`?carrosserie=SUV`) et par disponibilité (`?dispo=showroom`), fiches véhicules, Sur commande, Financement,
  Contact. Les combinaisons de filtres, les recherches et les véhicules vendus sont exclus (`noindex`).
- **Sitemap** (`/sitemap.xml`) : ces pages + chaque véhicule en vente avec ses photos ; vendus exclus.
- **Données structurées** : `AutoDealer` (garage : adresse, téléphone, logo, réseaux) et `WebSite` sur toutes les
  pages, `Car` + `Offer` (prix, état, vendeur) et fil d'Ariane sur chaque fiche.
- **Google Ads** : balise Google chargée seulement si configurée ; événements `generate_lead` (formulaire envoyé)
  et `contact` (clic WhatsApp / téléphone), avec conversions Google Ads optionnelles (`src/lib/track.ts`).
- **Mise en route** : Search Console (balise HTML → `GOOGLE_SITE_VERIFICATION`, puis soumettre `/sitemap.xml`),
  `SITE_URL` avec le vrai domaine, fiche Google Business Profile du showroom (adresse, horaires, photos).

## Tests

Recette du 21 octobre 2026 (Playwright, base locale, 62 contrôles, 0 erreur console) : connexion admin (mauvais
mot de passe refusé), réglages PAMF (taux, frais, durées, refus au-delà de 36 mois), création d'un véhicule avec
photo, parcours **sur commande → arrivage → showroom → vendu** vérifié à chaque étape côté client (listes, badges,
date d'arrivée, « Réserver un essai », retrait du catalogue, « Récemment vendus », fiche vendue en `noindex` et
hors sitemap), mensualité identique à la formule PAMF, simulateur (durées, petit montant non finançable),
formulaires fiche / financement / sur commande / contact reçus dans le back-office avec le montant emprunté,
absence de « Corée », « reprise » et « papiers en règle », pages publiques, robots, sitemap, 404, suppression du
véhicule de test. Les limites anti-abus fonctionnent (8 demandes / heure, 10 connexions / 15 min, en mémoire :
redémarrer le serveur local entre deux recettes).

Audit mobile (360 et 390 px) : aucune page ni fenêtre (menu Trier, panneau Filtres, menu, suggestions de
recherche, plein écran photo) ne dépasse de l'écran, pas de défilement horizontal, pas de texte sous 11 px.
Corrigés : menu Trier qui sortait à gauche, suggestions de recherche cachées sous la barre du bas (la recherche
remonte sous l'en-tête au toucher), engagements de l'accueil en lignes compactes, « % » jamais seul en début de
ligne, espaces de « à partir de … / mois ».

Recette précédente :

Parcours vérifiés de bout en bout (Playwright, base neuve avec 24 véhicules, 158 contrôles) : catalogue (filtres,
tris, pagination, recherche avec accents et fautes de casse, cas absurdes dans l'adresse), fiche (prix barré,
mensualité, plein écran, 404, redirections), formulaires (erreurs, champ piège anti-robots, limite de 8 demandes /
heure, textes piégés affichés en texte), demandes dans le back-office (statut, note, recherche par téléphone sous
toute forme, suppression), véhicules (validations, photos invalides, miniatures, doublons de référence, actions
groupées, duplication, suppression), paramètres (valeurs invalides, financement désactivé), favoris et comparatif
(stockage corrompu, véhicule retiré), accès protégé au back-office et blocage après 10 mauvais mots de passe.
Accessibilité et affichage contrôlés de 320 à 1920 px (axe-core, chevauchements, zones tactiles, clavier).

## Technique

Next.js 16 (App Router, Server Actions), Tailwind CSS 4, Neon Postgres / PGlite, Vercel Blob.
Le site public est servi depuis le cache (vidé immédiatement après chaque modification dans le back-office, et
sinon relu une fois par jour seulement, pour ménager le quota de cache Vercel partagé avec Moto Import) : les visiteurs ne réveillent pas la base. Photos réduites dans le navigateur
avant envoi (1600 px + miniature 720 px). Formulaires publics : champ piège anti-robots et 8 demandes / heure par
connexion. Connexion au back-office limitée à 10 essais / 15 min. En-têtes de sécurité sur toutes les pages
(`next.config.ts`) : pas d'affichage dans un autre site, pas de détection de type, adresse complète non transmise
aux sites externes, caméra / micro / position désactivés.
