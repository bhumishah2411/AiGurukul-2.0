import { AyurvedaQuestion, AyurvedaRecommendation, DoshaType } from '@ai-gurukul/types';

/**
 * Classical 18-Question Diagnostic Matrix grounded in Charaka Samhita
 * (Sutrasthana Chapter 1 & Vimanasthana Chapter 8: Prakriti Pariksha)
 */
export const AYURVEDA_QUESTIONNAIRE: AyurvedaQuestion[] = [
  // --- PHYSICAL TRAITS (Sharirika Lakshana) ---
  {
    id: 'q_frame',
    category: 'physical',
    question: 'How would you characterize your natural body frame and bone structure?',
    explanation: 'Skeletal build reflects the foundational element density of your constitution.',
    options: [
      {
        id: 'opt_frame_v',
        dosha: 'vata',
        text: 'Slender, thin, light-boned; prominent joints; hard to gain weight.',
      },
      {
        id: 'opt_frame_p',
        dosha: 'pitta',
        text: 'Medium, symmetrical, athletic build; moderate muscle tone.',
      },
      {
        id: 'opt_frame_k',
        dosha: 'kapha',
        text: 'Broad, sturdy, heavy-boned; thick joints; gains weight easily.',
      },
    ],
  },
  {
    id: 'q_skin',
    category: 'physical',
    question: 'What is the natural tendency of your skin throughout the year?',
    explanation:
      'Skin texture reflects hydration, oiliness, and microcirculation governed by doshas.',
    options: [
      {
        id: 'opt_skin_v',
        dosha: 'vata',
        text: 'Dry, rough, thin, easily chapped, cool to the touch.',
      },
      {
        id: 'opt_skin_p',
        dosha: 'pitta',
        text: 'Warm, sensitive, prone to redness, freckles, or inflammation.',
      },
      {
        id: 'opt_skin_k',
        dosha: 'kapha',
        text: 'Thick, smooth, oily, moist, soft, and cool.',
      },
    ],
  },
  {
    id: 'q_hair',
    category: 'physical',
    question: 'How would you describe your hair texture and luster?',
    options: [
      {
        id: 'opt_hair_v',
        dosha: 'vata',
        text: 'Dry, brittle, frizzy, thin, coarse, or unruly.',
      },
      {
        id: 'opt_hair_p',
        dosha: 'pitta',
        text: 'Fine, straight, soft, early greying, or thinning.',
      },
      {
        id: 'opt_hair_k',
        dosha: 'kapha',
        text: 'Thick, dense, wavy, lustrous, dark, and naturally oily.',
      },
    ],
  },
  {
    id: 'q_eyes',
    category: 'physical',
    question: 'What describes the appearance and nature of your eyes?',
    options: [
      {
        id: 'opt_eyes_v',
        dosha: 'vata',
        text: 'Small, active, darting, dry, or with a dull luster.',
      },
      {
        id: 'opt_eyes_p',
        dosha: 'pitta',
        text: 'Sharp, penetrating, sensitive to bright sunlight, prone to redness.',
      },
      {
        id: 'opt_eyes_k',
        dosha: 'kapha',
        text: 'Large, calm, attractive, surrounded by thick long eyelashes.',
      },
    ],
  },
  {
    id: 'q_weight',
    category: 'physical',
    question: 'What is your weight fluctuation tendency?',
    options: [
      {
        id: 'opt_weight_v',
        dosha: 'vata',
        text: 'Underweight or fluctuates quickly; difficulty gaining muscle/fat.',
      },
      {
        id: 'opt_weight_p',
        dosha: 'pitta',
        text: 'Stable, medium weight; easily gains or loses with conscious effort.',
      },
      {
        id: 'opt_weight_k',
        dosha: 'kapha',
        text: 'Heavier build; gains weight very easily, loses it with great difficulty.',
      },
    ],
  },
  {
    id: 'q_joints',
    category: 'physical',
    question: 'How do your joints feel during movement and daily activity?',
    options: [
      {
        id: 'opt_joints_v',
        dosha: 'vata',
        text: 'Prominent, prone to cracking, popping, stiffness, or dryness.',
      },
      {
        id: 'opt_joints_p',
        dosha: 'pitta',
        text: 'Moderate, flexible, prone to inflammation or burning sensations.',
      },
      {
        id: 'opt_joints_k',
        dosha: 'kapha',
        text: 'Strong, deeply cushioned, well-lubricated, rarely painful.',
      },
    ],
  },

  // --- PHYSIOLOGICAL TRAITS (Sharirika Kriya) ---
  {
    id: 'q_appetite',
    category: 'physiological',
    question: 'What is your characteristic appetite and hunger pattern (Agni)?',
    explanation: 'Agni (digestive fire) is central to Ayurvedic metabolic classification.',
    options: [
      {
        id: 'opt_appetite_v',
        dosha: 'vata',
        text: 'Irregular (Vishamagni): ravenous one day, absent the next.',
      },
      {
        id: 'opt_appetite_p',
        dosha: 'pitta',
        text: 'Strong & sharp (Tikshnagni): becomes irritable if meals are delayed.',
      },
      {
        id: 'opt_appetite_k',
        dosha: 'kapha',
        text: 'Slow & steady (Mandagni): can comfortably skip meals, slow digestion.',
      },
    ],
  },
  {
    id: 'q_digestion',
    category: 'physiological',
    question: 'What digestive tendencies do you experience most frequently?',
    options: [
      {
        id: 'opt_digestion_v',
        dosha: 'vata',
        text: 'Gas, bloating, dry hard stools, or constipation.',
      },
      {
        id: 'opt_digestion_p',
        dosha: 'pitta',
        text: 'Heartburn, acidity, loose stools, or excessive thirst.',
      },
      {
        id: 'opt_digestion_k',
        dosha: 'kapha',
        text: 'Heaviness after eating, sluggish bowel movements with mucus.',
      },
    ],
  },
  {
    id: 'q_temperature',
    category: 'physiological',
    question: 'Which climatic condition or temperature do you find most uncomfortable?',
    options: [
      {
        id: 'opt_temp_v',
        dosha: 'vata',
        text: 'Dislike cold, dry winds; hands and feet are frequently cold.',
      },
      {
        id: 'opt_temp_p',
        dosha: 'pitta',
        text: 'Dislike intense heat, direct sun, humidity; sweats profusely.',
      },
      {
        id: 'opt_temp_k',
        dosha: 'kapha',
        text: 'Dislike damp, wet, cold weather; prefers dry and warm climates.',
      },
    ],
  },
  {
    id: 'q_sleep',
    category: 'physiological',
    question: 'How do you sleep at night and wake up in the morning?',
    options: [
      {
        id: 'opt_sleep_v',
        dosha: 'vata',
        text: 'Light, interrupted sleep; tendency toward insomnia or racing thoughts.',
      },
      {
        id: 'opt_sleep_p',
        dosha: 'pitta',
        text: 'Moderate, sound sleep (6-7 hrs); wakes refreshed and ready for action.',
      },
      {
        id: 'opt_sleep_k',
        dosha: 'kapha',
        text: 'Heavy, deep, prolonged sleep; difficulty waking up before sunrise.',
      },
    ],
  },
  {
    id: 'q_stamina',
    category: 'physiological',
    question: 'What is your physical endurance and energy curve throughout the day?',
    options: [
      {
        id: 'opt_stamina_v',
        dosha: 'vata',
        text: 'Bursts of high energy followed by sudden fatigue; runs on adrenaline.',
      },
      {
        id: 'opt_stamina_p',
        dosha: 'pitta',
        text: 'Strong, goal-oriented drive; pushes past exhaustion relentlessly.',
      },
      {
        id: 'opt_stamina_k',
        dosha: 'kapha',
        text: 'Exceptional, sustained stamina; slow to start, but tireless once moving.',
      },
    ],
  },
  {
    id: 'q_sweat',
    category: 'physiological',
    question: 'How do you perspire during exertion or warm weather?',
    options: [
      {
        id: 'opt_sweat_v',
        dosha: 'vata',
        text: 'Scant perspiration, minimal body odor, skin remains dry.',
      },
      {
        id: 'opt_sweat_p',
        dosha: 'pitta',
        text: 'Copious sweating, warm perspiration, distinctive or pungent odor.',
      },
      {
        id: 'opt_sweat_k',
        dosha: 'kapha',
        text: 'Moderate, steady perspiration only during intense physical labor.',
      },
    ],
  },

  // --- PSYCHOLOGICAL TRAITS (Manasika Lakshana) ---
  {
    id: 'q_mind',
    category: 'psychological',
    question: 'How does your mind operate under normal conditions?',
    options: [
      {
        id: 'opt_mind_v',
        dosha: 'vata',
        text: 'Creative, imaginative, quick, restless; jumps between ideas rapidly.',
      },
      {
        id: 'opt_mind_p',
        dosha: 'pitta',
        text: 'Sharp, analytical, logical, decisive, ambitious, and precise.',
      },
      {
        id: 'opt_mind_k',
        dosha: 'kapha',
        text: 'Calm, steady, patient, loyal, contemplative, and methodical.',
      },
    ],
  },
  {
    id: 'q_stress',
    category: 'psychological',
    question: 'What is your involuntary emotional reaction when facing sudden stress or conflict?',
    explanation: 'Stress responses reveal the subconscious constitutional tendencies.',
    options: [
      {
        id: 'opt_stress_v',
        dosha: 'vata',
        text: 'Anxiety, nervousness, fear, worry, overthinking, and feeling scattered.',
      },
      {
        id: 'opt_stress_p',
        dosha: 'pitta',
        text: 'Irritation, impatience, anger, confrontation, and critical judgment.',
      },
      {
        id: 'opt_stress_k',
        dosha: 'kapha',
        text: 'Withdrawal, stubbornness, procrastination, silence, and inertia.',
      },
    ],
  },
  {
    id: 'q_memory',
    category: 'psychological',
    question: 'How do you grasp new information and recall it later?',
    options: [
      {
        id: 'opt_memory_v',
        dosha: 'vata',
        text: 'Learns quickly and grasps concepts fast, but forgets easily.',
      },
      {
        id: 'opt_memory_p',
        dosha: 'pitta',
        text: 'Learns systematically; organizes facts logically with accurate recall.',
      },
      {
        id: 'opt_memory_k',
        dosha: 'kapha',
        text: 'Takes longer to absorb concepts, but retains them forever like granite.',
      },
    ],
  },
  {
    id: 'q_speech',
    category: 'psychological',
    question: 'How would others describe your conversation and speech tempo?',
    options: [
      {
        id: 'opt_speech_v',
        dosha: 'vata',
        text: 'Fast, animated, expressive, talkative; may stray off topic.',
      },
      {
        id: 'opt_speech_p',
        dosha: 'pitta',
        text: 'Clear, direct, persuasive, sharp, articulate, and commanding.',
      },
      {
        id: 'opt_speech_k',
        dosha: 'kapha',
        text: 'Slow, melodious, gentle, measured; speaks only when necessary.',
      },
    ],
  },
  {
    id: 'q_financial',
    category: 'psychological',
    question: 'What is your natural attitude toward money and spending?',
    options: [
      {
        id: 'opt_fin_v',
        dosha: 'vata',
        text: 'Spends spontaneously on impulses; money comes and goes like the wind.',
      },
      {
        id: 'opt_fin_p',
        dosha: 'pitta',
        text: 'Calculated spender; invests in quality, prestige, and purposeful items.',
      },
      {
        id: 'opt_fin_k',
        dosha: 'kapha',
        text: 'Conservative saver; accumulates resources and rarely spends impulsively.',
      },
    ],
  },
  {
    id: 'q_dreams',
    category: 'psychological',
    question: 'What recurring themes or atmospheres characterize your dreams?',
    options: [
      {
        id: 'opt_dream_v',
        dosha: 'vata',
        text: 'Flying, running, falling, feeling chased, wind, or open skies.',
      },
      {
        id: 'opt_dream_p',
        dosha: 'pitta',
        text: 'Fiery situations, problem-solving, debates, warfare, or high intensity.',
      },
      {
        id: 'opt_dream_k',
        dosha: 'kapha',
        text: 'Lakes, oceans, tranquil gardens, romantic themes, or gentle landscapes.',
      },
    ],
  },
];

