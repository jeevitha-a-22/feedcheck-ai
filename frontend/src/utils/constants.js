/**
 * Agricultural Constants & Schema Fixtures
 * Structured for backend-configurable AI crop classes.
 */

export const FEED_TYPES = [
  {
    id: 'corn_silage',
    name: 'Corn Silage',
    category: 'Whole-Crop Forage',
    idealMoisture: '62% - 68%',
    idealPH: '3.8 - 4.2',
    icon: '🌽',
    image: '/assets/corn_silage.jpg',
    description: 'Whole-plant chopped corn, high energy forage for dairy & beef cattle.',
    supportedByAI: true
  },
  {
    id: 'grass_silage',
    name: 'Grass Silage',
    category: 'Perennial Grass',
    idealMoisture: '65% - 72%',
    idealPH: '4.2 - 4.8',
    icon: '🌾',
    image: '/assets/grass_silage.jpg',
    description: 'Fermented pasture grasses (Ryegrass, Fescue, Orchardgrass).',
    supportedByAI: true
  },
  {
    id: 'alfalfa_haylage',
    name: 'Alfalfa Haylage',
    category: 'Legume Forage',
    idealMoisture: '55% - 65%',
    idealPH: '4.5 - 5.0',
    icon: '🌿',
    image: '/assets/alfalfa_haylage.jpg',
    description: 'High protein legume forage harvested at mid-bud to early bloom.',
    supportedByAI: true
  },
  {
    id: 'tmr_mix',
    name: 'TMR (Total Mixed Ration)',
    category: 'Blended Diet',
    idealMoisture: '45% - 55%',
    idealPH: '4.2 - 4.8',
    icon: '🥣',
    image: '/assets/tmr_mix.jpg',
    description: 'Complete balanced blend of forages, grains, protein meals, and minerals.',
    supportedByAI: true
  },
  {
    id: 'sorghum_silage',
    name: 'Sorghum Silage',
    category: 'Warm-season Crop',
    idealMoisture: '65% - 70%',
    idealPH: '3.9 - 4.3',
    icon: '🌱',
    image: '/assets/sorghum_silage.jpg',
    description: 'Drought-tolerant silage substitute for corn with high fiber digestion.',
    supportedByAI: true
  }
];

export const STORAGE_TYPES = [
  'Bunker Silo',
  'Drive-over Silage Pile',
  'Ag-Bag / Silo Tube',
  'Wrapped Round Bales',
  'Concrete Stave / Tower Silo'
];

export const ODOR_PROFILES = [
  { value: 'pleasant_acidic', label: 'Pleasant & Acidic (Clean Lactic Acid)' },
  { value: 'sweet_fruity', label: 'Sweet & Fruity (Alcohol / Yeast)' },
  { value: 'sharp_vinegar', label: 'Sharp Vinegar (High Acetic Acid)' },
  { value: 'rancid_butter', label: 'Rancid / Vomit (Butyric Acid - High Risk)' },
  { value: 'musty_moldy', label: 'Musty / Earthy (Mold & Spoilage)' },
  { value: 'burnt_caramel', label: 'Burnt / Tobacco / Caramel (Heat Damage)' }
];

export const COLOR_PROFILES = [
  { value: 'olive_green', label: 'Olive Green / Light Yellow (Optimal)' },
  { value: 'yellowish_brown', label: 'Yellowish-Brown (Moderate Fermentation)' },
  { value: 'dark_brown', label: 'Dark Brown (High Heat / Aerobic Spoilage)' },
  { value: 'blackish', label: 'Blackish / Slimy (Severe Spoilage / Clostridial)' },
  { value: 'white_patches', label: 'Visible White/Blue Mold Patches' }
];

