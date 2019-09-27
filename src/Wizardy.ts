import {EventEmitter} from 'events';
import {Prompt} from './Prompt';

export class Wizardy<T = any> extends EventEmitter {
  private static readonly STARTING_INDEX = -1;
  public static TOPIC = {
    END: 'Wizardy.TOPIC.END',
    START: 'Wizardy.TOPIC.START',
  };
  public answers: Record<string, T> = {};
  private index: number = Wizardy.STARTING_INDEX;
  private questions: Prompt<T>[] = [];

  addQuestion(question: Prompt<T>): void {
    this.questions.push(question);
    if (this.index === -1) {
      this.emit(Wizardy.TOPIC.START);
      this.index = 0;
    }
  }

  addQuestions(questions: Prompt<T>[]): void {
    questions.forEach(question => this.addQuestion(question));
  }

  answer(answer: string): string {
    const question: Prompt<T> = Object.assign({}, this.questions[this.index]);
    try {
      const {answerKey, response} = question;
      const value = question.answerValue(answer);
      this.answers[answerKey] = value;
      this.questions.shift();
      if (this.questions.length === 0) {
        this.reset();
      }
      return response;
    } catch (error) {
      return error.message;
    }
  }

  ask(): string {
    return this.questions[this.index].question;
  }

  private reset(): void {
    this.emit(Wizardy.TOPIC.END, this.answers);
    this.index = Wizardy.STARTING_INDEX;
    this.questions = [];
    this.answers = {};
  }
}
