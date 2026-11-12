/* =========================================================
   À COMPLÉTER : toutes les informations modifiables du site
   (coordonnées, WhatsApp, carte, photos, véhicules)
   ========================================================= */
window.GE_CONFIG = {
  adresse: "Adresse du siège social, Ville, Pays",
  telephones: ["+221 00 000 00 00", "+221 00 000 00 00"],
  email: "contact@good-entrepreneur.sn",
  whatsapp: "221000000000",   // numéro international, sans « + » ni espaces
  horaires: "Lun. à sam., 8 h à 19 h",

  // Lien « Intégrer une carte » de Google Maps (valeur src de l'iframe)
  carte: "",

  // Chemins des vraies photos, ex. "img/entrepot.jpg"
  photos: {
    "accueil-centrale": "",
    "accueil-vtc": "",
    "equipe": "",
    "centrale": "",
    "import": "",
    "vtc": ""
  },

  // Les cinq véhicules de la flotte
  vehicules: [
    { nom: "Véhicule 1", type: "Berline", places: 4, bagages: 3, clim: true, photo: "" },
    { nom: "Véhicule 2", type: "Berline", places: 4, bagages: 3, clim: true, photo: "" },
    { nom: "Véhicule 3", type: "Berline", places: 4, bagages: 3, clim: true, photo: "" },
    { nom: "Véhicule 4", type: "SUV",     places: 6, bagages: 4, clim: true, photo: "" },
   // { nom: "Véhicule 5", type: "Van",     places: 7, bagages: 6, clim: true, photo: "" }
  ]
};