/**
 * Mapping of acute physical/mental symptoms to elevated Vikriti Doshas
 */
export const SYMPTOM_DOSHA_MAPPING: Record<string, { label: string; dosha: DoshaType }> = {
  insomnia: { label: 'Light sleep or difficulty falling asleep', dosha: 'vata' },
  anxiety: { label: 'Racing thoughts, fear, or panic', dosha: 'vata' },
  dry_skin: { label: 'Rough, cracked, or flaking skin', dosha: 'vata' },
  constipation: { label: 'Hard, dry stools or irregular elimination', dosha: 'vata' },
  joint_cracking: { label: 'Popping or painful joints', dosha: 'vata' },
  cold_extremities: { label: 'Chronically cold hands and feet', dosha: 'vata' },
  bloating_gas: { label: 'Intestinal gas or abdominal distension', dosha: 'vata' },

  hyperacidity: { label: 'Heartburn or acid reflux', dosha: 'pitta' },
  skin_rashes: { label: 'Inflamed skin, acne, or burning sensation', dosha: 'pitta' },
  irritability: { label: 'Short temper, impatience, or frustration', dosha: 'pitta' },
  excessive_heat: { label: 'Feeling overheated, hot flashes', dosha: 'pitta' },
  loose_stools: { label: 'Frequent, burning, or loose bowel movements', dosha: 'pitta' },
  eye_strain: { label: 'Red, burning, or light-sensitive eyes', dosha: 'pitta' },

  lethargy: { label: 'Morning sluggishness or chronic low motivation', dosha: 'kapha' },
  mucus_congestion: { label: 'Excess phlegm, sinus congestion, or cough', dosha: 'kapha' },
  water_retention: { label: 'Swelling in ankles/face or fluid retention', dosha: 'kapha' },
  heavy_digestion: { label: 'Food sits heavily in stomach for hours', dosha: 'kapha' },
  unwanted_weight_gain: { label: 'Stubborn weight gain despite moderate eating', dosha: 'kapha' },
  excessive_sleep: { label: 'Sleeping 9+ hours and still waking tired', dosha: 'kapha' },
};

