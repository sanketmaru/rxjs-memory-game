import { generate, interval, fromEvent } from 'rxjs';
import {
  scan,
  map,
  tap,
  distinct,
  takeWhile,
  last,
  mergeMap,
  delay,
  pluck,
  bufferCount,
  switchMap,
  debounceTime,
} from 'rxjs/operators';

// https://sandraisrael.github.io/Memory-Game-fend/#

const level = {
  EASY: 8,
  MEDIUM: 12,
  HARD: 16,
};

// Generates a random number
const randomNoGenerator = (maxNo) =>
  Math.floor(Math.random() * Math.floor(maxNo));

// Generate a random array of numbers for a range
const randomArr$ = (maxNo) =>
  interval(100).pipe(
    map(() => randomNoGenerator(maxNo)),
    distinct(),
    scan((acc, curr) => {
      return [...acc, curr];
    }, []),
    takeWhile((res) => {
      return res.length === maxNo ? false : true;
    }, true),
    last()
  );

const createCard = (id: number) => {
  const cardSceneContainer = document.createElement('div');
  cardSceneContainer.classList.add('scene');

  const cardContainer = document.createElement('div');
  cardContainer.classList.add('card');

  const cardFront = document.createElement('div');
  cardFront.classList.add('card__face', 'child-front');

  const cardBack = document.createElement('div');
  cardBack.classList.add('card__face', 'child-back');
  cardBack.id = id.toString();

  cardContainer.appendChild(cardFront);
  cardContainer.appendChild(cardBack);

  cardSceneContainer.appendChild(cardContainer);
  return cardSceneContainer;
};

//Show the array in cards
const fillCards = (arr, index) =>
  generate(
    0,
    (x) => x < arr.length,
    (x) => (x = x + 1)
  ).pipe(
    tap((key) => {
      const htmlKey = key + index;
      const container = document.getElementById('container');
      const card = createCard(htmlKey);
      container.appendChild(card);
      document.getElementById(`${htmlKey}`).innerHTML = `${arr[key]}`;
    }),
    // only emit when last emission is done
    last()
  );

const generateCards = (index, maxNo) => {
  return randomArr$(maxNo).pipe(mergeMap((val) => fillCards(val, index)));
};

const levelClick = fromEvent(
  document.querySelectorAll("input[name='level']"),
  'click'
);
levelClick
  .pipe(
    debounceTime(300),
    pluck('srcElement'),
    map((data: HTMLInputElement) => {
      // Not convinced by having string property here.
      const selectedLevel = data.attributes['value'].value;
      const noOfBlocks = level[selectedLevel];
      return noOfBlocks / 2;
    }),
    // when a new level is selected, clear the html
    tap(() => (document.getElementById('container').innerHTML = '')),
    switchMap((noOfBlocks) =>
      generateCards(0, noOfBlocks).pipe(map(() => noOfBlocks))
    ),
    switchMap(
      (noOfBlocks) => {
        return generateCards(noOfBlocks, noOfBlocks);
      },
      (source) => source
    )
  )
  .subscribe(() => {
    initMouseClick().subscribe();
    initTransitionEnd().subscribe();
  });

const initMouseClick = () => {
  const mouseClick$ = fromEvent(document.querySelectorAll('.card'), 'click');
  return mouseClick$.pipe(
    pluck('srcElement'),
    tap((event: HTMLElement) => {
      event.parentElement.classList.add('rotate', 'open');
    })
  );
};

const initTransitionEnd = () => {
  const transitionEnd$ = fromEvent(
    document.querySelectorAll('.card'),
    'transitionend'
  );
  return transitionEnd$.pipe(
    pluck('srcElement'),
    bufferCount(2),
    tap((openElements: HTMLDivElement[]) => {
      console.log(openElements);
      const match =
        openElements[0].children[1].innerHTML ===
        openElements[1].children[1].innerHTML;

      for (const elem of openElements) {
        if (match) {
          elem.classList.add('done');
        } else {
          elem.classList.remove('rotate', 'open');
        }
      }
    })
  );
};

// TODO, Check user chances. every two presses counts as 1. Use buffer operator to count and reset it.
