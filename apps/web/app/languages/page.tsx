'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES_REGISTRY,
  VirtualKeyboardLayout,
  ManuscriptDTO,
  EtymologyEntryDTO,
  TranslationResultDTO,
  TranslateSourceLanguage,
  ImageOCRResultDTO,
} from '@ai-gurukul/types';
import { apiClient } from '../../lib/api';

const CANONICAL_MANUSCRIPTS: ManuscriptDTO[] = [
  {
    id: 'manuscript-gita-2-47',
    slug: 'gita-2-47',
    title: 'Bhagavad Gita 2.47 – The Doctrine of Nishkama Karma',
    originalLanguage: 'sa',
    sourceScript: 'Devanagari',
    originalText: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    transliteration: 'karmaṇy-evādhikāras te mā phaleṣu kadācana |\nmā karma-phala-hetur bhūr mā te saṅgo \'stv akarmaṇi ||',
    canonicalSource: 'Bhagavad Gita',
    verseReference: 'Chapter 2, Verse 47',
    poeticMeter: 'Anushtubh (8 syllables per quarter)',
    authorOrRishi: 'Bhagavan Sri Krishna / Sage Vyasa',
    wordBreakdown: [
      { index: 1, word: 'कर्मणि', transliteration: 'karmaṇi', grammar: 'Locative singular of karman (neuter)', meaning: 'in action / in the performance of duty', dhatuRoot: 'कृ (kṛ)', rootMeaning: 'to act, to do' },
      { index: 2, word: 'एव', transliteration: 'eva', grammar: 'Indeclinable particle', meaning: 'only / alone / indeed' },
      { index: 3, word: 'अधिकारः', transliteration: 'adhikāraḥ', grammar: 'Nominative singular of adhikāra', meaning: 'right / jurisdiction / duty', dhatuRoot: 'अधि + कृ (kṛ)', rootMeaning: 'to preside over' },
      { index: 4, word: 'ते', transliteration: 'te', grammar: 'Genitive singular of yushmad', meaning: 'your / of you' },
      { index: 5, word: 'मा', transliteration: 'mā', grammar: 'Negative prohibitive particle', meaning: 'not / never' },
      { index: 6, word: 'फलेषु', transliteration: 'phaleṣu', grammar: 'Locative plural of phala', meaning: 'in the fruits / in results' },
      { index: 7, word: 'कदाचन', transliteration: 'kadācana', grammar: 'Indeclinable temporal adverb', meaning: 'at any time / ever' },
      { index: 8, word: 'कर्मफलहेतुः', transliteration: 'karma-phala-hetuḥ', grammar: 'Compound bahuvrihi, nominative singular', meaning: 'motivated by fruits of action', dhatuRoot: 'हि (hi) -> हेतु', rootMeaning: 'cause, instrument' },
      { index: 9, word: 'अकर्मणि', transliteration: 'akarmani', grammar: 'Locative singular of akarman', meaning: 'in inaction / sloth', dhatuRoot: 'अ + कृ (kṛ)', rootMeaning: 'non-action' },
    ],
    translations: {
      en: {
        targetLanguage: 'en',
        translation: 'You have a right only to perform your prescribed duty, but never to the fruits of action. Never consider yourself the cause of results, nor let your attachment be to inaction.',
        philosophicalCommentary: 'This verse is the bedrock of Karma Yoga. By dissociating self-worth from outcome anxiety, pure focus and moral equanimity are unlocked.',
      },
      hi: {
        targetLanguage: 'hi',
        translation: 'तुम्हारा अधिकार केवल कर्म करने में ही है, उसके फलों में कभी नहीं। इसलिए तुम कर्मों के फल का हेतु मत बनो और न ही तुम्हारी आसक्ति कर्म न करने में हो।',
        philosophicalCommentary: 'कर्मयोग का यह मूलमंत्र व्यक्ति को फल की चिंता से मुक्त कर वर्तमान क्षण में सर्वोत्तम निष्पादन की क्षमता प्रदान करता है।',
      },
      gu: {
        targetLanguage: 'gu',
        translation: 'તમારો અધિકાર ફક્ત કર્મ કરવામાં જ છે, તેના ફળમાં ક્યારેય નહીં. કર્મફળના કારણ ન બનો અને અકર્મ (કર્મ ન કરવું) માં તમારી આસક્તિ ન થાઓ.',
        philosophicalCommentary: 'નિષ્કામ કર્મનો આ પવિત્ર સંદેશ કર્તવ્યનિષ્ઠા અને માનસિક શાંતિનો અખૂટ માર્ગ બતાવે છે.',
      },
    },
  },
  {
    id: 'manuscript-tirukkural-1',
    slug: 'tirukkural-1',
    title: 'Tirukkural Couplet 1 – The Primordial Origin',
    originalLanguage: 'ta',
    sourceScript: 'Tamil',
    originalText: 'அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.',
    transliteration: 'Akara mudhala ezhuthellām ādhi\nbhagavan mudhatrē ulagu.',
    canonicalSource: 'Tirukkural (Aṟattuppāl - Prologue)',
    verseReference: 'Kural 1',
    poeticMeter: 'Kural Venba (4 feet in first line, 3 in second)',
    authorOrRishi: 'Thiruvalluvar',
    wordBreakdown: [
      { index: 1, word: 'அகர', transliteration: 'Akara', grammar: 'Noun in genitive relationship', meaning: 'The letter "A" (அ)', dhatuRoot: 'அ', rootMeaning: 'primordial vowel' },
      { index: 2, word: 'முதல', transliteration: 'mudhala', grammar: 'Adverbial postposition', meaning: 'having as origin / first' },
      { index: 3, word: 'எழுத்தெல்லாம்', transliteration: 'ezhuthellām', grammar: 'Compound noun + all', meaning: 'all written sounds / letters' },
      { index: 4, word: 'ஆதி', transliteration: 'ādhi', grammar: 'Noun (Sanskrit loan cognate)', meaning: 'primordial / timeless origin' },
      { index: 5, word: 'பகவன்', transliteration: 'bhagavan', grammar: 'Noun masculine singular', meaning: 'Divine Supreme / Luminous Lord' },
      { index: 6, word: 'முதற்றே', transliteration: 'mudhatrē', grammar: 'Predicate with emphatic -e', meaning: 'has as its primary cause' },
      { index: 7, word: 'உலகு', transliteration: 'ulagu', grammar: 'Noun neuter', meaning: 'the cosmos / world' },
    ],
    translations: {
      en: {
        targetLanguage: 'en',
        translation: 'As the letter "A" is the first of all letters, so is the Primordial Divinity the origin of the cosmos.',
        philosophicalCommentary: 'Just as the vowel sound "A" breathes phonological life into all consonants, the supreme conscious principle animates all transient forms.',
      },
      hi: {
        targetLanguage: 'hi',
        translation: 'जैसे अक्षरों में "अ" पहला अक्षर है, वैसे ही सम्पूर्ण संसार का आदि कारण परम पिता परमात्मा है।',
        philosophicalCommentary: 'तिरुक्कुरल का यह प्रथम पद भाषा और ब्रह्मांड के तात्विक संबंध को उजागर करता है।',
      },
      gu: {
        targetLanguage: 'gu',
        translation: 'જેમ બધા અક્ષરોમાં "અ" પ્રથમ છે, તેમ સમગ્ર વિશ્વનો આદિ કારણ પરમાત્મા છે.',
        philosophicalCommentary: 'તિરુવલ્લુવરનું આ દિવ્ય સૂત્ર સમગ્ર સૃષ્ટિના મૂળભૂત ચૈતન્ય તરફ ધ્યાન દોરે છે.',
      },
    },
  },
  {
    id: 'manuscript-dhammapada-1',
    slug: 'dhammapada-1',
    title: 'Dhammapada Verse 1 – Mind Precedes All Phenomena',
    originalLanguage: 'pli',
    sourceScript: 'Devanagari / Romanized Pali',
    originalText: 'मनोपुब्बङ्गमा धम्मा मनोसेट्ठा मनोमया।\nमनसा चे पदुट્ઠेन भासति वा करोति वा।\nततो नं दुक्खमन्वेति चक्कं व वहतो पदं॥',
    transliteration: 'Manopubbaṅgamā dhammā manosēṭṭhā manōmayā |\nmanasā cē paduṭṭhēna bhāsati vā karōti vā |\ntatō naṁ dukkham anvēti cakkaṁ va vahato padaṁ ||',
    canonicalSource: 'Khuddaka Nikaya – Dhammapada',
    verseReference: 'Yamaka-vagga, Verse 1',
    poeticMeter: 'Anushtubh / Pathyavaktra',
    authorOrRishi: 'Gautama Buddha',
    wordBreakdown: [
      { index: 1, word: 'मनोपुब्बङ्गमा', transliteration: 'manopubbaṅgamā', grammar: 'Compound adjective, nom. plural', meaning: 'preceded by mind / mind-led', dhatuRoot: 'मनस् + गम् (gam)', rootMeaning: 'mind going before' },
      { index: 2, word: 'धम्मा', transliteration: 'dhammā', grammar: 'Nominative plural', meaning: 'mental states / psychological qualities', dhatuRoot: 'धृ (dhṛ)', rootMeaning: 'to bear, manifest' },
      { index: 3, word: 'मनोसेट्ठा', transliteration: 'manoseṭṭhā', grammar: 'Adjective nom. plural', meaning: 'having mind as their chief / sovereign' },
      { index: 4, word: 'मनोमया', transliteration: 'manomayā', grammar: 'Adjective with -maya', meaning: 'made of mind / mind-fashioned' },
      { index: 5, word: 'दुक्खम्', transliteration: 'dukkham', grammar: 'Noun neuter', meaning: 'suffering / psychological friction' },
    ],
    translations: {
      en: {
        targetLanguage: 'en',
        translation: 'Mind precedes all mental states; mind is their chief; they are mind-made. If someone speaks or acts with a corrupted mind, suffering follows them just as the cartwheel follows the hoof of the draft-ox.',
        philosophicalCommentary: 'The core Buddhist insight on psychological causality. Intentional consciousness (cetana) is the primary architect of human experience.',
      },
      hi: {
        targetLanguage: 'hi',
        translation: 'सभी धर्म (मानसिक अवस्थाएं) मन के आगे चलने वाले हैं, मन ही उनका स्वामी है। यदि कोई कलुषित मन से बोलता या करता है, तो दुःख उसके पीछे वैसे ही चलता है जैसे गाड़ी का पहिया बैल के पैरों के पीछे।',
        philosophicalCommentary: 'धम्मपद की यह वाणी चेतना की प्रधानता और कर्म के अटूट फल को स्पष्ट करती है।',
      },
      gu: {
        targetLanguage: 'gu',
        translation: 'બધી માનસિક વૃત્તિઓ મનની પાછળ ચાલે છે, મન જ તેનો સ્વામી છે. જો કોઈ દૂષિત મનથી બોલે કે વર્તે, તો દુઃખ તેની પાછળ એમ જ આવે છે જેમ બળદના પગ પાછળ પૈડું ચાલે છે.',
        philosophicalCommentary: 'બૌદ્ધ ધર્મનો આ સિદ્ધાંત નિર્મળ વિચાર અને આંતરિક શુદ્ધિનો મહિમા સમજાવે છે.',
      },
    },
  },
  {
    id: 'manuscript-narsinh-vaishnava',
    slug: 'vaishnava-jana-to',
    title: 'Vaishnava Jana To – The Saint of Compassion',
    originalLanguage: 'gu',
    sourceScript: 'Gujarati',
    originalText: 'વૈષ્ણવ જન તો તેને કહીયે જે પીડ પરાઈ જાણે રે,\nપરદુઃખે ઉપકાર કરે તોયે મન અભિમાન ન આણે રે.',
    transliteration: 'Vaiṣṇava jana tō tēnē kahīyē jē pīḍa parā\'ī jāṇē rē |\npara-duḥkhē upakāra karē tōyē mana abhimāna na āṇē rē ||',
    canonicalSource: 'Narsinh Mehta Padas (15th Century)',
    verseReference: 'Pada 1',
    poeticMeter: 'Deshi Bhajan / Matra Chhand',
    authorOrRishi: 'Narsinh Mehta (Adi Kavi of Gujarat)',
    wordBreakdown: [
      { index: 1, word: 'વૈષ્ણવ', transliteration: 'Vaishnava', grammar: 'Noun / Adjective', meaning: 'A true devotee of Vishnu / of the Divine' },
      { index: 2, word: 'જન', transliteration: 'jana', grammar: 'Noun singular', meaning: 'person / human being', dhatuRoot: 'जन् (jan)', rootMeaning: 'to be born, generate' },
      { index: 3, word: 'પીડ', transliteration: 'peed', grammar: 'Noun feminine', meaning: 'suffering / anguish / pain' },
      { index: 4, word: 'પરાઈ', transliteration: 'paraayi', grammar: 'Adjective feminine', meaning: 'of another / of fellow beings' },
      { index: 5, word: 'જાણે', transliteration: 'jaane', grammar: 'Verb present 3rd person', meaning: 'feels / experientially understands', dhatuRoot: 'ज्ञा (jñā)', rootMeaning: 'to know deeply' },
      { index: 6, word: 'અભિમાન', transliteration: 'abhimaana', grammar: 'Noun neuter', meaning: 'egotism / conceit', dhatuRoot: 'मान् (mān)', rootMeaning: 'to measure ego' },
    ],
    translations: {
      en: {
        targetLanguage: 'en',
        translation: 'Call that soul a true Vaishnava who empathizes with the pain of another; who serves those in sorrow yet never allows pride to taint their heart.',
        philosophicalCommentary: 'Narsinh Mehta defining spirituality through pure, selfless empathy and ego-transcendence rather than external ritual.',
      },
      hi: {
        targetLanguage: 'hi',
        translation: 'वैष्णव जन उसे कहिए जो दूसरों की पीड़ा को अपनी पीड़ा समझता है; जो दूसरों के दुख दूर करने पर भी अपने मन में तनिक भी अभिमान नहीं लाता।',
        philosophicalCommentary: 'नरसिंह मेहता का यह अमर भजन मानवता और निष्काम सेवा का अप्रतिम संदेश है।',
      },
      gu: {
        targetLanguage: 'gu',
        translation: 'સાચો વૈષ્ણવ તે છે જે બીજાની વેદના સમજે છે અને પરોપકાર કર્યા પછી પણ મનમાં અહંકાર નથી લાવતો.',
        philosophicalCommentary: 'ગુજરાતના આદિ કવિ નરસિંહ મહેતાનું આ પદ માનવતાનું સર્વોચ્ચ દર્શન રજૂ કરે છે.',
      },
    },
  },
  {
    id: 'manuscript-isha-upanishad-1',
    slug: 'isha-upanishad-1',
    title: 'Isha Upanishad 1 – Divine Omnipresence',
    originalLanguage: 'sa',
    sourceScript: 'Devanagari',
    originalText: 'ईशा वास्यमिदँ सर्वं यत्किञ्च जगत्यां जगत्।\nतेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम्॥',
    transliteration: 'īśā vāsyam idaṁ sarvaṁ yat kiñca jagatyāṁ jagat |\ntena tyaktena bhuñjīthā mā gṛdhaḥ kasya svid dhanam ||',
    canonicalSource: 'Shukla Yajurveda – Isha Upanishad',
    verseReference: 'Mantra 1',
    poeticMeter: 'Anushtubh',
    authorOrRishi: 'Vedic Seers / Yajnavalkya Lineage',
    wordBreakdown: [
      { index: 1, word: 'ईशा', transliteration: 'īśā', grammar: 'Instrumental singular of īś', meaning: 'by the supreme Lord', dhatuRoot: 'ईश् (īś)', rootMeaning: 'to pervade, govern' },
      { index: 2, word: 'वास्यम्', transliteration: 'vāsyam', grammar: 'Gerundive adjective', meaning: 'to be enveloped / covered', dhatuRoot: 'वस् (vas)', rootMeaning: 'to clothe, dwell in' },
      { index: 3, word: 'सर्वम्', transliteration: 'sarvam', grammar: 'Pronominal adjective', meaning: 'all / everything' },
      { index: 4, word: 'त्यक्तेन', transliteration: 'tyaktena', grammar: 'Instrumental past participle', meaning: 'through detachment / renunciation', dhatuRoot: 'त्यज् (tyaj)', rootMeaning: 'to relinquish' },
      { index: 5, word: 'भुञ्जीथाः', transliteration: 'bhuñjīthāḥ', grammar: 'Optative middle 2nd person', meaning: 'enjoy / protect yourself', dhatuRoot: 'भुज् (bhuj)', rootMeaning: 'to enjoy, nourish' },
    ],
    translations: {
      en: {
        targetLanguage: 'en',
        translation: 'All this, whatever moves in this moving world, is enveloped by the Lord. Enjoy it through renunciation; do not covet anyone’s wealth.',
        philosophicalCommentary: 'The foundation of integral ecology and Vedanta: experiencing nature with reverence rather than rapacious attachment.',
      },
      hi: {
        targetLanguage: 'hi',
        translation: 'इस गतिशील संसार में जो कुछ भी जड़-चेतन है, वह सब ईश्वर से व्याप्त है। उसका त्यागपूर्वक उपभोग करो, किसी के धन का लोभ मत करो।',
        philosophicalCommentary: 'ईशावास्योपनिषद का यह प्रथम मंत्र भौतिक और आध्यात्मिक जीवन के संतुलन का मार्ग प्रशस्त करता है।',
      },
      gu: {
        targetLanguage: 'gu',
        translation: 'આ સમગ્ર જગતમાં જે કંઈ છે તે સર્વ ઈશ્વરથી વ્યાપ્ત છે. તેનો ત્યાગભાવથી ઉપભોગ કરો, કોઈના ધનનો લોભ ન કરો.',
        philosophicalCommentary: 'ત્યાગપૂર્વક જીવન જીવવાનો આ ઉપનિષદિક ઉપદેશ શાશ્વત શાંતિ આપે છે.',
      },
    },
  },
];

