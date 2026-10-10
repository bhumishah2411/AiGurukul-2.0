import { Types } from 'mongoose';
import { DocumentModel } from '../models/document.model.js';
import { DocumentChunkModel } from '../models/document-chunk.model.js';

export interface SeedDocumentData {
  title: string;
  fileName: string;
  domain: string;
  language: string;
  author: string;
  era: string;
  chunks: Array<{
    text: string;
    canonicalReference: string;
    tokenCount: number;
    metadata?: Record<string, unknown>;
  }>;
}

export const CANONICAL_DOCUMENTS: SeedDocumentData[] = [
  {
    title: 'Bhagavad Gita: Karma Yoga and the Nature of Mind',
    fileName: 'bhagavad_gita_karma_yoga.txt',
    domain: 'gita',
    language: 'sa',
    author: 'Maharishi Veda Vyasa',
    era: 'c. 5th–2nd Century BCE',
    chunks: [
      {
        text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥ [BG 2.47] You have a right to perform your prescribed duty, but you are not entitled to the fruits of actions. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.',
        canonicalReference: 'BG 2.47',
        tokenCount: 65,
        metadata: { chapter: 2, verse: 47, focus: 'Nishkama Karma' },
      },
      {
        text: 'दुःखेष्वनुद्विग्नमनाः सुखेषु विगतस्पृहः। वीतरागभयक्रोधः स्थितधीर्मुनिरुच्यते॥ [BG 2.56] One whose mind remains unperturbed amid misery, who is devoid of longing in pleasure, and who is free from attachment, fear, and anger, is termed a sage of steady wisdom (Sthitaprajna).',
        canonicalReference: 'BG 2.56',
        tokenCount: 62,
        metadata: { chapter: 2, verse: 56, focus: 'Sthitaprajna' },
      },
      {
        text: 'ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते। सङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥ क्रोधाद्भवति संमोहः संमोहात्स्मृतिविभ्रमः। स्मृतिभ्रंशाद्बुद्धिनाशो बुद्धिनाशात्प्रणश्यति॥ [BG 2.62-63] While contemplating the objects of the senses, a person develops attachment to them; from attachment lust develops, and from lust anger arises. From anger arises complete delusion, and from delusion bewilderment of memory; when memory is bewildered, intellect is lost, and when intellect is lost one falls down.',
        canonicalReference: 'BG 2.62-63',
        tokenCount: 88,
        metadata: { chapter: 2, verses: [62, 63], focus: 'Chain of Causation' },
      },
      {
        text: 'तस्मादसक्तः सततं कार्यं कर्म समाचर। असक्तो ह्याचरन्कर्म परमाप्नोति पूरुषः॥ [BG 3.19] Therefore, without being attached to the fruits of activities, one should act as a matter of duty, for by working without attachment one attains the Supreme.',
        canonicalReference: 'BG 3.19',
        tokenCount: 52,
        metadata: { chapter: 3, verse: 19, focus: 'Detached Action' },
      },
    ],
  },
  {
    title: 'Chanakya Neeti: Principles of Strategic Prudence',
    fileName: 'chanakya_neeti_prudence.txt',
    domain: 'chanakya',
    language: 'sa',
    author: 'Acharya Chanakya',
    era: 'c. 4th Century BCE',
    chunks: [
      {
        text: 'अनभ्यासे विषं शास्त्रमजीर्णे भोजनं विषम्। दरिद्रस्य विषं गोष्ठी वृद्धस्य तरुणी विषम्॥ [Chanakya Neeti 1.2] Knowledge without continuous practice and reflection turns into poison; food consumed while suffering indigestion is poison; a royal assembly is torture for the destitute; and a youthful companion is poison to an infirm elder.',
        canonicalReference: 'Chanakya Neeti 1.2',
        tokenCount: 68,
        metadata: { chapter: 1, verse: 2, focus: 'Applied Knowledge' },
      },
      {
        text: 'जानीयात् प्रेषणे भृत्यान् बान्धवान् व्यसनागमे। मित्रं चापत्तिकाले तु भार्यां च विभवक्षये॥ [Chanakya Neeti 1.12] Test a servant in the discharge of duty, relatives in the hour of adversity, friends in times of disaster, and a companion when fortune dwindles.',
        canonicalReference: 'Chanakya Neeti 1.12',
        tokenCount: 58,
        metadata: { chapter: 1, verse: 12, focus: 'Discernment of Loyalty' },
      },
      {
        text: 'सरलवृक्षाः छिद्यन्ते वक्राः तिष्ठन्ति पादपाः। [Chanakya Neeti 2.8] Straight trees in the forest are felled first, while crooked trees survive. Therefore, do not be overly naive or transparently yielding in corrupt company; maintain tactical prudence.',
        canonicalReference: 'Chanakya Neeti 2.8',
        tokenCount: 48,
        metadata: { chapter: 2, verse: 8, focus: 'Pragmatic Defense' },
      },
    ],
  },
  {
    title: 'Charaka Samhita: Sutrasthana and Fundamental Physiology',
    fileName: 'charaka_samhita_sutrasthana.txt',
    domain: 'ayurveda',
    language: 'sa',
    author: 'Maharishi Charaka',
    era: 'c. 2nd Century BCE',
    chunks: [
      {
        text: 'शरीरेन्द्रियसत्त्वात्मसंयोगो धारि जीवितम्। नित्यगश्चानुबन्धश्च पर्यायैरायुरुच्यते॥ [Charaka Samhita Sutrasthana 1.42] Ayu (life) is defined as the seamless conjunction of body (Sharira), sensory faculties (Indriya), mind (Sattva), and conscious soul (Atman). It is the maintainer of vital breath and the continuum of experience.',
        canonicalReference: 'Charaka Samhita Sutra 1.42',
        tokenCount: 64,
        metadata: { section: 'Sutrasthana', chapter: 1, verse: 42, focus: 'Definition of Life' },
      },
      {
        text: 'सर्वदा सर्वभावानां सामान्यं वृद्धिकारणम्। ह्रासहेतुर्विशेषश्च प्रवृत्तिरुभयस्य तु॥ [Charaka Samhita Sutrasthana 1.44] Similarity in qualities (Samanya) always causes augmentation of all constituents, while dissimilarity (Vishesha) causes attenuation. Both are operative in maintaining equilibrium.',
        canonicalReference: 'Charaka Samhita Sutra 1.44',
        tokenCount: 56,
        metadata: { section: 'Sutrasthana', chapter: 1, verse: 44, focus: 'Law of Similarities' },
      },
      {
        text: 'वायुः पित्तं कफश्चेति त्रयो दोषाः समासतः। विकृताऽविकृता देहं घ्नन्ति ते वर्तयन्ति च॥ [Charaka Samhita Sutrasthana 1.57] Vata, Pitta, and Kapha are the three biological humors (Doshas). When in balance they sustain and nourish the physical organism; when deranged they bring about pathology and disease.',
        canonicalReference: 'Charaka Samhita Sutra 1.57',
        tokenCount: 59,
        metadata: { section: 'Sutrasthana', chapter: 1, verse: 57, focus: 'Tri-Dosha Matrix' },
      },
    ],
  },
  {
    title: 'Patanjali Yoga Sutras: Science of Mental Stillness',
    fileName: 'patanjali_yoga_sutras.txt',
    domain: 'yoga',
    language: 'sa',
    author: 'Maharishi Patanjali',
    era: 'c. 400 CE',
    chunks: [
      {
        text: 'योगश्चित्तवृत्तिनिरोधः॥ तदा द्रष्टुः स्वरूपेऽवस्थानम्॥ [Yoga Sutras 1.2-1.3] Yoga is the intentional cessation of the oscillations of the mind field (Chitta Vritti Nirodha). Then the seer abides established in its own true transcendental nature.',
        canonicalReference: 'Yoga Sutras 1.2-1.3',
        tokenCount: 46,
        metadata: { section: 'Samadhi Pada', verses: [2, 3], focus: 'Nature of Yoga' },
      },
      {
        text: 'अभ्यासवैराग्याभ्यां तन्निरोधः॥ [Yoga Sutras 1.12] The stilling of mental fluctuations is achieved through persistent, disciplined practice (Abhyasa) and conscious dispassion (Vairagya).',
        canonicalReference: 'Yoga Sutras 1.12',
        tokenCount: 38,
        metadata: { section: 'Samadhi Pada', verse: 12, focus: 'Twin Pillars' },
      },
      {
        text: 'योगाङ्गानुष्ठानादशुद्धिक्षये ज्ञानदीप्तिरा विवेकख्यातेः॥ [Yoga Sutras 2.28] By dedicated adherence to the eight limbs of Yoga, as impurities are progressively eradicated, the radiant light of wisdom shines forth culminating in discriminative discernment (Viveka Khyati).',
        canonicalReference: 'Yoga Sutras 2.28',
        tokenCount: 50,
        metadata: { section: 'Sadhana Pada', verse: 28, focus: 'Ashtanga Fruit' },
      },
    ],
  },
];

