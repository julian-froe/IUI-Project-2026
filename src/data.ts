import { Recipe } from "./types";

export const recipes: Recipe[] = [
  {
    id: "steak-au-poivre",
    title: "Noir Steak Au Poivre",
    description: "A classic French steak with a bold black peppercorn crust and a silky cream sauce.",
    heroImage: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&q=80&w=1200",
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
        description: "Crush the black peppercorns coarsely using a mortar and pestle or a heavy pan.",
        image: "https://images.unsplash.com/photo-1590488663884-297775a6c8e9?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 2,
        description: "Press the crushed peppercorns firmly into both sides of the steaks to create a thick crust.",
        image: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 3,
        description: "Sear the steaks in a hot cast-iron skillet for 3-4 minutes per side until perfectly browned.",
        image: "https://images.unsplash.com/photo-1544022613-e87ec75aee81?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 4,
        description: "Deglaze the pan with cognac and flambé, then stir in heavy cream to finish the sauce.",
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
        description: "Boil the pasta in heavily salted water until al dente.",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 2,
        description: "Whisk together egg yolks, grated cheese, and truffle oil until smooth.",
        image: "https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 3,
        description: "Toss the pasta with the egg mixture and a splash of pasta water over low heat.",
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
        description: "Melt the dark chocolate and butter together in a bain-marie.",
        image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 2,
        description: "Whisk eggs and sugar until pale, then fold in the chocolate mixture.",
        image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800"
      },
      {
        id: 3,
        description: "Bake at 200°C for exactly 8 minutes to ensure a liquid center.",
        image: "https://images.unsplash.com/photo-1541783245831-57d69a4d5357?auto=format&fit=crop&q=80&w=800"
      }
    ]
  }
];
