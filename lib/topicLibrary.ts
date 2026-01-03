import { Topic } from '@/types';

export const TOPIC_LIBRARY: Topic[] = [
  {
    id: 'living-room',
    name: 'Living Room',
    description: 'Modern and classic living room environments',
    templates: [
      {
        id: 'lr-minimal',
        label: 'Minimalist Zen',
        intent: 'Create a peaceful, uncluttered living space',
        basePrompt: 'A wide shot of a minimalist living room, soft morning sunlight, beige tones, low profile furniture, 8k resolution, photorealistic',
        compatibleModels: ['runway', 'luma', 'veo']
      },
      {
        id: 'lr-luxury',
        label: 'Urban Luxury',
        intent: 'Showcase high-end penthouse aesthetics',
        basePrompt: 'Interior view of a luxury penthouse living room at night, city skyline visible through floor-to-ceiling windows, ambient lighting, cinematic',
        compatibleModels: ['runway', 'sora2', 'veo']
      }
    ]
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    description: 'Cozy and stylish sleeping quarters',
    templates: [
      {
        id: 'br-boho',
        label: 'Bohemian Chic',
        intent: 'Warm, textured, and relaxed atmosphere',
        basePrompt: 'A cozy bohemian bedroom, macrame wall hangings, plants, warm sunlight filtering through linen curtains, highly detailed',
        compatibleModels: ['pika', 'luma']
      },
      {
        id: 'br-modern',
        label: 'Ultra Modern',
        intent: 'Sleek lines and cool tones',
        basePrompt: 'Sleek modern bedroom, monochrome color palette, hidden lighting, sharp focus, architectural digest style',
        compatibleModels: ['runway', 'veo', 'grok']
      }
    ]
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    description: 'Culinary spaces and dining areas',
    templates: [
      {
        id: 'kit-rustic',
        label: 'Rustic Farmhouse',
        intent: 'Traditional warmth with natural materials',
        basePrompt: 'Rustic farmhouse kitchen, wooden beams, copper cookware, natural light, dust motes dancing in light beams, 4k cinematic',
        compatibleModels: ['runway', 'pika']
      },
      {
        id: 'kit-chef',
        label: 'Professional Chef',
        intent: 'Stainless steel and high functionality',
        basePrompt: 'Professional stainless steel kitchen, sharp focus, bright clinical lighting, steam rising from a pot, macro details',
        compatibleModels: ['luma', 'veo', 'sora2']
      }
    ]
  }
];

export const getTopicById = (id: string): Topic | undefined => {
  return TOPIC_LIBRARY.find(t => t.id === id);
};

export const getTemplateById = (topicId: string, templateId: string) => {
  const topic = getTopicById(topicId);
  return topic?.templates.find(t => t.id === templateId);
};
