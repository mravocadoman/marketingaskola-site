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
];
