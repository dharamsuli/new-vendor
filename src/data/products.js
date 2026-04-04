export const STATIC_PRODUCTS = [
  {
    sku: "NN-APL-001",
    slug: "kashmir-apples",
    title: "Kashmir Apples",
    category: "fruits",
    unit: "1 kg",
    price: 22000,
    compareAtPrice: 26000,
    stock: 45,
    shortDescription: "Crisp apples with a sweet-tart bite.",
    description:
      "Fresh Kashmir apples packed for everyday snacking, breakfast bowls, and juice blends.",
    image: "/images/products/apples.svg",
    badges: ["seasonal", "best seller"]
  },
  {
    sku: "NN-MNG-002",
    slug: "alphonso-mangoes",
    title: "Alphonso Mangoes",
    category: "fruits",
    unit: "1 dozen",
    price: 68000,
    compareAtPrice: 75000,
    stock: 18,
    shortDescription: "Rich, fragrant mangoes with dense golden pulp.",
    description:
      "Premium Alphonso mangoes selected for dessert trays, shakes, gifting, and summer specials.",
    image: "/images/products/mangoes.svg",
    badges: ["premium"]
  },
  {
    sku: "NN-BNN-003",
    slug: "farm-bananas",
    title: "Farm Bananas",
    category: "fruits",
    unit: "1 dozen",
    price: 7200,
    compareAtPrice: 9000,
    stock: 60,
    shortDescription: "Soft, sweet bananas for daily use.",
    description:
      "Naturally ripened bananas that work well for breakfast, smoothies, baby food, and quick snacks.",
    image: "/images/products/bananas.svg",
    badges: ["everyday value"]
  },
  {
    sku: "NN-ORG-004",
    slug: "nagpur-oranges",
    title: "Nagpur Oranges",
    category: "fruits",
    unit: "1 kg",
    price: 16000,
    compareAtPrice: 19000,
    stock: 28,
    shortDescription: "Juicy oranges with bright citrus flavor.",
    description:
      "Nagpur oranges known for refreshing sweetness and easy-juice segments.",
    image: "/images/products/oranges.svg",
    badges: ["vitamin c"]
  },
  {
    sku: "NN-TMT-005",
    slug: "vine-tomatoes",
    title: "Vine Tomatoes",
    category: "vegetables",
    unit: "1 kg",
    price: 6000,
    compareAtPrice: 8000,
    stock: 75,
    shortDescription: "Firm tomatoes for curry, salad, and sauce.",
    description:
      "Fresh red tomatoes sourced for daily kitchen use with balanced acidity and color.",
    image: "/images/products/tomatoes.svg",
    badges: ["kitchen staple"]
  },
  {
    sku: "NN-CRT-006",
    slug: "sweet-carrots",
    title: "Sweet Carrots",
    category: "vegetables",
    unit: "1 kg",
    price: 7800,
    compareAtPrice: 9500,
    stock: 52,
    shortDescription: "Crunchy carrots with natural sweetness.",
    description:
      "Ideal for sabzi, salads, soups, halwa, and fresh juice blends.",
    image: "/images/products/carrots.svg",
    badges: ["fresh harvest"]
  },
  {
    sku: "NN-PTT-007",
    slug: "new-potatoes",
    title: "New Potatoes",
    category: "vegetables",
    unit: "2 kg",
    price: 9000,
    compareAtPrice: 11000,
    stock: 80,
    shortDescription: "Smooth potatoes for fry, mash, and curry.",
    description:
      "Clean, uniform potatoes that cook evenly and fit both home and bulk kitchen use.",
    image: "/images/products/potatoes.svg",
    badges: ["bulk friendly"]
  },
  {
    sku: "NN-SPN-008",
    slug: "baby-spinach",
    title: "Baby Spinach",
    category: "leafy",
    unit: "250 g",
    price: 5200,
    compareAtPrice: 6500,
    stock: 34,
    shortDescription: "Tender spinach leaves for quick meals.",
    description:
      "Washed baby spinach for smoothies, dal, stir-fries, wraps, and salads.",
    image: "/images/products/spinach.svg",
    badges: ["leafy green"]
  },
  {
    sku: "NN-ONN-009",
    slug: "red-onions",
    title: "Red Onions",
    category: "vegetables",
    unit: "1 kg",
    price: 5400,
    compareAtPrice: 7000,
    stock: 90,
    shortDescription: "Sharp, versatile onions for everyday cooking.",
    description:
      "Kitchen-ready onions with strong flavor and long shelf life.",
    image: "/images/products/onions.svg",
    badges: ["essential"]
  },
  {
    sku: "NN-CCR-010",
    slug: "english-cucumbers",
    title: "English Cucumbers",
    category: "vegetables",
    unit: "500 g",
    price: 4600,
    compareAtPrice: 5900,
    stock: 40,
    shortDescription: "Hydrating cucumbers with light crunch.",
    description:
      "Best for salads, detox water, raita, and chilled summer platters.",
    image: "/images/products/cucumbers.svg",
    badges: ["hydrating"]
  },
  {
    sku: "NN-COR-011",
    slug: "fresh-coriander",
    title: "Fresh Coriander",
    category: "herbs",
    unit: "100 g",
    price: 1800,
    compareAtPrice: 2500,
    stock: 55,
    shortDescription: "Fragrant coriander bunches for garnish.",
    description:
      "Fresh coriander with bright aroma to finish curries, chaats, and chutneys.",
    image: "/images/products/coriander.svg",
    badges: ["daily add-on"]
  },
  {
    sku: "NN-LMN-012",
    slug: "juicy-lemons",
    title: "Juicy Lemons",
    category: "fruits",
    unit: "500 g",
    price: 6500,
    compareAtPrice: 7800,
    stock: 48,
    shortDescription: "Tangy lemons for seasoning and drinks.",
    description:
      "Fresh lemons for nimbu pani, marinades, salads, and kitchen prep.",
    image: "/images/products/lemons.svg",
    badges: ["kitchen staple"]
  }
];

export const STATIC_IMAGE_OPTIONS = STATIC_PRODUCTS.map((product) => ({
  label: product.title,
  image: product.image
}));