export async function seedCanonicalDocuments(): Promise<{
  documentsCreated: number;
  chunksCreated: number;
}> {
  let documentsCreated = 0;
  let chunksCreated = 0;

  for (const docData of CANONICAL_DOCUMENTS) {
    const storageKey = `canonical/${docData.fileName}`;
    const totalTokens = docData.chunks.reduce((sum, c) => sum + c.tokenCount, 0);

    const doc = await DocumentModel.findOneAndUpdate(
      { storageKey },
      {
        $setOnInsert: {
          _id: new Types.ObjectId(),
        },
        $set: {
          title: docData.title,
          fileName: docData.fileName,
          fileSize: Buffer.byteLength(docData.chunks.map((c) => c.text).join('\n\n')),
          mimeType: 'text/plain',
          storageKey,
          domain: docData.domain,
          language: docData.language,
          author: docData.author,
          era: docData.era,
          status: 'indexed',
          chunkCount: docData.chunks.length,
          tokenCount: totalTokens,
          uploadedBy: 'system',
        },
      },
      { upsert: true, new: true }
    );

    documentsCreated++;

    // Remove existing chunks for this document to ensure clean idempotency
    await DocumentChunkModel.deleteMany({ documentId: doc._id });

    const chunkDocs = docData.chunks.map((chunk, idx) => ({
      documentId: doc._id,
      chunkIndex: idx,
      text: chunk.text,
      tokenCount: chunk.tokenCount,
      canonicalReference: chunk.canonicalReference,
      metadata: {
        domain: docData.domain,
        language: docData.language,
        author: docData.author,
        title: docData.title,
        ...chunk.metadata,
      },
    }));

    await DocumentChunkModel.insertMany(chunkDocs);
    chunksCreated += chunkDocs.length;
  }

  return { documentsCreated, chunksCreated };
}
