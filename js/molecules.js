/* A curated question bank of small, valence-clean organic structures.
   Every entry has fewer than ten carbon atoms and a single unambiguous
   constitutional IUPAC name (no stereochemistry-dependent cases). */

export const CATEGORY_RULES = {
  Alkane:
    'Find the longest carbon chain. Number it from the end that gives the substituents the lowest locant set, then list substituents alphabetically.',
  Alkene:
    'The parent chain must contain the C=C bond. Number from the end that gives the double bond the lowest locant, then position the substituents.',
  Alkyne:
    'The parent chain must contain the C≡C bond. Give the triple bond the lowest possible locant and number substituents from that end.',
  Alcohol:
    'The –OH group is the principal group and takes the suffix -ol. Number the parent chain from the end that gives –OH the lowest locant.',
  Aldehyde:
    'The –CHO carbon is always C1. It is part of the parent chain, and the suffix is -al.',
  Ketone:
    'The carbonyl carbon is part of the parent chain. Number the chain to give C=O the lowest possible locant.',
  'Carboxylic acid':
    'The –COOH carbon is C1 and the parent chain must include it. The suffix is -oic acid; substituents are numbered from the carboxyl carbon.',
  Ester:
    'Name the alkyl group attached to oxygen first as a separate word, then the alkanoate. The acyl carbonyl carbon of the alkanoate is C1.',
  Ether:
    'The longer carbon chain is the parent alkane. The shorter alkyl group becomes an alkoxy substituent, numbered to give the lowest locant.',
  Amine:
    'The amine is the principal group and takes the suffix -amine. Groups attached directly to nitrogen use N locants; carbon-chain numbering is separate.',
  Haloalkane:
    'Halogens are cited as prefixes (chloro-, bromo-). Choose the longest carbon chain and number it to give the substituent set the lowest locants.',
  Multifunctional:
    'Rank the functional groups by priority. Only the highest-priority group becomes the suffix; all other groups become prefixes. Number the parent chain for the principal group, then the lowest locant set, and alphabetize the prefixes.',
  Amide:
    'The amide group takes the suffix -amide and its carbonyl carbon is C1. Groups attached to nitrogen use N locants; carbon-chain substituents are numbered normally.',
  Nitrile:
    'The nitrile carbon is C1 and the suffix is -nitrile. Number the carbon chain from the nitrile carbon, then give substituents the lowest locants.',
  Thiol:
    'The –SH group takes the suffix -thiol. Number the parent chain from the end that gives –SH the lowest locant.',
  'Acid halide':
    'The acyl carbon is C1. The suffix for –COCl is -oyl chloride; the rest of the chain is numbered from the carbonyl carbon.',
  Arene:
    'The benzene ring is the parent structure. Number around the ring to give substituents the lowest possible locant set; simple alkyl-substituted benzenes are named as alkylbenzenes.',
  'Aromatic acid':
    'Benzoic acid is the parent. The ring carbon bearing the –COOH group is C1; number around the ring to give the other substituents the lowest possible locants.',
  Cycloalkanamine:
    'The ring is the parent and –NH₂ takes the suffix -amine. Give the carbon bearing –NH₂ the lowest locant, then number substituents around the ring; groups attached to nitrogen use N locants.',
  Cycloalkane:
    'The ring is the parent structure. Number around the ring to give substituents the lowest possible locant set.',
  Cycloalkene:
    'The ring supplies the parent name. Number through the C=C bond (C1–C2), then around the ring to give substituents the lowest locants.',
  Cycloalkanol:
    'The ring is the parent and –OH takes the suffix -ol. Give the carbon bearing –OH the lowest locant, then number substituents.',
  Cycloalkanone:
    'The ring is the parent and C=O takes the suffix -one. The carbonyl carbon is C1, then number substituents around the ring.',
};

export const CATEGORY_SHORT = {
  Alkane: 'alkane',
  Alkene: 'alkene',
  Alkyne: 'alkyne',
  Alcohol: 'alcohol',
  Aldehyde: 'aldehyde',
  Ketone: 'ketone',
  'Carboxylic acid': 'carboxylic acid',
  Ester: 'ester',
  Ether: 'ether',
  Amine: 'amine',
  Haloalkane: 'haloalkane',
  Multifunctional: 'multifunctional',
  Amide: 'amide',
  Nitrile: 'nitrile',
  Thiol: 'thiol',
  'Acid halide': 'acid halide',
  Arene: 'arene',
  'Aromatic acid': 'aromatic acid',
  Cycloalkanamine: 'cyclic amine',
  Cycloalkane: 'cycloalkane',
  Cycloalkene: 'cycloalkene',
  Cycloalkanol: 'cyclic alcohol',
  Cycloalkanone: 'cyclic ketone',
};

