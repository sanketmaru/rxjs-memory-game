import { generate, of, interval, fromEvent } from 'rxjs';
import {
  scan,
  map,
  tap,
  distinct,
  takeWhile,
  last,
  mergeMap,
  filter,
  throttleTime,
  buffer,
  delay,
  debounceTime,
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
let arr1 = [],
  arr2 = [];
// Generate 1st row of cards
generateCards(1).subscribe((res) => (arr1 = res));
// Generate 2nd row of cards
generateCards(6).subscribe((res) => (arr2 = res));

const mouseClick$ = fromEvent(document, 'click');
mouseClick$
  .pipe(
    filter((event: MouseEvent) => {
      return event.target.classList?.contains('child');
    }),
    tap((event: MouseEvent) => {
      event.target.classList.add('rotate', 'open');
    }),
    // delay is added to finish the rotate which takes 1 seconds in css
    delay(500),
    tap((event) => (event.target.children[0].style.visibility = 'visible')),
    delay(2000),
    // check if open classes are present for two divs and they are same they can be opened
    // and remove click class from them
    tap(() => {
      // create copy as we are changing same reference in dom
      const openElements = Object.assign(
        [],
        document.getElementsByClassName('open')
      );
      const openItemsLen = openElements.length;
      console.log(openItemsLen);
      if (openItemsLen === 2) {
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
      }
    })
  )
  .subscribe();
