import type {
  DimensionScores,
  LevelBand,
  PlayContext,
  PlayStyle,
  ScoredDimension,
  WeaknessRankingItem
} from "@/types/assessment";

const BASE_IMPACT_WEIGHT: Record<ScoredDimension, number> = {
  serve: 1.0,
  return: 0.95,
  rally: 0.9,
  forehand: 0.85,
  backhand_slice: 0.8,
  movement: 0.72,
  net: 0.58,
  overhead: 0.48,
  tactics: 0.4,
  pressure: 0.34
};

const SEVERITY_WEIGHT: Record<1 | 2 | 3 | 4, number> = {
  1: 1.0,
  2: 0.65,
  3: 0.2,
  4: 0.0
};

const ADVANCED_LEVEL_MULTIPLIER: Partial<Record<ScoredDimension, number>> = {
  movement: 1.12,
  tactics: 1.3,
  pressure: 1.25,
  net: 1.05,
  overhead: 1.05
};

const STYLE_MULTIPLIER: Record<PlayStyle, Partial<Record<ScoredDimension, number>>> = {
  defensive: {
    rally: 1.05,
    movement: 1.05
  },
  baseline_attack: {
    forehand: 1.06,
    rally: 1.04
  },
  all_court: {
    net: 1.08,
    tactics: 1.08
  },
  net_pressure: {
    net: 1.15,
    overhead: 1.08
  }
};

const CONTEXT_MULTIPLIER: Record<PlayContext, Partial<Record<ScoredDimension, number>>> = {
  singles_standard: {},
  singles_limited_mobility: {
    movement: 1.15
  },
  mixed_with_doubles: {
    net: 1.1,
    overhead: 1.08
  },
  doubles_primary: {
    net: 1.25,
    overhead: 1.15,
    tactics: 1.1
  }
};

const FOUNDATIONAL_DIMENSIONS: ScoredDimension[] = [
  "serve",
  "return",
  "rally",
  "forehand",
  "backhand_slice"
];

function getLevelMultiplier(levelBand: LevelBand, dimension: ScoredDimension) {
  if (levelBand === "4.0" || levelBand === "4.0+") {
    return ADVANCED_LEVEL_MULTIPLIER[dimension] ?? 1;
  }

  return 1;
}

function hasAnyFoundationalLowScore(dimensionScores: DimensionScores) {
  return FOUNDATIONAL_DIMENSIONS.some((dimension) => dimensionScores[dimension] <= 2);
}

export function rankWeaknesses(input: {
  dimensionScores: DimensionScores;
  levelBand: LevelBand;
  playStyle: PlayStyle;
  playContext: PlayContext;
}): WeaknessRankingItem[] {
  const { dimensionScores, levelBand, playStyle, playContext } = input;
  const dimensions = Object.keys(dimensionScores) as ScoredDimension[];
  const candidates = dimensions.filter((dimension) => dimensionScores[dimension] <= 2);
  const foundationalLowExists = hasAnyFoundationalLowScore(dimensionScores);

  return candidates
    .map((dimension) => {
      const score = dimensionScores[dimension];
      const baseImpactWeight = BASE_IMPACT_WEIGHT[dimension];
      const severityWeight = SEVERITY_WEIGHT[score];
      const levelMultiplier = getLevelMultiplier(levelBand, dimension);
      const styleMultiplier = STYLE_MULTIPLIER[playStyle][dimension] ?? 1;
      const contextMultiplier = CONTEXT_MULTIPLIER[playContext][dimension] ?? 1;
      const priorityScore =
        baseImpactWeight *
        severityWeight *
        levelMultiplier *
        styleMultiplier *
        contextMultiplier;

      let suppressedAsPrimary = false;

      if (
        (levelBand === "2.5" || levelBand === "3.0" || levelBand === "3.5") &&
        (dimension === "tactics" || dimension === "pressure") &&
        foundationalLowExists
      ) {
        suppressedAsPrimary = true;
      }

      if ((levelBand === "2.5" || levelBand === "3.0") && dimension === "overhead") {
        suppressedAsPrimary = true;
      }

      return {
        dimension,
        score,
        priorityScore,
        baseImpactWeight,
        severityWeight,
        levelMultiplier,
        styleMultiplier,
        contextMultiplier,
        suppressedAsPrimary
      };
    })
    .sort((left, right) => right.priorityScore - left.priorityScore);
}
