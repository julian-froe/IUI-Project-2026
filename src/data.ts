import { Recipe } from "./types";

export const recipes: Recipe[] =[
  {
    id: "steak-au-poivre",
    title: "Noir Steak Au Poivre",
    description: "A classic French steak with a bold black peppercorn crust and a silky cream sauce.",
    heroImage: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&q=80&w=1200",
    prepTime: "25 MIN",
    difficulty: "Medium",
    ingredients:[
      { item: "Filet Mignon", amount: "2 Steaks" },
      { item: "Black Peppercorns", amount: "2 tbsp" },
      { item: "Heavy Cream", amount: "100ml" },
      { item: "Cognac", amount: "30ml" },
      { item: "Sea Salt", amount: "1 tsp" }
    ],
    steps:[
      {
        id: 1,
        description: [
          "Place your black peppercorns into a heavy mortar.",
          "Crush them coarsely—do not grind them to a fine powder, you want a tactile crunch.",
          "Alternatively, seal them in a plastic bag and crush with the bottom of a heavy cast-iron skillet."
        ],
        image: "https://images.unsplash.com/photo-1590488663884-297775a6c8e9?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 2,
        description:[
          "Take your room-temperature Filet Mignon cuts.",
          "Aggressively press the crushed peppercorns into both flat sides of the meat.",
          "Use the palm of your hand to ensure the crust adheres completely.",
          "Season generously with sea salt right before it hits the pan."
        ],
        image: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 3,
        description:[
          "Heat your cast-iron skillet over high heat until it just begins to smoke.",
          "Drop in a knob of butter and instantly lay the steaks down.",
          "Do not move them under any circumstances.",
          "Let them sear violently for 3 to 4 minutes per side until an impenetrable crust forms."
        ],
        image: "https://images.unsplash.com/photo-1544022613-e87ec75aee81?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 4,
        description:[
          "Remove the pan from the flame.",
          "Carefully pour in the cognac and ignite it to flambé, burning off the raw alcohol.",
          "Once the flames subside, return to low heat.",
          "Whisk in the heavy cream, scraping up the dark fond from the bottom until it reduces to a silky sauce."
        ],
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "truffle-pasta",
    title: "Truffle Carbonara",
    description: "Deep, earthy truffle notes meet creamy egg-based sauce for the ultimate comfort dish.",
    heroImage: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=1200",
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
        description:[
          "Bring a large pot of water to a rolling boil.",
          "Salt it heavily until it tastes like the sea.",
          "Drop your spaghetti in and boil it exactly one minute less than the package instructions.",
          "Aim for a perfect al dente bite."
        ],
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 2,
        description:[
          "Separate three egg yolks into a wide glass or metal bowl.",
          "Vigorously whisk in the finely grated Pecorino Romano.",
          "Add an unapologetic amount of cracked black pepper and the truffle oil.",
          "Whisk until it forms a thick, golden paste."
        ],
        image: "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 3,
        description:[
          "Using tongs, transfer the hot pasta directly from the water into the egg mixture bowl.",
          "Toss frantically to prevent the eggs from scrambling.",
          "Add half a ladle of starchy pasta water.",
          "Emulsify the fat and cheese into a glossy, perfectly suspended sauce."
        ],
        image: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "dark-chocolate-fondant",
    title: "Obsidian Fondant",
    description: "A dark chocolate lava cake that spills out a rich, molten heart.",
    heroImage: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&q=80&w=1200",
    prepTime: "20 MIN",
    difficulty: "Pro",
    ingredients:[
      { item: "70% Dark Chocolate", amount: "100g" },
      { item: "Butter", amount: "80g" },
      { item: "Sugar", amount: "50g" },
      { item: "Eggs", amount: "2" },
      { item: "Cocoa Powder", amount: "For dusting" }
    ],
    steps:[
      {
        id: 1,
        description: [
          "Construct a bain-marie by placing a heatproof glass bowl over gently simmering water.",
          "Add the chopped 70% dark chocolate and cubed butter.",
          "Stir lazily until completely melted.",
          "Ensure the mixture is sleek and reflects light."
        ],
        image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 2,
        description:[
          "In a separate container, aggressively whisk the whole eggs and sugar together.",
          "Whisk until the mixture turns pale, aerated, and ribbons down from the whisk.",
          "Gently fold the molten chocolate mixture into the eggs.",
          "Be careful to retain as much air as possible."
        ],
        image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 3,
        description:[
          "Butter your ramekins and dust them heavily with cocoa powder.",
          "Fill each three-quarters full.",
          "Bake in a preheated 200°C (400°F) oven for exactly 8 to 9 minutes.",
          "The edges should be set, but the absolute center must tremble when shaken."
        ],
        image: "https://images.unsplash.com/photo-1541783245831-57d69a4d5357?auto=format&fit=crop&q=80&w=800"
      }
    ]
  }
];