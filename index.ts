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
} from 'rxjs/operators';

// https://sandraisrael.github.io/Memory-Game-fend/#

const level = {
  EASY: 5,
  MODERATE: 7,
  HARD: 10,
};
// Generates a random number
const randomNoGenerator = () =>
  Math.floor(Math.random() * Math.floor(level.EASY));
// Generate a random array of numbers for a range
const randomArr$ = interval(100).pipe(
  map(() => randomNoGenerator()),
  distinct(),
  scan((acc, curr) => {
    return [...acc, curr];
  }, []),
  takeWhile((res) => {
    return res.length === 5 ? false : true;
  }, true),
  last()
);
//Show the array in cards
const fillCards = (arr, index) =>
  generate(
    0,
    (x) => x < arr.length,
    (x) => (x = x + 1)
  ).pipe(
    tap((key) => {
      const htmlKey = key + index;
      document.getElementById(`${htmlKey}`).innerHTML = `${arr[key]}`;
    }),
    // only emit when last emission is done
    last()
  );

const generateCards = (index) => {
  return randomArr$.pipe(
    mergeMap(
      (val) => fillCards(val, index),
      (source) => {
        return source;
      }
    )
  );
};
// Generate 1st row of cards
generateCards(1).subscribe();
// Generate 2nd row of cards
generateCards(6).subscribe();

const mouseClick$ = fromEvent(document.querySelectorAll('.child'), 'click');
mouseClick$
  .pipe(
    pluck('srcElement'),
    tap((event: HTMLElement) => {
      event.classList.add('rotate', 'open');
    }),
    // // delay is added to finish the rotate which takes 1 seconds in css
    // delay(500),
    tap(
      (event: HTMLElement) => (event.children[0].style.visibility = 'visible')
    )
  )
  .subscribe();

const transitionEnd$ = fromEvent(
  document.querySelectorAll('.child'),
  'animationend'
);
transitionEnd$
  .pipe(
    pluck('srcElement'),
    bufferCount(2),
    delay(2000),
    // check if open classes are present for two divs and they are same they can be opened
    // and remove click class from them
    tap((openElements: HTMLDivElement[]) => {
      const match =
        openElements[0].children[0].innerHTML ===
        openElements[1].children[0].innerHTML;

      for (const elem of openElements) {
        if (match) {
          elem.classList.add('done');
        } else {
          elem.children[0].style.visibility = 'hidden';
        }
        elem.classList.remove('rotate', 'open');
      }
    })
  )
  .subscribe();

// TODO, Check user chances. every two presses counts as 1. Use buffer operator to count and reset it.
