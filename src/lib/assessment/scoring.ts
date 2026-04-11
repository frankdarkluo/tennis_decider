import { ASSESSMENT_QUESTIONS } from "@/data/assessmentQuestions";
import type {
  AssessmentAnswerMap,
  LevelBand,
  ScoredDimension,
  ScoredAssessmentResult
} from "@/types/assessment";

const LEVEL_BAND_ORDER: LevelBand[] = ["2.5", "3.0", "3.5", "4.0", "4.0+"];

const LEVEL_THRESHOLDS: Array<{
  min: number;
  max: number;
  band: LevelBand;
}> = [
  { min: 10, max: 15, band: "2.5" },
  { min: 16, max: 22, band: "3.0" },
  { min: 23, max: 29, band: "3.5" },
  { min: 30, max: 35, band: "4.0" },
  { min: 36, max: 40, band: "4.0+" }
];

function clampLevelBand(band: LevelBand, maxBand: LevelBand): LevelBand {
  const bandIndex = LEVEL_BAND_ORDER.indexOf(band);
  const maxIndex = LEVEL_BAND_ORDER.indexOf(maxBand);

  return LEVEL_BAND_ORDER[Math.min(bandIndex, maxIndex)];
}

function mapRawScoreToLevelBand(rawScore: number): LevelBand {
  const matched = LEVEL_THRESHOLDS.find((entry) => rawScore >= entry.min && rawScore <= entry.max);

  if (!matched) {
    throw new Error(`Unexpected raw assessment score: ${rawScore}`);
  }

  return matched.band;
}

export function scoreAssessment(answers: AssessmentAnswerMap): ScoredAssessmentResult {
  const scoredQuestions = ASSESSMENT_QUESTIONS.filter((question) => question.type === "scored");
  const dimensionScores = {} as ScoredAssessmentResult["dimensionScores"];
  let rawScore = 0;

  for (const question of scoredQuestions) {
    const selectedValue = answers[question.id];

    if (!selectedValue) {
      throw new Error(`Missing answer for scored question: ${question.id}`);
    }

    const selectedOption = question.options.find((option) => option.value === selectedValue);

    if (!selectedOption || selectedOption.score == null) {
      throw new Error(`Invalid scored answer for question: ${question.id}`);
    }

    dimensionScores[question.dimension as ScoredDimension] = selectedOption.score;
    rawScore += selectedOption.score;
  }

  let levelBand = mapRawScoreToLevelBand(rawScore);

  if (dimensionScores.rally === 1) {
    levelBand = clampLevelBand(levelBand, "3.5");
  }

  return {
    rawScore,
    levelBand,
    dimensionScores
  };
}
