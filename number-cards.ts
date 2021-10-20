// Import stylesheets
// import './style.css';

// // Write TypeScript code!
// const appDiv: HTMLElement = document.getElementById('app');
// appDiv.innerHTML = `<h1>TypeScript Starter</h1>`;

console.clear();
import { EMPTY, from, fromEvent, generate, interval, merge, noop } from 'rxjs';
import {
  map,
  pluck,
  scan,
  sequenceEqual,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
const random = (): number => Math.floor(Math.random() * Math.floor(8));
const setInfo = (text: string) =>
  (document.getElementById('info').innerHTML = text);
const showSequenceToMemorize$ =
  (memorySize: number) => (randomSequence: number[]) =>
    interval(1000).pipe(
      tap((i) =>
        setInfo(
          i === memorySize - 1 ? `YOUR TURN` : `${memorySize - i} elements`
        )
      ),
      tap((i) => console.log(i, randomSequence)),
      take(randomSequence.length),
      map((index) => randomSequence[index]),
      tap((value) => document.getElementById(`${value}`).click())
      // switchMap(takePlayerInput$(randomSequence))
    );

const memoryGame$ = (memorySize) =>
  generate(
    1,
    (x) => x <= memorySize,
    (x) => x + 1
  ).pipe(
    scan((acc: number[], _: number): number[] => [...acc, random() + 1], []),
    switchMap(showSequenceToMemorize$(memorySize))
  );

const elementClick$ = (event: string, color: string) =>
  fromEvent(document.querySelectorAll('.child'), event).pipe(
    pluck('srcElement'),
    tap((e: HTMLElement) => (e.style.background = color))
  );

const clicks$ = merge(
  elementClick$('click', 'lightgray')
  // elementClick$('transitionend', 'white')
);

const game$ = merge(clicks$, memoryGame$(2));

game$.subscribe();
