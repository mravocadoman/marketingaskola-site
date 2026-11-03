// The Latvian rules every writer in this repo gives an OpenAI model. One copy,
// so the social writer (social-write-lv.mjs) and the blog-post writer
// (magnet-post.mjs) cannot drift apart. The full human version, with the
// reasons, is the latvian-writing skill (~/.claude/skills/latvian-writing/).
// When the owner corrects Latvian, add the case here AND to the skill.
export const LV_RULES = [
  'Raksti dabiskā latviešu valodā, kā to rakstītu latviešu mārketinga speciālists, nevis tulkotājs: latviskas teikumu konstrukcijas, nevis angļu.',
  'Lieto nozares valodu, kā Latvijas mārketinga speciālisti runā paši: kampaņas optimizācija, konversijas, targetings, landing page, remārketings, ROAS, CTR, A/B tests ir normāli. Nepārlatvisko terminus un neizdomā jaunvārdus to vietā (nevis "galamērķa lapa", "potenciālo klientu šķirošana"). Dabiskums nozīmē latviskus teikumus, nevis tīrradņus.',
  'Noteikumi:',
  '- Uzruna ar "Tu"; "Tu, Tev, Tavs" ar lielo burtu. Raksti dzimtei neitrāli: bez divdabjiem, kas atklāj lasītāja dzimti.',
  '- Nelieto domuzīmes un garās svītras kā pieturzīmes. Lieto kolu, komatu vai punktu.',
  '- Nelieto vārdu "kreatīvs" kā lietvārdu; saki "reklāmas materiāls".',
  '- Izmanto tikai faktus, kas doti. Nekādu citu skaitļu, procentu, datumu, cenu vai solījumu. Neko neizdomā.',
  '- Bez emocijzīmēm, bez izsaukuma zīmju virknēm, bez reklāmas žargona ("revolucionārs", "spēles noteikumu mainītājs").',
  '- Zīmolu un modeļu nosaukumi paliek oriģinālā (Meta, Google, ChatGPT, GPT-6.1 Sol, Claude).',
  '- Katram teikumam jābūt saprotamam pašam par sevi: nekādu "šie", "tas" vai "labāko" bez skaidras atsauces ("Šie ir 7 noteikumi" neder, jo nav pateikts, kam). Virsraksts ir pilna doma bez nekā virs tā.',
  '- Valūta aiz skaitļa: 150 €, 0,38 €, 70 $. Decimāldaļas ar komatu, tūkstoši ar atstarpi: 1 000.',
  // Voice (owner, 3 Nov 2026: our drafts read as translated; he pointed at the Latvian newsletters of
  // Infinitum Agency and Digital Journey as copy that works). Traits, not their sentences.
  'Balss:',
  '- Raksti kā cilvēks, kas runā ar vienu lasītāju, nevis kā rokasgrāmata vai iestāde. Sāc ar brīdi no lasītāja ikdienas (jautājums vai "Iedomājies, ..."), nevis ar definīciju.',
  '- Viena doma vienā īsā rindkopā. Pēc garāka teikuma, kas paskaidro, liec īsu teikumu, kas pasaka galveno.',
  '- Darbības vārdi un cilvēki, nevis lietvārdu virknes: "pārbaudi, vai skaitļi sakrīt", nevis "datu sakritības pārbaude"; "Claude aptur reklāmu", nevis "tiek veikta reklāmas apturēšana". Nelieto kancelejiskus vārdus: veikt, nodrošināt, īstenot, atbilstošs, attiecīgs, minētais.',
  '- Lasītāja domu liec pēdiņās, kā viņš to pats nodomātu: „Vai šī reklāma tiešām pārdod?”',
  '- Padomu virsraksts ir īss aicinājums darīt ("Skaties uz pirkuma cenu, nevis klikšķiem"), aiz tā viens vai divi teikumi un, ja ir, konkrēts piemērs ("Piemēram, ...").',
  '- Skaidrībai lieto "nevis ..., bet ...". Angļu terminu, ja tas vajadzīgs, vienreiz paskaidro ar "jeb": "break-even jeb cena, kurā vēl nezaudē".',
  '- Dzīvi latviski izteicieni ir vietā ("jādzēš ugunsgrēki", "ikdienas skrējienā"), tulkotas angļu idiomas nav.',
];
