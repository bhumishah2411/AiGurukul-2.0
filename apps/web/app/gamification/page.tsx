'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../lib/api';

// ---------------------------------------------------------------------------
// TYPES & DATA DEFINITIONS
// ---------------------------------------------------------------------------

type GameCategory = 'ramayana' | 'mahabharata' | 'ayurveda' | 'temples' | 'wisdom';

interface LevelData {
  id: number;
  name: string;
  title: string;
  image: string;
  cartoon?: string;
  answer: string;
  aliases: string[];
  hints: string[];
  loreQuote: string;
}

interface ShopItem {
  id: string;
  name: string;
  category: 'Jewelry' | 'Weapon' | 'Relic' | 'Decoration' | 'Accessory';
  price: number;
  forCategory: GameCategory[];
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
  benefit: string;
}

const CATEGORIES: { id: GameCategory; name: string; subtitle: string; icon: string; bannerColor: string }[] = [
  { id: 'ramayana', name: 'RAMAYANA', subtitle: 'The Journey of Rama', icon: '🏹', bannerColor: '#eab308' },
  { id: 'mahabharata', name: 'MAHABHARATA', subtitle: 'The Great Epic of India', icon: '🦚', bannerColor: '#3b82f6' },
  { id: 'ayurveda', name: 'AYURVEDA', subtitle: 'Ancient science of life', icon: '🌿', bannerColor: '#10b981' },
  { id: 'temples', name: 'DIVINE TEMPLES', subtitle: 'Architectural Wonders', icon: '🕉️', bannerColor: '#a855f7' },
  { id: 'wisdom', name: 'VEDIC WISDOM', subtitle: 'Chanakya & Immortal Sages', icon: '📜', bannerColor: '#f97316' },
];