export const INITIAL_MOCK_HISTORY = [
  {
    id: 'test-2026-001',
    quality: 'good',
    confidence: 0.96,
    score: 92,
    risk_level: 'low',
    feed_type: 'Corn Silage',
    feed_type_id: 'corn_silage',
    batch_id: 'BUNKER-A-2026',
    farm_location: 'North Valley Dairy - Bunker 2',
    image_url: '/assets/corn_silage.jpg',
    timestamp: '2026-09-08T09:30:00Z',
    metrics: {
      moisture: { value: 64.5, unit: '%', status: 'within_range', range: '60 - 70%', source: 'field_input' },
      pH: { value: 3.9, unit: 'pH', status: 'within_range', range: '3.8 - 4.3', source: 'field_input' },
      temperature: { value: 22.4, unit: '°C', status: 'within_range', range: '< 28°C', source: 'field_input' }
    },
    visual_indicators: [
      'FBSI Score 0: Bare/slick bunk with approximately 0% feed remaining (Model Confidence: 96.0%)',
      'Bunk surface appears to have minimal visible feed residue.',
      'Visual pattern is consistent with a low residual feed level.'
    ],
    advisory: 'Prototype screening indicates measurements within configured baseline ranges. Continue routine bunk management and monitor storage conditions.',
    evidence: [
      'Field pH reading (3.90) is within the configured screening range (3.8 - 4.3).',
      'Moisture reading (64.5%) is within the configured screening range (60 - 70%).',
      'Core temperature (22.4°C) is within the configured baseline (< 28°C).'
    ]
  },
  {
    id: 'test-2026-002',
    quality: 'moderate',
    confidence: 0.87,
    score: 78,
    risk_level: 'medium',
    feed_type: 'Alfalfa Haylage',
    feed_type_id: 'alfalfa_haylage',
    batch_id: 'BAG-EAST-04',
    farm_location: 'Green Hills Farm - AgBag East',
    image_url: '/assets/alfalfa_haylage.jpg',
    timestamp: '2026-09-07T14:15:00Z',
    metrics: {
      moisture: { value: 58.2, unit: '%', status: 'within_range', range: '60 - 70%', source: 'field_input' },
      pH: { value: 4.5, unit: 'pH', status: 'warning', range: '3.8 - 4.3', source: 'field_input' },
      temperature: { value: 33.1, unit: '°C', status: 'warning', range: '< 28°C', source: 'field_input' }
    },
    visual_indicators: [
      'FBSI Score 2: Approximately 25% to 50% feed remaining with visible crowns/piles (Model Confidence: 87.0%)',
      'Moderate residual feed volume is visible across the bunk.',
      'Uneven feed accumulation is visible in parts of the bunk.'
    ],
    advisory: 'Prototype screening indicates mild measurement variability or elevated bunk residuals. Inspect bunker face for localized warming and monitor herd intake patterns.',
    evidence: [
      'Field pH reading (4.50) is above the configured screening range (3.8 - 4.3).',
      'Moisture reading (58.2%) is slightly outside the configured screening range (60 - 70%).',
      'Core temperature (33.1°C) is above the configured baseline (< 28°C). Continued monitoring is recommended.'
    ]
  },
  {
    id: 'test-2026-003',
    quality: 'poor',
    confidence: 0.91,
    score: 54,
    risk_level: 'high',
    feed_type: 'Grass Silage (Wrapped)',
    feed_type_id: 'grass_silage',
    batch_id: 'BALES-LOT-09',
    farm_location: 'Sunny Acre Pastures - Field 4',
    image_url: '/assets/grass_silage.jpg',
    timestamp: '2026-09-05T11:40:00Z',
    metrics: {
      moisture: { value: 74.8, unit: '%', status: 'danger', range: '60 - 70%', source: 'field_input' },
      pH: { value: 4.9, unit: 'pH', status: 'danger', range: '3.8 - 4.3', source: 'field_input' },
      temperature: { value: 38.6, unit: '°C', status: 'danger', range: '< 28°C', source: 'field_input' }
    },
    visual_indicators: [
      'FBSI Score 4: Feed appears largely untouched (Model Confidence: 91.0%)',
      'A large amount of feed appears to remain in the bunk.',
      'Visual pattern is consistent with a high residual feed level.'
    ],
    advisory: 'Prototype screening flags one or more measurements outside configured target ranges. Further physical inspection or laboratory assessment is recommended.',
    evidence: [
      'Field pH reading (4.90) is outside the configured screening range. Further physical or laboratory assessment may be appropriate.',
      'Moisture reading (74.8%) is outside the configured screening range. This is a potential storage-condition risk indicator.',
      'Core temperature (38.6°C) is elevated relative to the configured baseline. Further assessment may be appropriate.'
    ]
  }
];

export const FARMER_TIPS = [
  {
    id: 1,
    title: 'Optimal Silo Packing Density',
    category: 'Preservation',
    tip: 'Pack bunker silage to at least 240 kg DM/m³ (15 lbs DM/ft³) to minimize trapped oxygen and prevent mold.'
  },
  {
    id: 2,
    title: 'Moisture Target for Corn Silage',
    category: 'Harvest Window',
    tip: 'Harvest when whole-plant dry matter is between 32% and 38% (62% - 68% moisture) for peak starch digestibility.'
  },
  {
    id: 3,
    title: 'Bunker Face Management',
    category: 'Feeding',
    tip: 'Maintain a minimum face removal rate of 15 to 30 cm (6-12 inches) daily to prevent aerobic deterioration.'
  }
];
