export interface NumericSurveyCardData {
  question: string;
  description: string;
  image: string;
  surveyId: string;
  questionIndex: number;
  questionCount: number;
}

export interface IntroCardData {
  title: string;
  description: string;
  image: string;
  surveyId: string;
}

export interface SurveyCompleteCardData {
  title: string;
  description: string;
  image: string;
}
