export type Question = {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
    hint: string;
    rationale: string;
};

export type ContentPath = {
    id: string;
    type: 'MAIN' | 'STORY' | 'ANALOGY';
    title: string;
    description: string;
    videoUrl: string; // Mock URL or placeholder
    duration: string;
    questions: Question[];
};

export const PHOTOSYNTHESIS_CONTENT: Record<string, ContentPath> = {
    MAIN: {
        id: 'path_main',
        type: 'MAIN',
        title: 'Introduction to Photosynthesis',
        description: 'Learn how plants make their own food using sunlight, water, and carbon dioxide.',
        videoUrl: 'https://www.youtube.com/embed/UPBMG5EYydo', // Placeholder
        duration: '5:00',
        questions: [
            {
                id: 'q1',
                text: 'What are the three main inputs required for photosynthesis?',
                options: [
                    { id: 'A', text: 'Oxygen, Sugar, Soil' },
                    { id: 'B', text: 'Sunlight, Water, Carbon Dioxide' },
                    { id: 'C', text: 'Nitrogen, Water, Oxygen' },
                    { id: 'D', text: 'Sunlight, Soil, Sugar' }
                ],
                correctAnswer: 'B',
                hint: 'Think about what plants take in from the air and rain, and what they need from the sky.',
                rationale: 'Plants need Sunlight (energy), Water (from roots), and Carbon Dioxide (from air) to produce food.'
            },
            {
                id: 'q2',
                text: 'What is the primary output (product) of photosynthesis that is useful for the plant?',
                options: [
                    { id: 'A', text: 'Carbon Dioxide' },
                    { id: 'B', text: 'Water' },
                    { id: 'C', text: 'Glucose (Sugar)' },
                    { id: 'D', text: 'Nitrogen' }
                ],
                correctAnswer: 'C',
                hint: 'The goal of photosynthesis is to make food for the plant.',
                rationale: 'Glucose is the sugar plants produce to use as energy for growth.'
            },
            {
                id: 'q3',
                text: 'Which gas do plants release as a byproduct of photosynthesis?',
                options: [
                    { id: 'A', text: 'Oxygen' },
                    { id: 'B', text: 'Carbon Dioxide' },
                    { id: 'C', text: 'Nitrogen' },
                    { id: 'D', text: 'Methane' }
                ],
                correctAnswer: 'A',
                hint: 'This is the gas that humans and animals need to breathe.',
                rationale: 'Plants release Oxygen into the atmosphere as a byproduct, which is essential for animal life.'
            }
        ]
    },
    STORY: {
        id: 'path_story',
        type: 'STORY',
        title: 'Rohan and the Plant Chef',
        description: 'Join Rohan as he learns how his grandma\'s garden is like a busy kitchen!',
        videoUrl: 'https://www.youtube.com/embed/K8jA6h57Lz8', // Placeholder
        duration: '6:00',
        questions: [
            {
                id: 'sq1',
                text: 'In the story, what was the "stove" that provided heat for the cooking?',
                options: [
                    { id: 'A', text: 'The Soil' },
                    { id: 'B', text: 'The Sun' },
                    { id: 'C', text: 'The Watering Can' },
                    { id: 'D', text: 'The Air' }
                ],
                correctAnswer: 'B',
                hint: 'What provides the energy or heat in the garden?',
                rationale: 'Just like a stove provides heat for cooking, the Sun provides light energy for photosynthesis.'
            },
            {
                id: 'sq2',
                text: 'What "ingredient" did the plant take from the air?',
                options: [
                    { id: 'A', text: 'Carbon Dioxide' },
                    { id: 'B', text: 'Oxygen' },
                    { id: 'C', text: 'Water' },
                    { id: 'D', text: 'Sugar' }
                ],
                correctAnswer: 'A',
                hint: 'It\'s the gas that we breathe out.',
                rationale: 'Plants take in Carbon Dioxide from the air through their leaves.'
            },
            {
                id: 'sq3',
                text: 'What "dish" did the plant chef finally cook?',
                options: [
                    { id: 'A', text: 'Salad' },
                    { id: 'B', text: 'Soup' },
                    { id: 'C', text: 'Glucose (Sugar)' },
                    { id: 'D', text: 'Bread' }
                ],
                correctAnswer: 'C',
                hint: 'It\'s a sweet energy source for the plant.',
                rationale: 'The final product of the cooking process (photosynthesis) is Glucose, which is food for the plant.'
            }
        ]
    },
    ANALOGY: {
        id: 'path_analogy',
        type: 'ANALOGY',
        title: 'The Solar Factory',
        description: 'Imagine a leaf is a factory powered by solar panels. Let\'s see how it works.',
        videoUrl: 'https://www.youtube.com/embed/3pD68uxRLkM', // Placeholder
        duration: '7:00',
        questions: [
            {
                id: 'aq1',
                text: 'In our factory analogy, what represents the "Solar Panels"?',
                options: [
                    { id: 'A', text: 'The Roots' },
                    { id: 'B', text: 'The Stem' },
                    { id: 'C', text: 'Chloroplasts' },
                    { id: 'D', text: 'The Flowers' }
                ],
                correctAnswer: 'C',
                hint: 'These are the green parts inside the leaf cells that catch sunlight.',
                rationale: 'Chloroplasts capture sunlight energy just like solar panels capture solar energy.'
            },
            {
                id: 'aq2',
                text: 'What raw materials enter the factory delivery doors?',
                options: [
                    { id: 'A', text: 'Water and Carbon Dioxide' },
                    { id: 'B', text: 'Sugar and Oxygen' },
                    { id: 'C', text: 'Sunlight and Soil' },
                    { id: 'D', text: 'Nitrogen and Heat' }
                ],
                correctAnswer: 'A',
                hint: 'The factory needs water from pipes and gas from the air.',
                rationale: 'The factory inputs are Water (from roots) and Carbon Dioxide (from air).'
            },
            {
                id: 'aq3',
                text: 'What waste product does the factory pump out of its chimneys?',
                options: [
                    { id: 'A', text: 'Smoke' },
                    { id: 'B', text: 'Carbon Dioxide' },
                    { id: 'C', text: 'Oxygen' },
                    { id: 'D', text: 'Steam' }
                ],
                correctAnswer: 'C',
                hint: 'It\'s a gas that is good for us!',
                rationale: 'The factory releases Oxygen as a byproduct, which is released into the air.'
            }
        ]
    }
};
