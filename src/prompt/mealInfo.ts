import type {OpenAI} from 'openai';

import type {FoodCategory, MealInfo, MealPhoto, MealResponse} from '../types';

const PROMPT = `
You are my personal meal categorizer and analyst. Your objective is to
categorize the given photos of food I ate in the past 24 hours. 

## RULES

 - Each date time is associated to the photos in their respective
   order. Be sure to retain the chronological order in the response
   list.

 - Within the day there should almost always be a lunch and dinner. Remember to
   use the timestamps to help inform this category decision. Even if
   the type of food is typically lunch, if it's eaten at dinner time then
   categorize it as dinner.

 - In some scenarios if two photos are taken within a few minutes of each
   other and IMPORTANTLY, appear to be at the same place, you should combine
   those into a single Meal result. Use hints like the same table in the
   photo, sane style of plates, etc.
`;

const categories: FoodCategory[] = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Brunch',
  'Dessert',
  'Beverage',
  'Coffee',
  'Late Night',
];

const foodGroups: string[] = [
  'Fruits',
  'Vegetables',
  'Grains',
  'Protein',
  'Dairy',
  'Oils and Fats',
  'Sweets and Added Sugars',
  'Beverages',
  'Legumes',
  'Nuts and Seeds',
];

const MEAL_PROPERTIES = {
  name: {
    description: 'A name for the meal. Short and sweet',
    type: 'string',
  },
  category: {
    description:
      "The 'category' of the meal. Use the date of the photo to help you determine this along with the contents of the food.",
    type: 'string',
    enum: categories,
  },
  foodGroups: {
    description: 'A list of the food groups the meal appears to belong to.',
    type: 'array',
    items: {
      type: 'string',
      enum: foodGroups,
    },
  },
  cusineType: {
    description:
      "A list of the 'cuisine' of food in the photo, try and look close at the photo to determine this. Here are various examples: Italian, Mexican, Japanese, Chinese, Indian, Mediterranean, Korean, Thai, French, Greek, American, Vietnamese, Middle Eastern. You do not have to pick ONLY from this list.",
    type: 'array',
    items: {type: 'string'},
  },
  foodType: {
    description:
      "A list of the 'type' of food in the photo, try and look close at the photo to determine this. Here are various examples: Burrito, Sandwich, Pasta, Soup, Salad, Omelet, Pizza, Boba, Stir-fry, Sushi, Tacos, Noodles, Curry, Wrap, Dumplings, Ramen, Pancakes, Burger, Toast, Cereal, Steak, BBQ, Smoothie, Ice Cream, Cake. You do not have to pick ONLY from this list.",
    type: 'array',
    items: {type: 'string'},
  },
  notes: {
    description: 'A descriptive summary of the meal',
    type: 'string',
  },
  illustrationPrompt: {
    description:
      'A detailed, presentation-focused description of the food only. Absolutely does NOT describe any background elements, scenery, hands, people, tables, how the food is held etc. Focuses solely on the contents of the dish or drink. Does not mention if it is half-eaten. Does not include any mention of illustration styles, materials, or artistic interpretation. This description will be used to generate an image of the food only.',
    type: 'string',
  },
  photosIndexes: {
    description:
      'A list of the zero based index of the photos that contributed to this meal',
    type: 'array',
    items: {type: 'number'},
  },
} as const satisfies Record<keyof MealInfo, any>;

const SCHEMA = {
  type: 'json_schema',
  name: 'meals',
  schema: {
    $defs: {
      Meal: {
        type: 'object',
        properties: MEAL_PROPERTIES,
        required: Object.keys(MEAL_PROPERTIES),
        additionalProperties: false,
      },
    },
    type: 'object',
    properties: {
      meals: {
        type: 'array',
        items: {$ref: '#/$defs/Meal'},
      },
      healthScore: {
        type: 'number',
        description:
          'Given todays meals score the day on a scale of 0-10, 10 being a very balanced and healthy diet with well timed meals and 0 being highly unhealthy. This may be fractional',
      },
      healthSummary: {
        type: 'string',
        description: 'Summarize why you gave today the healh score given',
      },
    },
    required: ['meals', 'healthScore', 'healthSummary'],
    additionalProperties: false,
  },
} as const;

export async function processMealPhotos(
  client: OpenAI,
  photos: MealPhoto[],
): Promise<MealResponse> {
  const images = photos.map<OpenAI.Responses.ResponseInputImage>(photo => ({
    type: 'input_image',
    image_url: `data:image/jpeg;base64,${photo.image.toString('base64')}`,
    detail: 'high',
  }));
  const dates = photos.map(photo => photo.dateTaken).join('\n');

  const response = await client.responses.create({
    model: 'o4-mini',
    text: {format: SCHEMA},
    input: [
      {
        role: 'system',
        content: [{type: 'input_text', text: PROMPT}],
      },
      {
        role: 'user',
        content: [{type: 'input_text', text: dates}, ...images],
      },
    ],
  });

  return JSON.parse(response.output_text);
}