/**
 * Classical Shastric Recommendations Catalog (Charaka Samhita)
 */
export const AYURVEDA_RECOMMENDATIONS_CATALOG: Record<DoshaType, AyurvedaRecommendation[]> = {
  vata: [
    {
      id: 'rec_v_diet',
      category: 'diet',
      title: 'Vata-Pacifying Ahara (Warm, Nourishing Diet)',
      guidance:
        'Favor warm, freshly cooked, grounding foods with healthy fats (ghee, sesame oil). Emphasize Sweet, Sour, and Salty tastes (Madhura, Amla, Lavana). Minimize cold, raw salads, iced drinks, dry crackers, and bitter vegetables.',
      classicalReference: 'Charaka Samhita Sutrasthana 1.41',
      benefits: [
        'Grounds restless nervous energy',
        'Alleviates abdominal gas',
        'Lubricates internal tissues',
      ],
    },
    {
      id: 'rec_v_abhyanga',
      category: 'routine',
      title: 'Snigdha Abhyanga (Warm Sesame Oil Self-Massage)',
      guidance:
        'Apply warm unrefined sesame oil to the entire body, especially joints and scalp, 15 minutes prior to a warm bath. Practice at least 3-4 mornings per week.',
      classicalReference: 'Charaka Samhita Sutrasthana 5.88-89',
      benefits: [
        'Calms hyperactive nervous system',
        'Improves skin elasticity',
        'Promotes sound sleep',
      ],
    },
    {
      id: 'rec_v_herbs',
      category: 'herbs',
      title: 'Ashwagandha Rasayana (Vitality & Grounding)',
      guidance:
        'Take 1/2 teaspoon of organic Ashwagandha churna with warm spiced milk (or almond milk) and a drop of ghee before bed.',
      classicalReference: 'Ashtanga Hridaya Uttarasthana 39.61',
      benefits: [
        'Rebuilds Ojas (vital vigor)',
        'Deepens restorative sleep',
        'Reduces serum cortisol',
      ],
    },
    {
      id: 'rec_v_lifestyle',
      category: 'lifestyle',
      title: 'Sthirata Dinacharya (Routine Consistency)',
      guidance:
        'Establish fixed hours for waking, meals, and retiring. Avoid multi-tasking, excessive travel, and prolonged screen exposure in the evening.',
      classicalReference: 'Charaka Samhita Vimanasthana 8.97',
      benefits: ['Stabilizes fluctuating Vata', 'Enhances metabolic rhythm'],
    },
  ],
  pitta: [
    {
      id: 'rec_p_diet',
      category: 'diet',
      title: 'Pitta-Pacifying Ahara (Cooling, Moderating Diet)',
      guidance:
        'Favor cooling, refreshing foods with naturally Sweet, Bitter, and Astringent tastes (Madhura, Tikta, Kashaya). Consume coconut water, ghee, sweet fruits, and cilantro. Avoid pungent chilies, excessive garlic, vinegar, and fermented pickles.',
      classicalReference: 'Charaka Samhita Sutrasthana 1.42',
      benefits: [
        'Soothes digestive fire (Tikshnagni)',
        'Prevents acid reflux',
        'Cools blood inflammation',
      ],
    },
    {
      id: 'rec_p_routine',
      category: 'routine',
      title: 'Sheetali Pranayama & Moon Bathing',
      guidance:
        'Practice Sheetali (cooling curled-tongue breath) for 5-10 minutes in the late afternoon. Take evening walks in the moonlight or near water bodies.',
      classicalReference: 'Hatha Yoga Pradipika 2.57-58',
      benefits: ['Reduces systemic body heat', 'Soothes anger and competitive tension'],
    },
    {
      id: 'rec_p_herbs',
      category: 'herbs',
      title: 'Brahmi & Shatavari Formulation',
      guidance:
        'Take 1/2 teaspoon of Shatavari or Brahmi churna in warm water with a teaspoon of ghee to nourish tissues and soothe the intellect.',
      classicalReference: 'Charaka Samhita Chikitsasthana 1.2',
      benefits: [
        'Clears cognitive agitation',
        'Protects gastric lining',
        'Nourishes reproductive tissues',
      ],
    },
    {
      id: 'rec_p_lifestyle',
      category: 'lifestyle',
      title: 'Non-Competitive Leisure & Cool Environment',
      guidance:
        'Avoid intense direct midday sunlight. Engage in activities without a scoreboard or performance goal. Cultivate forgiveness and self-compassion.',
      classicalReference: 'Charaka Samhita Sutrasthana 7.27',
      benefits: ['Calms over-ambition', 'Alleviates vascular tension'],
    },
  ],
  kapha: [
    {
      id: 'rec_k_diet',
      category: 'diet',
      title: 'Kapha-Pacifying Ahara (Light, Warming, Stimulating Diet)',
      guidance:
        'Favor warm, light, dry, and stimulating meals with Pungent, Bitter, and Astringent tastes (Katu, Tikta, Kashaya). Use warming spices (ginger, black pepper, cumin, turmeric). Avoid cold dairy, heavy oily sweets, and late-night dinners.',
      classicalReference: 'Charaka Samhita Sutrasthana 1.43',
      benefits: [
        'Stirs sluggish metabolism (Mandagni)',
        'Reduces lymphatic fluid stagnation',
        'Clears respiratory mucus',
      ],
    },
    {
      id: 'rec_k_routine',
      category: 'routine',
      title: 'Surya Namaskar & Early Rising (Brahma Muhurta)',
      guidance:
        'Rise before 6:00 AM. Practice dynamic Sun Salutations (12 rounds) followed by Kapalabhati breathing to ignite metabolic fire.',
      classicalReference: 'Ashtanga Hridaya Sutrasthana 2.1',
      benefits: [
        'Combats daytime sluggishness',
        'Expels stagnant bodily fluids',
        'Boosts natural stamina',
      ],
    },
    {
      id: 'rec_k_herbs',
      category: 'herbs',
      title: 'Trikatu & Triphala Decoction',
      guidance:
        'Take 1/3 teaspoon of Trikatu (black pepper, long pepper, ginger) with raw honey before meals to kindle digestive fire, and Triphala before bed.',
      classicalReference: 'Sushruta Samhita Sutrasthana 38.38',
      benefits: [
        'Scrapes adipose tissue (Lekhana)',
        'Purges accumulated Ama (toxins)',
        'Enhances vitality',
      ],
    },
    {
      id: 'rec_k_lifestyle',
      category: 'lifestyle',
      title: 'Active Exploration & Dry Massage (Garshana)',
      guidance:
        'Engage in vigorous daily aerobic exercise. Perform dry raw silk glove massage (Garshana) toward the heart to stimulate lymph circulation. Avoid daytime naps.',
      classicalReference: 'Charaka Samhita Sutrasthana 5.92',
      benefits: ['Mobilizes stubborn tissue congestion', 'Sharpens mental alertness'],
    },
  ],
};