const CANONICAL_ETYMOLOGIES: EtymologyEntryDTO[] = [
  {
    root: 'धृ (dhṛ)',
    rootDevanagari: 'धृञ् धारणे',
    rootIast: 'dhṛ',
    language: 'sa',
    rootMeaning: 'To hold, support, maintain, uphold, or sustain',
    linguisticFamily: 'Indo-European / Classical Sanskrit (Cognate with Latin firmus, English dur-able)',
    grammaticalAffixes: '+ मन् (man) -> धर्म (Dharma); + ति (ti) -> धरति (dharati)',
    derivedWords: ['धर्म (Dharma)', 'धरणी (Dharaṇī - Earth)', 'धारणा (Dhāraṇā - Concentration)', 'धारक (Dhāraka - Bearer)'],
    canonicalCitation: 'धारणाद् धर्म इत्याहुर्धर्मो धारयते प्रजाः (Mahabharata, Karna Parva 69.58)',
    philosophicalEvolution: 'From physical support to the cosmic moral substrate (Ṛta) upholding society, duty, and truth.',
  },
  {
    root: 'कृ (kṛ)',
    rootDevanagari: 'डुकृञ् करणे',
    rootIast: 'kṛ',
    language: 'sa',
    rootMeaning: 'To do, enact, perform, create, cause',
    linguisticFamily: 'Indo-European (Cognate with Latin creare, English create)',
    grammaticalAffixes: '+ मन् (man) -> कर्मन् (Karman); + ता (tā) -> कर्ता (Kartā); + य (ya) -> कार्य (Kārya)',
    derivedWords: ['कर्म (Karma)', 'कर्ता (Kartā - Agent)', 'क्रिया (Kriyā - Action)', 'कारण (Kāraṇa - Cause)'],
    canonicalCitation: 'गहना कर्मणो गतिः (Bhagavad Gita 4.17)',
    philosophicalEvolution: 'From sacrificial Vedic rites to the inexorable cosmic causal law of rebirth, and finally to selfless action.',
  },
  {
    root: 'ज्ञा (jñā)',
    rootDevanagari: 'ज्ञा अवबोधने',
    rootIast: 'jñā',
    language: 'sa',
    rootMeaning: 'To know, experience directly, apprehend with luminous clarity',
    linguisticFamily: 'Indo-European (Cognate with Greek gnosis, Latin cognoscere, English know)',
    grammaticalAffixes: '+ ल्युट् (lyuṭ / ana) -> ज्ञान (Jñāna); + तृ (tṛ) -> ज्ञाता (Jñātā)',
    derivedWords: ['ज्ञान (Jñāna - Wisdom)', 'जिज्ञासा (Jijñāsā - Desire to know)', 'विज्ञानी (Vijñānī - Knower)'],
    canonicalCitation: 'न हि ज्ञानेन सदृशं पवित्रमिह विद्यते (Bhagavad Gita 4.38)',
    philosophicalEvolution: 'Contrast between discursive intellectual knowing (Apara Vidya) and direct unmediated spiritual realization (Para Vidya).',
  },
  {
    root: 'युज् (yuj)',
    rootDevanagari: 'युज् समाधौ / युजिरँ योगे',
    rootIast: 'yuj',
    language: 'sa',
    rootMeaning: 'To yoke, unite, integrate, bind, concentrate',
    linguisticFamily: 'Indo-European (Cognate with Latin iungere, English yoke/junction)',
    grammaticalAffixes: '+ घञ् (ghañ) -> योग (Yoga); + त (ta) -> युक्त (Yukta)',
    derivedWords: ['योग (Yoga)', 'योगी (Yogī)', 'युक्त (Yukta - Disciplined)', 'संयोग (Saṁyoga - Union)'],
    canonicalCitation: 'योगश्चित्तवृत्तिनिरोधः (Patanjali Yoga Sutra 1.2)',
    philosophicalEvolution: 'From yoking war chariots to stilling psychological fluctuations and realizing meditative unity.',
  },
  {
    root: 'चित् (cit)',
    rootDevanagari: 'चिती स्मृतौ / चेतने',
    rootIast: 'cit',
    language: 'sa',
    rootMeaning: 'To perceive, reflect, observe, be conscious of',
    linguisticFamily: 'Indo-Aryan (Classical Sanskrit)',
    grammaticalAffixes: '+ क्तिन् (ktin) -> चित्ति (Citti); + क्त (kta) -> चित्त (Citta); + णिच् -> चेतना (Cetanā)',
    derivedWords: ['चित्त (Citta - Mind-field)', 'चैतन्य (Caitanya - Pure Consciousness)', 'चेतना (Cetanā - Awareness)'],
    canonicalCitation: 'सच्चिदानन्दविग्रह (Sat-Cit-Ananda: Existence, Consciousness, Bliss)',
    philosophicalEvolution: 'The witnessing awareness (Sakshi) that illuminates transient sensory thoughts without being altered by them.',
  },
  {
    root: 'અહંકાર (Ahaṁkāra)',
    rootDevanagari: 'અસ્ (as) -> અસ્તિત્વ',
    rootIast: 'ahaṁ-kāra',
    language: 'gu',
    rootMeaning: 'The "I-maker" / Egoic self-identification',
    linguisticFamily: 'Indo-Aryan (Old Gujarati / Apabhramsha)',
    grammaticalAffixes: 'અહમ્ (aham - I) + કાર (kāra - maker)',
    derivedWords: ['અહંકાર (Ahamkara)', 'આત્મભાવ (Atmabhava)', 'નિરહંકાર (Nirahamkara)'],
    canonicalCitation: 'મન અભિમાન ન આણે રે (Narsinh Mehta)',
    philosophicalEvolution: 'The shift from defensive egotism to universal humility and recognition of divine presence in all.',
  },
  {
    root: 'அறம் (Aṟam)',
    rootDevanagari: 'அறு (aṟu) -> அறுத்தல்',
    rootIast: 'aṟam',
    language: 'ta',
    rootMeaning: 'To cut through wrong, sever delusion, establish moral boundary',
    linguisticFamily: 'Dravidian (Classical Tamil Sangam)',
    grammaticalAffixes: '+ அம் (am) -> அறம் (Aṟam - Virtue / Natural Law)',
    derivedWords: ['அறம் (Aṟam - Virtue)', 'அறநெறி (Aṟaneṟi - Path of Dharma)', 'அறவோன் (Aṟavōn - Sage)'],
    canonicalCitation: 'அறத்தினூஉங்கு ஆக்கமும் இல்லை (Tirukkural 32)',
    philosophicalEvolution: 'The supreme ethical standard of Tamil civilization: universal compassion, integrity, and social duty.',
  },
  {
    root: 'धम्म (Dhamma)',
    rootDevanagari: 'धम्म (Pali)',
    rootIast: 'dhamma',
    language: 'pli',
    rootMeaning: 'Pali cognate of Dharma; cosmic truth, phenomena, the Buddha’s teaching',
    linguisticFamily: 'Middle Indo-Aryan (Prakrit / Magadhi)',
    grammaticalAffixes: 'Stem dhamma + nominative case inflection',
    derivedWords: ['धम्मपद (Dhammapada)', 'धम्मचक्क (Dhammacakka)', 'अभिधम्म (Abhidhamma)'],
    canonicalCitation: 'धम्मो हवे रक्खति धम्मचारिं (Dhamma protects the one who lives in truth)',
    philosophicalEvolution: 'Specifically designates the Four Noble Truths, intentional causality, and the path to Nibbāna.',
  },
];

