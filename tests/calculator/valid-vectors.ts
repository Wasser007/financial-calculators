import type {
  CalculatorInputs,
  CalculatorSummary,
} from '../../lib/calculator/index.js';

type DisplaySummary = Record<keyof CalculatorSummary, string>;

export interface ValidVector {
  id: string;
  inputs: CalculatorInputs;
  expectedRaw: CalculatorSummary;
  expectedDisplay: DisplaySummary;
  ledgerSha256: string;
  annualSha256: string;
}

export const validVectors: readonly ValidVector[] = [
  {
    id: 'V01',
    inputs: { currency:'USD', initialPrincipal:10000, contributionAmount:500, contributionFrequency:'monthly', contributionTiming:'end', durationMonths:120, nominalAnnualRate:0.07, compoundingFrequency:'monthly', nominalAnnualFeeRate:0, inflationRate:0.03 },
    expectedRaw: { finalBalance:106639.01748372454, totalContributions:60000, grossGrowth:36639.017483724514, totalFees:0, nominalInvestmentGain:36639.017483724514, inflationAdjustedFinalBalance:79349.4440002049 },
    expectedDisplay: { finalBalance:'106,639.02', totalContributions:'60,000.00', grossGrowth:'36,639.02', totalFees:'0.00', nominalInvestmentGain:'36,639.02', inflationAdjustedFinalBalance:'79,349.44' },
    ledgerSha256: '2df0a8ce3999b67f9de9d4b185700dcbb61d99a366e5a7df4c083a11ae5f53fd',
    annualSha256: 'a7f58b90259128c599fe2fcf8392db1f557ae7be0b7f3bc52a7d83a1de194219',
  },
  {
    id: 'V02',
    inputs: { currency:'EUR', initialPrincipal:1000, contributionAmount:100, contributionFrequency:'annually', contributionTiming:'end', durationMonths:24, nominalAnnualRate:0.10, compoundingFrequency:'annually', nominalAnnualFeeRate:0, inflationRate:0 },
    expectedRaw: { finalBalance:1420.0000000000005, totalContributions:200, grossGrowth:220.00000000000065, totalFees:0, nominalInvestmentGain:220.00000000000065, inflationAdjustedFinalBalance:1420.0000000000005 },
    expectedDisplay: { finalBalance:'1,420.00', totalContributions:'200.00', grossGrowth:'220.00', totalFees:'0.00', nominalInvestmentGain:'220.00', inflationAdjustedFinalBalance:'1,420.00' },
    ledgerSha256: '0b75848bcea083eae425c3b871a3d1591bdf15cde8880ab3fe4d895751dcea19',
    annualSha256: 'fea77c2a696207de8cd1ca52eedfb736c990c927e2c193fc8f406ecdae055bfa',
  },
  {
    id: 'V03',
    inputs: { currency:'GBP', initialPrincipal:2500, contributionAmount:200, contributionFrequency:'monthly', contributionTiming:'beginning', durationMonths:18, nominalAnnualRate:0.0525, compoundingFrequency:'daily', nominalAnnualFeeRate:0.006, inflationRate:0.021 },
    expectedRaw: { finalBalance:6416.312562394381, totalContributions:3600, grossGrowth:357.2313064350937, totalFees:40.918744040715765, nominalInvestmentGain:316.31256239437795, inflationAdjustedFinalBalance:6219.377222185905 },
    expectedDisplay: { finalBalance:'6,416.31', totalContributions:'3,600.00', grossGrowth:'357.23', totalFees:'40.92', nominalInvestmentGain:'316.31', inflationAdjustedFinalBalance:'6,219.38' },
    ledgerSha256: 'e1b6c3bda057c5ddb1d74ea07f00d327d6edc966e3d8aab275f822b9749b54f3',
    annualSha256: 'd0521acd43ca84f3ad2a167814258f7a93f7cd56c7bd082da61501bcf50814f8',
  },
  {
    id: 'V04',
    inputs: { currency:'CAD', initialPrincipal:12000, contributionAmount:1500, contributionFrequency:'quarterly', contributionTiming:'beginning', durationMonths:27, nominalAnnualRate:0.08, compoundingFrequency:'quarterly', nominalAnnualFeeRate:0.01, inflationRate:0.025 },
    expectedRaw: { finalBalance:28756.45948180777, totalContributions:13500, grossGrowth:3728.7547419757616, totalFees:472.2952601679935, nominalInvestmentGain:3256.459481807768, inflationAdjustedFinalBalance:27202.36835283648 },
    expectedDisplay: { finalBalance:'28,756.46', totalContributions:'13,500.00', grossGrowth:'3,728.75', totalFees:'472.30', nominalInvestmentGain:'3,256.46', inflationAdjustedFinalBalance:'27,202.37' },
    ledgerSha256: 'c5a21051928e8370948085df5e0b71fedd139762f4ae112d211afb0bc728920a',
    annualSha256: 'd409e0b8cea351e6d252d3cde2bd12c9497416d6e609ca242ab408bec202645e',
  },
  {
    id: 'V05',
    inputs: { currency:'AUD', initialPrincipal:50000, contributionAmount:3000, contributionFrequency:'quarterly', contributionTiming:'end', durationMonths:36, nominalAnnualRate:0.065, compoundingFrequency:'semi-annually', nominalAnnualFeeRate:0.0125, inflationRate:0.0325 },
    expectedRaw: { finalBalance:97024.28324938507, totalContributions:36000, grossGrowth:13710.726379620519, totalFees:2686.443130235431, nominalInvestmentGain:11024.283249385087, inflationAdjustedFinalBalance:88147.55330262339 },
    expectedDisplay: { finalBalance:'97,024.28', totalContributions:'36,000.00', grossGrowth:'13,710.73', totalFees:'2,686.44', nominalInvestmentGain:'11,024.28', inflationAdjustedFinalBalance:'88,147.55' },
    ledgerSha256: 'f3dd4b74684ed7593db950a3d23aa95965e5210976834b6f85a07d7c4472731a',
    annualSha256: '7e4aa7cf4cc924874bb5e67a993add3e768b28ad36ae79bb8cd30ba622a9adf3',
  },
  {
    id: 'V06',
    inputs: { currency:'USD', initialPrincipal:10000, contributionAmount:250, contributionFrequency:'monthly', contributionTiming:'end', durationMonths:24, nominalAnnualRate:-0.12, compoundingFrequency:'annually', nominalAnnualFeeRate:0.02, inflationRate:0.03 },
    expectedRaw: { finalBalance:12666.408048950618, totalContributions:6000, grossGrowth:-2884.6737808201046, totalFees:448.91817022927785, nominalInvestmentGain:-3333.5919510493823, inflationAdjustedFinalBalance:11939.304410359711 },
    expectedDisplay: { finalBalance:'12,666.41', totalContributions:'6,000.00', grossGrowth:'-2,884.67', totalFees:'448.92', nominalInvestmentGain:'-3,333.59', inflationAdjustedFinalBalance:'11,939.30' },
    ledgerSha256: 'c5221000a01f477c8f6a40bb145a2c690d7382462d51d203206092b71a26803d',
    annualSha256: 'f61106936f13f738b62d13f274728a15877aef7fe3d396da6f746bb166bf7ec1',
  },
  {
    id: 'V07',
    inputs: { currency:'EUR', initialPrincipal:7500, contributionAmount:0, contributionFrequency:'monthly', contributionTiming:'end', durationMonths:30, nominalAnnualRate:0.09, compoundingFrequency:'monthly', nominalAnnualFeeRate:0.025, inflationRate:0 },
    expectedRaw: { finalBalance:8815.38306523069, totalContributions:0, grossGrowth:1826.5685765980536, totalFees:511.18551136736755, nominalInvestmentGain:1315.383065230686, inflationAdjustedFinalBalance:8815.38306523069 },
    expectedDisplay: { finalBalance:'8,815.38', totalContributions:'0.00', grossGrowth:'1,826.57', totalFees:'511.19', nominalInvestmentGain:'1,315.38', inflationAdjustedFinalBalance:'8,815.38' },
    ledgerSha256: 'db10364389cc8e3155fa326797c9de5e4c98249fd92fe9c0e87c583f2436feb2',
    annualSha256: 'b0c7a41c53e6696115ba747c9ef187457c4170b4a790cae870203166980cd51c',
  },
  {
    id: 'V08',
    inputs: { currency:'GBP', initialPrincipal:1000, contributionAmount:1200, contributionFrequency:'annually', contributionTiming:'end', durationMonths:11, nominalAnnualRate:0.06, compoundingFrequency:'daily', nominalAnnualFeeRate:0, inflationRate:0 },
    expectedRaw: { finalBalance:1056.5358390671306, totalContributions:0, grossGrowth:56.53583906713061, totalFees:0, nominalInvestmentGain:56.53583906713061, inflationAdjustedFinalBalance:1056.5358390671306 },
    expectedDisplay: { finalBalance:'1,056.54', totalContributions:'0.00', grossGrowth:'56.54', totalFees:'0.00', nominalInvestmentGain:'56.54', inflationAdjustedFinalBalance:'1,056.54' },
    ledgerSha256: 'c043e80479b1d0775c41e267a0bfd38925151d789eaa03815bab5dd93eab14b4',
    annualSha256: '64f298df2377d99fa8bc44d741cfed94c0def918df2a80dc5a2fdb602badfcdb',
  },
  {
    id: 'V09',
    inputs: { currency:'CAD', initialPrincipal:0, contributionAmount:5000, contributionFrequency:'annually', contributionTiming:'beginning', durationMonths:25, nominalAnnualRate:0.04, compoundingFrequency:'monthly', nominalAnnualFeeRate:0.005, inflationRate:0.02 },
    expectedRaw: { finalBalance:15584.8672275017, totalContributions:15000, grossGrowth:668.7381353044682, totalFees:83.87090780276681, nominalInvestmentGain:584.8672275017013, inflationAdjustedFinalBalance:14954.988459503482 },
    expectedDisplay: { finalBalance:'15,584.87', totalContributions:'15,000.00', grossGrowth:'668.74', totalFees:'83.87', nominalInvestmentGain:'584.87', inflationAdjustedFinalBalance:'14,954.99' },
    ledgerSha256: 'b2d3c89163b4a991fd4aaa064c4f88dbd72ca5bef425a0907b0b045267e84fa3',
    annualSha256: 'aa224d06bbf99230101b8bef2d7194e2ea33ad3782df690d653f5dd5502ce721',
  },
  {
    id: 'V10',
    inputs: { currency:'USD', initialPrincipal:10000, contributionAmount:0, contributionFrequency:'monthly', contributionTiming:'end', durationMonths:12, nominalAnnualRate:0, compoundingFrequency:'annually', nominalAnnualFeeRate:0, inflationRate:0.10 },
    expectedRaw: { finalBalance:10000, totalContributions:0, grossGrowth:0, totalFees:0, nominalInvestmentGain:0, inflationAdjustedFinalBalance:9090.90909090909 },
    expectedDisplay: { finalBalance:'10,000.00', totalContributions:'0.00', grossGrowth:'0.00', totalFees:'0.00', nominalInvestmentGain:'0.00', inflationAdjustedFinalBalance:'9,090.91' },
    ledgerSha256: 'e88d8cac19672722746e7c1963fc5da9e8875b861d4a537d33883f48585b1963',
    annualSha256: 'f6ad02c49ec4cb415534548714068813bfd74fd4ace7324b71892047a567b54f',
  },
  {
    id: 'V11',
    inputs: { currency:'AUD', initialPrincipal:100, contributionAmount:10, contributionFrequency:'quarterly', contributionTiming:'beginning', durationMonths:1, nominalAnnualRate:2.0, compoundingFrequency:'quarterly', nominalAnnualFeeRate:0.2, inflationRate:0.5 },
    expectedRaw: { finalBalance:123.81992390285207, totalContributions:10, grossGrowth:15.918566680866507, totalFees:2.0986427780144417, nominalInvestmentGain:13.819923902852064, inflationAdjustedFinalBalance:119.70609431425146 },
    expectedDisplay: { finalBalance:'123.82', totalContributions:'10.00', grossGrowth:'15.92', totalFees:'2.10', nominalInvestmentGain:'13.82', inflationAdjustedFinalBalance:'119.71' },
    ledgerSha256: '5c2bc1c758181ef48a587f092fa0acbea720cfbfd73dadd67b2e2dcc495df73d',
    annualSha256: 'eb0ee7f06e3bf88b75457d2423c49aae35a714c95b99b2adef26c9ccef54ca1e',
  },
  {
    id: 'V12',
    inputs: { currency:'USD', initialPrincipal:1, contributionAmount:999, contributionFrequency:'annually', contributionTiming:'end', durationMonths:1, nominalAnnualRate:0, compoundingFrequency:'annually', nominalAnnualFeeRate:0, inflationRate:0 },
    expectedRaw: { finalBalance:1, totalContributions:0, grossGrowth:0, totalFees:0, nominalInvestmentGain:0, inflationAdjustedFinalBalance:1 },
    expectedDisplay: { finalBalance:'1.00', totalContributions:'0.00', grossGrowth:'0.00', totalFees:'0.00', nominalInvestmentGain:'0.00', inflationAdjustedFinalBalance:'1.00' },
    ledgerSha256: 'dac1c8b9044a86dc5819ec42a1c714cccc8dd12a770cbb4b1b1eb605ac0e9cd8',
    annualSha256: '838072451c4da73baab111639210f01be25c223e3050e9a9ff1c9e0405ba1dab',
  },
];
