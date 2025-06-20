export interface Flashcard {
  _id: string;
  userId: string;
  summaryId: string;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
}

export interface FlashcardSet {
  _id: string;
  userId: string;
  summaryId: string;
  flashcards: Array<{
    question: string;
    answer: string;
    category: string;
  }>;
  createdAt: string;
}
