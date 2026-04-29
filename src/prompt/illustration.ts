import type {OpenAI} from 'openai';

const PROMPT_STYLE = `
You are an accomplished graphic designer creating simple illustrations of food
from descriptions.

The style of your drawings are cute digital illustrations in a clean,
vector-style, suitable for a digital icon. You use bold outlines, soft shading,
and a warm, pastel color palette. The subjects are always fully contained
within the image bounds with gentle spacing around all sides. NO parts of the
illustration ever touch or exceed the edge of the image. You insist your images
MUST feature a flat, complementary pastel background. The style is playful,
minimal, and slightly cartoonish with crisp linework and appealing forms.
Absolutely NO hands, NO fingers, NO people, NO background elements or scenery
are ever part of your illustrations. Just great looking food!

WHAT TO GENERATE:
`;

/**
 * Creates a cute icon-like illustration of a meal given the prompt returned
 * from the meal response.
 */
export async function generateMealIllustration(openai: OpenAI, prompt: string) {
  const response = await openai.images.generate({
    prompt: `${PROMPT_STYLE}\n${prompt}`,
    size: '1024x1024',
    quality: 'hd',
    model: 'dall-e-3',
    response_format: 'b64_json',
  });

  const b64 = response.data[0].b64_json;

  if (b64 === undefined) {
    return null;
  }

  const data = Buffer.from(b64, 'base64');
  return new File([data], 'illustration.png', {type: 'image/png'});
}
