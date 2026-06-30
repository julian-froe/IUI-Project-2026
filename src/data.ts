import { Recipe } from "./types";

export const recipes: Recipe[] = [
  {
    id: "steak-au-poivre",
    title: "Onyx Steak Au Poivre",
    description: "A classic French steak with a bold black peppercorn crust and a silky cream sauce.",
    heroImage: "/assets/images/steak_hero.jpg",
    prepTime: "25 MIN",
    difficulty: "Medium",
    ingredients: [
      { item: "Filet Mignon", amount: "2 Steaks" },
      { item: "Black Peppercorns", amount: "2 tbsp" },
      { item: "Heavy Cream", amount: "100ml" },
      { item: "Cognac", amount: "30ml" },
      { item: "Sea Salt", amount: "1 tsp" }
    ],
    steps: [
      {
        id: 1,
        description: [
          "Place your black peppercorns into a heavy mortar.",
          "Crush them coarsely—do not grind them to a fine powder, you want a tactile crunch.",
          "Alternatively, seal them in a plastic bag and crush with the bottom of a heavy cast-iron skillet."
        ],
        image: "/assets/images/steak_1.jpg"
      },
      {
        id: 2,
        description: [
          "Take your room-temperature Filet Mignon cuts.",
          "Aggressively press the crushed peppercorns into both flat sides of the meat.",
          "Use the palm of your hand to ensure the crust adheres completely.",
          "Season generously with sea salt right before it hits the pan."
        ],
        image: "/assets/images/steak_2.jpg"
      },
      {
        id: 3,
        description: [
          "Heat your cast-iron skillet over high heat until it just begins to smoke.",
          "Drop in a knob of butter and instantly lay the steaks down.",
          "Do not move them under any circumstances.",
          "Let them sear violently for 3 to 4 minutes per side until an impenetrable crust forms."
        ],
        image: "/assets/images/steak_3.jpg"
      },
      {
        id: 4,
        description: [
          "Remove the pan from the flame.",
          "Carefully pour in the cognac and ignite it to flambé, burning off the raw alcohol.",
          "Once the flames subside, return to low heat.",
          "Whisk in the heavy cream, scraping up the dark fond from the bottom until it reduces to a silky sauce."
        ],
        image: "/assets/images/steak_4.jpg"
      }
    ]
  },
  {
    id: "truffle-pasta",
    title: "Truffle Carbonara",
    description: "Deep, earthy truffle notes meet creamy egg-based sauce for the ultimate comfort dish.",
    heroImage: "/assets/images/carbonara_hero.jpg",
    prepTime: "15 MIN",
    difficulty: "Easy",
    ingredients: [
      { item: "Spaghetti", amount: "200g" },
      { item: "Truffle Oil", amount: "2 tsp" },
      { item: "Pecorino Romano", amount: "50g" },
      { item: "Egg Yolks", amount: "3" },
      { item: "Black Pepper", amount: "Much" }
    ],
    steps: [
      {
        id: 1,
        description: [
          "Bring a large pot of water to a rolling boil.",
          "Salt it heavily until it tastes like the sea.",
          "Drop your spaghetti in and boil it exactly one minute less than the package instructions.",
          "Aim for a perfect al dente bite."
        ],
        image: "/assets/images/carbonara_1.jpg"
      },
      {
        id: 2,
        description: [
          "Separate three egg yolks into a wide glass or metal bowl.",
          "Vigorously whisk in the finely grated Pecorino Romano.",
          "Add an unapologetic amount of cracked black pepper and the truffle oil.",
          "Whisk until it forms a thick, golden paste."
        ],
        image: "/assets/images/carbonara_2.jpg"
      },
      {
        id: 3,
        description: [
          "Using tongs, transfer the hot pasta directly from the water into the egg mixture bowl.",
          "Toss frantically to prevent the eggs from scrambling.",
          "Add half a ladle of starchy pasta water.",
          "Emulsify the fat and cheese into a glossy, perfectly suspended sauce."
        ],
        image: "/assets/images/carbonara_3.jpg"
      }
    ]
  },
  {
    id: "dark-chocolate-fondant",
    title: "Obsidian Fondant",
    description: "A dark chocolate lava cake that spills out a rich, molten heart.",
    heroImage: "/assets/images/fondant_hero.jpg",
    prepTime: "20 MIN",
    difficulty: "Pro",
    ingredients: [
      { item: "70% Dark Chocolate", amount: "100g" },
      { item: "Butter", amount: "80g" },
      { item: "Sugar", amount: "50g" },
      { item: "Eggs", amount: "2" },
      { item: "Cocoa Powder", amount: "For dusting" }
    ],
    steps: [
      {
        id: 1,
        description: [
          "Construct a bain-marie by placing a heatproof glass bowl over gently simmering water.",
          "Add the chopped 70% dark chocolate and cubed butter.",
          "Stir lazily until completely melted.",
          "Ensure the mixture is sleek and reflects light."
        ],
        image: "/assets/images/fondant_1.jpg"
      },
      {
        id: 2,
        description: [
          "In a separate container, aggressively whisk the whole eggs and sugar together.",
          "Whisk until the mixture turns pale, aerated, and ribbons down from the whisk.",
          "Gently fold the molten chocolate mixture into the eggs.",
          "Be careful to retain as much air as possible."
        ],
        image: "/assets/images/fondant_2.jpg"
      },
      {
        id: 3,
        description: [
          "Butter your ramekins and dust them heavily with cocoa powder.",
          "Fill each three-quarters full.",
          "Bake in a preheated 200°C (400°F) oven for exactly 8 to 9 minutes.",
          "The edges should be set, but the absolute center must tremble when shaken."
        ],
        image: "/assets/images/fondant_3.jpg"
      }
    ]
  },

];