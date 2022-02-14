import { storeSprintInterface, wordInterface } from './instance';
import { Question } from '../pages/games/sprint/qustion';
import { storeSprint } from '../pages/games/sprint/storeSprint';
import { WordResult } from '../pages/games/sprint/word';

export const renderSprintQuestion = async (
  id: number,
  arrWords: wordInterface[],
  word: wordInterface
) => {
  const img = word.image;
  const nameEng = word.word;
  const randomId = randomFalseWordSprint(id, arrWords);
  const nameRus = arrWords[randomId].wordTranslate;
  const answer = randomId === id;
  return { img, nameEng, nameRus, answer };
};

export const randomFalseWordSprint = (id: number, arrWords: wordInterface[]) => {
  let randomNumber = Math.floor(Math.random() * arrWords.length);
  while (randomNumber === id) {
    randomNumber = Math.floor(Math.random() * arrWords.length);
  }
  return Math.floor(Math.random() * 2) === 1 ? randomNumber : id;
};

//Функция для выбора правильного или неправильного ответа

export const answerAdd = (
  event: Event,
  wordValues: { img: string; nameEng: string; nameRus: string; answer: boolean }[],
  storeSprint: storeSprintInterface,
  arrWords: wordInterface[],
  i: number,
  blockQuestinWrap: HTMLElement,
  blockScore: HTMLElement,
  blockArr: NodeListOf<HTMLElement>,
  btnKeybord: string | null = null
) => {
  const answer = giveAnswer(event) === String(wordValues[i].answer);
  storeSprint.answers.push({ word: arrWords[i], answer: answer });
  if (answer) {
    blockQuestinWrap?.classList.add('questin__true');
    addPoints(storeSprint, blockScore);
    addClass(storeSprint, blockArr);
    storeSprint.correctAnswers++;
  } else {
    blockQuestinWrap?.classList.add('questin__false');
    storeSprint.correctAnswers = 0;
    blockArr.forEach((li) => li.classList.remove('activ__round'));
  }
  soundAnswer(answer);
  setTimeout(
    () =>
      answer
        ? blockQuestinWrap?.classList.remove('questin__true')
        : blockQuestinWrap?.classList.remove('questin__false'),
    1000
  );
};

//Функция таймер

export const timerSprint = (block: HTMLElement, blockTrue: HTMLElement, blockFalse: HTMLElement, answers: { word: wordInterface; answer: boolean; }[], sections: NodeListOf<HTMLElement>, blockResult: HTMLElement) => {
  let count = 10;
  storeSprint.timer = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(storeSprint.timer!);
      addWordsResult(blockTrue, blockFalse, answers);
      sections.forEach((section) => section.classList.add('close'));
      blockResult?.classList.remove('close');
    }
    if (count < 10) {
      block.innerHTML = `00:0${count}`;
    } else block.innerHTML = `00:${count}`;
  }, 1000);
};

//Функция добавления баллов

export const addPoints = (storeSprint: storeSprintInterface, block: HTMLElement) => {
  if (storeSprint.correctAnswers > 2) storeSprint.points += 20;
  if (storeSprint.correctAnswers > 3) storeSprint.points += 40;
  else storeSprint.points += 10;
  block.innerHTML = String(storeSprint.points);
};

//Функция добавления класса

export const addClass = (storeSprint: storeSprintInterface, blockArr: NodeListOf<HTMLElement>) => {
  if (storeSprint.correctAnswers % 3 === 0) {
    blockArr[0].classList.add('activ__round');
  }
  if (storeSprint.correctAnswers % 3 === 1) {
    blockArr[1].classList.add('activ__round');
  }
  if (storeSprint.correctAnswers % 3 === 2) {
    blockArr[2].classList.add('activ__round');
  }
};

//Функция звука ответа
const soundAnswer = (flag: boolean) => {
  const audio = new Audio();
  audio.src = flag
    ? './../assets/sound-sprint/zvuk-pravilnogo-otveta-iz-peredachi-100-k-1-5200.mp3'
    : './../assets/sound-sprint/standartnyiy-zvuk-s-oshibochnyim-otvetom-5199-1__=8.mp3';
  audio.autoplay = true;
};

//Функция получения ответа
const giveAnswer = (event: Event | KeyboardEvent) => {
  let answer: boolean;
  if (event.target instanceof HTMLElement && event.target.dataset.answer) {
    return event.target!.dataset.answer;
  } else if (event instanceof KeyboardEvent) {
    const btnKeybord = event.key === 'ArrowLeft' ? 'false' : 'true';
    return btnKeybord;
  }
};

//Функция отрисовки результатов
export const addWordsResult =  (blockTrue: HTMLElement, blockFalse: HTMLElement, answers: {word: wordInterface, answer: boolean}[]) => {
  answers.forEach(async (answer) => {
    const word = answer.word;
    const wordResultInstance = new WordResult(word.transcription, word.word, word.wordTranslate, word.audio);
    const wordElement = document.createElement('div');
    wordElement.innerHTML = await wordResultInstance.render();
    
    await answer.answer ? blockTrue.append(wordElement) : blockFalse.append(wordElement);
    await wordResultInstance.after_render();
  })
}