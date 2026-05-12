export interface CookingStep {
  id: number;
  description: string[];
  image: string;
}

export interface Ingredient {
  item: string;
  amount: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  heroImage: string;
  prepTime: string;
  difficulty: "Easy" | "Medium" | "Pro";
  ingredients: Ingredient[];
  steps: CookingStep[];
}