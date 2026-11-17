/* =========================================================
   À COMPLÉTER : toutes les informations modifiables du site
   (coordonnées, WhatsApp, carte, photos, véhicules)
   ========================================================= */
window.GE_CONFIG = {
  adresse: "Mamelles oasis lot 646, Dakar, Sénégal",
  telephones: ["+221 77 614 82 11", "+221 77 874 49 18"], 
  email: "contact@good-entrepreneur.sn",
  whatsapp: "221776148211",   // numéro international, sans « + » ni espaces
  horaires: "Lun. à sam., 8 h à 19 h",

  // Lien « Intégrer une carte » de Google Maps (valeur src de l'iframe)
  carte: "",

  // Chemins des vraies photos, ex. "img/entrepot.jpg"
  photos: {
    "accueil-centrale": "img/accueil-centrale-entrepot.jpg", // Unsplash (voir img/CREDITS.txt)
    "accueil-vtc": "img/vehicule-renault-megane.jpg",        // photo réelle de la flotte
    "equipe": "",
    "centrale": "img/centrale-entrepot.jpg",          // Unsplash (voir img/CREDITS.txt)
    "import": "img/import-port-conteneurs.jpg",       // Unsplash (voir img/CREDITS.txt)
    "vtc": "img/vehicule-renault-megane.jpg"          // photo réelle de la flotte
  },

  // Les cinq véhicules de la flotte
  vehicules: [
    { nom: "Renault Mégane", type: "Berline", places: 4, bagages: 3, clim: true, photo: "img/vehicule-renault-megane.jpg" },
    { nom: "Citroën C4 Cactus", type: "SUV compact", places: 4, bagages: 3, clim: true, photo: "img/vehicule-citroen-c4-cactus.jpg" },
    { nom: "Véhicule 3", type: "Berline", places: 4, bagages: 3, clim: true, photo: "" },
    // photoIllustrative: true -> affiche « Photo non contractuelle » (image d'un modèle similaire)
    { nom: "Toyota RAV 4", type: "SUV",     places: 6, bagages: 4, clim: true, photo: "img/vehicule-suv-illustratif.jpg", photoIllustrative: true },
    { nom: "Véhicule 5", type: "Van",     places: 7, bagages: 6, clim: true, photo: "" }
  ]
};