const RING_CATEGORIES = new Set([
  'Cycloalkane',
  'Cycloalkene',
  'Cycloalkanol',
  'Cycloalkanone',
  'Cycloalkanamine',
  'Arene',
  'Aromatic acid',
]);

const definitions = [
  // Straight and branched alkanes
  ['propane', 'CCC', 'Alkane'],
  ['butane', 'CCCC', 'Alkane'],
  ['2-methylpropane', 'CC(C)C', 'Alkane'],
  ['pentane', 'CCCCC', 'Alkane'],
  ['2-methylbutane', 'CC(C)CC', 'Alkane'],
  ['2,2-dimethylpropane', 'CC(C)(C)C', 'Alkane'],
  ['hexane', 'CCCCCC', 'Alkane'],
  ['2-methylpentane', 'CC(C)CCC', 'Alkane'],
  ['3-methylpentane', 'CCC(C)CC', 'Alkane'],
  ['2,2-dimethylbutane', 'CC(C)(C)CC', 'Alkane'],
  ['2,3-dimethylbutane', 'CC(C)C(C)C', 'Alkane'],
  ['heptane', 'CCCCCCC', 'Alkane'],
  ['2,4-dimethylpentane', 'CC(C)CC(C)C', 'Alkane'],
  ['3-ethylpentane', 'CCC(CC)CC', 'Alkane'],
  ['octane', 'CCCCCCCC', 'Alkane'],
  ['2,2,4-trimethylpentane', 'CC(C)CC(C)(C)C', 'Alkane'],
  ['nonane', 'CCCCCCCCC', 'Alkane'],
  ['2,3,4-trimethylpentane', 'CC(C)C(C)C(C)C', 'Alkane'],

  // Alkenes (terminal or symmetrically substituted to avoid E/Z ambiguity)
  ['ethene', 'C=C', 'Alkene'],
  ['prop-1-ene', 'C=CC', 'Alkene'],
  ['but-1-ene', 'C=CCC', 'Alkene'],
  ['2-methylprop-1-ene', 'C=C(C)C', 'Alkene'],
  ['pent-1-ene', 'C=CCCC', 'Alkene'],
  ['3-methylbut-1-ene', 'C=CC(C)C', 'Alkene'],
  ['2-methylbut-1-ene', 'C=C(C)CC', 'Alkene'],
  ['2-methylbut-2-ene', 'CC=C(C)C', 'Alkene'],
  ['hex-1-ene', 'C=CCCCC', 'Alkene'],
  ['2,3-dimethylbut-1-ene', 'C=C(C)C(C)C', 'Alkene'],
  ['3,3-dimethylbut-1-ene', 'C=CC(C)(C)C', 'Alkene'],
  ['2-ethylbut-1-ene', 'C=C(CC)CC', 'Alkene'],
  ['4-methylpent-1-ene', 'C=CCC(C)C', 'Alkene'],
  ['3-methylpent-1-ene', 'C=CC(C)CC', 'Alkene'],
  ['2,3-dimethylbut-2-ene', 'CC(C)=C(C)C', 'Alkene'],
  ['2-methylhex-1-ene', 'C=C(C)CCCC', 'Alkene'],

  // Alkynes
  ['ethyne', 'C#C', 'Alkyne'],
  ['prop-1-yne', 'C#CC', 'Alkyne'],
  ['but-1-yne', 'C#CCC', 'Alkyne'],
  ['but-2-yne', 'CC#CC', 'Alkyne'],
  ['pent-1-yne', 'C#CCCC', 'Alkyne'],
  ['3-methylbut-1-yne', 'C#CC(C)C', 'Alkyne'],
  ['hex-1-yne', 'C#CCCCC', 'Alkyne'],
  ['4-methylpent-1-yne', 'C#CCC(C)C', 'Alkyne'],
  ['hex-3-yne', 'CCC#CCC', 'Alkyne'],
  ['3,3-dimethylbut-1-yne', 'C#CC(C)(C)C', 'Alkyne'],

  // Alcohols
  ['methanol', 'CO', 'Alcohol'],
  ['ethanol', 'CCO', 'Alcohol'],
  ['propan-1-ol', 'CCCO', 'Alcohol'],
  ['propan-2-ol', 'CC(C)O', 'Alcohol'],
  ['butan-1-ol', 'CCCCO', 'Alcohol'],
  ['butan-2-ol', 'CCC(C)O', 'Alcohol'],
  ['2-methylpropan-1-ol', 'CC(C)CO', 'Alcohol'],
  ['2-methylpropan-2-ol', 'CC(C)(C)O', 'Alcohol'],
  ['pentan-1-ol', 'CCCCCO', 'Alcohol'],
  ['pentan-2-ol', 'CCCC(C)O', 'Alcohol'],
  ['pentan-3-ol', 'CCC(O)CC', 'Alcohol'],
  ['3-methylbutan-1-ol', 'CC(C)CCO', 'Alcohol'],
  ['2-methylbutan-1-ol', 'OCC(C)CC', 'Alcohol'],
  ['2-methylbutan-2-ol', 'CCC(C)(C)O', 'Alcohol'],
  ['3-methylbutan-2-ol', 'CC(O)C(C)C', 'Alcohol'],
  ['2,2-dimethylpropan-1-ol', 'CC(C)(C)CO', 'Alcohol'],
  ['hexan-1-ol', 'CCCCCCO', 'Alcohol'],
  ['hexan-2-ol', 'CCCCC(C)O', 'Alcohol'],
  ['hexan-3-ol', 'CCCC(O)CC', 'Alcohol'],
  ['4-methylpentan-2-ol', 'CC(O)CC(C)C', 'Alcohol'],

  // Aldehydes
  ['methanal', 'C=O', 'Aldehyde'],
  ['ethanal', 'CC=O', 'Aldehyde'],
  ['propanal', 'CCC=O', 'Aldehyde'],
  ['butanal', 'CCCC=O', 'Aldehyde'],
  ['2-methylpropanal', 'CC(C)C=O', 'Aldehyde'],
  ['pentanal', 'CCCCC=O', 'Aldehyde'],
  ['2-methylbutanal', 'CCC(C)C=O', 'Aldehyde'],
  ['3-methylbutanal', 'CC(C)CC=O', 'Aldehyde'],
  ['2,2-dimethylpropanal', 'CC(C)(C)C=O', 'Aldehyde'],
  ['hexanal', 'CCCCCC=O', 'Aldehyde'],
  ['2-ethylbutanal', 'CCC(CC)C=O', 'Aldehyde'],
  ['2-methylpentanal', 'CCCC(C)C=O', 'Aldehyde'],
  ['3-methylpentanal', 'CCC(C)CC=O', 'Aldehyde'],

  // Ketones
  ['propan-2-one', 'CC(C)=O', 'Ketone'],
  ['butan-2-one', 'CCC(C)=O', 'Ketone'],
  ['pentan-2-one', 'CCCC(C)=O', 'Ketone'],
  ['pentan-3-one', 'CCC(=O)CC', 'Ketone'],
  ['3-methylbutan-2-one', 'CC(=O)C(C)C', 'Ketone'],
  ['hexan-2-one', 'CCCCC(C)=O', 'Ketone'],
  ['hexan-3-one', 'CCCC(=O)CC', 'Ketone'],
  ['2-methylpentan-3-one', 'CC(C)C(=O)CC', 'Ketone'],
  ['4-methylpentan-2-one', 'CC(=O)CC(C)C', 'Ketone'],

  // Carboxylic acids
  ['methanoic acid', 'C(=O)O', 'Carboxylic acid'],
  ['ethanoic acid', 'CC(=O)O', 'Carboxylic acid'],
  ['propanoic acid', 'CCC(=O)O', 'Carboxylic acid'],
  ['butanoic acid', 'CCCC(=O)O', 'Carboxylic acid'],
  ['2-methylpropanoic acid', 'CC(C)C(=O)O', 'Carboxylic acid'],
  ['pentanoic acid', 'CCCCC(=O)O', 'Carboxylic acid'],
  ['2-methylbutanoic acid', 'CCC(C)C(=O)O', 'Carboxylic acid'],
  ['3-methylbutanoic acid', 'CC(C)CC(=O)O', 'Carboxylic acid'],
  ['2,2-dimethylpropanoic acid', 'CC(C)(C)C(=O)O', 'Carboxylic acid'],
  ['hexanoic acid', 'CCCCCC(=O)O', 'Carboxylic acid'],
  ['heptanoic acid', 'CCCCCCC(=O)O', 'Carboxylic acid'],
  ['octanoic acid', 'CCCCCCCC(=O)O', 'Carboxylic acid'],
  ['2-ethylbutanoic acid', 'CCC(CC)C(=O)O', 'Carboxylic acid'],
  ['3-methylpentanoic acid', 'CCC(C)CC(=O)O', 'Carboxylic acid'],

  // Esters
  ['methyl methanoate', 'COC=O', 'Ester'],
  ['methyl ethanoate', 'COC(C)=O', 'Ester'],
  ['ethyl ethanoate', 'CCOC(C)=O', 'Ester'],
  ['methyl propanoate', 'COC(=O)CC', 'Ester'],
  ['ethyl propanoate', 'CCOC(=O)CC', 'Ester'],
  ['propyl ethanoate', 'CCCOC(C)=O', 'Ester'],
  ['methyl butanoate', 'COC(=O)CCC', 'Ester'],
  ['butyl ethanoate', 'CCCCOC(C)=O', 'Ester'],
  ['ethyl methanoate', 'CCOC=O', 'Ester'],

  // Ethers
  ['methoxymethane', 'COC', 'Ether'],
  ['ethoxyethane', 'CCOCC', 'Ether'],
  ['1-methoxypropane', 'COCCC', 'Ether'],
  ['1-ethoxypropane', 'CCOCCC', 'Ether'],
  ['2-methoxypropane', 'COC(C)C', 'Ether'],
  ['1-methoxybutane', 'COCCCC', 'Ether'],
  ['1-ethoxybutane', 'CCOCCCC', 'Ether'],
  ['2-ethoxypropane', 'CCOC(C)C', 'Ether'],
  ['1-methoxy-2-methylpropane', 'COCC(C)C', 'Ether'],

  // Amines
  ['methanamine', 'CN', 'Amine'],
  ['ethanamine', 'CCN', 'Amine'],
  ['propan-1-amine', 'CCCN', 'Amine'],
  ['propan-2-amine', 'CC(C)N', 'Amine'],
  ['butan-1-amine', 'CCCCN', 'Amine'],
  ['butan-2-amine', 'CCC(C)N', 'Amine'],
  ['N-methylethanamine', 'CCNC', 'Amine'],
  ['N,N-dimethylethanamine', 'CCN(C)C', 'Amine'],
  ['N-ethylethanamine', 'CCNCC', 'Amine'],
  ['N-methylpropan-1-amine', 'CCCNC', 'Amine'],
  ['N,N-dimethylpropan-1-amine', 'CCCN(C)C', 'Amine'],
  ['N-methylpropan-2-amine', 'CC(C)NC', 'Amine'],
  ['N,N-dimethylpropan-2-amine', 'CC(C)N(C)C', 'Amine'],
  ['N-ethylpropan-1-amine', 'CCCNCC', 'Amine'],
  ['N-ethylpropan-2-amine', 'CC(C)NCC', 'Amine'],

  // Haloalkanes
  ['chloromethane', 'CCl', 'Haloalkane'],
  ['bromoethane', 'CCBr', 'Haloalkane'],
  ['1-chloropropane', 'CCCCl', 'Haloalkane'],
  ['2-chloropropane', 'CC(Cl)C', 'Haloalkane'],
  ['1-bromopropane', 'CCCBr', 'Haloalkane'],
  ['2-bromopropane', 'CC(Br)C', 'Haloalkane'],
  ['1-chlorobutane', 'CCCCCl', 'Haloalkane'],
  ['2-chlorobutane', 'CCC(Cl)C', 'Haloalkane'],
  ['1-bromo-2-methylpropane', 'CC(C)CBr', 'Haloalkane'],
  ['2-bromo-2-methylpropane', 'CC(C)(C)Br', 'Haloalkane'],
  ['1,2-dichloroethane', 'ClCCCl', 'Haloalkane'],
  ['1,1-dichloroethane', 'CC(Cl)Cl', 'Haloalkane'],
  ['1-bromo-3-methylbutane', 'CC(C)CCBr', 'Haloalkane'],
  ['2-bromobutane', 'CCC(Br)C', 'Haloalkane'],
  ['1-chloro-2-methylpropane', 'CC(C)CCl', 'Haloalkane'],
  ['2-chloro-3-methylpentane', 'CC(Cl)C(C)CC', 'Haloalkane'],
  ['3,4-dimethylhexane', 'CCC(C)C(C)CC', 'Alkane'],
  ['3-ethyl-2-methylpentane', 'CC(C)C(CC)CC', 'Alkane'],
  ['2-methylpropan-1-amine', 'CC(C)CN', 'Amine'],

  // Functional-group priority: one principal group, everything else a prefix
  [
    '2-chloroethan-1-ol',
    'ClCCO',
    'Multifunctional',
    '–OH outranks halogen, so the alcohol is the suffix and its carbon is C1. Chlorine becomes a chloro prefix at C2.',
  ],
  [
    '3-hydroxybutanal',
    'CC(O)CC=O',
    'Multifunctional',
    '–CHO outranks –OH, so the aldehyde is the suffix and the –CHO carbon is C1. The hydroxy group is at C3.',
  ],
  [
    '2-hydroxypropanoic acid',
    'CC(O)C(=O)O',
    'Multifunctional',
    '–COOH has the highest priority and is C1. The –OH is a hydroxy prefix at C2.',
  ],
  [
    '3-hydroxypropanoic acid',
    'OCCC(=O)O',
    'Multifunctional',
    '–COOH is C1 and stays the suffix. Number toward the hydroxy group so it receives the lower locant, C3.',
  ],
  [
    '2-hydroxybutanoic acid',
    'CCC(O)C(=O)O',
    'Multifunctional',
    'The carboxylic acid is the principal group and C1; the –OH is a hydroxy prefix at C2.',
  ],
  [
    '3-hydroxybutanoic acid',
    'CC(O)CC(=O)O',
    'Multifunctional',
    '–COOH outranks –OH. Number from the carboxyl carbon so the hydroxy group is at C3.',
  ],
  [
    '4-hydroxybutanoic acid',
    'OCCCC(=O)O',
    'Multifunctional',
    'The –COOH carbon is C1. The alcohol is named as a hydroxy prefix at C4.',
  ],
  [
    '2-aminopropanoic acid',
    'CC(N)C(=O)O',
    'Multifunctional',
    '–COOH outranks –NH₂; the amino group becomes an amino prefix at C2.',
  ],
  [
    '2-aminoethanoic acid',
    'NCC(=O)O',
    'Multifunctional',
    'The carboxylic acid is the suffix and C1. The amine is a lower-priority amino prefix at C2.',
  ],
  [
    '3-aminopropanoic acid',
    'NCCC(=O)O',
    'Multifunctional',
    '–COOH stays the suffix. Number from C1 so the amino group is at C3.',
  ],
  [
    '2-methoxyethan-1-ol',
    'COCCO',
    'Multifunctional',
    '–OH outranks the ether. The alcohol carbon is C1; the methoxy group is a prefix at C2.',
  ],
  [
    '2-ethoxyethan-1-ol',
    'CCOCCO',
    'Multifunctional',
    'The alcohol is the principal group and gets C1. The ether becomes an ethoxy prefix at C2.',
  ],
  [
    '2-chloropropan-1-ol',
    'CC(Cl)CO',
    'Multifunctional',
    '–OH is the suffix and C1. Number toward chlorine to give the lower locant, C2.',
  ],
  [
    '3-chloropropan-1-ol',
    'ClCCCO',
    'Multifunctional',
    'The alcohol carbon is C1; chlorine is a chloro prefix at C3.',
  ],
  [
    '1-chloropropan-2-ol',
    'CC(O)CCl',
    'Multifunctional',
    'Number to give –OH the lower locant (C2); chlorine is then at C1.',
  ],
  [
    '2-bromopropan-1-ol',
    'CC(Br)CO',
    'Multifunctional',
    '–OH outranks bromine. The alcohol carbon is C1 and bromine is at C2.',
  ],
  [
    '2,3-dibromopropan-1-ol',
    'BrCC(Br)CO',
    'Multifunctional',
    'The –OH carbon is C1. Number toward the bromines to give 2,3-dibromopropan-1-ol.',
  ],
  [
    '1-bromobutan-2-ol',
    'CCC(O)CBr',
    'Multifunctional',
    'Number the chain to give –OH the lower locant (C2), then bromine falls at C1.',
  ],
  [
    '4-chlorobutan-1-ol',
    'ClCCCCO',
    'Multifunctional',
    'The alcohol is C1; numbering along the chain puts chlorine at C4.',
  ],
  [
    '2-chlorobutanoic acid',
    'CCC(Cl)C(=O)O',
    'Multifunctional',
    '–COOH is the principal group and C1; chlorine is a chloro prefix at C2.',
  ],
  [
    '3-oxobutanal',
    'CC(=O)CC=O',
    'Multifunctional',
    'The aldehyde outranks the ketone and is C1. The ketone becomes an oxo prefix at C3.',
  ],
  [
    '2-oxopropanoic acid',
    'CC(=O)C(=O)O',
    'Multifunctional',
    '–COOH outranks the ketone and is C1; the ketone is an oxo prefix at C2.',
  ],
  [
    '4-oxopentanoic acid',
    'CC(=O)CCC(=O)O',
    'Multifunctional',
    'The carboxylic acid is C1 and the principal group. The ketone becomes an oxo prefix at C4.',
  ],
  [
    'but-2-en-1-ol',
    'CC=CCO',
    'Multifunctional',
    '–OH outranks C=C. Number from the alcohol carbon so the double bond is at C2 (stereochemistry not specified).',
  ],
  [
    'but-3-en-2-ol',
    'CC(O)C=C',
    'Multifunctional',
    'The alcohol is the suffix and C2; the C=C begins at C3, giving but-3-en-2-ol.',
  ],
  [
    'pent-4-en-1-ol',
    'OCCCC=C',
    'Multifunctional',
    '–OH is C1 and the double bond is at C4, giving pent-4-en-1-ol.',
  ],
  [
    'ethane-1,2-diol',
    'OCCO',
    'Multifunctional',
    'The parent has two –OH groups, so the suffix is -diol and both carbons need locants: ethane-1,2-diol.',
  ],
  [
    '3-hydroxy-2-methylbutanal',
    'O=CC(C)C(O)C',
    'Multifunctional',
    '–CHO is C1 and the highest-priority group. Number the butanal chain so the hydroxy group is at C3 and the methyl at C2.',
  ],

  // Amides, nitriles, thiols and acid halides from the priority table
  ['ethanamide', 'CC(=O)N', 'Amide'],
  ['propanamide', 'CCC(=O)N', 'Amide'],
  ['N-methylethanamide', 'CC(=O)NC', 'Amide'],
  ['N,N-dimethylmethanamide', 'C(=O)N(C)C', 'Amide'],
  ['ethanenitrile', 'CC#N', 'Nitrile'],
  ['propanenitrile', 'CCC#N', 'Nitrile'],
  ['butanenitrile', 'CCCC#N', 'Nitrile'],
  ['methanethiol', 'CS', 'Thiol'],
  ['ethanethiol', 'CCS', 'Thiol'],
  ['propane-1-thiol', 'CCCS', 'Thiol'],
  ['ethanoyl chloride', 'CC(=O)Cl', 'Acid halide'],
  ['propanoyl chloride', 'CCC(=O)Cl', 'Acid halide'],

  // Aromatic rings (Kekulé representations)
  ['benzene', 'C1=CC=CC=C1', 'Arene'],
  ['methylbenzene', 'CC1=CC=CC=C1', 'Arene'],
  ['ethylbenzene', 'CCC1=CC=CC=C1', 'Arene'],
  ['benzoic acid', 'O=C(O)C1=CC=CC=C1', 'Aromatic acid'],
  ['3-chloro-4-methylbenzoic acid', 'O=C(O)C1=CC(Cl)=C(C)C=C1', 'Aromatic acid'],

  // Rings
  ['cyclopropane', 'C1CC1', 'Cycloalkane'],
  ['cyclobutane', 'C1CCC1', 'Cycloalkane'],
  ['cyclopentane', 'C1CCCC1', 'Cycloalkane'],
  ['cyclohexane', 'C1CCCCC1', 'Cycloalkane'],
  ['cycloheptane', 'C1CCCCCC1', 'Cycloalkane'],
  ['cyclooctane', 'C1CCCCCCC1', 'Cycloalkane'],
  ['methylcyclopropane', 'CC1CC1', 'Cycloalkane'],
  ['methylcyclobutane', 'CC1CCC1', 'Cycloalkane'],
  ['methylcyclopentane', 'CC1CCCC1', 'Cycloalkane'],
  ['methylcyclohexane', 'CC1CCCCC1', 'Cycloalkane'],
  ['ethylcyclopentane', 'CCC1CCCC1', 'Cycloalkane'],
  ['1,1-dimethylcyclopropane', 'CC1(C)CC1', 'Cycloalkane'],
  ['1,1-dimethylcyclobutane', 'CC1(C)CCC1', 'Cycloalkane'],
  ['1,1-dimethylcyclopentane', 'CC1(C)CCCC1', 'Cycloalkane'],
  ['propylcyclopentane', 'CCCC1CCCC1', 'Cycloalkane'],
  ['butylcyclopentane', 'CCCCC1CCCC1', 'Cycloalkane'],
  ['1-ethyl-1-methylcyclopentane', 'CCC1(C)CCCC1', 'Cycloalkane'],

  ['cyclopropene', 'C1=CC1', 'Cycloalkene'],
  ['cyclobutene', 'C1=CCC1', 'Cycloalkene'],
  ['cyclopentene', 'C1=CCCC1', 'Cycloalkene'],
  ['cyclohexene', 'C1=CCCCC1', 'Cycloalkene'],
  ['1-methylcyclopentene', 'CC1=CCCC1', 'Cycloalkene'],
  ['1-methylcyclohexene', 'CC1=CCCCC1', 'Cycloalkene'],
  ['3-methylcyclopent-1-ene', 'CC1C=CCC1', 'Cycloalkene'],

  ['cyclopropanol', 'OC1CC1', 'Cycloalkanol'],
  ['cyclobutanol', 'OC1CCC1', 'Cycloalkanol'],
  ['cyclopentanol', 'OC1CCCC1', 'Cycloalkanol'],
  ['cyclohexanol', 'OC1CCCCC1', 'Cycloalkanol'],
  ['1-methylcyclopentanol', 'CC1(O)CCCC1', 'Cycloalkanol'],
  ['1-methylcyclohexanol', 'CC1(O)CCCCC1', 'Cycloalkanol'],

  ['cyclopentanone', 'O=C1CCCC1', 'Cycloalkanone'],
  ['cyclohexanone', 'O=C1CCCCC1', 'Cycloalkanone'],

  // More crowded substituent patterns: mixed halogens, branched haloalkanes
  ['1-bromo-2-chloroethane', 'BrCCCl', 'Haloalkane'],
  ['1-bromo-2-chloropropane', 'CC(Cl)CBr', 'Haloalkane'],
  ['1-bromo-3-chloropropane', 'BrCCCCl', 'Haloalkane'],
  ['1,2-dibromopropane', 'CC(Br)CBr', 'Haloalkane'],
  ['1,3-dibromopropane', 'BrCCCBr', 'Haloalkane'],
  ['1,1,2-trichloroethane', 'ClCC(Cl)Cl', 'Haloalkane'],
  ['2,2-dichloropropane', 'CC(Cl)(Cl)C', 'Haloalkane'],
  ['1,2-dichloropropane', 'CC(Cl)CCl', 'Haloalkane'],
  ['1,3-dichloropropane', 'ClCCCCl', 'Haloalkane'],
  ['1-chloro-2-methylbutane', 'ClCC(C)CC', 'Haloalkane'],
  ['2-chloro-2-methylbutane', 'CCC(C)(C)Cl', 'Haloalkane'],
  ['1-bromo-2,2-dimethylpropane', 'CC(C)(C)CBr', 'Haloalkane'],
  ['1-chloro-2,2-dimethylpropane', 'CC(C)(C)CCl', 'Haloalkane'],
  ['1-chloro-3-methylpentane', 'CCC(C)CCCl', 'Haloalkane'],
  ['1-bromo-3,3-dimethylbutane', 'CC(C)(C)CCBr', 'Haloalkane'],
  ['1-bromo-2-chloro-2-methylpropane', 'CC(C)(Cl)CBr', 'Haloalkane'],
  ['2-bromo-1-chloro-2-methylpropane', 'CC(C)(Br)CCl', 'Haloalkane'],
  ['1,2-dibromo-2-methylpropane', 'CC(C)(Br)CBr', 'Haloalkane'],
  ['1,2-dibromo-3-chloropropane', 'BrCC(Br)CCl', 'Haloalkane'],
  ['2-bromo-1,1-dichloroethane', 'ClC(Cl)CBr', 'Haloalkane'],
  ['1-bromo-2-chlorobenzene', 'BrC1=CC=CC=C1Cl', 'Arene'],
  ['1-bromo-3-chlorobenzene', 'BrC1=CC(Cl)=CC=C1', 'Arene'],
  ['1-bromo-4-chlorobenzene', 'BrC1=CC=C(Cl)C=C1', 'Arene'],

  // Nitrogen plus halogen in the same small skeleton
  ['1-chloropropan-2-amine', 'CC(N)CCl', 'Amine'],
  ['2-chloropropan-1-amine', 'CC(Cl)CN', 'Amine'],
  ['3-chloropropan-1-amine', 'ClCCCN', 'Amine'],
  ['1-bromopropan-2-amine', 'CC(N)CBr', 'Amine'],
  ['2-bromopropan-1-amine', 'CC(Br)CN', 'Amine'],
  ['1-bromo-2-methylpropan-2-amine', 'CC(C)(N)CBr', 'Amine'],
  ['1-chloro-2-methylpropan-2-amine', 'CC(C)(N)CCl', 'Amine'],
  ['1,3-dichloropropan-2-amine', 'ClCC(N)CCl', 'Amine'],
  [
    '2-amino-3-chloropropanoic acid',
    'NC(CCl)C(=O)O',
    'Multifunctional',
    '–COOH is the highest-priority group and is C1. The amino group is at C2 and chlorine is at C3.',
  ],
  [
    '2-amino-2-chloropropanoic acid',
    'CC(N)(Cl)C(=O)O',
    'Multifunctional',
    '–COOH is C1. Both the amino and chloro prefixes are at C2; alphabetize amino before chloro.',
  ],
  [
    '3-amino-2-chloropropanoic acid',
    'NCC(Cl)C(=O)O',
    'Multifunctional',
    '–COOH is C1, chloro is C2, and amino is C3; amino alphabetizes before chloro.',
  ],
  [
    '2,3-diaminopropanoic acid',
    'NC(CN)C(=O)O',
    'Multifunctional',
    '–COOH is C1 and the two amino prefixes sit at C2 and C3, giving 2,3-diaminopropanoic acid.',
  ],

  // Amides, nitriles and ethers with halogen substituents
  ['2-chloroethanamide', 'ClCC(=O)N', 'Amide'],
  ['3-chloropropanamide', 'ClCCC(=O)N', 'Amide'],
  ['2-chloro-N-methylethanamide', 'ClCC(=O)NC', 'Amide'],
  ['2-chloroethanenitrile', 'ClCC#N', 'Nitrile'],
  ['3-chloropropanenitrile', 'ClCCC#N', 'Nitrile'],
  ['1-chloro-2-methoxyethane', 'COCCCl', 'Ether'],
  ['1-bromo-2-ethoxyethane', 'CCOCCBr', 'Ether'],

  // Ring parents carrying N and/or halogen
  ['1-bromo-1-chlorocyclopropane', 'BrC1(Cl)CC1', 'Cycloalkane'],
  ['1-chloro-1-methylcyclopropane', 'CC1(Cl)CC1', 'Cycloalkane'],
  ['cyclopropanamine', 'NC1CC1', 'Cycloalkanamine'],
  ['cyclobutanamine', 'NC1CCC1', 'Cycloalkanamine'],
  ['1-methylcyclopropan-1-amine', 'CC1(N)CC1', 'Cycloalkanamine'],
  ['1-chlorocyclopropan-1-amine', 'NC1(Cl)CC1', 'Cycloalkanamine'],
  ['N-methylcyclopropanamine', 'CNC1CC1', 'Cycloalkanamine'],
  ['N,N-dimethylcyclopropanamine', 'CN(C)C1CC1', 'Cycloalkanamine'],
];

function slug(value) {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const MOLECULES = definitions.map(([name, smiles, category, customRule], index) => ({
  id: `${index + 1}-${slug(name)}`,
  name,
  smiles,
  category,
  family: RING_CATEGORIES.has(category) ? 'ring' : 'chain',
  rule: customRule || CATEGORY_RULES[category],
}));

export const CATEGORIES = [...new Set(MOLECULES.map((molecule) => molecule.category))];
