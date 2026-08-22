import { QUESTION_TYPES, QUESTION_DIFFICULTIES } from "../../constants/question.constants.js";

const DISTRACTOR_OFFSETS = [1, 7, 13];

const FORM_PROFILES = {
  definition: {
    type: QUESTION_TYPES.SINGLE_CHOICE,
    difficulty: QUESTION_DIFFICULTIES.EASY,
    marks: 1,
    negativeMarks: 0,
    timeLimitSeconds: 45,
  },
  selectAll: {
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    difficulty: QUESTION_DIFFICULTIES.MEDIUM,
    marks: 3,
    negativeMarks: 1,
    timeLimitSeconds: 90,
  },
  trueFalse: {
    type: QUESTION_TYPES.TRUE_FALSE,
    difficulty: QUESTION_DIFFICULTIES.EASY,
    marks: 1,
    negativeMarks: 0,
    timeLimitSeconds: 30,
  },
  oddOneOut: {
    type: QUESTION_TYPES.SINGLE_CHOICE,
    difficulty: QUESTION_DIFFICULTIES.MEDIUM,
    marks: 2,
    negativeMarks: 1,
    timeLimitSeconds: 60,
  },
  descriptive: {
    type: QUESTION_TYPES.DESCRIPTIVE,
    difficulty: QUESTION_DIFFICULTIES.HARD,
    marks: 5,
    negativeMarks: 0,
    timeLimitSeconds: 300,
  },
  coding: {
    type: QUESTION_TYPES.CODING,
    difficulty: QUESTION_DIFFICULTIES.HARD,
    marks: 10,
    negativeMarks: 0,
    timeLimitSeconds: 900,
  },
};

const sentence = (text) => {
  const trimmed = text.trim();
  const capitalised = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capitalised) ? capitalised : `${capitalised}.`;
};

const rotate = (items, by) => {
  const size = items.length;
  if (size === 0) return items;
  const offset = ((by % size) + size) % size;
  return [...items.slice(offset), ...items.slice(0, offset)];
};

const option = (text, isCorrect) => ({ text: sentence(text), isCorrect });

const pickDistractors = (concepts, index) =>
  DISTRACTOR_OFFSETS.map((offset) => concepts[(index + offset) % concepts.length]);

const buildDefinitionQuestion = (concept, index, bank) => {
  const options = [
    option(concept.definition, true),
    ...pickDistractors(bank.concepts, index).map((other) => option(other.definition, false)),
  ];

  return {
    ...FORM_PROFILES.definition,
    title: `${bank.name} — which statement best describes ${concept.term}?`,
    options: rotate(options, index),
    explanation: sentence(`${concept.term} is ${concept.definition}`),
  };
};

const buildSelectAllQuestion = (concept, index, bank) => {
  const options = [
    ...concept.facts.map((fact) => option(fact, true)),
    ...concept.myths.map((myth) => option(myth, false)),
  ];

  return {
    ...FORM_PROFILES.selectAll,
    title: `${bank.name} — select every statement that is true about ${concept.term}.`,
    options: rotate(options, index),
    explanation: sentence(
      `the incorrect choices are common misconceptions: ${concept.myths.join("; ")}`
    ),
  };
};

const buildTrueFalseQuestion = (concept, index, bank) => {
  const isTrue = index % 2 === 0;
  const statement = isTrue ? concept.facts[2] : concept.myths[0];

  return {
    ...FORM_PROFILES.trueFalse,
    title: `${bank.name} — true or false: ${sentence(statement)}`,
    options: [
      { text: "True", isCorrect: isTrue },
      { text: "False", isCorrect: !isTrue },
    ],
    explanation: isTrue
      ? sentence(`this holds because ${concept.term} is ${concept.definition}`)
      : sentence(`this is false, because ${concept.term} is ${concept.definition}`),
  };
};

const buildOddOneOutQuestion = (concept, index, bank) => {
  const options = [
    option(concept.myths[1], true),
    ...concept.facts.map((fact) => option(fact, false)),
  ];

  return {
    ...FORM_PROFILES.oddOneOut,
    title: `${bank.name} — which of the following is NOT true about ${concept.term}?`,
    options: rotate(options, index + 2),
    explanation: sentence(
      `the other three statements are accurate, because ${concept.term} is ${concept.definition}`
    ),
  };
};

const buildDescriptiveQuestion = (concept, bank) => ({
  ...FORM_PROFILES.descriptive,
  title: `${bank.name} — explain ${concept.term} and describe a situation where it matters.`,
  correctAnswer: sentence(`${concept.term} is ${concept.definition}`),
  explanation: sentence(`graded manually. A full answer covers: ${concept.facts.join("; ")}`),
});

const buildCodingQuestion = (concept, bank) => ({
  ...FORM_PROFILES.coding,
  title: `${bank.name} — ${concept.code.title}`,
  codingConfig: {
    language: concept.code.language,
    starterCode: concept.code.starterCode,
    testCases: concept.code.testCases,
  },
  explanation: sentence(concept.code.explanation),
});

const buildConceptQuestions = (concept, index, bank) => {
  const shared = {
    category: bank.categoryId,
    tags: [bank.tag, ...concept.tags],
    createdBy: bank.createdBy,
    isActive: true,
  };

  const forms = [
    buildDefinitionQuestion(concept, index, bank),
    buildSelectAllQuestion(concept, index, bank),
    buildTrueFalseQuestion(concept, index, bank),
    buildOddOneOutQuestion(concept, index, bank),
    concept.code ? buildCodingQuestion(concept, bank) : buildDescriptiveQuestion(concept, bank),
  ];

  return forms.map((form) => ({ ...shared, ...form }));
};

export const QUESTIONS_PER_CONCEPT = 5;

export const buildQuestionsForBank = (bank) =>
  bank.concepts.flatMap((concept, index) => buildConceptQuestions(concept, index, bank));