export default function LanguagesPage() {
  const [activeLang, setActiveLang] = useState<SupportedLanguage>('sa');
  const [activeTab, setActiveTab] = useState<'keyboard' | 'manuscripts' | 'translator' | 'etymology'>('keyboard');

  // Virtual Keyboard state
  const [keyboardScript, setKeyboardScript] = useState<'sa' | 'gu'>('sa');
  const [isShifted, setIsShifted] = useState<boolean>(false);
  const [typedText, setTypedText] = useState<string>('');
  const keyboardInputRef = useRef<HTMLTextAreaElement>(null);
  const translatorInputRef = useRef<HTMLTextAreaElement>(null);

  // Manuscript Workbench state
  const [selectedManuscriptSlug, setSelectedManuscriptSlug] = useState<string>('gita-2-47');
  const [translationTargetLang, setTranslationTargetLang] = useState<'en' | 'hi' | 'gu'>('en');

  // Multi-tradition Translator Tool state
  const [translateMode, setTranslateMode] = useState<'text' | 'image'>('text');
  const [transSourceLang, setTransSourceLang] = useState<TranslateSourceLanguage>('auto');
  const [transTargetLang, setTransTargetLang] = useState<SupportedLanguage>('en');
  const [transInputText, setTransInputText] = useState<string>('कर्मण्येवाधिकारस्ते मा फलेषु कदाचन');
  const [transResult, setTransResult] = useState<TranslationResultDTO | null>(null);
  const [transLoading, setTransLoading] = useState<boolean>(false);
  const [transError, setTransError] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Image & Manuscript OCR Translation state
  const [ocrImageFile, setOcrImageFile] = useState<File | null>(null);
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const [ocrImageBase64, setOcrImageBase64] = useState<string | null>(null);
  const [ocrImageMime, setOcrImageMime] = useState<string>('image/png');
  const [ocrTargetLang, setOcrTargetLang] = useState<SupportedLanguage>('en');
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<ImageOCRResultDTO | null>(null);
  const [ocrError, setOcrError] = useState<string>('');

  // Etymology state
  const [etymologySearch, setEtymologySearch] = useState<string>('');
  const [selectedEtymology, setSelectedEtymology] = useState<EtymologyEntryDTO>(CANONICAL_ETYMOLOGIES[0]);

  // Virtual Keyboards definitions
  const devanagariRows = [
    [
      { normal: '१', shifted: 'ॐ' },
      { normal: '२', shifted: 'ऽ' },
      { normal: '३', shifted: '॑' },
      { normal: '४', shifted: '॒' },
      { normal: '५', shifted: '!' },
      { normal: '६', shifted: '॥' },
      { normal: '७', shifted: '।' },
      { normal: '८', shifted: '(' },
      { normal: '९', shifted: ')' },
      { normal: '०', shifted: '%' },
      { normal: '।', shifted: '॥' },
    ],
    [
      { normal: 'अ', shifted: 'ा' },
      { normal: 'आ', shifted: 'ि' },
      { normal: 'इ', shifted: 'ी' },
      { normal: 'ई', shifted: 'ु' },
      { normal: 'उ', shifted: 'ू' },
      { normal: 'ऊ', shifted: 'ृ' },
      { normal: 'ऋ', shifted: 'ॄ' },
      { normal: 'ए', shifted: 'े' },
      { normal: 'ऐ', shifted: 'ै' },
      { normal: 'ओ', shifted: 'ो' },
      { normal: 'औ', shifted: 'ौ' },
      { normal: 'अं', shifted: 'ं' },
      { normal: 'अः', shifted: 'ः' },
    ],
    [
      { normal: 'क', shifted: 'क्ष' },
      { normal: 'ख', shifted: 'ख्' },
      { normal: 'ग', shifted: 'ग्' },
      { normal: 'घ', shifted: 'घ्' },
      { normal: 'ङ', shifted: 'ङ्' },
      { normal: 'च', shifted: 'च्' },
      { normal: 'छ', shifted: 'छ्' },
      { normal: 'ज', shifted: 'ज्ञ' },
      { normal: 'झ', shifted: 'झ्' },
      { normal: 'ञ', shifted: 'ञ्' },
      { normal: '्', shifted: '्' },
    ],
    [
      { normal: 'ट', shifted: 'ट्' },
      { normal: 'ठ', shifted: 'ठ्' },
      { normal: 'ड', shifted: 'ड्' },
      { normal: 'ढ', shifted: 'ढ्' },
      { normal: 'ण', shifted: 'ण्' },
      { normal: 'त', shifted: 'त्र' },
      { normal: 'थ', shifted: 'थ्' },
      { normal: 'द', shifted: 'द्' },
      { normal: 'ध', shifted: 'ध्' },
      { normal: 'न', shifted: 'न्' },
    ],
    [
      { normal: 'प', shifted: 'प्' },
      { normal: 'फ', shifted: 'फ्' },
      { normal: 'ब', shifted: 'ब्' },
      { normal: 'भ', shifted: 'भ्' },
      { normal: 'म', shifted: 'म्' },
      { normal: 'य', shifted: 'य्' },
      { normal: 'र', shifted: 'र्' },
      { normal: 'ल', shifted: 'ल्' },
      { normal: 'व', shifted: 'व्' },
      { normal: 'श', shifted: 'श्र' },
      { normal: 'ष', shifted: 'ष्' },
      { normal: 'स', shifted: 'स्' },
      { normal: 'ह', shifted: 'ह्' },
    ],
  ];

  const gujaratiRows = [
    [
      { normal: '૧', shifted: 'ૐ' },
      { normal: '૨', shifted: 'ઽ' },
      { normal: '૩', shifted: '!' },
      { normal: '૪', shifted: '@' },
      { normal: '૫', shifted: '#' },
      { normal: '૬', shifted: '॥' },
      { normal: '૭', shifted: '।' },
      { normal: '૮', shifted: '(' },
      { normal: '૯', shifted: ')' },
      { normal: '૦', shifted: '%' },
      { normal: '।', shifted: '॥' },
    ],
    [
      { normal: 'અ', shifted: 'ા' },
      { normal: 'આ', shifted: 'િ' },
      { normal: 'ઇ', shifted: 'ી' },
      { normal: 'ઈ', shifted: 'ુ' },
      { normal: 'ઉ', shifted: 'ૂ' },
      { normal: 'ઊ', shifted: 'ૃ' },
      { normal: 'ઋ', shifted: 'ૄ' },
      { normal: 'એ', shifted: 'ે' },
      { normal: 'ઐ', shifted: 'ૈ' },
      { normal: 'ઓ', shifted: 'ો' },
      { normal: 'ઔ', shifted: 'ૌ' },
      { normal: 'અં', shifted: 'ં' },
      { normal: 'અઃ', shifted: 'ઃ' },
    ],
    [
      { normal: 'ક', shifted: 'ક્ષ' },
      { normal: 'ખ', shifted: 'ખ્' },
      { normal: 'ગ', shifted: 'ગ્' },
      { normal: 'ઘ', shifted: 'ઘ્' },
      { normal: 'ઙ', shifted: 'ઙ્' },
      { normal: 'ચ', shifted: 'ચ્' },
      { normal: 'છ', shifted: 'છ્' },
      { normal: 'જ', shifted: 'જ્ઞ' },
      { normal: 'ઝ', shifted: 'ઝ્' },
      { normal: 'ઞ', shifted: 'ઞ્' },
      { normal: '્', shifted: '્' },
    ],
    [
      { normal: 'ટ', shifted: 'ટ્' },
      { normal: 'ઠ', shifted: 'ઠ્' },
      { normal: 'ડ', shifted: 'ડ્' },
      { normal: 'ઢ', shifted: 'ઢ્' },
      { normal: 'ણ', shifted: 'ણ્' },
      { normal: 'ત', shifted: 'ત્ર' },
      { normal: 'થ', shifted: 'થ્' },
      { normal: 'દ', shifted: 'દ્' },
      { normal: 'ધ', shifted: 'ધ્' },
      { normal: 'ન', shifted: 'ન્' },
    ],
    [
      { normal: 'પ', shifted: 'પ્' },
      { normal: 'ફ', shifted: 'ફ્' },
      { normal: 'બ', shifted: 'બ્' },
      { normal: 'ભ', shifted: 'ભ્' },
      { normal: 'મ', shifted: 'મ્' },
      { normal: 'ય', shifted: 'ય્' },
      { normal: 'ર', shifted: 'ર્' },
      { normal: 'લ', shifted: 'લ્' },
      { normal: 'વ', shifted: 'વ્' },
      { normal: 'શ', shifted: 'શ્ર' },
      { normal: 'ષ', shifted: 'ષ્' },
      { normal: 'સ', shifted: 'સ્' },
      { normal: 'હ', shifted: 'હ્' },
      { normal: 'ળ', shifted: 'ળ્' },
    ],
  ];

  // Matra combination handler supporting cursor position & selection
  function handleKeyPress(char: string) {
    const textarea = keyboardInputRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? typedText.length;
      const end = textarea.selectionEnd ?? typedText.length;
      const before = typedText.slice(0, start);
      const after = typedText.slice(end);

      const isMatra = /^[\u093E-\u094F\u0951-\u0954\u0902\u0903\u0A82\u0A83\u0ABE-\u0ACF]$/.test(char);
      if (isMatra && before.length > 0) {
        const lastChar = before.slice(-1);
        // If last character is halant (virama), replace with matra
        if (lastChar === '\u094D' || lastChar === '\u0ACD') {
          const updatedBefore = before.slice(0, -1);
          const newText = updatedBefore + char + after;
          setTypedText(newText);
          const newPos = updatedBefore.length + char.length;
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
          return;
        }
      }

      const newText = before + char + after;
      setTypedText(newText);
      const newPos = start + char.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    } else {
      setTypedText((prev) => {
        if (!prev) return char;
        const isMatra = /^[\u093E-\u094F\u0951-\u0954\u0902\u0903\u0A82\u0A83\u0ABE-\u0ACF]$/.test(char);
        if (isMatra) {
          const lastChar = prev.slice(-1);
          if (lastChar === '\u094D' || lastChar === '\u0ACD') {
            return prev.slice(0, -1) + char;
          }
        }
        return prev + char;
      });
    }
  }

  function handleBackspace() {
    const textarea = keyboardInputRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? typedText.length;
      const end = textarea.selectionEnd ?? typedText.length;
      if (start !== end) {
        const newText = typedText.slice(0, start) + typedText.slice(end);
        setTypedText(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start);
        }, 0);
        return;
      }
      if (start > 0) {
        const newText = typedText.slice(0, start - 1) + typedText.slice(start);
        setTypedText(newText);
        const newPos = start - 1;
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
        return;
      }
    } else {
      setTypedText((prev) => prev.slice(0, -1));
    }
  }

  function handleSpace() {
    handleKeyPress(' ');
  }

  function handleClear() {
    setTypedText('');
  }

  function handleCopy() {
    navigator.clipboard.writeText(typedText);
    setCopiedKey('virtual-keyboard');
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function copyToClipboard(text: string, key: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((k) => (k === key ? null : k));
    }, 2000);
  }

  function handleSwapLanguages() {
    if (transSourceLang === 'auto') return;
    const oldSource = transSourceLang;
    setTransSourceLang(transTargetLang);
    setTransTargetLang(oldSource);
    if (transResult?.translatedText) {
      setTransInputText(transResult.translatedText);
      setTransResult(null);
    }
  }

  async function handleExecuteTranslation() {
    if (!transInputText.trim()) return;
    setTransLoading(true);
    setTransError('');
    try {
      const res = await apiClient<TranslationResultDTO>('/languages/translate', {
        method: 'POST',
        body: JSON.stringify({
          sourceLanguage: transSourceLang,
          targetLanguage: transTargetLang,
          text: transInputText.trim(),
        }),
      });
      if (res.success && res.data) {
        setTransResult(res.data);
      } else {
        setTransError(res.error?.message || 'Translation failed');
      }
    } catch {
      setTransError('Network error during translation');
    } finally {
      setTransLoading(false);
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setOcrError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setOcrError('File size exceeds 8MB limit. Please upload an image smaller than 8MB.');
      return;
    }

    const validMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setOcrError('Unsupported image format. Please upload a PNG, JPG, or WebP image.');
      return;
    }

    setOcrImageFile(file);
    setOcrImageMime(file.type);
    setOcrResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setOcrImagePreview(result);
      setOcrImageBase64(result);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setOcrImageFile(null);
    setOcrImagePreview(null);
    setOcrImageBase64(null);
    setOcrResult(null);
    setOcrError('');
  }

  async function handleExecuteImageOCR() {
    if (!ocrImageBase64) {
      setOcrError('Please upload an image first');
      return;
    }

    setOcrLoading(true);
    setOcrError('');
    try {
      const res = await apiClient<ImageOCRResultDTO>('/languages/ocr-translate', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: ocrImageBase64,
          mimeType: ocrImageMime,
          targetLanguage: ocrTargetLang,
        }),
      });

      if (res.success && res.data) {
        setOcrResult(res.data);
      } else {
        setOcrError(res.error?.message || 'Failed to extract or translate manuscript image');
      }
    } catch {
      setOcrError('Network error while processing manuscript image');
    } finally {
      setOcrLoading(false);
    }
  }

  const activeManuscript = CANONICAL_MANUSCRIPTS.find((m) => m.slug === selectedManuscriptSlug) || CANONICAL_MANUSCRIPTS[0];

  const filteredEtymologies = CANONICAL_ETYMOLOGIES.filter((e) => {
    if (!etymologySearch) return true;
    const q = etymologySearch.toLowerCase();
    return (
      e.root.toLowerCase().includes(q) ||
      e.rootMeaning.toLowerCase().includes(q) ||
      e.derivedWords.some((w) => w.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', background: '#0D0B08', color: '#EDE8D5' }}>
      <div className="temple-container" style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Header Banner */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🪶 📜 🕉️</div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#D4AF37',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
            }}
          >
            Multilingual Manuscripts, Virtual Keyboards &amp; Etymology
          </h1>
          <p style={{ color: '#9A9078', maxWidth: '780px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Access authentic sacred literature across Sanskrit, Hindi, Gujarati, Tamil, and Pali. Type with high-precision virtual keyboards, explore word-by-word anatomical verse breakdowns, and trace primordial Dhatu roots.
          </p>
        </div>

        {/* Language Selection Row */}
        <div
          className="temple-card"
          style={{
            background: 'rgba(25, 22, 15, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🌐</span>
            <span style={{ fontFamily: 'var(--font-serif)', color: '#F2D675', fontWeight: 600 }}>Supported Traditions:</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {(Object.keys(SUPPORTED_LANGUAGES_REGISTRY) as SupportedLanguage[]).map((code) => {
              const info = SUPPORTED_LANGUAGES_REGISTRY[code];
              const isSelected = activeLang === code;
              return (
                <button
                  key={code}
                  onClick={() => {
                    setActiveLang(code);
                    if (code === 'gu') setKeyboardScript('gu');
                    else setKeyboardScript('sa');
                  }}
                  style={{
                    background: isSelected ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.04)',
                    border: isSelected ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                    color: isSelected ? '#F2D675' : '#EDE8D5',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>{info.flag}</span>
                  <span>{info.name}</span>
                  <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({info.nativeName})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('keyboard')}
            style={{
              background: activeTab === 'keyboard' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              border: activeTab === 'keyboard' ? '1px solid #D4AF37' : '1px solid transparent',
              color: activeTab === 'keyboard' ? '#F2D675' : '#9A9078',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ⌨️ Virtual Keyboards (Devanagari &amp; Gujarati)
          </button>

          <button
            onClick={() => setActiveTab('manuscripts')}
            style={{
              background: activeTab === 'manuscripts' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              border: activeTab === 'manuscripts' ? '1px solid #D4AF37' : '1px solid transparent',
              color: activeTab === 'manuscripts' ? '#F2D675' : '#9A9078',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            📜 Manuscript Reader &amp; Verse Breakdown
          </button>

          <button
            onClick={() => setActiveTab('translator')}
            style={{
              background: activeTab === 'translator' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              border: activeTab === 'translator' ? '1px solid #D4AF37' : '1px solid transparent',
              color: activeTab === 'translator' ? '#F2D675' : '#9A9078',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🌐 Multilingual Translation Engine
          </button>

          <button
            onClick={() => setActiveTab('etymology')}
            style={{
              background: activeTab === 'etymology' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              border: activeTab === 'etymology' ? '1px solid #D4AF37' : '1px solid transparent',
              color: activeTab === 'etymology' ? '#F2D675' : '#9A9078',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🌱 Root-Word (Dhatu) &amp; Etymology
          </button>
        </div>

        {/* TAB 1: VIRTUAL KEYBOARDS */}
        {activeTab === 'keyboard' && (
          <div>
            {/* Script Toggle & Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ color: '#9A9078', fontSize: '0.9rem' }}>Script Layout:</span>
                <button
                  onClick={() => setKeyboardScript('sa')}
                  style={{
                    background: keyboardScript === 'sa' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: keyboardScript === 'sa' ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                    color: keyboardScript === 'sa' ? '#F2D675' : '#EDE8D5',
                    padding: '0.4rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  संस्कृतम् / हिन्दी (Devanagari)
                </button>
                <button
                  onClick={() => setKeyboardScript('gu')}
                  style={{
                    background: keyboardScript === 'gu' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.05)',
                    border: keyboardScript === 'gu' ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                    color: keyboardScript === 'gu' ? '#F2D675' : '#EDE8D5',
                    padding: '0.4rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ગુજરાતી (Gujarati)
                </button>
              </div>

              {/* Shift Key Toggle Button */}
              <button
                onClick={() => setIsShifted((s) => !s)}
                style={{
                  background: isShifted ? '#D4AF37' : 'rgba(212, 175, 55, 0.15)',
                  color: isShifted ? '#0D0B08' : '#F2D675',
                  border: '1px solid #D4AF37',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>⇧ SHIFT {isShifted ? 'ACTIVE' : 'OFF'}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({isShifted ? 'Matras & Symbols' : 'Letters & Numbers'})</span>
              </button>
            </div>

            {/* Live Typing Display Box */}
            <div
              className="temple-card"
              style={{
                background: 'rgba(20, 17, 12, 0.95)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '10px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#9A9078', fontSize: '0.85rem' }}>
                <span>Inscribed Text Preview ({typedText.length} characters)</span>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={handleCopy} style={{ background: 'transparent', border: 'none', color: '#F2D675', cursor: 'pointer', fontSize: '0.8rem' }}>
                    📋 Copy
                  </button>
                  <button onClick={handleClear} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}>
                    🗑️ Clear
                  </button>
                </div>
              </div>

              <textarea
                ref={keyboardInputRef}
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Click virtual keys below, or type directly with your physical keyboard..."
                rows={3}
                style={{
                  width: '100%',
                  minHeight: '88px',
                  fontSize: '1.45rem',
                  lineHeight: 1.6,
                  color: '#F2D675',
                  caretColor: '#F2D675',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(212,175,55,0.3)',
                  wordBreak: 'break-word',
                  fontFamily: keyboardScript === 'gu' ? 'sans-serif' : 'var(--font-serif)',
                  outline: 'none',
                  resize: 'vertical',
                  cursor: 'text',
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(242, 214, 117, 0.8)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(212, 175, 55, 0.25)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />

              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setTransInputText(typedText);
                    setTransSourceLang(keyboardScript);
                    setTransTargetLang('en');
                    setActiveTab('translator');
                  }}
                  disabled={!typedText}
                  style={{
                    padding: '0.45rem 1rem',
                    background: typedText ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)' : 'rgba(255,255,255,0.05)',
                    color: typedText ? '#0D0B08' : '#9A9078',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: typedText ? 'pointer' : 'not-allowed',
                    fontSize: '0.85rem',
                  }}
                >
                  Translate This Text ➔
                </button>
              </div>
            </div>

            {/* Virtual Keyboard Grid */}
            <div
              className="temple-card"
              style={{
                background: 'rgba(13, 11, 8, 0.98)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
              }}
            >
              {(keyboardScript === 'sa' ? devanagariRows : gujaratiRows).map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    marginBottom: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {row.map((k, colIdx) => {
                    const displayChar = isShifted ? k.shifted : k.normal;
                    return (
                      <button
                        key={colIdx}
                        onClick={() => handleKeyPress(displayChar)}
                        style={{
                          minWidth: '42px',
                          height: '42px',
                          background: isShifted ? 'rgba(212, 175, 55, 0.18)' : 'rgba(33, 29, 18, 0.9)',
                          border: isShifted ? '1px solid #F2D675' : '1px solid rgba(212, 175, 55, 0.25)',
                          borderRadius: '6px',
                          color: isShifted ? '#F2D675' : '#EDE8D5',
                          fontSize: '1.15rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.1s, transform 0.1s',
                        }}
                      >
                        {displayChar}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Bottom Control Bar */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '0.75rem' }}>
                <button
                  onClick={() => setIsShifted((s) => !s)}
                  style={{
                    flex: 1,
                    maxWidth: '120px',
                    height: '42px',
                    background: isShifted ? '#D4AF37' : 'rgba(255,255,255,0.06)',
                    color: isShifted ? '#0D0B08' : '#EDE8D5',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ⇧ Shift
                </button>

                <button
                  onClick={handleSpace}
                  style={{
                    flex: 3,
                    maxWidth: '360px',
                    height: '42px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#9A9078',
                    border: '1px solid rgba(212,175,55,0.25)',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ␣ Space
                </button>

                <button
                  onClick={handleBackspace}
                  style={{
                    flex: 1,
                    maxWidth: '120px',
                    height: '42px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ⌫ Backspace
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANUSCRIPT READER & VERSE BREAKDOWN */}
        {activeTab === 'manuscripts' && (
          <div>
            {/* Manuscript Selector */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              <span style={{ color: '#9A9078', fontSize: '0.9rem' }}>Select Manuscript:</span>
              {CANONICAL_MANUSCRIPTS.map((m) => (
                <button
                  key={m.slug}
                  onClick={() => setSelectedManuscriptSlug(m.slug)}
                  style={{
                    background: selectedManuscriptSlug === m.slug ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.04)',
                    border: selectedManuscriptSlug === m.slug ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                    color: selectedManuscriptSlug === m.slug ? '#F2D675' : '#EDE8D5',
                    padding: '0.45rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {m.title.split('–')[0]}
                </button>
              ))}
            </div>

            {/* Manuscript Folio Viewer */}
            <div
              className="temple-card"
              style={{
                background: 'linear-gradient(135deg, rgba(33, 29, 18, 0.95) 0%, rgba(20, 17, 12, 0.98) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: '#D4AF37', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                    {activeManuscript.canonicalSource} • {activeManuscript.verseReference}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#F2D675', margin: '0.2rem 0' }}>
                    {activeManuscript.title}
                  </h3>
                  <div style={{ color: '#9A9078', fontSize: '0.85rem' }}>
                    Rishi / Lineage: {activeManuscript.authorOrRishi} | Meter: {activeManuscript.poeticMeter}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['en', 'hi', 'gu'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setTranslationTargetLang(lang)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        background: translationTargetLang === lang ? '#D4AF37' : 'rgba(255,255,255,0.05)',
                        color: translationTargetLang === lang ? '#0D0B08' : '#EDE8D5',
                        border: '1px solid rgba(212,175,55,0.3)',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Original Shastra Inscription & Transliteration */}
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.6rem', color: '#F2D675', lineHeight: 1.8, whiteSpace: 'pre-line', fontFamily: 'var(--font-serif)', marginBottom: '0.75rem' }}>
                  {activeManuscript.originalText}
                </div>
                <div style={{ fontSize: '1rem', color: '#9A9078', fontStyle: 'italic', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {activeManuscript.transliteration}
                </div>
              </div>

              {/* Translation Commentary */}
              <div style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.25)', marginBottom: '1.75rem' }}>
                <div style={{ color: '#EDE8D5', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '0.6rem' }}>
                  &ldquo;{activeManuscript.translations[translationTargetLang]?.translation}&rdquo;
                </div>
                <div style={{ color: '#c4b5fd', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  💡 {activeManuscript.translations[translationTargetLang]?.philosophicalCommentary}
                </div>
              </div>

              {/* Word-by-Word Anatomical Breakdown */}
              <div>
                <h4 style={{ fontFamily: 'var(--font-serif)', color: '#D4AF37', fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                  Word-by-Word Grammatical &amp; Dhatu Breakdown (पदच्छेद):
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.3)', textAlign: 'left', color: '#9A9078' }}>
                        <th style={{ padding: '0.6rem' }}>Word (पद)</th>
                        <th style={{ padding: '0.6rem' }}>Transliteration</th>
                        <th style={{ padding: '0.6rem' }}>Grammar / Case</th>
                        <th style={{ padding: '0.6rem' }}>Meaning</th>
                        <th style={{ padding: '0.6rem' }}>Root (धातु)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeManuscript.wordBreakdown.map((w, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.6rem', color: '#F2D675', fontWeight: 700, fontSize: '0.95rem' }}>{w.word}</td>
                          <td style={{ padding: '0.6rem', color: '#EDE8D5' }}>{w.transliteration}</td>
                          <td style={{ padding: '0.6rem', color: '#9A9078' }}>{w.grammar}</td>
                          <td style={{ padding: '0.6rem', color: '#EDE8D5' }}>{w.meaning}</td>
                          <td style={{ padding: '0.6rem', color: '#38bdf8', fontWeight: 600 }}>{w.dhatuRoot || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MULTILINGUAL TRANSLATION & VISION OCR ENGINE */}
        {activeTab === 'translator' && (
          <div>
            <div
              className="temple-card"
              style={{
                background: 'rgba(25, 22, 15, 0.95)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#D4AF37', margin: 0 }}>
                    Shastric Translation &amp; Manuscript Vision
                  </h3>
                  <p style={{ color: '#9A9078', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                    End-to-end translation for typed/pasted sacred literature and uploaded manuscript imagery.
                  </p>
                </div>

                {/* Sub-mode selector (Text vs Image OCR) */}
                <div
                  style={{
                    display: 'flex',
                    background: 'rgba(13, 11, 8, 0.8)',
                    padding: '4px',
                    borderRadius: '24px',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                  }}
                >
                  <button
                    onClick={() => setTranslateMode('text')}
                    style={{
                      padding: '0.45rem 1.25rem',
                      background:
                        translateMode === 'text'
                          ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
                          : 'transparent',
                      color: translateMode === 'text' ? '#0D0B08' : '#EDE8D5',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>✍️</span> Text Translation
                  </button>
                  <button
                    onClick={() => setTranslateMode('image')}
                    style={{
                      padding: '0.45rem 1.25rem',
                      background:
                        translateMode === 'image'
                          ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
                          : 'transparent',
                      color: translateMode === 'image' ? '#0D0B08' : '#EDE8D5',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>🖼️</span> Image &amp; Manuscript OCR
                  </button>
                </div>
              </div>

              {/* =========================================================================
                  SUB-MODE A: TEXT TRANSLATION
              ========================================================================== */}
              {translateMode === 'text' && (
                <div>
                  {/* Language Selection Row */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                      marginBottom: '1.25rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Source Language Picker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', color: '#9A9078', fontWeight: 600 }}>Source:</label>
                      <select
                        value={transSourceLang}
                        onChange={(e) => setTransSourceLang(e.target.value as TranslateSourceLanguage)}
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          border: '1px solid rgba(212,175,55,0.3)',
                          color: '#F2D675',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      >
                        <option value="auto">✨ Auto Detect (स्वचालित)</option>
                        <option value="sa">Sanskrit (संस्कृतम्)</option>
                        <option value="ta">Tamil (தமிழ்)</option>
                        <option value="pli">Pali (पाळि)</option>
                        <option value="gu">Gujarati (ગુજરાતી)</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    {/* Swap Button */}
                    <button
                      onClick={handleSwapLanguages}
                      disabled={transSourceLang === 'auto'}
                      title={transSourceLang === 'auto' ? 'Cannot swap with Auto Detect' : 'Swap languages'}
                      style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: transSourceLang === 'auto' ? '#555' : '#F2D675',
                        borderRadius: '50%',
                        width: '34px',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: transSourceLang === 'auto' ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      ⇄
                    </button>

                    {/* Target Language Picker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', color: '#9A9078', fontWeight: 600 }}>Target:</label>
                      <select
                        value={transTargetLang}
                        onChange={(e) => setTransTargetLang(e.target.value as SupportedLanguage)}
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          border: '1px solid rgba(212,175,55,0.3)',
                          color: '#F2D675',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                        <option value="gu">Gujarati (ગુજરાતી)</option>
                        <option value="sa">Sanskrit (संस्कृतम्)</option>
                        <option value="ta">Tamil (தமிழ்)</option>
                        <option value="pli">Pali (पाळિ)</option>
                      </select>
                    </div>

                    {/* Action Button */}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setTransInputText('');
                          setTransResult(null);
                          setTransError('');
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#9A9078',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleExecuteTranslation}
                        disabled={transLoading || !transInputText.trim()}
                        style={{
                          padding: '0.5rem 1.6rem',
                          background:
                            transLoading || !transInputText.trim()
                              ? 'rgba(212, 175, 55, 0.3)'
                              : 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                          color: '#0D0B08',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 700,
                          cursor: transLoading || !transInputText.trim() ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.25)',
                        }}
                      >
                        {transLoading ? 'Translating...' : 'Translate ➔'}
                      </button>
                    </div>
                  </div>

                  {/* Input Text Box with character counter */}
                  <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <textarea
                      ref={translatorInputRef}
                      id="translation-source-input"
                      value={transInputText}
                      onChange={(e) => setTransInputText(e.target.value)}
                      placeholder="Enter sacred verse, shloka, sutra, or philosophical inquiry to translate..."
                      rows={5}
                      maxLength={10000}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem 1rem 2.4rem 1rem',
                        color: '#EDE8D5',
                        caretColor: '#F2D675',
                        fontSize: '1.05rem',
                        lineHeight: 1.6,
                        resize: 'vertical',
                        outline: 'none',
                        cursor: 'text',
                        userSelect: 'text',
                        WebkitUserSelect: 'text',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(242, 214, 117, 0.8)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(212, 175, 55, 0.25)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '14px',
                        fontSize: '0.75rem',
                        color: '#716b5c',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        zIndex: 2,
                      }}
                    >
                      {transInputText.length} / 10,000 characters
                    </div>
                  </div>

                  {/* Error Notification */}
                  {transError && (
                    <div
                      style={{
                        background: 'rgba(229, 62, 62, 0.15)',
                        border: '1px solid rgba(229, 62, 62, 0.4)',
                        color: '#fc8181',
                        padding: '0.85rem 1.25rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>⚠️ {transError}</span>
                      <button
                        onClick={() => setTransError('')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fc8181',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Text Translation Output */}
                  {transResult && (
                    <div
                      style={{
                        background: 'rgba(212, 175, 55, 0.08)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        borderRadius: '10px',
                        padding: '1.5rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span
                            style={{
                              background: 'rgba(212, 175, 55, 0.15)',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                              color: '#F2D675',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                            }}
                          >
                            Source: {transResult.sourceLanguage.toUpperCase()}
                          </span>
                          <span style={{ color: '#D4AF37' }}>➔</span>
                          <span
                            style={{
                              background: 'rgba(72, 187, 120, 0.15)',
                              border: '1px solid rgba(72, 187, 120, 0.3)',
                              color: '#68d391',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                            }}
                          >
                            Target: {transResult.targetLanguage.toUpperCase()}
                          </span>
                          <span
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#9A9078',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.78rem',
                            }}
                          >
                            Engine: {transResult.method.toUpperCase()}
                          </span>
                          <span
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#9A9078',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.78rem',
                            }}
                          >
                            Confidence: {Math.round(transResult.confidence * 100)}%
                          </span>
                        </div>

                        {/* Copy Translated Text Button */}
                        <button
                          onClick={() => copyToClipboard(transResult.translatedText, 'text-translation')}
                          style={{
                            background:
                              copiedKey === 'text-translation'
                                ? 'rgba(72, 187, 120, 0.2)'
                                : 'rgba(212, 175, 55, 0.15)',
                            border: `1px solid ${
                              copiedKey === 'text-translation' ? '#48bb78' : 'rgba(212, 175, 55, 0.3)'
                            }`,
                            color: copiedKey === 'text-translation' ? '#68d391' : '#F2D675',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: 600,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {copiedKey === 'text-translation' ? '✓ Copied!' : '📋 Copy Translation'}
                        </button>
                      </div>

                      {/* Main Translated Text */}
                      <div
                        style={{
                          fontSize: '1.25rem',
                          color: '#EDE8D5',
                          lineHeight: 1.7,
                          marginBottom: '1rem',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {transResult.translatedText}
                      </div>

                      {/* Transliteration (IAST / Romanized) */}
                      {transResult.transliteration && (
                        <div
                          style={{
                            background: 'rgba(0, 0, 0, 0.35)',
                            padding: '0.75rem 1rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(212, 175, 55, 0.15)',
                            marginBottom: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{ color: '#c4b5fd', fontStyle: 'italic', fontSize: '0.92rem' }}>
                            <span style={{ color: '#9A9078', fontWeight: 600, fontStyle: 'normal' }}>IAST: </span>
                            {transResult.transliteration}
                          </div>
                          <button
                            onClick={() => copyToClipboard(transResult.transliteration!, 'text-translit')}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: copiedKey === 'text-translit' ? '#48bb78' : '#9A9078',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              marginLeft: '0.5rem',
                            }}
                          >
                            {copiedKey === 'text-translit' ? '✓ Copied' : '📋'}
                          </button>
                        </div>
                      )}

                      {/* Philosophical / Etymological Notes */}
                      {transResult.etymologyNotes && (
                        <div
                          style={{
                            background: 'rgba(196, 107, 58, 0.1)',
                            borderLeft: '3px solid #C46B3A',
                            padding: '0.75rem 1rem',
                            borderRadius: '0 6px 6px 0',
                            color: '#e2d9c8',
                            fontSize: '0.88rem',
                            lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: '#F2D675', fontWeight: 600 }}>💡 Philosophical Commentary: </span>
                          {transResult.etymologyNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  SUB-MODE B: IMAGE & MANUSCRIPT OCR TRANSLATION
              ========================================================================== */}
              {translateMode === 'image' && (
                <div>
                  {/* Target Language & Controls Row */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                      marginBottom: '1.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', color: '#9A9078', fontWeight: 600 }}>
                        Translate Inscription To:
                      </label>
                      <select
                        value={ocrTargetLang}
                        onChange={(e) => setOcrTargetLang(e.target.value as SupportedLanguage)}
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          border: '1px solid rgba(212,175,55,0.3)',
                          color: '#F2D675',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                        <option value="gu">Gujarati (ગુજરાતી)</option>
                        <option value="sa">Sanskrit (संस्कृतम्)</option>
                        <option value="ta">Tamil (தமிழ்)</option>
                        <option value="pli">Pali (पाळિ)</option>
                      </select>
                    </div>

                    <div style={{ color: '#716b5c', fontSize: '0.85rem' }}>
                      (Supports Devanagari, Grantha, Tamil, Gujarati, and Romanized Sanskrit)
                    </div>
                  </div>

                  {/* Dropzone & Upload Box */}
                  {!ocrImagePreview ? (
                    <label
                      style={{
                        display: 'block',
                        border: '2px dashed rgba(212, 175, 55, 0.4)',
                        borderRadius: '12px',
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        background: 'rgba(0, 0, 0, 0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const pseudoEvent = {
                            target: { files: [file] },
                          } as any;
                          handleImageSelect(pseudoEvent);
                        }
                      }}
                    >
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleImageSelect}
                        style={{ display: 'none' }}
                      />
                      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📜</div>
                      <div style={{ fontSize: '1.2rem', color: '#F2D675', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Upload Ancient Manuscript, Palm Leaf, or Inscription Photo
                      </div>
                      <p style={{ color: '#9A9078', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1rem' }}>
                        Click to browse or drag and drop an image containing sacred verses or script. Max size 8MB (PNG, JPG, WebP).
                      </p>
                      <span
                        style={{
                          display: 'inline-block',
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid var(--gold-sacred)',
                          color: '#F2D675',
                          padding: '0.5rem 1.4rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        Select Image From Device
                      </span>
                    </label>
                  ) : (
                    /* Image Preview Card */
                    <div
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        borderRadius: '10px',
                        padding: '1.25rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ocrImagePreview}
                          alt="Manuscript Preview"
                          style={{
                            width: '90px',
                            height: '90px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                          }}
                        />
                        <div>
                          <div style={{ color: '#F2D675', fontWeight: 600, fontSize: '1rem', marginBottom: '0.2rem' }}>
                            {ocrImageFile?.name || 'Manuscript Image'}
                          </div>
                          <div style={{ color: '#9A9078', fontSize: '0.85rem' }}>
                            Size: {ocrImageFile ? (ocrImageFile.size / (1024 * 1024)).toFixed(2) + ' MB' : '—'} • Format:{' '}
                            {ocrImageMime.split('/')[1]?.toUpperCase()}
                          </div>
                          <div style={{ color: '#48bb78', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                            ✓ Validated for OCR scanning
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                          onClick={handleRemoveImage}
                          disabled={ocrLoading}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(229, 62, 62, 0.4)',
                            color: '#fc8181',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          ✕ Remove Image
                        </button>
                        <button
                          onClick={handleExecuteImageOCR}
                          disabled={ocrLoading}
                          style={{
                            background: ocrLoading
                              ? 'rgba(212, 175, 55, 0.3)'
                              : 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                            color: '#0D0B08',
                            border: 'none',
                            padding: '0.55rem 1.6rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                            cursor: ocrLoading ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                          }}
                        >
                          {ocrLoading ? 'Scanning & Translating...' : '⚡ Scan & Translate Image'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* OCR Loading State Indicator */}
                  {ocrLoading && (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '2.5rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '10px',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        marginBottom: '1.5rem',
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
                      <div style={{ color: '#F2D675', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                        Extracting Sacred Text &amp; Synthesizing Translation
                      </div>
                      <p style={{ color: '#9A9078', fontSize: '0.88rem', margin: 0 }}>
                        Analyzing script strokes, isolating characters, and applying cross-lingual philosophical grounding...
                      </p>
                    </div>
                  )}

                  {/* OCR Error Notification */}
                  {ocrError && (
                    <div
                      style={{
                        background: 'rgba(229, 62, 62, 0.15)',
                        border: '1px solid rgba(229, 62, 62, 0.4)',
                        color: '#fc8181',
                        padding: '1rem 1.25rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>⚠️ {ocrError}</span>
                      <button
                        onClick={() => setOcrError('')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fc8181',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Dual Panel OCR Results */}
                  {ocrResult && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                        gap: '1.5rem',
                        marginTop: '1.5rem',
                      }}
                    >
                      {/* Left Panel: Extracted Original Text */}
                      <div
                        style={{
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: '1px solid rgba(212, 175, 55, 0.35)',
                          borderRadius: '10px',
                          padding: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.95rem' }}>
                              📜 Extracted Original Text (मूल पाठ)
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <span
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#9A9078',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '10px',
                                fontSize: '0.75rem',
                              }}
                            >
                              {ocrResult.ocrProvider || 'Vision OCR'}
                            </span>
                            <span
                              style={{
                                background:
                                  ocrResult.confidence >= 0.75
                                    ? 'rgba(72, 187, 120, 0.15)'
                                    : 'rgba(212, 175, 55, 0.15)',
                                color: ocrResult.confidence >= 0.75 ? '#68d391' : '#F2D675',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '10px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              {Math.round(ocrResult.confidence * 100)}% Confidence
                            </span>
                            <button
                              onClick={() => copyToClipboard(ocrResult.extractedText, 'ocr-extracted')}
                              style={{
                                background:
                                  copiedKey === 'ocr-extracted'
                                    ? 'rgba(72, 187, 120, 0.2)'
                                    : 'rgba(212, 175, 55, 0.15)',
                                border: `1px solid ${
                                  copiedKey === 'ocr-extracted' ? '#48bb78' : 'rgba(212, 175, 55, 0.3)'
                                }`,
                                color: copiedKey === 'ocr-extracted' ? '#68d391' : '#F2D675',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                            >
                              {copiedKey === 'ocr-extracted' ? '✓ Copied' : '📋 Copy'}
                            </button>
                            <button
                              onClick={() => {
                                setTransInputText(ocrResult.extractedText);
                                setTranslateMode('text');
                              }}
                              style={{
                                background: 'rgba(212, 175, 55, 0.15)',
                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                color: '#F2D675',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                            >
                              ✎ Edit in Text Translator
                            </button>
                          </div>
                        </div>

                        {/* Low Confidence Warning Alert */}
                        {ocrResult.warning && (
                          <div
                            style={{
                              background: 'rgba(196, 107, 58, 0.15)',
                              border: '1px solid rgba(196, 107, 58, 0.4)',
                              color: '#fbd38d',
                              padding: '0.65rem 0.85rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              marginBottom: '0.85rem',
                              lineHeight: 1.4,
                            }}
                          >
                            ⚠️ {ocrResult.warning}
                          </div>
                        )}

                        {/* Extracted Text Body */}
                        <div
                          style={{
                            flex: 1,
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.25rem',
                            color: '#F2D675',
                            lineHeight: 1.8,
                            whiteSpace: 'pre-line',
                            background: 'rgba(13, 11, 8, 0.6)',
                            padding: '1rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(212, 175, 55, 0.15)',
                          }}
                        >
                          {ocrResult.extractedText || '(No readable script detected)'}
                        </div>
                      </div>

                      {/* Right Panel: Translated Sacred Text */}
                      <div
                        style={{
                          background: 'rgba(212, 175, 55, 0.08)',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          borderRadius: '10px',
                          padding: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#F2D675', fontWeight: 700, fontSize: '0.95rem' }}>
                              ✨ Translated Shastra (अनुवाद)
                            </span>
                            <span
                              style={{
                                background: 'rgba(72, 187, 120, 0.15)',
                                border: '1px solid rgba(72, 187, 120, 0.3)',
                                color: '#68d391',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '10px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              Target: {ocrTargetLang.toUpperCase()}
                            </span>
                          </div>

                          <button
                            onClick={() => copyToClipboard(ocrResult.translatedText || '', 'ocr-translated')}
                            style={{
                              background:
                                copiedKey === 'ocr-translated'
                                  ? 'rgba(72, 187, 120, 0.2)'
                                  : 'rgba(212, 175, 55, 0.15)',
                              border: `1px solid ${
                                copiedKey === 'ocr-translated' ? '#48bb78' : 'rgba(212, 175, 55, 0.3)'
                              }`,
                              color: copiedKey === 'ocr-translated' ? '#68d391' : '#F2D675',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {copiedKey === 'ocr-translated' ? '✓ Copied' : '📋 Copy Translation'}
                          </button>
                        </div>

                        {/* Translated Text Body */}
                        <div
                          style={{
                            fontSize: '1.15rem',
                            color: '#EDE8D5',
                            lineHeight: 1.7,
                            whiteSpace: 'pre-line',
                            marginBottom: '1rem',
                            background: 'rgba(13, 11, 8, 0.6)',
                            padding: '1rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(212, 175, 55, 0.15)',
                            flex: 1,
                          }}
                        >
                          {ocrResult.translatedText || '(Translation will appear here)'}
                        </div>

                        {/* Transliteration if available */}
                        {ocrResult.transliteration && (
                          <div
                            style={{
                              background: 'rgba(0, 0, 0, 0.35)',
                              padding: '0.65rem 0.85rem',
                              borderRadius: '6px',
                              border: '1px solid rgba(212, 175, 55, 0.15)',
                              marginBottom: '0.75rem',
                              fontSize: '0.88rem',
                              color: '#c4b5fd',
                              fontStyle: 'italic',
                            }}
                          >
                            <span style={{ color: '#9A9078', fontWeight: 600, fontStyle: 'normal' }}>IAST: </span>
                            {ocrResult.transliteration}
                          </div>
                        )}

                        {/* Philosophical Commentary if available */}
                        {ocrResult.etymologyNotes && (
                          <div
                            style={{
                              background: 'rgba(196, 107, 58, 0.1)',
                              borderLeft: '3px solid #C46B3A',
                              padding: '0.65rem 0.85rem',
                              borderRadius: '0 6px 6px 0',
                              color: '#e2d9c8',
                              fontSize: '0.85rem',
                              lineHeight: 1.45,
                            }}
                          >
                            <span style={{ color: '#F2D675', fontWeight: 600 }}>💡 Context &amp; Commentary: </span>
                            {ocrResult.etymologyNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ROOT-WORD (DHATU) & ETYMOLOGY */}
        {activeTab === 'etymology' && (
          <div>
            <div className="etymology-workspace-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              {/* Left Column: Root List & Search */}
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={etymologySearch}
                    onChange={(e) => setEtymologySearch(e.target.value)}
                    placeholder="Search Dhatu or meaning..."
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      borderRadius: '6px',
                      padding: '0.6rem 0.9rem',
                      color: '#EDE8D5',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto' }}>
                  {filteredEtymologies.map((entry, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedEtymology(entry)}
                      style={{
                        textAlign: 'left',
                        padding: '0.8rem 1rem',
                        background: selectedEtymology.root === entry.root ? 'rgba(212, 175, 55, 0.25)' : 'rgba(33, 29, 18, 0.7)',
                        border: selectedEtymology.root === entry.root ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#F2D675', fontSize: '1.05rem', marginBottom: '0.2rem' }}>
                        {entry.root}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#9A9078' }}>
                        {entry.rootMeaning}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Deep Etymology Inspector */}
              <div
                className="temple-card"
                style={{
                  background: 'rgba(25, 22, 15, 0.95)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: '12px',
                  padding: '2rem',
                }}
              >
                <div style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ color: '#D4AF37', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    {selectedEtymology.linguisticFamily}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#F2D675', margin: '0.25rem 0' }}>
                    {selectedEtymology.root}
                  </h3>
                  <div style={{ fontSize: '1.05rem', color: '#EDE8D5' }}>
                    Meaning: &ldquo;{selectedEtymology.rootMeaning}&rdquo;
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#9A9078', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Grammatical Affixes (प्रत्यय / उपसर्ग):
                    </h4>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '6px', color: '#38bdf8', fontSize: '0.92rem' }}>
                      {selectedEtymology.grammaticalAffixes}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#9A9078', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Derived Shastric Vocabulary:
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedEtymology.derivedWords.map((word, i) => (
                        <span
                          key={i}
                          style={{
                            background: 'rgba(212, 175, 55, 0.15)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            color: '#F2D675',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '15px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#9A9078', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Canonical Shastra Citation:
                    </h4>
                    <div style={{ fontStyle: 'italic', color: '#EDE8D5', fontSize: '0.92rem', background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #D4AF37' }}>
                      &ldquo;{selectedEtymology.canonicalCitation}&rdquo;
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#9A9078', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Philosophical Evolution:
                    </h4>
                    <p style={{ color: '#9A9078', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                      {selectedEtymology.philosophicalEvolution}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
