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
/*
  {
    id: "charcoal-sourdough",
    title: "Ash Sourdough",
    description: "A stark black loaf featuring activated charcoal, crisp on the outside and impossibly soft within.",
    heroImage: "/assets/images/sourdough_hero.jpg",
    prepTime: "24 HRS",
    difficulty: "Pro",
    ingredients: [
      { item: "Bread Flour", amount: "500g" },
      { item: "Active Starter", amount: "100g" },
      { item: "Water", amount: "350ml" },
      { item: "Activated Charcoal", amount: "2 tbsp" },
      { item: "Sea Salt", amount: "10g" }
    ],
    steps: [
      {
        id: 1,
        description: [
          "Mix the active starter and water until it becomes milky.",
          "Add the flour and activated charcoal, blending until no dry spots remain.",
          "Let it rest for an hour for autolyse."
        ],
        image: "/assets/images/sourdough_1.jpg"
      },
      {
        id: 2,
        description: [
          "Sprinkle the salt over the dough and begin the stretch and fold process.",
          "Perform a set of stretches every 30 minutes for a total of four times.",
          "The dough should transform into a smooth, elastic, pitch-black mass."
        ],
        image: "/assets/images/sourdough_2.jpg"
      },
      {
        id: 3,
        description: [
          "Shape the dough into a tight boule and place it in a proofing basket.",
          "Cover and leave it in the refrigerator overnight for a slow, deep fermentation.",
          "The cold will enhance the tang and complexity."
        ],
        image: "/assets/images/sourdough_3.jpg"
      },
      {
        id: 4,
        description: [
          "Score the top of the dark dough with a sharp lame to guide the expansion.",
          "Bake in a preheated Dutch oven at 250°C (480°F) for 20 minutes covered, then 20 minutes uncovered.",
          "Let it cool completely before slicing."
        ],
        image: "/assets/images/sourdough_4.jpg"
      }
    ]
  },
  {
    id: "black-garlic-risotto",
    title: "Black Garlic Risotto",
    description: "Intense, umami-rich black garlic infused into perfectly al dente arborio rice.",
    heroImage: "/assets/images/risotto_hero.jpg",
    prepTime: "35 MIN",
    difficulty: "Medium",
    ingredients: [
      { item: "Arborio Rice", amount: "300g" },
      { item: "Black Garlic", amount: "1 Head" },
      { item: "Chicken Broth", amount: "1L" },
      { item: "White Wine", amount: "100ml" },
      { item: "Parmesan", amount: "60g" }
    ],
    steps: [
      {
        id: 1,
        description: [
          "Peel the dark, sticky cloves of the black garlic.",
          "Mash them into a smooth paste using the back of a knife or a mortar and pestle.",
          "In a separate saucepan, keep your chicken broth gently simmering."
        ],
        image: "/assets/images/risotto_1.jpg"
      },
      {
        id: 2,
        description: [
          "Toast the arborio rice in olive oil until the edges turn slightly translucent.",
          "Pour in the white wine and stir until it completely evaporates.",
          "The smell of the sharp alcohol fading marks the beginning of the ritual."
        ],
        image: "/assets/images/risotto_2.jpg"
      },
      {
        id: 3,
        description: [
          "Add the hot broth one ladle at a time.",
          "Stir continuously until the liquid is absorbed before adding the next.",
          "Halfway through, stir in the rich black garlic paste, watching the rice turn into a dark, glossy mixture."
        ],
        image: "/assets/images/risotto_3.jpg"
      },
      {
        id: 4,
        description: [
          "Once the rice is tender but firm to the bite, remove from the heat.",
          "Vigorously beat in the cold butter and grated Parmesan to create a creamy emulsion.",
          "Serve immediately onto warm plates."
        ],
        image: "/assets/images/risotto_4.jpg"
      }
    ]
  },
  {
    id: "squid-ink-pasta",
    title: "Midnight Linguine",
    description: "Striking black squid ink pasta tossed with fresh seafood and bright lemon zest.",
    heroImage: "/assets/images/squid_ink_hero.jpg",
    prepTime: "30 MIN",
    difficulty: "Medium",
    ingredients: [
      { item: "Squid Ink Pasta", amount: "250g" },
      { item: "Fresh Clams", amount: "500g" },
      { item: "Garlic Cloves", amount: "3" },
      { item: "Chili Flakes", amount: "1/2 tsp" },
      { item: "Lemon", amount: "1" }
    ],
    steps: [
      {
        id: 1,
        description: [
          "Boil a large pot of aggressively salted water.",
          "Drop in the jet-black squid ink linguine and cook until al dente.",
          "Reserve a cup of the dark, starchy pasta water before draining."
        ],
        image: "/assets/images/squid_ink_1.jpg"
      },
      {
        id: 2,
        description: [
          "In a large skillet, sauté thinly sliced garlic and chili flakes in olive oil until golden.",
          "Add the cleaned clams and a splash of white wine, covering immediately.",
          "Let them steam until the shells pop open."
        ],
        image: "/assets/images/squid_ink_2.jpg"
      },
      {
        id: 3,
        description: [
          "Toss the black pasta into the pan with the seafood.",
          "Add the reserved pasta water to bind the sauce, letting it coat every strand.",
          "Finish with a shower of lemon zest and fresh parsley before plating."
        ],
        image: "/assets/images/squid_ink_3.jpg"
      }
    ]
  }
  */
];