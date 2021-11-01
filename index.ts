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
  EASY: 8,
  MODERATE: 12,
  HARD: 16,
};

// const getRandomColor = () => {
//   const letters = '0123456789ABCDEF';
//   let color = '#';
//   for (var i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// };
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
const levelClick = fromEvent(
  document.querySelectorAll("input[name='level']"),
  'change'
);
levelClick
  .pipe(
    pluck('srcElement'),
    tap((data) => {
      const level = data.attributes.value;
    })
  )
  .subscribe();
// Generate 1st row of cards
generateCards(1).subscribe();
// Generate 2nd row of cards
generateCards(6).subscribe();

const mouseClick$ = fromEvent(document.querySelectorAll('.card'), 'click');
mouseClick$
  .pipe(
    pluck('srcElement'),
    tap((event: HTMLElement) => {
      console.log(event.parentElement);
      event.parentElement.classList.add('rotate', 'open');
    })
  )
  .subscribe();

const transitionEnd$ = fromEvent(
  document.querySelectorAll('.card'),
  'transitionend'
);
transitionEnd$
  .pipe(
    pluck('srcElement'),
    bufferCount(2),
    // check if open classes are present for two divs and they are same they can be opened
    // and remove click class from them
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
  )
  .subscribe();

// TODO, Check user chances. every two presses counts as 1. Use buffer operator to count and reset it.