const CATEGORY_LEVELS: Record<GameCategory, LevelData[]> = {
  ramayana: [
    {
      id: 1,
      name: 'Lord Rama',
      title: 'Maryada Purushottam',
      image: '/game/rama_real.png',
      cartoon: '/game/rama_3d.png',
      answer: 'rama',
      aliases: ['ram', 'rama', 'lord rama', 'shree ram', 'shri ram', 'sri rama', 'maryada purushottam'],
      hints: [
        'He is the seventh avatar of Lord Vishnu, born in Ayodhya to King Dasharatha.',
        'Known across eternity as Maryada Purushottam—the supreme embodiment of dharma and duty.',
        'He bent and broke the formidable Pinaka bow of Lord Shiva at Sita’s swayamvara.',
        'Wielding the celestial Kodanda bow, he crossed the ocean and vanquished King Ravana.',
        'His noble life is chronicled in the Valmiki Ramayana as a timeless guide for humanity.',
      ],
      loreQuote: 'Ramo Vigrahavan Dharmah — Rama is the living embodiment of righteousness.',
    },
    {
      id: 2,
      name: 'Goddess Sita',
      title: 'Daughter of Mother Earth',
      image: '/game/sita_real.png',
      cartoon: '/game/sita_real.png',
      answer: 'sita',
      aliases: ['sita', 'seeta', 'janaki', 'vaidehi', 'goddess sita', 'ma sita', 'maa sita'],
      hints: [
        'She is an incarnation of Goddess Lakshmi, embodying supreme grace and fortitude.',
        'Discovered by King Janaka of Mithila while furrowing the sacred golden soil.',
        'Epitome of selfless fidelity, she chose forest exile over the luxuries of the royal palace.',
        'She proved her unblemished divine purity through the sacred Agni Pariksha.',
        'Beloved mother of twin warrior princes Luv and Kush at Valmiki’s hermitage.',
      ],
      loreQuote: 'Her devotion is an ocean of silence, purity, and spiritual strength.',
    },
    {
      id: 3,
      name: 'Lord Hanuman',
      title: 'Sankat Mochan & Mahavira',
      image: '/game/hanuman_real.png',
      cartoon: '/game/hanuman_real.png',
      answer: 'hanuman',
      aliases: ['hanuman', 'hanumana', 'maruti', 'bajrangbali', 'anjaneya', 'pavanputra', 'lord hanuman'],
      hints: [
        'Divine son of Anjana and Vayudev, possessing limitless strength and boundless humility.',
        'In his youth, he mistook the radiant morning sun for a golden fruit and leaped into the sky.',
        'He traversed the vast ocean to Lanka in a single breath to find Mother Sita.',
        'He lifted the entire Dronagiri mountain to bring Sanjeevani herb and revive Lakshmana.',
        'The eternal Chiranjivi whose heart is consecrated as the permanent throne of Rama and Sita.',
      ],
      loreQuote: 'Manojavam Maruta Tulya Vegam — Swift as thought and mighty as the cosmic wind.',
    },
    {
      id: 4,
      name: 'Lakshmana',
      title: 'The Inseparable Brother',
      image: '/game/lakshman_real.png',
      cartoon: '/game/lakshman_real.png',
      answer: 'lakshmana',
      aliases: ['lakshman', 'lakshmana', 'laxman', 'saumitra'],
      hints: [
        'Devoted younger brother of Sri Rama, revered as an incarnation of Adi Sheshanaga.',
        'Forswore sleep for fourteen years (Gudakesha) to remain vigilant guardian of Rama and Sita.',
        'Vanquished the invincible sorcerer prince Indrajit (Meghnada) on the battlefield.',
        'Drew the legendary protective perimeter around their hermitage known as the Lakshmana Rekha.',
        'Symbol of fierce loyalty, unbending duty, and martial mastery.',
      ],
      loreQuote: 'Duty to an elder brother is the highest path of dharma.',
    },
    {
      id: 5,
      name: 'King Dasharatha',
      title: 'Monarch of Ayodhya',
      image: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?q=80&w=700&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?q=80&w=700&auto=format&fit=crop',
      answer: 'dasharatha',
      aliases: ['dasharatha', 'dasharath', 'king dasharatha'],
      hints: [
        'Noble sovereign of the Ikshvaku dynasty ruling over the golden city of Ayodhya.',
        'Mastered the rare art of Shabda-bhedi archery—striking any target purely by listening to sound.',
        'Performed the sacred Putrakameshti Yajna to receive four divine sons.',
        'Bound by an inviolable ancient boon given to Queen Kaikeyi, he sacrificed his own joy for truth.',
      ],
      loreQuote: 'Raghukula reeti sada chali aayi, pran jaayi par vachan na jaayi.',
    },
    {
      id: 6,
      name: 'Sage Vishvamitra',
      title: 'Brahmarshi of Sacred Astras',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop',
      answer: 'vishvamitra',
      aliases: ['vishvamitra', 'vishwamitra', 'kaushika', 'sage vishvamitra'],
      hints: [
        'Originally a powerful monarch who achieved the zenith of Brahmarshi through austere penance.',
        'Initiator who brought the immortal Gayatri Mantra to the seeker realm.',
        'Took young princes Rama and Lakshmana to sanctify his yajnas and liberate Tataka.',
        'Conferred secret divine celestial astras (Bala and Atibala) upon Sri Rama.',
      ],
      loreQuote: 'Patience and tapasya transform royal ambition into cosmic wisdom.',
    },
    {
      id: 7,
      name: 'King Sugriva',
      title: 'Lord of Kishkindha',
      image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=700&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=700&auto=format&fit=crop',
      answer: 'sugriva',
      aliases: ['sugriva', 'sugreev', 'king sugriva'],
      hints: [
        'The Vanara sovereign of the mountainous kingdom of Kishkindha and son of Surya.',
        'Forged an eternal bond of sacred friendship with Sri Rama before the consecrated fire.',
        'Mobilized his vast legions across four cardinal directions to locate the captive Sita.',
        'Showed the sacred power of an allied army united for universal righteousness.',
      ],
      loreQuote: 'A true friend is a haven of refuge in times of deep sorrow.',
    },
    {
      id: 8,
      name: 'Jatayu',
      title: 'The Valiant Protector',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=700&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=700&auto=format&fit=crop',
      answer: 'jatayu',
      aliases: ['jatayu', 'king jatayu'],
      hints: [
        'The noble king of eagles and lifelong friend of King Dasharatha.',
        'Interception warrior who fearlessly battled Ravana in mid-air to rescue Mother Sita.',
        'Clung to his dying breaths until he could impart crucial strategic intelligence to Sri Rama.',
        'Attained direct Moksha and divine funeral rites performed tenderly by Sri Rama’s own hands.',
      ],
      loreQuote: 'Valor is not in knowing you will win, but in fighting for what is right until the end.',
    },
    {
      id: 9,
      name: 'Bharata',
      title: 'The Paduka Sovereign',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=700&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=700&auto=format&fit=crop',
      answer: 'bharata',
      aliases: ['bharat', 'bharata'],
      hints: [
        'The noble prince who vehemently refused the kingdom thrust upon him by his mother Kaikeyi.',
        'Walked barefoot into the forest to implore Sri Rama to return to Ayodhya.',
        'Placed Rama’s sacred wooden sandals (Padukas) upon the golden throne of Kosala.',
        'Ruled for fourteen years from the simple ascetic hut of Nandigram as an humble servant.',
      ],
      loreQuote: 'True royalty is renunciation of personal ego in service of dharma.',
    },
    {
      id: 10,
      name: 'Ravana',
      title: 'Ten-Headed King of Lanka',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=700&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=700&auto=format&fit=crop',
      answer: 'ravana',
      aliases: ['ravana', 'ravan', 'dashanana', 'lankapati', 'king ravana'],
      hints: [
        'The formidable ten-headed sovereign of Lanka endowed with immense tapasya.',
        'A master of the Sama Veda and virtuoso player of the divine Veena.',
        'Authored the thunderous Shiva Tandava Stotram in adoration of Mahadeva.',
        'Fell from grace when unbound hubris led him to abduct Goddess Sita.',
      ],
      loreQuote: 'Knowledge without humility and ethics becomes the instrument of one’s own ruin.',
    },
    // Levels 11-20
    { id: 11, name: 'Kumbhakarna', title: 'The Sleeping Titan', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=700&auto=format&fit=crop', answer: 'kumbhakarna', aliases: ['kumbhakarna', 'kumbhkaran', 'kumbhakaran'], hints: ['Giant brother of Ravana cursed to sleep six months at a time.', 'Warned Ravana of his folly before honoring brotherly duty on the battlefield.'], loreQuote: 'Loyalty misdirected against dharma leads to tragedy.' },
    { id: 12, name: 'Vibhishana', title: 'The Beacon of Conscience', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=700&auto=format&fit=crop', answer: 'vibhishana', aliases: ['vibhishana', 'vibhishan', 'bibhishan'], hints: ['Righteous younger brother of Ravana who chose dharma over family blindness.', 'Crowned sovereign of Lanka after the victory of Sri Rama.'], loreQuote: 'Righteousness transcends borders and blood ties.' },
    { id: 13, name: 'Indrajit', title: 'Conqueror of the Heavens', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=700&auto=format&fit=crop', answer: 'indrajit', aliases: ['indrajit', 'meghnada', 'meghnath'], hints: ['Son of Ravana, known as Meghnada because his birth cry sounded like thunder.', 'Defeated Indra and mastered illusionary warfare (Maya yuddha).'], loreQuote: 'Even supreme mystical power cannot withstand pure righteousness.' },
    { id: 14, name: 'Angada', title: 'The Unshakeable Emissary', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=700&auto=format&fit=crop', answer: 'angada', aliases: ['angad', 'angada'], hints: ['Valiant prince son of Vali who served as Rama’s bold final peace envoy.', 'Firmly planted his foot in Ravana’s court; no titan in Lanka could budge it.'], loreQuote: 'Unshakeable faith grounds the righteous in any hostile assembly.' },
    { id: 15, name: 'Jambavan', title: 'King of the Bears & Elder Sage', image: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?q=80&w=700&auto=format&fit=crop', answer: 'jambavan', aliases: ['jambavan', 'jambavanta', 'jambavant'], hints: ['Immortal elder bear king who witnessed the Trivikrama avatar of Lord Vishnu.', 'Awakened Hanuman to his latent cosmic strength when despair struck the shore.'], loreQuote: 'True mentors awaken the dormant divine power within others.' },
    { id: 16, name: 'Shabari', title: 'Devotion of Sweet Berries', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=700&auto=format&fit=crop', answer: 'shabari', aliases: ['shabari', 'sabari'], hints: ['Humble ascetic forest disciple of Sage Matanga who waited decades for Sri Rama.', 'Offered sweet tasted berries with pure, childlike bhakti that delighted God.'], loreQuote: 'God seeks not grandeur, but unconditional purity of heart.' },
    { id: 17, name: 'Nala and Nila', title: 'Master Architects of the Floating Bridge', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=700&auto=format&fit=crop', answer: 'nala', aliases: ['nala', 'nila', 'nala and nila', 'nal neel', 'nal'], hints: ['Sons of Vishwakarma blessed with the gift to make heavy stones float upon the sea.', 'Engineered the 30-mile Ram Setu across the ocean in just five days.'], loreQuote: 'Divine skill and collective labor can bridge any impassable gulf.' },
    { id: 18, name: 'Urmila', title: 'Silent Tapasya of Ayodhya', image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=700&auto=format&fit=crop', answer: 'urmila', aliases: ['urmila'], hints: ['Sister of Sita and faithful wife of Lakshmana who stayed back in Ayodhya.', 'Accepted fourteen years of deep yogic slumber so Lakshmana could stay awake.'], loreQuote: 'Unspoken sacrifice upholds the great epics from behind the scenes.' },
    { id: 19, name: 'Maricha', title: 'The Golden Deer', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=700&auto=format&fit=crop', answer: 'maricha', aliases: ['maricha', 'mareech'], hints: ['Demon uncle of Ravana who disguised himself as an iridescent golden deer.', 'Warned Ravana repeatedly that crossing Rama’s path meant absolute doom.'], loreQuote: 'The glitter of illusion is often the doorway to capture.' },
    { id: 20, name: 'Mandodari', title: 'Queen of Lanka', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=700&auto=format&fit=crop', answer: 'mandodari', aliases: ['mandodari'], hints: ['Righteous chief queen of Ravana and daughter of divine architect Mayasura.', 'Constantly advised her husband to return Sita and avert cosmic cataclysm.'], loreQuote: 'Wisdom speaks even in the corridors of darkness.' },
  ],
  mahabharata: [
    {
      id: 1,
      name: 'Lord Krishna',
      title: 'Yogeshvara & Gita Teacher',
      image: '/game/krishna_real.png',
      cartoon: '/game/krishna_3d.png',
      answer: 'krishna',
      aliases: ['krishna', 'shri krishna', 'sri krishna', 'lord krishna', 'vasudeva', 'govinda', 'keshava'],
      hints: [
        'He delivered the eternal seven hundred verses of the Bhagavad Gita at Kurukshetra.',
        'The eighth avatar of Lord Vishnu, manifesting divine wisdom, playfulness, and cosmic governance.',
        'He is the protector of cows (Gopala) who lifted the Govardhan mountain on his little finger.',
        'Served as the humble, unarmed charioteer (Parthasarathy) for prince Arjuna.',
        'Slew the tyrant Kamsa and established the oceanic citadel of Dwarka.',
      ],
      loreQuote: 'Yada yada hi dharmasya glanir bhavati bharata — Whenever dharma declines, I manifest.',
    },
    {
      id: 2,
      name: 'Arjuna',
      title: 'The Incomparable Archer',
      image: '/game/arjuna_real.png',
      cartoon: '/game/arjuna_real.png',
      answer: 'arjuna',
      aliases: ['arjuna', 'arjun', 'partha', 'savyasachi', 'dhananjaya'],
      hints: [
        'The third Pandava prince and beloved student of Dronacharya.',
        'Wielded the celestial divine bow Gandiva, gifted by Agni and Varuna.',
        'Known as Savyasachi because he could release devastating arrows with both hands equally.',
        'Witnessed the staggering cosmic form (Vishwarupa) of Sri Krishna on the battlefield.',
        'The symbol of laser-sharp concentration, focused entirely on the eye of the bird.',
      ],
      loreQuote: 'Focus your mind upon the task, undisturbed by doubt or attachment.',
    },
    {
      id: 3,
      name: 'Bhishma Pitamaha',
      title: 'The Great Patriarch of Vows',
      image: '/game/bhishma_real.png',
      cartoon: '/game/bhishma_real.png',
      answer: 'bhishma',
      aliases: ['bhishma', 'bheeshma', 'devavrata', 'pitamaha bhishma'],
      hints: [
        'Son of King Shantanu and Goddess Ganga, originally named Devavrata.',
        'Took the terrible, unbending vow of lifelong celibacy to ensure his father’s joy.',
        'Blessed with Iccha-Mrityu—the divine boon to choose the exact hour of his own death.',
        'Imparted the profound Shanti Parva and Vishnu Sahasranama from his bed of arrows.',
      ],
      loreQuote: 'A vow of honor is more precious than an entire earthly empire.',
    },
    {
      id: 4,
      name: 'Draupadi',
      title: 'Yajnaseni of the Sacred Flame',
      image: '/game/draupadi_real.png',
      cartoon: '/game/draupadi_real.png',
      answer: 'draupadi',
      aliases: ['draupadi', 'panchali', 'yajnaseni'],
      hints: [
        'Born directly from the glowing embers of King Drupada’s sacred sacrificial altar.',
        'Her dignity was miraculously protected by Sri Krishna when injustice stained the royal court.',
        'A towering figure of intellectual brilliance, royal pride, and unyielding justice.',
      ],
      loreQuote: 'From the purest fire arises the courage to demand justice.',
    },
    {
      id: 5,
      name: 'Yudhishthira',
      title: 'Embodiment of Dharma',
      image: '/game/bhishma_real.png',
      cartoon: '/game/bhishma_real.png',
      answer: 'yudhishthira',
      aliases: ['yudhishthira', 'yudhisthir', 'yudhishtir', 'dharmaraj'],
      hints: [
        'Eldest Pandava prince and spiritual son of Dharma (Yama).',
        'Answered the profound philosophical riddles of the cosmic Yaksha to resurrect his brothers.',
        'Refused to enter heaven without the humble stray dog that accompanied his final Himalayan trek.',
      ],
      loreQuote: 'Truth is the highest sanctuary, and compassion is its foundation.',
    },
    // Levels 6-20
    { id: 6, name: 'Karna', title: 'Danaveera Sun Prince', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=700&auto=format&fit=crop', answer: 'karna', aliases: ['karna', 'karan', 'radheya', 'danaveera'], hints: ['Firstborn son of Kunti and Surya Bhagavan born with golden armor and earrings.', 'Legendary for never refusing any seeker’s request for charity.'], loreQuote: 'Generosity without calculation is the ornament of the noble.' },
    { id: 7, name: 'Dronacharya', title: 'Royal Guru of Warfare', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop', answer: 'dronacharya', aliases: ['drona', 'dronacharya', 'guru drona'], hints: ['Master preceptor of military science to both the Pandavas and Kauravas.', 'Demanded the thumb of Eklavya to protect his pledge to Arjuna.'], loreQuote: 'Knowledge passed without impartiality creates heavy karmic knots.' },
    { id: 8, name: 'Bhima', title: 'Might of Ten Thousand Elephants', image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=700&auto=format&fit=crop', answer: 'bhima', aliases: ['bhima', 'bhim', 'vrikodara'], hints: ['Second Pandava endowed with the strength of ten thousand elephants.', 'Supreme master of the mace (Gada) and the chef of King Virata’s kitchen.'], loreQuote: 'True strength protects the gentle and punishes arrogance.' },
    { id: 9, name: 'Abhimanyu', title: 'Hero of the Chakravyuha', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=700&auto=format&fit=crop', answer: 'abhimanyu', aliases: ['abhimanyu'], hints: ['Sixteen-year-old son of Arjuna and Subhadra who learned warfare in the womb.', 'Broke into the impenetrable circular Chakravyuha battle maze single-handedly.'], loreQuote: 'Immortal glory belongs to those who stand fearless against all odds.' },
    { id: 10, name: 'Kunti', title: 'Mother of the Pandavas', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=700&auto=format&fit=crop', answer: 'kunti', aliases: ['kunti', 'pritha'], hints: ['Blessed by Sage Durvasa with a sacred mantra to invoke any celestial deity.', 'Chose to accompany the aged Dhritarashtra and Gandhari into the forest after victory.'], loreQuote: 'Endurance through hardship shapes the destiny of nations.' },
    { id: 11, name: 'Vidura', title: 'Voice of Pure Ethics', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop', answer: 'vidura', aliases: ['vidura', 'vidur'], hints: ['Incarnation of Dharma and chief royal counselor whose ethical maxims are Vidura Niti.', 'Welcomed Krishna to dine on simple banana peel spinach in his humble hut.'], loreQuote: 'Love and integrity are richer than royal feasts.' },
    { id: 12, name: 'Nakula and Sahadeva', title: 'Twin Masters of Swords & Stars', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=700&auto=format&fit=crop', answer: 'sahadeva', aliases: ['sahadeva', 'nakula', 'nakul', 'sahadev', 'twins'], hints: ['Sons of the divine Ashwini Kumars.', 'Sahadeva was a supreme astrologer who foresaw the entire Kurukshetra war.'], loreQuote: 'Knowledge of the future demands supreme restraint in the present.' },
    { id: 13, name: 'Ashwatthama', title: 'The Gem of Immortality', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=700&auto=format&fit=crop', answer: 'ashwatthama', aliases: ['ashwatthama', 'ashwatthaman'], hints: ['Son of Dronacharya born with a divine mystical gem embedded on his forehead.', 'Wielded the dreadful Narayanastra and Brahmashira astra.'], loreQuote: 'Revenge extracts a heavier price from the seeker than from the foe.' },
    { id: 14, name: 'Ghatotkacha', title: 'Giant of the Night Sky', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=700&auto=format&fit=crop', answer: 'ghatotkacha', aliases: ['ghatotkacha', 'ghatotkach'], hints: ['Son of Bhima and Hidimbi whose powers multiplied manifold under the cloak of night.', 'Forced Karna to expend the fatal Vasava Shakti dart intended for Arjuna.'], loreQuote: 'A glorious sacrifice protects the light of the future.' },
    { id: 15, name: 'Eklavya', title: 'Devotion to the Clay Master', image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=700&auto=format&fit=crop', answer: 'eklavya', aliases: ['eklavya', 'ekalavya'], hints: ['Nishada prince who mastered archery before a clay statue of Guru Drona.', 'Cut off his right thumb without hesitation as guru dakshina.'], loreQuote: 'Self-taught discipline is the quietest mountain of mastery.' },
    { id: 16, name: 'Gandhari', title: 'The Blindfolded Queen', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=700&auto=format&fit=crop', answer: 'gandhari', aliases: ['gandhari'], hints: ['Princess of Gandhara who chose to blindfold herself throughout her marital life.', 'Told her son Duryodhana: Yato dharmas tato jayah—Victory follows righteousness alone.'], loreQuote: 'Justice bends not for the tears of a mother.' },
    { id: 17, name: 'Duryodhana', title: 'Prince of Unyielding Pride', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=700&auto=format&fit=crop', answer: 'duryodhana', aliases: ['duryodhana', 'duryodhan', 'suyodhana'], hints: ['Eldest Kaurava prince who refused to surrender even a needlepoint of land.', 'Master of the mace whose pride caused the doom of his dynasty.'], loreQuote: 'Possessiveness burns the throne it seeks to preserve.' },
    { id: 18, name: 'Sanjaya', title: 'The Divine Vision Eye', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop', answer: 'sanjaya', aliases: ['sanjaya', 'sanjay'], hints: ['Charioteer blessed by Vyasa with celestial vision (Divya Drishti).', 'Narrated every event of the war and the Gita live to blind king Dhritarashtra.'], loreQuote: 'An impartial witness is the voice of history.' },
    { id: 19, name: 'Dhrishtadyumna', title: 'Fire-Born Commander', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=700&auto=format&fit=crop', answer: 'dhrishtadyumna', aliases: ['dhrishtadyumna'], hints: ['Brother of Draupadi born of fire destined to be the commander of Pandava forces.', 'Executed the prophesied fall of Dronacharya on the fifteenth day.'], loreQuote: 'Destiny marches through the fiery resolve of purpose.' },
    { id: 20, name: 'Balarama', title: 'The Master of the Golden Plow', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=700&auto=format&fit=crop', answer: 'balarama', aliases: ['balarama', 'balaram', 'balabhadra', 'haladhara'], hints: ['Elder brother of Sri Krishna, wielding the sacred plow (Hala) and mace.', 'Refused to take sides in the fratricidal Kurukshetra war, departing on pilgrimage.'], loreQuote: 'True neutrality sometimes protects universal brotherhood.' },
  ],
  ayurveda: [
    {
      id: 1,
      name: 'Sage Sushruta',
      title: 'Father of Surgery & Plastic Surgery',
      image: '/game/sushruta_real.png',
      cartoon: '/game/sushruta_real.png',
      answer: 'sushruta',
      aliases: ['sushruta', 'sushrut', 'father of surgery'],
      hints: [
        'Celebrated as the ancient Father of Surgery and pioneer of reconstructive plastic surgery.',
        'Authored the monumental surgical compendium Sushruta Samhita in Kashi.',
        'Pioneered rhinoplasty (forehead flap nose reconstruction), cataract couching, and lithotomy.',
        'Described over 120 precision surgical instruments (Yantras and Shastras) modeled after animal beaks.',
      ],
      loreQuote: 'A physician who knows only surgery or only medicine is like a bird with one wing.',
    },
    {
      id: 2,
      name: 'Sage Charaka',
      title: 'Father of Internal Medicine',
      image: '/game/charaka_real.png',
      cartoon: '/game/charaka_real.png',
      answer: 'charaka',
      aliases: ['charaka', 'charak', 'father of ayurveda'],
      hints: [
        'The wandering physician and author of the foundational Charaka Samhita.',
        'Established the doctrine of Tridosha—maintaining equilibrium among Vata, Pitta, and Kapha.',
        'Proclaimed: It is far more important to prevent disease than to cure it once established.',
      ],
      loreQuote: 'Swasthyasya swasthya rakshanam — Preserve the health of the healthy first.',
    },
    {
      id: 3,
      name: 'Lord Dhanvantari',
      title: 'Divine Source of Medicine & Amrita',
      image: '/game/dhanvantari_real.png',
      cartoon: '/game/dhanvantari_real.png',
      answer: 'dhanvantari',
      aliases: ['dhanvantari', 'dhanwantari', 'lord dhanvantari'],
      hints: [
        'The celestial physician of the cosmos and avatar of Lord Vishnu.',
        'Emerged from the cosmic ocean of milk carrying the golden pot of immortal Amrita.',
        'Venerated during Dhanteras as the giver of radiant health and disease-free longevity.',
      ],
      loreQuote: 'Divine consciousness is the primordial root of all healing.',
    },
    {
      id: 4,
      name: 'Ashwagandha',
      title: 'The King of Adaptogens',
      image: '/game/ashwagandha_real.png',
      cartoon: '/game/ashwagandha_real.png',
      answer: 'ashwagandha',
      aliases: ['ashwagandha', 'asvagandha', 'withania'],
      hints: [
        'Premier Rasayana adaptogen herb named for imparting the strength and vitality of a horse.',
        'Soothes Vata dosha, lowers chronic stress, and rejuvenates muscular and nervous vigor.',
      ],
      loreQuote: 'Calmness of mind and strength of body grow from rooted herbs.',
    },
    {
      id: 5,
      name: 'Tulsi',
      title: 'The Sacred Queen of Herbs',
      image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=700&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=700&auto=format&fit=crop',
      answer: 'tulsi',
      aliases: ['tulsi', 'holy basil', 'vrinda'],
      hints: [
        'The sacred holy basil plant cultivated in traditional Vedic courtyards.',
        'Supreme purifier of the aura and lungs, balancing Kapha and clearing respiratory channels.',
      ],
      loreQuote: 'Where Tulsi flourishes, negative currents cannot dwell.',
    },
    // Levels 6-20
    { id: 6, name: 'Triphala', title: 'The Three Sacred Fruits', image: 'https://images.unsplash.com/photo-1624494052342-990520bc973c?q=80&w=700&auto=format&fit=crop', answer: 'triphala', aliases: ['triphala', 'trifala'], hints: ['Confluence of Amalaki, Bibhitaki, and Haritaki.', 'Balances all three doshas and gently detoxifies the digestive fire (Agni).'], loreQuote: 'A mother cares for the body as Triphala cares for internal harmony.' },
    { id: 7, name: 'Sage Vagbhata', title: 'Author of Ashtanga Hridaya', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop', answer: 'vagbhata', aliases: ['vagbhata', 'vagbhat'], hints: ['Third great luminary of the Brihat Trayi trio.', 'Condensed complex medical treaties into poetic verses easy for practitioners to chant.'], loreQuote: 'Simplicity is the jewel of medical mastery.' },
    { id: 8, name: 'Neem', title: 'The Universal Healer & Blood Purifier', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=700&auto=format&fit=crop', answer: 'neem', aliases: ['neem', 'nimba', 'margosa'], hints: ['Known in Sanskrit as Arishta—reliever of all sickness.', 'Bitter purifier that cools Pitta inflammation and cleanses the bloodstream.'], loreQuote: 'Bitter tastes yield sweet health.' },
    { id: 9, name: 'Haridra (Turmeric)', title: 'The Golden Goddess of Herbs', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=700&auto=format&fit=crop', answer: 'turmeric', aliases: ['turmeric', 'haridra', 'haldi'], hints: ['Auspicious yellow rhizome venerated in both culinary medicine and sacred rites.', 'Potent anti-inflammatory agent that preserves cellular youth.'], loreQuote: 'Golden root of the sun, blessing health and purity.' },
    { id: 10, name: 'Brahmi', title: 'Nootropic of Higher Consciousness', image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=700&auto=format&fit=crop', answer: 'brahmi', aliases: ['brahmi', 'bacopa'], hints: ['Named after Lord Brahma, the cosmic creator.', 'Supreme brain tonic (Medhya Rasayana) that enhances memory, clarity, and meditative stillness.'], loreQuote: 'A clear mind sees through the turbulent waves of thought.' },
    { id: 11, name: 'Chyawanprash', title: 'The Elixir of Youth', image: 'https://images.unsplash.com/photo-1624494052342-990520bc973c?q=80&w=700&auto=format&fit=crop', answer: 'chyawanprash', aliases: ['chyawanprash', 'chyavanprash'], hints: ['Formulated by Ashwini Kumars to restore youthful vigor to aging Sage Chyavana.', 'Cooked with organic Amla, ghee, honey, and over 40 rejuvenating herbs.'], loreQuote: 'Youth is not mere years, but the vibrancy of inner Ojas.' },
    { id: 12, name: 'Guggulu', title: 'The Resin that Defends Against Disease', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=700&auto=format&fit=crop', answer: 'guggulu', aliases: ['guggulu', 'guggul'], hints: ['Aromatic gum resin harvested from the Mukul myrrh tree.', 'Scrapes away toxic Ama and deeply lubricates stiff joints.'], loreQuote: 'What is bound shall be melted, what is stiff shall soften.' },
    { id: 13, name: 'Shatavari', title: 'She of a Hundred Roots', image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=700&auto=format&fit=crop', answer: 'shatavari', aliases: ['shatavari', 'satavari'], hints: ['Premier cooling tonic for feminine vitality and hormonal harmony.', 'Moistens dry tissues and nurtures universal maternal energy.'], loreQuote: 'Gentleness nurtures the deepest roots of life.' },
    { id: 14, name: 'Amalaki (Amla)', title: 'The Sustainer & Nectar of Longevity', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=700&auto=format&fit=crop', answer: 'amla', aliases: ['amla', 'amalaki', 'indian gooseberry'], hints: ['The only fruit containing five of the six classical tastes (Rasa).', 'Richest natural source of bioavailable Vitamin C.'], loreQuote: 'Like a divine nurse, Amla never tires of caring for the body.' },
    { id: 15, name: 'Panchakarma', title: 'The Fivefold Purification Odyssey', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop', answer: 'panchakarma', aliases: ['panchakarma', 'panch karma'], hints: ['Classical systematic fivefold detoxification therapies.', 'Includes Vamana, Virechana, Basti, Nasya, and Raktamokshana.'], loreQuote: 'Purify the vessel before pouring in the elixir.' },
    { id: 16, name: 'Pippali', title: 'Long Pepper of Deep Bio-Enhancement', image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?q=80&w=700&auto=format&fit=crop', answer: 'pippali', aliases: ['pippali', 'long pepper'], hints: ['Potent rejuvenating spice that kindle Agni without aggravating Pitta.', 'Enhances the bioavailability of other botanical formulations.'], loreQuote: 'A small spark kindles the sacred inner digestive flame.' },
    { id: 17, name: 'Kumkumadi', title: 'Miraculous Saffron Radiance', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=700&auto=format&fit=crop', answer: 'kumkumadi', aliases: ['kumkumadi', 'saffron oil'], hints: ['Royal beauty oil distilled with pure Kashmiri saffron (Keshara).', 'Restores the golden luminous glow of the facial aura.'], loreQuote: 'Inner health reflects in outward radiance.' },
    { id: 18, name: 'Shankhpushpi', title: 'The Calming Conch Flower', image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=700&auto=format&fit=crop', answer: 'shankhpushpi', aliases: ['shankhpushpi'], hints: ['Blue and white blossoms shaped like the divine conch shell.', 'Induces peaceful restful sleep and quietens mental restlessness.'], loreQuote: 'Still waters reflect the sky.' },
    { id: 19, name: 'Vacha', title: 'Root of Eloquent Speech', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop', answer: 'vacha', aliases: ['vacha', 'calamus', 'sweet flag'], hints: ['Aromatic rhizome known as the voice root.', 'Stimulates articulate speech and clears brain fog.'], loreQuote: 'Clear speech arises from an unobstructed mind.' },
    { id: 20, name: 'Dinacharya', title: 'The Daily Rhythm of Harmony', image: 'https://images.unsplash.com/photo-1624494052342-990520bc973c?q=80&w=700&auto=format&fit=crop', answer: 'dinacharya', aliases: ['dinacharya', 'daily routine'], hints: ['The sacred science of aligning daily human habits with the cycles of the sun and seasons.', 'Includes waking at Brahma Muhurta, tongue scraping, and abhyanga self-massage.'], loreQuote: 'He who masters his morning masters his lifespan.' },
  ],
  temples: [
    {
      id: 1,
      name: 'Kedarnath Temple',
      title: 'Himalayan Shrine of Mahadeva',
      image: '/game/kedarnath_real.png',
      cartoon: '/game/kedarnath_real.png',
      answer: 'kedarnath',
      aliases: ['kedarnath', 'kedarnath temple', 'kedar'],
      hints: [
        'Perched at an altitude of 3,583 meters amidst towering snowbound Garhwal peaks.',
        'One of the twelve supreme Jyotirlingas and the crown of the Panch Kedar pilgrimage.',
        'Constructed of massive interlocking grey stone slabs that miraculously survived the catastrophic 2013 floods.',
        'Built by the Pandavas seeking forgiveness after Kurukshetra and revived by Adi Shankaracharya.',
      ],
      loreQuote: 'In the stillness of Himalayan snows, Shiva rests in eternal meditation.',
    },
    {
      id: 2,
      name: 'Brihadisvara Temple',
      title: 'Granite Wonder of Thanjavur',
      image: '/game/brihadisvara_real.png',
      cartoon: '/game/brihadisvara_real.png',
      answer: 'brihadisvara',
      aliases: ['brihadisvara', 'brihadeshwara', 'thanjavur temple', 'tanjore temple', 'peruvudaiyar'],
      hints: [
        'A thousand-year-old architectural marvel built entirely of granite by Emperor Raja Raja Chola I.',
        'Crowned by a single monolithic 80-tonne granite dome lifted to a height of 66 meters via an inclined ramp.',
        'Constructed without a single drop of mortar using interlocking puzzle stone joints.',
      ],
      loreQuote: 'A grand granite testament where geometry and devotion reach the clouds.',
    },
    {
      id: 3,
      name: 'Konark Sun Temple',
      title: 'The Cosmic Chariot of Surya',
      image: '/game/konark_real.png',
      cartoon: '/game/konark_real.png',
      answer: 'konark',
      aliases: ['konark', 'konark sun temple', 'sun temple'],
      hints: [
        'Conceived as a colossal stone chariot of Surya Bhagavan with 24 carved stone wheels pulled by 7 rearing horses.',
        'The spokes of its wheels function as precision sundials, accurate to within minutes.',
      ],
      loreQuote: 'Time itself is carved in stone across the wheels of the sun.',
    },
    {
      id: 4,
      name: 'Kashi Vishwanath',
      title: 'The Eternal City of Light',
      image: '/game/kashi_real.svg',
      cartoon: '/game/kashi_real.svg',
      answer: 'kashi',
      aliases: ['kashi', 'kashi vishwanath', 'varanasi', 'banaras'],
      hints: [
        'Standing on the western banks of the holy river Ganga in Varanasi, the oldest continually inhabited city.',
        'Gold-plated spire temple dedicated to Lord Shiva as the lord of the universe.',
      ],
      loreQuote: 'Kashi is not placed on the earth, but on the trident of Shiva.',
    },
    {
      id: 5,
      name: 'Meenakshi Temple',
      title: 'Gopuram Towers of Madurai',
      image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=700&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=700&auto=format&fit=crop',
      answer: 'meenakshi',
      aliases: ['meenakshi', 'meenakshi temple', 'madurai'],
      hints: [
        'Historic spiritual landmark of Madurai crowned with fourteen soaring painted gateway gopurams.',
        'Features the Hall of a Thousand Pillars where carved stone produces distinct musical notes when tapped.',
      ],
      loreQuote: 'Color and sacred architecture embrace millions of seekers.',
    },
    // Levels 6-20
    { id: 6, name: 'Somnath Temple', title: 'The First of Twelve Jyotirlingas', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=700&auto=format&fit=crop', answer: 'somnath', aliases: ['somnath', 'somnath temple'], hints: ['Reconstructed repeatedly as a symbol of resilient spiritual faith on Gujarat’s coastline.', 'First among the sacred twelve Jyotirlinga shrines.'], loreQuote: 'The ocean waves wash the feet of the immortal lingam.' },
    { id: 7, name: 'Hampi Virupaksha', title: 'Jewel of Vijayanagara', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=700&auto=format&fit=crop', answer: 'virupaksha', aliases: ['virupaksha', 'hampi', 'hampi temple'], hints: ['Unbroken worship for centuries amidst the boulder-strewn valleys of Tungabhadra.', 'Includes a pinhole camera effect where the inverted shadow of the gopuram falls inside a dark chamber.'], loreQuote: 'Even fallen empires leave monuments of eternal spirit.' },
    { id: 8, name: 'Jagannath Puri', title: 'The Sacred Kitchen & Ratha Yatra', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=700&auto=format&fit=crop', answer: 'jagannath', aliases: ['jagannath', 'puri', 'jagannath temple'], hints: ['Seat of Lord Jagannath, Balabhadra, and Subhadra along Odisha’s eastern shore.', 'Known for the world-famous chariot festival and the largest traditional clay pot kitchen.'], loreQuote: 'The Lord comes out into the streets to embrace every being.' },
    { id: 9, name: 'Badrinath Temple', title: 'Vishnu’s Himalayan Sanctuary', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=700&auto=format&fit=crop', answer: 'badrinath', aliases: ['badrinath', 'badri'], hints: ['Situated on the banks of Alaknanda in the shadow of Nilkantha peak.', 'Primary Char Dham shrine where Lord Vishnu meditated under the shelter of a berry tree.'], loreQuote: 'Silence reigns where Alaknanda whispers ancient mantras.' },
    { id: 10, name: 'Ramanathaswamy (Rameswaram)', title: 'The Endless Pillared Corridors', image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=700&auto=format&fit=crop', answer: 'rameswaram', aliases: ['rameswaram', 'ramanathaswamy'], hints: ['Southern Jyotirlinga where Sri Rama consecrated a sand lingam made by Mother Sita.', 'Boasts the longest carved pillared temple corridor in the entire world.'], loreQuote: 'Where penance meets peace upon the southern horizon.' },
    { id: 11, name: 'Kailasa Temple (Ellora)', title: 'The Monolithic Mountain Carved Top-Down', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop', answer: 'kailasa', aliases: ['kailasa', 'ellora', 'kailash temple'], hints: ['Cave 16 at Ellora carved out of a single volcanic basalt cliff from the top down.', 'Over 200,000 tonnes of rock were carved away without a single architectural miscalculation.'], loreQuote: 'Not built from stones, but freed from a mountain.' },
    { id: 12, name: 'Akshardham', title: 'Modern Oasis of Vedic Art', image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=700&auto=format&fit=crop', answer: 'akshardham', aliases: ['akshardham'], hints: ['Magnificent sandstone and marble monument along the Yamuna in New Delhi.', 'Features thousands of hand-carved celestial dancers, sages, and elephants.'], loreQuote: 'Ancient craft lives on through modern devotion.' },
    { id: 13, name: 'Golden Temple (Harmandir Sahib)', title: 'The Pool of Nectar', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=700&auto=format&fit=crop', answer: 'harmandir', aliases: ['golden temple', 'harmandir', 'amritsar'], hints: ['Gilded gurudwara encircled by the sacred Amrit Sarovar pool in Amritsar.', 'Feeds hundreds of thousands daily with unceasing community langar.'], loreQuote: 'Equality, humility, and selfless service shine brighter than gold.' },
    { id: 14, name: 'Belur Chennakeshava', title: 'Hoysala Filigree in Soapstone', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=700&auto=format&fit=crop', answer: 'belur', aliases: ['belur', 'chennakeshava'], hints: ['Built by King Vishnuvardhana in Karnataka featuring soft chloritic schist soapstone.', 'Carved with lace-like precision: jewelry, folds of fabric, and fingernails are distinct.'], loreQuote: 'Stone responds like wax when touched by inspired chisels.' },
    { id: 15, name: 'Tirupati Balaji (Venkateswara)', title: 'The Seven Sacred Hills', image: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?q=80&w=700&auto=format&fit=crop', answer: 'tirupati', aliases: ['tirupati', 'balaji', 'venkateswara'], hints: ['Nestled amidst the Seshachalam hills in Andhra Pradesh.', 'One of the most visited pilgrimage centers on earth dedicated to Lord Venkateswara.'], loreQuote: 'Surrender in the Kali Yuga brings peace at his lotus feet.' },
    { id: 16, name: 'Mahabalipuram Shore Temple', title: 'Granite Sentinels of the Bay of Bengal', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=700&auto=format&fit=crop', answer: 'mahabalipuram', aliases: ['mahabalipuram', 'shore temple', 'mamallapuram'], hints: ['Pallava rock-cut structural temple enduring coastal salt spray for over 1,300 years.', 'Features open-air monolithic bas-reliefs like the Descent of the Ganga.'], loreQuote: 'The ocean bows before the enduring rock.' },
    { id: 17, name: 'Lingaraja Temple', title: 'Crown of Kalinga Architecture', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=700&auto=format&fit=crop', answer: 'lingaraja', aliases: ['lingaraja', 'bhubaneswar'], hints: ['Oldest and largest temple in Bhubaneswar, the Temple City of India.', 'Dedicated to Harihara—a combined form of Lord Shiva and Lord Vishnu.'], loreQuote: 'Harmonizing Shiva and Vishnu in a single sacred sanctum.' },
    { id: 18, name: 'Dilwara Temples', title: 'Luminous Marble of Mount Abu', image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=700&auto=format&fit=crop', answer: 'dilwara', aliases: ['dilwara', 'mount abu'], hints: ['Perched upon Rajasthan’s Mount Abu, carved out of pure translucent white marble.', 'Ceilings feature suspended pendant lotus petals so thin they appear translucent.'], loreQuote: 'Purity of soul carved in translucent marble.' },
    { id: 19, name: 'Khajuraho Kandariya Mahadeva', title: 'The Symphony of Medieval Sandstone', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop', answer: 'khajuraho', aliases: ['khajuraho', 'kandariya'], hints: ['Built by Chandela kings in Madhya Pradesh representing Mount Meru.', 'Celebrates every aspect of human life, arts, and divine communion.'], loreQuote: 'Life in all its forms is an expression of the cosmic dance.' },
    { id: 20, name: 'Kamakhya Temple', title: 'The Primordial Shakti Peetha', image: 'https://images.unsplash.com/photo-1624494052342-990520bc973c?q=80&w=700&auto=format&fit=crop', answer: 'kamakhya', aliases: ['kamakhya', 'guwahati'], hints: ['Situated atop Nilachal hill in Assam, one of the oldest Shakti Peethas.', 'Celebrates the primordial power of divine feminine creation and mother earth.'], loreQuote: 'The source of all vitality is the supreme cosmic Mother.' },
  ],
  wisdom: [
    {
      id: 1,
      name: 'Chanakya (Kautilya)',
      title: 'Master of Statecraft & Arthashastra',
      image: '/game/chanakya_real.png',
      cartoon: '/game/chanakya.png',
      answer: 'chanakya',
      aliases: ['chanakya', 'kautilya', 'vishnugupta', 'acharya chanakya'],
      hints: [
        'Professor of political science and economics at the ancient Takshashila University.',
        'Author of the Arthashastra, the world’s first systematic treatise on economics and governance.',
        'Mentored young Chandragupta Maurya to forge the unified Mauryan Empire.',
        'His sharp aphorisms on life, strategy, and human character are compiled in Chanakya Niti.',
      ],
      loreQuote: 'A person should not be too honest; straight trees are cut first.',
    },
    {
      id: 2,
      name: 'Adi Shankaracharya',
      title: 'Beacon of Advaita Vedanta',
      image: '/game/shankara_real.svg',
      cartoon: '/game/shankara_real.svg',
      answer: 'shankara',
      aliases: ['shankara', 'adi shankara', 'shankaracharya', 'adi shankaracharya'],
      hints: [
        'Philosophical prodigy from Kaladi, Kerala who revived Sanatana Dharma across India.',
        'Consolidated Advaita Vedanta: Brahma Satyam Jagan Mithya (Brahman is real, the world is transient).',
        'Walked across the entire subcontinent, establishing four cardinal Mathas (Sringeri, Puri, Dwarka, Joshimath).',
      ],
      loreQuote: 'Brahma Satyam Jagan Mithya Jivo Brahmaiva Na Parah — The soul is none other than Brahman.',
    },
    {
      id: 3,
      name: 'Sage Patanjali',
      title: 'Codifier of Ashtanga Yoga',
      image: '/game/patanjali_real.svg',
      cartoon: '/game/patanjali_real.svg',
      answer: 'patanjali',
      aliases: ['patanjali', 'sage patanjali', 'maharishi patanjali'],
      hints: [
        'Compiled the 196 Yoga Sutras defining the eightfold path from Yama to Samadhi.',
        'Defined yoga: Yogas Citta-Vritti-Nirodhah (Yoga is the stilling of mental fluctuations).',
      ],
      loreQuote: 'When you are inspired by some great purpose, all your thoughts break their bonds.',
    },
    {
      id: 4,
      name: 'Maharishi Valmiki',
      title: 'The Adi Kavi (First Poet)',
      image: '/game/valmiki_real.svg',
      cartoon: '/game/valmiki_real.svg',
      answer: 'valmiki',
      aliases: ['valmiki', 'maharishi valmiki', 'adi kavi'],
      hints: [
        'The first poet who spontaneously uttered the very first rhythmic Sanskrit shloka in Anushtup meter.',
        'Authored the immortal 24,000 verses of the Valmiki Ramayana.',
      ],
      loreQuote: 'Poetry is born when deep sorrow transforms into divine compassion.',
    },
    {
      id: 5,
      name: 'Maharishi Ved Vyasa',
      title: 'Compiler of the Four Vedas',
      image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=700&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=700&auto=format&fit=crop',
      answer: 'vyasa',
      aliases: ['vyasa', 'ved vyasa', 'veda vyasa', 'badarayana'],
      hints: [
        'Divided the primordial single Veda into Rig, Sama, Yajur, and Atharva for future generations.',
        'Author of the monumental Mahabharata, the eighteen Puranas, and the Brahma Sutras.',
      ],
      loreQuote: 'What is found here may be found elsewhere; what is not here is nowhere.',
    },
    // Levels 6-20
    { id: 6, name: 'Gargi Vachaknavi', title: 'The Fearless Philosopher', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=700&auto=format&fit=crop', answer: 'gargi', aliases: ['gargi'], hints: ['Vedic woman philosopher who engaged Sage Yajnavalkya in intellectual debate at King Janaka’s court.', 'Inquired: Upon what is the fabric of space itself woven?'], loreQuote: 'Truth yields to courageous inquiry, not to titles.' },
    { id: 7, name: 'Aryabhata', title: 'Pioneer of the Zero & Orbital Spheres', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=700&auto=format&fit=crop', answer: 'aryabhata', aliases: ['aryabhata', 'aryabhatt'], hints: ['Ancient mathematician and astronomer from Kusumpura (Patna) who authored the Aryabhatiya.', 'Calculated Pi to 4 decimal places and proved the earth rotates on its axis.'], loreQuote: 'The stars turn not around us, but we spin within their grand embrace.' },
    { id: 8, name: 'Panini', title: 'The Father of Formal Linguistics', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop', answer: 'panini', aliases: ['panini'], hints: ['Grammarian from Gandhara who authored the Ashtadhyayi with 3,959 algebraic sutras.', 'Created the first complete generative algorithmic language framework in human history.'], loreQuote: 'Grammar is the mathematical architecture of human thought.' },
    { id: 9, name: 'Kanada', title: 'The Philosopher of the Atom (Anu)', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=700&auto=format&fit=crop', answer: 'kanada', aliases: ['kanada', 'sage kanada', 'kashyapa'], hints: ['Founder of the Vaisheshika school of natural philosophy.', 'Postulated that all matter consists of indivisible, indestructible particles called Parmanu (atoms).'], loreQuote: 'The cosmos is built of indivisible points of light and matter.' },
    { id: 10, name: 'Varahamihira', title: 'Cosmic Astrologer & Hydrologist', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=700&auto=format&fit=crop', answer: 'varahamihira', aliases: ['varahamihira'], hints: ['Royal scholar of Ujjain who authored the encyclopedic Brihat Samhita.', 'Documented planetary motions, earthquake predictions, and ground water detection.'], loreQuote: 'The skies reflect the unfolding rhythm of earthly destiny.' },
    { id: 11, name: 'Kapila Muni', title: 'The Father of Samkhya Philosophy', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=700&auto=format&fit=crop', answer: 'kapila', aliases: ['kapila', 'kapil muni'], hints: ['Expounded the dualistic philosophy of Purusha (Consciousness) and Prakriti (Matter).', 'His hermitage is commemorated at Ganga Sagar where the holy river enters the sea.'], loreQuote: 'Discern the seer from the seen, and freedom is won.' },
    { id: 12, name: 'Maitreyi', title: 'Seeker of the Immortal Soul', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=700&auto=format&fit=crop', answer: 'maitreyi', aliases: ['maitreyi'], hints: ['Philosopher wife of Sage Yajnavalkya in the Brihadaranyaka Upanishad.', 'Asked: What shall I do with wealth if it cannot give me immortality?'], loreQuote: 'Wealth buys comfort, but wisdom grants the eternal.' },
    { id: 13, name: 'Bhaskaracharya', title: 'Master of Lilavati & Gravity', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=700&auto=format&fit=crop', answer: 'bhaskara', aliases: ['bhaskara', 'bhaskaracharya'], hints: ['12th-century mathematician who wrote Siddhanta Shiromani and Lilavati for his daughter.', 'Described gravitational pull (Gurutvakarshan) centuries before western science.'], loreQuote: 'Objects fall towards the earth because it is in earth’s nature to attract.' },
    { id: 14, name: 'Gautama Maharishi', title: 'Architect of Nyaya Logic', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop', answer: 'gautama', aliases: ['gautama', 'akshapada gautama'], hints: ['Formulated the Nyaya Sutras establishing 16 pramanas of rigorous logical inquiry.', 'Husband of Ahalya, whose hermitage stood along the sacred Godavari.'], loreQuote: 'Proper logic clears the mirrors of perception.' },
    { id: 15, name: 'Jaimini', title: 'Master of Mimamsa & Dharma Karma', image: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?q=80&w=700&auto=format&fit=crop', answer: 'jaimini', aliases: ['jaimini'], hints: ['Disciple of Ved Vyasa who authored the Purva Mimamsa Sutras.', 'Focused on the power of Vedic mantras, sacred sound vibrations, and righteous action.'], loreQuote: 'Righteous action performed with pure devotion creates auspicious fruit.' },
    { id: 16, name: 'Bhartrihari', title: 'The Poet of Detachment & Worldly Life', image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=700&auto=format&fit=crop', answer: 'bhartrihari', aliases: ['bhartrihari'], hints: ['King of Ujjain who alternated between worldly royalty and ascetic contemplation.', 'Authored the Vairagya Shatakam (Hundred Verses on Renunciation) and Niti Shatakam.'], loreQuote: 'In renunciation alone lies freedom from fear.' },
    { id: 17, name: 'Madhvacharya', title: 'Champion of Dvaita Realism', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop', answer: 'madhva', aliases: ['madhva', 'madhvacharya', 'anandatirtha'], hints: ['13th-century philosopher from Udupi who propounded Tattvavada (Dvaita).', 'Established the Krishna temple at Udupi and installed the idol found in sea clay.'], loreQuote: 'Every individual soul is distinct and eternally beloved of the Lord.' },
    { id: 18, name: 'Ramanujacharya', title: 'The Apostle of Vishishtadvaita & Grace', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=700&auto=format&fit=crop', answer: 'ramanuja', aliases: ['ramanuja', 'ramanujacharya'], hints: ['Climbed the temple tower of Thirukoshtiyur to shout the secret liberating mantra to all beings.', 'Championed the philosophy of qualified non-dualism (Vishishtadvaita) and universal Bhakti.'], loreQuote: 'If sharing the secret mantra frees thousands, I willingly accept any consequence.' },
    { id: 19, name: 'Thiruvalluvar', title: 'Weaver of the Immortal Tirukkural', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=700&auto=format&fit=crop', answer: 'thiruvalluvar', aliases: ['thiruvalluvar', 'valluvar'], hints: ['Celebrated Tamil poet-philosopher who gave the world the 1,330 couplets of the Tirukkural.', 'Covers ethics (Aram), prosperity (Porul), and noble love (Inbam) across universal lines.'], loreQuote: 'Water will flow to the depth of the well; virtue flows to the depth of the mind.' },
    { id: 20, name: 'Brahma Rishi Vasishtha', title: 'Guru of the Solar Dynasty', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700&auto=format&fit=crop', answer: 'vasishtha', aliases: ['vasishtha', 'vashistha', 'vashisht'], hints: ['Chief preceptor of the Ikshvaku royal dynasty and husband of devoted Arundhati.', 'Imparted the profound non-dual wisdom of Yoga Vasishtha to young Prince Rama.'], loreQuote: 'The world is as you perceive it; change your perception, and reality transforms.' },
  ],
};

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'gold-crown',
    name: 'Sacred Gold Crown (मुकुट)',
    category: 'Jewelry',
    price: 100,
    forCategory: ['ramayana', 'mahabharata', 'temples'],
    icon: '👑',
    rarity: 'Epic',
    description: 'Consecrated golden crown adorned with navaratna gems, worn by kings and divine beings.',
    benefit: '+20% bonus coins awarded on all first-try character guesses.',
  },
  {
    id: 'peacock-feather',
    name: 'Peacock Feather (मयूरपिच्छ)',
    category: 'Accessory',
    price: 50,
    forCategory: ['mahabharata', 'wisdom'],
    icon: '🪶',
    rarity: 'Rare',
    description: 'Radiant feather mirroring Sri Krishna’s divine headpiece, symbol of equanimity and joy.',
    benefit: 'Unlocks a radiant golden halo frame around your seeker avatar.',
  },
  {
    id: 'royal-bow',
    name: 'Kodikanda Divine Bow (कोदण्ड)',
    category: 'Weapon',
    price: 150,
    forCategory: ['ramayana', 'mahabharata'],
    icon: '🏹',
    rarity: 'Legendary',
    description: 'Celestial bow of Sri Rama forged to protect cosmic truth and pierce the veil of illusion.',
    benefit: 'Reduces incorrect guess coin penalties by 50%.',
  },
  {
    id: 'floral-garland',
    name: 'Vanamala / Tulsi Japa Mala',
    category: 'Relic',
    price: 60,
    forCategory: ['ramayana', 'mahabharata', 'ayurveda', 'temples', 'wisdom'],
    icon: '📿',
    rarity: 'Common',
    description: '108 pure holy basil and lotus seed beads consecrated for steadying meditative focus.',
    benefit: 'Emits a soothing singing bowl vibration upon every correct puzzle move.',
  },
  {
    id: 'temple-bell',
    name: 'Conch & Divine Bell (शङ्ख घण्टा)',
    category: 'Decoration',
    price: 80,
    forCategory: ['temples', 'wisdom', 'ramayana'],
    icon: '🔔',
    rarity: 'Rare',
    description: 'Sacred brass temple bell that disperses negative thoughts and brings sattvic clarity.',
    benefit: 'Automatically flashes the next correct tile in green when requested.',
  },
  {
    id: 'herbal-pot',
    name: 'Amrita Rasayana Pot (कलश)',
    category: 'Relic',
    price: 70,
    forCategory: ['ayurveda', 'wisdom'],
    icon: '🏺',
    rarity: 'Rare',
    description: 'Golden urn holding botanical nectar formulated by Sage Charaka and Lord Dhanvantari.',
    benefit: 'Provides a free letter clue whenever you need assistance guessing a name.',
  },
  {
    id: 'gold-plating',
    name: 'Temple Gold Leafing (सुवर्ण लेपन)',
    category: 'Decoration',
    price: 200,
    forCategory: ['temples', 'ramayana', 'mahabharata'],
    icon: '✨',
    rarity: 'Legendary',
    description: 'Pure 24-karat gold leafing mirroring the glowing spires of Kashi and Somnath.',
    benefit: 'Transforms the avatar preview with a shimmering golden cosmic aura.',
  },
  {
    id: 'rudraksha-patanjali',
    name: 'Five-Mukhi Rudraksha of Patanjali',
    category: 'Relic',
    price: 120,
    forCategory: ['wisdom', 'temples', 'ayurveda'],
    icon: '🧘',
    rarity: 'Epic',
    description: 'Sacred seed infused with the vibrational silence of the Yoga Sutras.',
    benefit: 'Earns 2x XP points for all completed jigsaw puzzle levels.',
  },
];

// Audio tone synthesizer using Web Audio API
function playSound(type: 'slide' | 'hint' | 'guess_correct' | 'level_win' | 'buy') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    if (type === 'slide') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.07);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'hint') {
      [528, 660, 792].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.45);
      });
    } else if (type === 'guess_correct' || type === 'level_win') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.55);
      });
    } else if (type === 'buy') {
      [987.77, 1318.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.14, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    }
  } catch {
    // Autoplay policy or unsupported audio context
  }
}

// Solvable 3x3 shuffle logic
function generateSolvableBoard(): number[] {
  // 3x3 = 9 slots: 0 to 7 are pieces, -1 is empty cell
  const board = [0, 1, 2, 3, 4, 5, 6, 7, -1];
  let emptyIdx = 8;
  const numMoves = 60;

  for (let i = 0; i < numMoves; i++) {
    const row = Math.floor(emptyIdx / 3);
    const col = emptyIdx % 3;
    const neighbors: number[] = [];
    if (row > 0) neighbors.push(emptyIdx - 3);
    if (row < 2) neighbors.push(emptyIdx + 3);
    if (col > 0) neighbors.push(emptyIdx - 1);
    if (col < 2) neighbors.push(emptyIdx + 1);

    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    // Swap empty with neighbor
    board[emptyIdx] = board[pick];
    board[pick] = -1;
    emptyIdx = pick;
  }
  return board;
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

export default function GamificationPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const guestUser = useMemo(
    () => ({
      id: 'guest_seeker',
      displayName: 'Seeker',
      email: 'seeker@aigurukul.org',
    }),
    []
  );
  const activeUser = user || guestUser;


  // Screen State
  const [screen, setScreen] = useState<'categories' | 'saga-map' | 'puzzle-play' | 'boutique'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('ramayana');
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [sagaViewMode, setSagaViewMode] = useState<'map' | 'grid'>('map');

  // Persistent Game State (Per Authenticated User)
  const [coins, setCoins] = useState<number>(150);
  const [unlockedLevels, setUnlockedLevels] = useState<Record<GameCategory, number>>({
    ramayana: 1,
    mahabharata: 1,
    ayurveda: 1,
    temples: 1,
    wisdom: 1,
  });
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const [inventory, setInventory] = useState<{ id: string; equipped: boolean }[]>([
    { id: 'gold-crown', equipped: true },
  ]);
  const [userLoaded, setUserLoaded] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Audio / Sound toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Tutorial Modal
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  // Jigsaw Puzzle State (3x3 grid)
  const [boardState, setBoardState] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, -1]);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [currentGuessPoints, setCurrentGuessPoints] = useState<number>(100);
  const [guessInput, setGuessInput] = useState<string>('');
  const [guessSuccess, setGuessSuccess] = useState<boolean>(false);
  const [guessFeedback, setGuessFeedback] = useState<string | null>(null);
  const [puzzleWon, setPuzzleWon] = useState<boolean>(false);
  const [showClue, setShowClue] = useState<boolean>(false);
  const [activeHintModal, setActiveHintModal] = useState<string | null>(null);

  // Free Swap vs Slide Mode (Age-friendly toggle)
  const [swapMode, setSwapMode] = useState<boolean>(false);
  const [selectedPieceIdx, setSelectedPieceIdx] = useState<number | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3D Avatar Tilt ref
  const avatarCardRef = useRef<HTMLDivElement>(null);

  // Quick Demo Seeker Switcher (Allows testing multiple isolated user tracks directly)
  const loginAsDemoUser = (demoType: 'user1' | 'user2') => {
    const demoProfiles = {
      user1: {
        id: 'seeker_user_1',
        email: 'user1@gurukul.ai',
        displayName: 'Seeker Arjuna (User 1)',
        role: 'scholar' as const,
        preferences: { defaultPersona: 'krishna' as const, language: 'en' as const, notificationsEnabled: true },
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      user2: {
        id: 'seeker_user_2',
        email: 'user2@gurukul.ai',
        displayName: 'Seeker Draupadi (User 2)',
        role: 'scholar' as const,
        preferences: { defaultPersona: 'krishna' as const, language: 'en' as const, notificationsEnabled: true },
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    const target = demoProfiles[demoType];
    localStorage.setItem('aigurukul_user', JSON.stringify(target));
    localStorage.setItem('aigurukul_access_token', `demo_token_${demoType}`);
    window.dispatchEvent(new CustomEvent('aigurukul_auth_state_changed', { detail: { user: target } }));
    showToast(`🧘 Welcomed ${target.displayName}! Loaded isolated saga track.`);
  };

  // Load user-specific game state from localStorage whenever user ID changes
  useEffect(() => {
    if (!user?.id) {
      setUserLoaded(false);
      return;
    }

    try {
      const userKey = `aigurukul_game_user_${user.id}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.coins === 'number') setCoins(parsed.coins);
        if (parsed.unlockedLevels) {
          setUnlockedLevels({
            ramayana: parsed.unlockedLevels.ramayana || 1,
            mahabharata: parsed.unlockedLevels.mahabharata || 1,
            ayurveda: parsed.unlockedLevels.ayurveda || 1,
            temples: parsed.unlockedLevels.temples || 1,
            wisdom: parsed.unlockedLevels.wisdom || 1,
          });
        }
        if (Array.isArray(parsed.completedLevels)) {
          setCompletedLevels(parsed.completedLevels);
        }
        if (Array.isArray(parsed.inventory)) {
          setInventory(parsed.inventory);
        }
      } else {
        // First time this user plays: initialize clean starter state
        const initial = {
          userId: user.id,
          userName: user.displayName || user.email,
          coins: 150,
          unlockedLevels: {
            ramayana: 1,
            mahabharata: 1,
            ayurveda: 1,
            temples: 1,
            wisdom: 1,
          },
          completedLevels: [],
          inventory: [{ id: 'gold-crown', equipped: true }],
          createdAt: new Date().toISOString(),
        };
        setCoins(initial.coins);
        setUnlockedLevels(initial.unlockedLevels);
        setCompletedLevels(initial.completedLevels);
        setInventory(initial.inventory);
        localStorage.setItem(userKey, JSON.stringify(initial));
      }
    } catch (err) {
      console.error('Error hydrating user game state:', err);
    } finally {
      setUserLoaded(true);
    }
  }, [user?.id, user?.displayName, user?.email]);

  // Persist game state specifically for the current authenticated user
  useEffect(() => {
    if (!user?.id || !userLoaded) return;
    try {
      const userKey = `aigurukul_game_user_${user.id}`;
      localStorage.setItem(
        userKey,
        JSON.stringify({
          userId: user.id,
          userName: user.displayName || user.email,
          coins,
          unlockedLevels,
          completedLevels,
          inventory,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore storage error
    }
  }, [user?.id, user?.displayName, user?.email, userLoaded, coins, unlockedLevels, completedLevels, inventory]);

  const activeCategoryData = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  const activeLevelData: LevelData = useMemo(() => {
    const list = CATEGORY_LEVELS[selectedCategory] || CATEGORY_LEVELS.ramayana;
    return list.find((l) => l.id === selectedLevelId) || list[0];
  }, [selectedCategory, selectedLevelId]);

  function triggerSound(type: 'slide' | 'hint' | 'guess_correct' | 'level_win' | 'buy') {
    if (soundEnabled) playSound(type);
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Launch a level
  function startLevel(lvlId: number) {
    setSelectedLevelId(lvlId);
    setBoardState(generateSolvableBoard());
    setRevealedHints([]);
    setCurrentGuessPoints(100);
    setGuessInput('');
    setGuessSuccess(false);
    setGuessFeedback(null);
    setPuzzleWon(false);
    setShowClue(false);
    setSelectedPieceIdx(null);
    setScreen('puzzle-play');

    // Show tutorial automatically for level 1 if not shown before
    if (lvlId === 1 && !completedLevels.includes(`${selectedCategory}-1`)) {
      setShowTutorial(true);
    }
  }

  // Handle Sliding or Swapping
  function handlePieceClick(index: number) {
    if (puzzleWon) return;

    if (swapMode) {
      // Free swap mode (friendly for kids / elderly)
      if (selectedPieceIdx === null) {
        setSelectedPieceIdx(index);
      } else {
        const first = selectedPieceIdx;
        const second = index;
        setSelectedPieceIdx(null);
        if (first === second) return;

        const newBoard = [...boardState];
        const temp = newBoard[first];
        newBoard[first] = newBoard[second];
        newBoard[second] = temp;
        setBoardState(newBoard);
        triggerSound('slide');

        // Check if either moved piece reached correct slot
        checkPiecePlacement(second, newBoard[second]);
        checkPiecePlacement(first, newBoard[first]);
        verifyBoardCompletion(newBoard);
      }
      return;
    }

    // Classic 3x3 Sliding Puzzle Mode
    const emptyIdx = boardState.indexOf(-1);
    if (emptyIdx === -1) return;

    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIdx / 3);
    const emptyCol = emptyIdx % 3;

    const distance = Math.abs(row - emptyRow) + Math.abs(col - emptyCol);
    if (distance === 1) {
      // Valid adjacent slide!
      const newBoard = [...boardState];
      newBoard[emptyIdx] = newBoard[index];
      newBoard[index] = -1;
      setBoardState(newBoard);
      triggerSound('slide');

      // Check if newly placed piece is in correct spot
      checkPiecePlacement(emptyIdx, newBoard[emptyIdx]);
      verifyBoardCompletion(newBoard);
    }
  }

  function checkPiecePlacement(slotIdx: number, pieceId: number) {
    if (pieceId === slotIdx && pieceId !== -1) {
      // Piece placed correctly! Reveal hint if available
      const hints = activeLevelData.hints;
      const hintIndex = pieceId % hints.length;
      const hintText = hints[hintIndex];

      if (!revealedHints.includes(hintText)) {
        setRevealedHints((prev) => [...prev, hintText]);
        setActiveHintModal(hintText);
        triggerSound('hint');

        // Auto close divine hint card after 5 seconds
        setTimeout(() => {
          setActiveHintModal(null);
        }, 5000);

        // Deduct slight reward decay for unlocking hints to reward quick solvers
        if (!guessSuccess) {
          setCurrentGuessPoints((prev) => Math.max(30, prev - 5));
        }
      }
    }
  }

  function verifyBoardCompletion(currentBoard: number[]) {
    // 0..7 must match indices, index 8 is -1
    const isComplete = currentBoard.every((val, idx) => {
      if (idx === 8) return val === -1 || val === 8;
      return val === idx;
    });

    if (isComplete && !puzzleWon) {
      setPuzzleWon(true);
      triggerSound('level_win');

      // Fill in the missing 9th slot
      setBoardState([0, 1, 2, 3, 4, 5, 6, 7, 8]);

      const tag = `${selectedCategory}-${selectedLevelId}`;
      const rewardCoins = guessSuccess ? 40 : 60;
      const nextCoins = coins + rewardCoins;
      setCoins(nextCoins);

      let nextCompleted = completedLevels;
      let nextUnlocked = { ...unlockedLevels };

      if (!completedLevels.includes(tag)) {
        nextCompleted = [...completedLevels, tag];
        setCompletedLevels(nextCompleted);

        const currentUnlocked = unlockedLevels[selectedCategory] || 1;
        if (selectedLevelId >= currentUnlocked && currentUnlocked < 20) {
          nextUnlocked[selectedCategory] = selectedLevelId + 1;
          setUnlockedLevels(nextUnlocked);
        }
      }

      // Save immediately to user record
      const userKey = `aigurukul_game_user_${activeUser.id}`;
      try {
        localStorage.setItem(
          userKey,
          JSON.stringify({
            userId: activeUser.id,
            userName: activeUser.displayName || activeUser.email,
            coins: nextCoins,
            unlockedLevels: nextUnlocked,
            completedLevels: nextCompleted,
            inventory,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {
        // Ignore
      }
      showToast(`🏆 Level ${selectedLevelId} Conquered! Saved to ${activeUser.displayName || 'Seeker'} (+${rewardCoins} 🪙)`);
    }
  }

  // Handle Character Name Guess
  function handleSubmitGuess() {
    if (guessSuccess || puzzleWon) return;

    const query = guessInput.trim().toLowerCase();
    if (!query) return;

    const matched =
      query === activeLevelData.answer.toLowerCase() ||
      activeLevelData.aliases.some((alias) => alias.toLowerCase() === query);

    if (matched) {
      setGuessSuccess(true);
      setGuessFeedback(`🎉 Magnificent! You recognized ${activeLevelData.name}! +${currentGuessPoints} 🪙 Coins earned!`);
      const nextCoins = coins + currentGuessPoints;
      setCoins(nextCoins);
      triggerSound('guess_correct');
      showToast(`✨ Brilliant! +${currentGuessPoints} Coins added to your vault!`);

      const userKey = `aigurukul_game_user_${activeUser.id}`;
      try {
        localStorage.setItem(
          userKey,
          JSON.stringify({
            userId: activeUser.id,
            userName: activeUser.displayName || activeUser.email,
            coins: nextCoins,
            unlockedLevels,
            completedLevels,
            inventory,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {}

        apiClient('/gamification/award-xp', {
          method: 'POST',
          body: JSON.stringify({
            xp: 25,
            coins: currentGuessPoints,
            reason: `Recognized ${activeLevelData.name} in ${selectedCategory}`,
          }),
        }).catch(() => {});
    } else {
      triggerSound('slide');
      setGuessFeedback(`Not quite! Reflect upon the divine hints above and try again.`);
      setCurrentGuessPoints((prev) => Math.max(25, prev - 10));
    }
  }

  // Shop purchase
  function handleBuyItem(item: ShopItem) {
    if (coins < item.price) {
      showToast(`❌ Insufficient coins! Need ${item.price} 🪙, you have ${coins} 🪙.`);
      return;
    }

    setCoins((c) => c - item.price);
    setInventory((prev) => [...prev, { id: item.id, equipped: true }]);
    triggerSound('buy');
    showToast(`🛍️ Acquired "${item.name}"! Equipped to your avatar.`);
  }

  function handleToggleEquip(itemId: string) {
    setInventory((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, equipped: !i.equipped } : i))
    );
    showToast('✨ Avatar equipment updated!');
  }

  // 3D Parallax Tilt Handler
  function handleAvatarMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!avatarCardRef.current) return;
    const rect = avatarCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (centerY - y) / 12;
    const rotateY = (x - centerX) / 12;

    avatarCardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }

  function handleAvatarMouseLeave() {
    if (!avatarCardRef.current) return;
    avatarCardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  }

  // Clue display (first and last letter)
  const letterClue = useMemo(() => {
    const word = activeLevelData.name.replace(/^(Lord|Sage|King|Goddess)\s+/i, '').trim();
    if (word.length <= 2) return word;
    return `${word[0].toUpperCase()} ${' _ '.repeat(Math.max(1, word.length - 2))} ${word[word.length - 1].toUpperCase()} (${word.length} letters)`;
  }, [activeLevelData]);

  // Multiple-choice options for quick tap (super friendly for all ages / mobile)
  const quickChoices = useMemo(() => {
    const current = activeLevelData.name;
    const list = (CATEGORY_LEVELS[selectedCategory] || []).map((l) => l.name);
    const others = list.filter((n) => n !== current).sort(() => Math.random() - 0.5).slice(0, 3);
    return [current, ...others].sort(() => Math.random() - 0.5);
  }, [activeLevelData, selectedCategory]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0D0B08',
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 60%)',
        color: '#EDE8D5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ----------------------------------------------------------------- */}
      {/* GLOBAL GAME HEADER (Sticky) */}
      {/* ----------------------------------------------------------------- */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'rgba(13, 11, 8, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.35)',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.7)',
        }}
      >
        {/* Left: Exit/Back Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => {
              if (screen === 'boutique') setScreen('saga-map');
              else if (screen === 'puzzle-play') setScreen('saga-map');
              else if (screen === 'saga-map') setScreen('categories');
              else if (screen === 'categories') window.location.href = '/';
            }}
            style={{
              background: '#D4AF37',
              color: '#0D0B08',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.05em',
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'transform 0.15s ease',
            }}
          >
            ← EXIT
          </button>

          <span
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#F2D675',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {screen === 'categories' && 'VEDIC CHRONICLES: SELECT YOUR REALM'}
            {screen === 'saga-map' && `${activeCategoryData.name} SAGA MAP`}
            {screen === 'puzzle-play' && `LEVEL ${selectedLevelId}: ${activeCategoryData.name} CHALLENGE`}
            {screen === 'boutique' && `${activeCategoryData.name}'S DIVINE BOUTIQUE`}
          </span>
        </div>

        {/* Right: Seeker Capsule, Switch User, Rules, Sound, Coins, Shop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Seeker Profile Capsule */}
          <button
            onClick={() => setShowProfileModal(true)}
            title="View your Seeker Saga Progress"
            style={{
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#F2D675',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <span>🧘</span>
            <span>{activeUser.displayName || activeUser.email.split('@')[0]}</span>
            <span
              style={{
                background: '#D4AF37',
                color: '#0D0B08',
                borderRadius: '10px',
                padding: '1px 6px',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}
            >
              {completedLevels.length}/100
            </span>
          </button>

          {/* Switch Seeker / Logout */}
          <button
            onClick={() => {
              if (window.confirm('Switch seeker or log out of current chronicle?')) {
                logout();
                showToast('Seeker logged out. Sanctum locked.');
              }
            }}
            title="Switch Seeker / Logout"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              padding: '0.4rem 0.65rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            🚪 Switch
          </button>

          {/* Rules/Info Button */}
          <button
            onClick={() => setShowTutorial(true)}
            title="How to Play / Rules"
            style={{
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#F2D675',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            📜 Rules
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#EDE8D5',
              padding: '0.45rem 0.65rem',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Coins Pill */}
          <div
            style={{
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid #D4AF37',
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
              color: '#F2D675',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.2)',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🪙</span>
            <span>{coins}</span>
          </div>

          {/* Shop Button */}
          <button
            onClick={() => setScreen('boutique')}
            style={{
              background: 'linear-gradient(135deg, #F2D675 0%, #D4AF37 100%)',
              color: '#0D0B08',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.04em',
              padding: '0.45rem 1.1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 10px rgba(212, 175, 55, 0.4)',
            }}
          >
            🛍️ SHOP
          </button>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* SEEKER JOURNEY STATS MODAL */}
      {/* ----------------------------------------------------------------- */}
      {showProfileModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              background: '#16130B',
              border: '2px solid #D4AF37',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              color: '#EDE8D5',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🧘</span>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-serif, serif)', color: '#F2D675', fontSize: '1.3rem' }}>
                    {activeUser.displayName || activeUser.email}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#9A9078' }}>
                    Seeker ID: {activeUser.id} • {activeUser.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9A9078',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.85rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#9A9078', textTransform: 'uppercase' }}>Total Solved</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F2D675' }}>
                  {completedLevels.length} / 100
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#9A9078', textTransform: 'uppercase' }}>Divine Vault</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F2D675' }}>
                  🪙 {coins}
                </div>
              </div>
            </div>

            <h4
              style={{
                fontFamily: 'var(--font-serif, serif)',
                color: '#D4AF37',
                fontSize: '1rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '0.8rem',
              }}
            >
              Realm Progress Breakdown
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {CATEGORIES.map((cat) => {
                const count = completedLevels.filter((k) => k.startsWith(`${cat.id}-`)).length;
                const unlocked = unlockedLevels[cat.id] || 1;
                const pct = Math.round((count / 20) * 100);
                return (
                  <div
                    key={cat.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: '#EDE8D5' }}>
                        {cat.icon} {cat.name}
                      </span>
                      <span style={{ color: '#F2D675' }}>
                        {count}/20 Solved (Lvl {unlocked} Active)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #D4AF37, #10B981)',
                          borderRadius: '3px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  logout();
                  showToast('Logged out.');
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#F87171',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Log Out
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  background: '#D4AF37',
                  color: '#0D0B08',
                  border: 'none',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '4.8rem',
            right: '1.5rem',
            zIndex: 9999,
            background: 'rgba(212, 175, 55, 0.95)',
            color: '#0D0B08',
            fontWeight: 700,
            padding: '0.8rem 1.4rem',
            borderRadius: '8px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
            border: '1px solid #FFF',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SCREEN 1: CATEGORY SELECTION (Matches User Image 4) */}
      {/* ----------------------------------------------------------------- */}
      {screen === 'categories' && (
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '3.5rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '0.35rem 1.1rem',
                borderRadius: '20px',
                fontSize: '0.85rem',
                color: '#F2D675',
                marginBottom: '0.85rem',
              }}
            >
              🧘 Seeker: <strong>{activeUser.displayName || activeUser.email}</strong> • {completedLevels.length} of 100 Levels Conquered
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                color: '#D4AF37',
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
              }}
            >
              Choose Your Sacred Chronicle
            </h1>
            <p style={{ color: '#9A9078', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
              Embark on a multi-level sliding jigsaw odyssey through ancient epics, ayurvedic healing, and architectural wonders.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.8rem',
            }}
          >
            {CATEGORIES.map((cat) => {
              const unlocked = unlockedLevels[cat.id] || 1;
              const solvedCount = completedLevels.filter((k) => k.startsWith(`${cat.id}-`)).length;
              const pct = Math.round((solvedCount / 20) * 100);
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setScreen('saga-map');
                    triggerSound('slide');
                  }}
                  style={{
                    background: 'rgba(25, 22, 15, 0.9)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '16px',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = '#D4AF37';
                    e.currentTarget.style.boxShadow = '0 12px 36px rgba(212, 175, 55, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
                  }}
                >
                  <div style={{ fontSize: '3.2rem', marginBottom: '1.25rem' }}>{cat.icon}</div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif, serif)',
                      fontSize: '1.45rem',
                      color: '#F2D675',
                      letterSpacing: '0.05em',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {cat.name}
                  </h3>
                  <p style={{ color: '#9A9078', fontSize: '0.9rem', marginBottom: '1.1rem' }}>
                    {cat.subtitle}
                  </p>

                  {/* Progress Bar */}
                  <div style={{ width: '85%', margin: '0 auto 0.85rem', background: 'rgba(0,0,0,0.6)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37, #10B981)', borderRadius: '3px' }} />
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'rgba(212, 175, 55, 0.12)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      color: '#EDE8D5',
                    }}
                  >
                    <span>⚡ Level {unlocked} / 20</span>
                    <span style={{ color: '#D4AF37' }}>•</span>
                    <span style={{ color: '#A7F3D0' }}>{solvedCount} Solved</span>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SCREEN 2: SAGA MAP (Matches User Image 1) */}
      {/* ----------------------------------------------------------------- */}
      {screen === 'saga-map' && (
        <main
          style={{
            position: 'relative',
            width: '100%',
            minHeight: 'calc(100vh - 70px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem 1rem',
          }}
        >
          {/* Header indicator */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', zIndex: 10 }}>
            <span
              style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: '1.8rem',
                color: '#D4AF37',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {activeCategoryData.icon} {activeCategoryData.name} SAGA MAP
            </span>
            <p style={{ color: '#9A9078', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Seeker <strong>{activeUser.displayName || activeUser.email}</strong>: {completedLevels.filter((k) => k.startsWith(`${selectedCategory}-`)).length} of 20 Challenges Mastered
            </p>
          </div>

          {/* S-Curve Landscape Saga Map Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1150px',
              height: '520px',
              margin: '0 auto',
            }}
          >
            {/* Winding Trail SVG */}
            <svg
              viewBox="0 0 1000 520"
              preserveAspectRatio="xMidYMid meet"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <path
                d="M 50,300 C 150,80 350,80 500,260 C 650,450 850,450 950,260"
                stroke="#D4AF37"
                strokeWidth="4"
                fill="none"
                strokeDasharray="10 10"
                opacity="0.38"
              />
            </svg>

            {/* 20 Circular Nodes placed along the curve */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
              {Array.from({ length: 20 }).map((_, i) => {
                const lvlNum = i + 1;
                const unlocked = unlockedLevels[selectedCategory] || 1;
                const isLocked = lvlNum > unlocked;
                const isCompleted = completedLevels.includes(`${selectedCategory}-${lvlNum}`);
                const isCurrent = lvlNum === unlocked;

                // Mathematical placement along S-curve
                const t = i / 19;
                const x = 50 + t * 900;
                // Double harmonic for elegant S-curve matching the SVG
                const y = 270 + Math.sin(t * Math.PI * 2) * 165;

                const levelObj = (CATEGORY_LEVELS[selectedCategory] || [])[i];
                const charName = levelObj ? levelObj.name : `Level ${lvlNum}`;

                return (
                  <div
                    key={lvlNum}
                    onClick={() => {
                      if (!isLocked) startLevel(lvlNum);
                      else showToast(`🔒 Complete Level ${lvlNum - 1} to unlock this quest!`);
                    }}
                    style={{
                      position: 'absolute',
                      left: `${(x / 1000) * 100}%`,
                      top: `${(y / 520) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.25s ease',
                      zIndex: isCurrent ? 5 : 2,
                    }}
                  >
                    {/* Outer Circle */}
                    <div
                      style={{
                        width: isCurrent ? '56px' : '48px',
                        height: isCurrent ? '56px' : '48px',
                        borderRadius: '50%',
                        background: isCompleted
                          ? '#D4AF37'
                          : isCurrent
                          ? '#1A160E'
                          : 'rgba(25, 22, 15, 0.95)',
                        border: isCurrent
                          ? '3px solid #FFF'
                          : isCompleted
                          ? '2px solid #FFF'
                          : '2px solid rgba(212, 175, 55, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        boxShadow: isCurrent
                          ? '0 0 24px rgba(242, 214, 117, 0.8), 0 0 45px rgba(212, 175, 55, 0.4)'
                          : '0 4px 16px rgba(0,0,0,0.8)',
                        opacity: isLocked ? 0.38 : 1,
                        filter: isLocked ? 'grayscale(1)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-serif, serif)',
                          fontSize: isCurrent ? '1.25rem' : '1.05rem',
                          fontWeight: 700,
                          color: isCompleted ? '#0D0B08' : isCurrent ? '#F2D675' : '#9A9078',
                        }}
                      >
                        {isCompleted ? '✓' : lvlNum}
                      </span>
                    </div>

                    {/* Level Label */}
                    <div
                      style={{
                        marginTop: '0.4rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: isCurrent ? '#F2D675' : '#9A9078',
                        background: 'rgba(0,0,0,0.7)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        border: isCurrent ? '1px solid rgba(212,175,55,0.4)' : 'none',
                      }}
                    >
                      LEVEL {lvlNum}
                    </div>

                    {/* Character Tag preview */}
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: '#C4B5FD',
                        whiteSpace: 'nowrap',
                        marginTop: '1px',
                      }}
                    >
                      {charName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SCREEN 3: PUZZLE PLAY & GUESSING SANCTUM (Matches User Image 3) */}
      {/* ----------------------------------------------------------------- */}
      {screen === 'puzzle-play' && (
        <main style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
          {/* Controls Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              background: 'rgba(25, 22, 15, 0.85)',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: '#9A9078', textTransform: 'uppercase' }}>Target Persona: </span>
              <span style={{ fontWeight: 700, color: '#F2D675' }}>{activeLevelData.title}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {/* Slide Mode vs Free Swap Toggle */}
              <button
                onClick={() => setSwapMode(!swapMode)}
                title="Toggle sliding puzzle vs free swap mode"
                style={{
                  background: swapMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: swapMode ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: swapMode ? '#34D399' : '#EDE8D5',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {swapMode ? '🧩 Swap Mode (Easy)' : '⚡ Slide Mode (Original)'}
              </button>

              <button
                onClick={() => setBoardState(generateSolvableBoard())}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#EDE8D5',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🔄 Reshuffle
              </button>
            </div>
          </div>

          {/* 3x3 Sliding Jigsaw Board */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 110px)',
                gridTemplateRows: 'repeat(3, 110px)',
                gap: '4px',
                background: '#1A160E',
                padding: '6px',
                borderRadius: '12px',
                border: '3px solid #D4AF37',
                boxShadow: '0 0 45px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.25)',
              }}
            >
              {boardState.map((pieceId, slotIdx) => {
                const isCorrect = pieceId === slotIdx && pieceId !== -1;
                const isEmpty = pieceId === -1;
                const isSelected = selectedPieceIdx === slotIdx;

                if (isEmpty) {
                  return (
                    <div
                      key={slotIdx}
                      onClick={() => handlePieceClick(slotIdx)}
                      style={{
                        width: '110px',
                        height: '110px',
                        background: '#0D0B08',
                        border: '2px dashed rgba(212, 175, 55, 0.3)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    />
                  );
                }

                // Background slice math for 3x3 grid
                const r = Math.floor(pieceId / 3);
                const c = pieceId % 3;
                const bgX = (c / 2) * 100 + '%';
                const bgY = (r / 2) * 100 + '%';

                return (
                  <div
                    key={slotIdx}
                    onClick={() => handlePieceClick(slotIdx)}
                    style={{
                      width: '110px',
                      height: '110px',
                      backgroundColor: '#1E1911',
                      backgroundImage: `url('${activeLevelData.image}')`,
                      backgroundSize: '300% 300%',
                      backgroundPosition: `${bgX} ${bgY}`,
                      backgroundRepeat: 'no-repeat',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      position: 'relative',
                      border: isSelected
                        ? '3px solid #FFF'
                        : isCorrect
                        ? '2px solid #10B981'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: isCorrect ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    {isCorrect && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '3px',
                          right: '4px',
                          background: 'rgba(16, 185, 129, 0.85)',
                          color: '#FFF',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          padding: '1px 4px',
                          borderRadius: '3px',
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divine Hints Container (Matches User Image 3) */}
          <div
            style={{
              background: 'rgba(25, 22, 15, 0.95)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '10px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                color: '#F2D675',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.85rem',
              }}
            >
              <span>✨ Divine Hints (Revealed on placement):</span>
            </div>

            {revealedHints.length === 0 ? (
              <p style={{ color: '#9A9078', fontStyle: 'italic', fontSize: '0.85rem', margin: 0 }}>
                Slide a puzzle piece into its correct position to unveil divine wisdom and shastric clues...
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {revealedHints.map((hint, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(212, 175, 55, 0.08)',
                      borderLeft: '3px solid #D4AF37',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '0 6px 6px 0',
                      fontSize: '0.88rem',
                      color: '#EDE8D5',
                      lineHeight: 1.45,
                    }}
                  >
                    🪷 {hint}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guess The Name Box (Matches User Image 3) */}
          <div
            style={{
              background: 'rgba(25, 22, 15, 0.95)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '12px',
              padding: '1.8rem',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: '1.35rem',
                color: '#F2D675',
                letterSpacing: '0.04em',
                marginBottom: '0.35rem',
              }}
            >
              GUESS THE NAME
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9A9078', marginBottom: '1.25rem' }}>
              Current Guess Reward: <span style={{ color: '#F2D675', fontWeight: 700 }}>{currentGuessPoints} 🪙</span>
            </p>

            {guessSuccess ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  color: '#34D399',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🎉</div>
                <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.4rem 0' }}>{guessFeedback}</h4>
                <p style={{ fontSize: '0.85rem', color: '#EDE8D5', margin: 0 }}>
                  {puzzleWon
                    ? 'Cosmic puzzle fully restored! Your saga progresses onwards.'
                    : 'Now slide the remaining puzzle pieces to complete the sacred portrait!'}
                </p>
              </div>
            ) : (
              <div>
                <div style={{ maxWidth: '420px', margin: '0 auto 1rem' }}>
                  <input
                    type="text"
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmitGuess();
                    }}
                    placeholder="Type name here... (e.g. Rama, Sita, Krishna)"
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      background: 'rgba(13, 11, 8, 0.9)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      borderRadius: '8px',
                      color: '#EDE8D5',
                      fontSize: '1rem',
                      outline: 'none',
                      textAlign: 'center',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={handleSubmitGuess}
                    style={{
                      background: 'linear-gradient(135deg, #F2D675 0%, #D4AF37 100%)',
                      color: '#0D0B08',
                      fontWeight: 700,
                      padding: '0.65rem 1.6rem',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.92rem',
                    }}
                  >
                    SUBMIT GUESS
                  </button>

                  <button
                    onClick={() => setShowClue(!showClue)}
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#F2D675',
                      padding: '0.65rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    💡 {showClue ? 'Hide Clue' : 'Need Clue?'}
                  </button>
                </div>

                {showClue && (
                  <div style={{ marginTop: '1rem' }}>
                    <div
                      style={{
                        padding: '0.6rem',
                        background: 'rgba(212, 175, 55, 0.1)',
                        borderRadius: '6px',
                        color: '#F2D675',
                        fontSize: '0.85rem',
                        letterSpacing: '0.1em',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Letter Clue: <strong>{letterClue}</strong>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#9A9078', marginBottom: '0.45rem' }}>
                      Or tap a persona choice (Easy Mode):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                      {quickChoices.map((choice, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setGuessInput(choice);
                            const query = choice.trim().toLowerCase();
                            const matched =
                              query === activeLevelData.answer.toLowerCase() ||
                              activeLevelData.aliases.some((alias) => alias.toLowerCase() === query);
                            if (matched) {
                              setGuessSuccess(true);
                              setGuessFeedback(
                                `🎉 Magnificent! You recognized ${activeLevelData.name}! +${currentGuessPoints} 🪙 Coins earned!`
                              );
                              setCoins((c) => c + currentGuessPoints);
                              triggerSound('guess_correct');
                              showToast(`✨ Brilliant! +${currentGuessPoints} Coins added to your vault!`);
                            } else {
                              triggerSound('slide');
                              setGuessFeedback(`Not ${choice}! Try another clue or slide more tiles.`);
                              setCurrentGuessPoints((prev) => Math.max(25, prev - 10));
                            }
                          }}
                          style={{
                            background: 'rgba(212, 175, 55, 0.15)',
                            border: '1px solid rgba(212, 175, 55, 0.35)',
                            color: '#F2D675',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {guessFeedback && !guessSuccess && (
                  <p style={{ color: '#F87171', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                    {guessFeedback}
                  </p>
                )}
              </div>
            )}

            {/* Victory Next Level banner */}
            {puzzleWon && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button
                  onClick={() => {
                    const nextId = selectedLevelId + 1;
                    if (nextId <= 20) {
                      startLevel(nextId);
                    } else {
                      setScreen('saga-map');
                    }
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFF',
                    fontWeight: 700,
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  NEXT LEVEL ➔
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SCREEN 4: DIVINE BOUTIQUE & AVATAR SHOP */}
      {/* ----------------------------------------------------------------- */}
      {screen === 'boutique' && (
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '2.5rem',
              alignItems: 'start',
            }}
          >
            {/* Left Column: 3D Interactive Avatar Preview */}
            <div
              style={{
                background: 'rgba(25, 22, 15, 0.95)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-serif, serif)',
                  color: '#F2D675',
                  fontSize: '1.4rem',
                  marginBottom: '0.4rem',
                }}
              >
                Avatar Wardrobe
              </h3>
              <p style={{ color: '#9A9078', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Equip your relics and adorn your spiritual presence.
              </p>

              {/* 3D Tilt Card */}
              <div
                ref={avatarCardRef}
                onMouseMove={handleAvatarMouseMove}
                onMouseLeave={handleAvatarMouseLeave}
                style={{
                  position: 'relative',
                  width: '260px',
                  height: '320px',
                  margin: '0 auto 1.5rem',
                  background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, rgba(13, 11, 8, 0.8) 100%)',
                  borderRadius: '16px',
                  border: '2px solid rgba(212, 175, 55, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  transition: 'transform 0.1s ease',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.8)',
                }}
              >
                {/* Character Base Image */}
                <img
                  src={
                    activeLevelData.cartoon ||
                    activeLevelData.image ||
                    '/game/rama_3d.png'
                  }
                  alt={activeLevelData.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/game/rama_3d.png';
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Layered Equipped Items Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '0.8rem',
                  }}
                >
                  {/* Top: Crown / Feather / Halo */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    {inventory.find((i) => i.id === 'gold-crown' && i.equipped) && (
                      <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px #F2D675)' }}>👑</span>
                    )}
                    {inventory.find((i) => i.id === 'peacock-feather' && i.equipped) && (
                      <span style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 0 8px #38BDF8)' }}>🪶</span>
                    )}
                  </div>

                  {/* Bottom: Relics */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {inventory.find((i) => i.id === 'royal-bow' && i.equipped) && (
                      <span style={{ fontSize: '2rem' }}>🏹</span>
                    )}
                    {inventory.find((i) => i.id === 'herbal-pot' && i.equipped) && (
                      <span style={{ fontSize: '2rem' }}>🏺</span>
                    )}
                    {inventory.find((i) => i.id === 'floral-garland' && i.equipped) && (
                      <span style={{ fontSize: '2rem' }}>📿</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F2D675' }}>
                {activeLevelData.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#9A9078', marginTop: '0.2rem' }}>
                {activeLevelData.title}
              </div>
            </div>

            {/* Right Column: Catalog of Divine Items */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif, serif)',
                    color: '#D4AF37',
                    fontSize: '1.4rem',
                    margin: 0,
                  }}
                >
                  Boutique Catalog
                </h3>
                <div style={{ color: '#F2D675', fontWeight: 700, fontSize: '0.95rem' }}>
                  Vault: {coins} 🪙
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {SHOP_ITEMS.map((item) => {
                  const owned = inventory.find((i) => i.id === item.id);
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: 'rgba(25, 22, 15, 0.9)',
                        border: owned ? '1px solid #10B981' : '1px solid rgba(212, 175, 55, 0.25)',
                        borderRadius: '12px',
                        padding: '1.1rem 1.4rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '2.2rem' }}>{item.icon}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, color: '#EDE8D5', fontSize: '1rem' }}>
                              {item.name}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                background:
                                  item.rarity === 'Legendary'
                                    ? 'rgba(234, 179, 8, 0.2)'
                                    : item.rarity === 'Epic'
                                    ? 'rgba(168, 85, 247, 0.2)'
                                    : 'rgba(59, 130, 246, 0.2)',
                                color:
                                  item.rarity === 'Legendary'
                                    ? '#FACC15'
                                    : item.rarity === 'Epic'
                                    ? '#C084FC'
                                    : '#93C5FD',
                              }}
                            >
                              {item.rarity}
                            </span>
                          </div>
                          <p style={{ color: '#9A9078', fontSize: '0.8rem', margin: '0.2rem 0' }}>
                            {item.description}
                          </p>
                          <div style={{ color: '#C4B5FD', fontSize: '0.75rem', fontStyle: 'italic' }}>
                            ✨ {item.benefit}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ color: '#F2D675', fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.95rem' }}>
                          {owned ? '✓ OWNED' : `${item.price} 🪙`}
                        </div>

                        {owned ? (
                          <button
                            onClick={() => handleToggleEquip(item.id)}
                            style={{
                              padding: '0.4rem 0.9rem',
                              borderRadius: '6px',
                              border: owned.equipped ? '1px solid #10B981' : '1px solid rgba(212,175,55,0.4)',
                              background: owned.equipped ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              color: owned.equipped ? '#34D399' : '#EDE8D5',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {owned.equipped ? 'Equipped' : 'Equip'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyItem(item)}
                            style={{
                              padding: '0.4rem 1.1rem',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #F2D675 0%, #D4AF37 100%)',
                              color: '#0D0B08',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                            }}
                          >
                            Acquire
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* HOW TO PLAY TUTORIAL MODAL (Matches User Image 2) */}
      {/* ----------------------------------------------------------------- */}
      {showTutorial && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '2.5rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            paddingBottom: '1rem',
          }}
          onClick={() => setShowTutorial(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '350px',
              background: '#1A160E',
              border: '1.5px solid #D4AF37',
              borderRadius: '12px',
              padding: '1rem 1.15rem',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.95)',
              textAlign: 'center',
            }}
          >
            {/* Close Cross */}
            <button
              onClick={() => setShowTutorial(false)}
              aria-label="Close tutorial"
              style={{
                position: 'absolute',
                top: '0.6rem',
                right: '0.6rem',
                background: 'transparent',
                border: 'none',
                color: '#9A9078',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '0.2rem',
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            {/* Scroll Icon Header */}
            <div style={{ fontSize: '1.5rem', marginBottom: '0.1rem' }}>📜</div>
            <h2
              style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: '1.15rem',
                color: '#F2D675',
                letterSpacing: '0.04em',
                margin: '0 0 0.1rem 0',
              }}
            >
              HOW TO PLAY
            </h2>
            <p
              style={{
                fontSize: '0.62rem',
                color: '#9A9078',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                margin: '0 0 0.75rem 0',
              }}
            >
              YOUR JOURNEY BEGINS HERE
            </p>

            {/* 4 Step Cards (Small & compact) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left', marginBottom: '0.85rem' }}>
              {/* Step 1 */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(212, 175, 55, 0.16)',
                  borderRadius: '7px',
                  padding: '0.4rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}
              >
                <span style={{ fontSize: '1.15rem' }}>🧩</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.78rem', color: '#F2D675', fontWeight: 700 }}>
                    SLIDE PIECES
                  </h4>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.68rem', color: '#9A9078', lineHeight: 1.25 }}>
                    Tap a puzzle piece next to the empty slot to slide it into place.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(212, 175, 55, 0.16)',
                  borderRadius: '7px',
                  padding: '0.4rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}
              >
                <span style={{ fontSize: '1.15rem' }}>💡</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.78rem', color: '#F2D675', fontWeight: 700 }}>
                    UNLOCK HINTS
                  </h4>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.68rem', color: '#9A9078', lineHeight: 1.25 }}>
                    Place a piece in its correct spot to reveal a Divine Hint.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(212, 175, 55, 0.16)',
                  borderRadius: '7px',
                  padding: '0.4rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}
              >
                <span style={{ fontSize: '1.15rem' }}>🤔</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.78rem', color: '#F2D675', fontWeight: 700 }}>
                    GUESS THE NAME
                  </h4>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.68rem', color: '#9A9078', lineHeight: 1.25 }}>
                    Use hints to guess the answer! Earlier guesses earn more 🪙 coins.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(212, 175, 55, 0.16)',
                  borderRadius: '7px',
                  padding: '0.4rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}
              >
                <span style={{ fontSize: '1.15rem' }}>🏆</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.78rem', color: '#F2D675', fontWeight: 700 }}>
                    COMPLETE & EARN
                  </h4>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.68rem', color: '#9A9078', lineHeight: 1.25 }}>
                    Finish the puzzle to progress and unlock Avatar shop items!
                  </p>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => setShowTutorial(false)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #F2D675 0%, #D4AF37 100%)',
                color: '#0D0B08',
                fontWeight: 700,
                fontSize: '0.82rem',
                letterSpacing: '0.04em',
                padding: '0.55rem 1rem',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)',
              }}
            >
              START JOURNEY ✨
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* DIVINE INSIGHT MODAL POPUP */}
      {/* ----------------------------------------------------------------- */}
      {activeHintModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '420px',
              background: '#1A160E',
              border: '2px solid #D4AF37',
              borderRadius: '14px',
              padding: '1.8rem',
              textAlign: 'center',
              boxShadow: '0 12px 40px rgba(0,0,0,0.9)',
            }}
          >
            <button
              onClick={() => setActiveHintModal(null)}
              style={{
                position: 'absolute',
                top: '0.8rem',
                right: '0.8rem',
                background: 'transparent',
                border: 'none',
                color: '#9A9078',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>💡</div>
            <h3
              style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: '1.3rem',
                color: '#F2D675',
                margin: '0 0 0.85rem 0',
              }}
            >
              Divine Insight
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                color: '#EDE8D5',
                lineHeight: 1.5,
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '0.85rem',
                borderRadius: '8px',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                margin: 0,
              }}
            >
              &ldquo;{activeHintModal}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
