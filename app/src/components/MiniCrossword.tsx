import { FC, MutableRefObject, useEffect, useRef, useState } from 'react';
import Link from "next/link";
import Crossword, { CrosswordImperative } from '@jaredreisinger/react-crossword';
import { CrosswordData } from 'models/types';
import CrosswordStorage from 'storage/CrosswordStorage';
import { theme } from '../../tailwind.config.js';
import Modal, { ModalHandle } from './Modal';
import { Timer } from './Timer';

export const MiniCrossword: FC = props => {
  const crosswordType = 'mini';
  const defaultCrossword = {across: undefined, down: undefined};
  const [crosswordData, setCrosswordData] = useState(defaultCrossword);
  const [crosswordState, setCrosswordState] = useState({startingTimestamp: 0, endingTimestamp: undefined, isSolved: false});
  let crosswordRef = useRef<CrosswordImperative>();
  const [highlightedClue, setHighlightedClue] = useState('');
  const [loadError, setLoadError] = useState(false);

  let modalRef = useRef<ModalHandle>();

  const focusColor = theme.extend.colors['pastel-yellow'];
  const highlightColor = theme.extend.colors['pastel-pink'];

  useEffect(()=>{
    const fx = async () => {
      try {
        const {crosswordData, crosswordState} = await CrosswordStorage.getCurrentCrossword(crosswordType);
        setCrosswordState(crosswordState);
        setCrosswordData(crosswordData);
      } catch(error) {
        console.error('request error', error);
        setLoadError(true);
      }
    }
    fx();
  }, []);

  const errorRetry = async () => {
    setLoadError(false);
    await newPuzzle();
  }

  const newPuzzle = async () => {
    try {
      setHighlightedClue('');
      resetPuzzle();
      setCrosswordData(defaultCrossword);
      const { crosswordData, crosswordState} = await CrosswordStorage.getNewCrossword(crosswordType);
      setCrosswordData(crosswordData);
      setCrosswordState(crosswordState);
    }
    catch (error) {
      console.error('request error', error);
      setLoadError(true);
    }
  }

  const resetPuzzle = async () => {
    if (crosswordRef.current !== undefined) {
      crosswordRef.current.reset();
    }
  }

  const onSolved = async(correct: boolean) => {
    if (correct) {
      if (!crosswordState.isSolved) {
        const newState = await CrosswordStorage.puzzleSolved(crosswordType);
        setCrosswordState(newState);
        console.log('opening');
        openSolvedModal();
      }
    }
  }

  const checkPuzzle = async () => {
    const incorrectElements = document.getElementsByClassName('guess-text-incorrect');
    for (const element of incorrectElements) {
      if (element.textContent.length > 0) {
        (element as HTMLElement).style.fill = 'red';
      }
    }
  }

  const cellChanged = (row: number, col: number, value: string) => {
    const y = 11 + row * 20;
    const x = 10 + col * 20;
    const incorrectElements = document.getElementsByClassName('guess-text-incorrect');
    for (const element of incorrectElements) {
      if (element.getAttribute('x') === x.toString() && element.getAttribute('y') === y.toString()) {
        (element as HTMLElement).style.fill = 'black';
      }
    }
  }

  const updateClue = () => {
    // TODO: hacky code - make this more robust!
    function rgbStringToHex(rgb: string){
      let vals = rgb.split("(")[1].split(")")[0].split(',').map(x => parseInt(x));
      const [r,g,b] = vals;
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).toUpperCase().slice(1);
    }

    setTimeout(() => {
      const elements = document.getElementsByClassName('clue');
      for (const element of elements) {
        if (rgbStringToHex(window.getComputedStyle(element).backgroundColor) === highlightColor) {
          setHighlightedClue(element.textContent.replace(':', '.'));
        }
      }
    }, 50);
  }

  const openSolvedModal = () => {
    modalRef.current.open();
  }

  const solvedTime = crosswordState.endingTimestamp !== undefined ? crosswordState.endingTimestamp - crosswordState.startingTimestamp : 0;
  if (crosswordData.across !== undefined && crosswordData.down !== undefined) {
    return (
      <>
        <Modal ref={modalRef} defaultOpen={false} timeElapsed={solvedTime}></Modal>
        <div className="w-[100%] flex justify-end pb-1" >
          <Timer endingTimestamp={crosswordState.endingTimestamp} startingTimestamp={crosswordState.startingTimestamp}></Timer>
        </div>
        <div className="h-14 flex">
          <div className="flex-none w-[20%]">
            {!crosswordState.isSolved ? <button 
              className="font-semibold w-[90%] h-14 border border-black hover:bg-pastel-yellow/[.4] rounded" 
              onClick={checkPuzzle}>
              Check
            </button>: <button 
              className="font-semibold w-[90%] h-14 border border-black hover:bg-pastel-yellow/[.4] rounded" 
              onClick={openSolvedModal}> <span className="text-[26px]">✨</span>
            </button>}
          </div>
          <div className="flex-none w-[20%]">
            <button 
              className="font-semibold w-[90%] h-14 border border-black hover:bg-pastel-yellow/[.4] rounded" 
              onClick={resetPuzzle}>
              Reset
            </button>
          </div>

          <div className="flex-none w-[20%]">
          </div>

          <div className="flex-none w-[20%]">
          </div>

          <div className="flex-none w-[20%]">
            <button 
              className={`font-semibold w-[90%] h-14 border border-black hover:bg-pastel-pink/[.4] rounded`}
              onClick={newPuzzle}>
              New
            </button>
          </div>
        </div>
        <div className="h-14 flex bg-pastel-pink my-4">
          <div className="m-auto">
            {highlightedClue}
          </div>
        </div>
        <div onClick={()=>{updateClue()}}>
          <Crossword theme={{
            cellBorder: '1px',
            numberColor: 'black',
            focusBackground: focusColor,
            highlightBackground: highlightColor,
          }}
          onCellChange={cellChanged}
          ref={crosswordRef} data={crosswordData} onCrosswordCorrect={onSolved} />
        </div>
      </>
    );
  } else {
    if (loadError === false) {
      return (
      <div className='w-64 m-auto'>
        <p className='pb-10 text-md'>
          Generating 🪄
        </p>
        <div className='loader'></div>
        <p className='pt-10 text-md'>
          May take a while. Do not refresh this page.
        </p>
      </div>);
    } else return (
      <div className='w-64 m-auto'>
          <p className='pb-10 text-md'>
            Loading error 🪑
          </p>
          <button 
              onClick={errorRetry}
              className="font-semibold w-[100%] h-14 border border-black  hover:bg-pastel-yellow/[.4] rounded" >
              Retry ✨
          </button>
          <div className='mt-10'></div>
      </div>);
  }
};
