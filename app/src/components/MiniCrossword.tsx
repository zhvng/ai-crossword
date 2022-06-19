import { FC, MutableRefObject, useEffect, useRef, useState } from 'react';
import Link from "next/link";
import Crossword, { CrosswordImperative } from '@jaredreisinger/react-crossword';
import { CrosswordData } from 'models/types';
import CrosswordStorage from 'storage/CrosswordStorage';
import { theme } from '../../tailwind.config.js';
import Modal, { ModalHandle } from './Modal';
import { Timer } from './Timer';
import { useRouter } from 'next/router';
const codec = require('json-url')('lzw');

export const MiniCrossword: FC = props => {
  const { query, replace } = useRouter();
  const crosswordType = 'mini';
  const defaultCrossword = {across: undefined, down: undefined};
  const [crosswordData, setCrosswordData] = useState(defaultCrossword);
  const [crosswordState, setCrosswordState] = useState({startingTimestamp: 0, endingTimestamp: undefined, isSolved: false, usedReveal: false});
  let crosswordRef = useRef<CrosswordImperative>();
  const [highlightedClue, setHighlightedClue] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [clipboardAlertVisible, setClipboardAlertVisible] = useState(false);
  const [usedReveal, setUsedReveal] = useState(false);

  let modalRef = useRef<ModalHandle>();

  const focusColor = theme.extend.colors['pastel-yellow'];
  const highlightColor = theme.extend.colors['pastel-pink'];

  useEffect(()=>{
    const fx = async () => {
      try {
        if (query.data !== undefined) {
          resetPuzzle();
          const crosswordData = await codec.decompress(query.data);
          const { crosswordState } = await CrosswordStorage.setNewCrossword(crosswordType, crosswordData);
          setCrosswordData(crosswordData);
          setCrosswordState(crosswordState);
          replace('/mini');
        } else {
          const {crosswordData, crosswordState} = await CrosswordStorage.getCurrentCrossword(crosswordType);
          setCrosswordState(crosswordState);
          setCrosswordData(crosswordData);
        }
      } catch(error) {
        console.error('request error', error);
        setLoadError(true);
      }
    }
    fx();
  }, [query]);

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

  const resetPuzzle = () => {
    setUsedReveal(false);
    if (crosswordRef.current) {
      crosswordRef.current.reset();
    }
  }

  const revealPuzzle = () => {
    if (crosswordRef.current) {
      setUsedReveal(true);
      crosswordRef.current.fillAllAnswers();
    }
  }

  const sharePuzzle = async () =>{
    const encodedPuzzle = await codec.compress(crosswordData);
    let text = `I solved this AI generated crossword puzzle in ${Math.round(solvedTime/1000)} seconds! Solve it here:`;
    if (crosswordState.usedReveal) text = `I couldn't solve this AI generated crossword puzzle 😡. Can you?`
    const url = `https://aicrossword.app/mini?data=${encodedPuzzle}`;
    if (navigator.share) {
      navigator.share({
        text,
        url
      }).then(() => {
        console.log('Thanks for sharing!');
      })
      .catch(console.error);
    } else {
      navigator.clipboard.writeText(text + ' ' + url);
      setClipboardAlertVisible(true);
      setTimeout(()=>{setClipboardAlertVisible(false)}, 1000);
    }
  }

  const onSolved = async(correct: boolean) => {
    if (correct) {
      if (!crosswordState.isSolved) {
        const newState = await CrosswordStorage.puzzleSolved(crosswordType, usedReveal);
        setCrosswordState(newState);
        console.log('opening');
        if (!newState.usedReveal) openSolvedModal();
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
          <Timer usedReveal={crosswordState.usedReveal} endingTimestamp={crosswordState.endingTimestamp} startingTimestamp={crosswordState.startingTimestamp}></Timer>
        </div>
        <div className="h-14 flex">
          <div className="flex-none w-[20%]">
            {!crosswordState.isSolved ? <button 
              className="font-semibold w-[90%] h-14 border border-black hover:bg-pastel-yellow/[.4] rounded" 
              onClick={checkPuzzle}>
              Check
            </button>: <button 
              className="font-semibold w-[90%] h-14 border border-black hover:bg-pastel-yellow/[.4] rounded" 
              onClick={()=>{
                if (crosswordState.isSolved) {
                  crosswordRef.current.fillAllAnswers();
                }
                if (!crosswordState.usedReveal) openSolvedModal();
              }}> <span className="text-[26px]">{!crosswordState.usedReveal ? '✨': '🔎'}</span>
            </button>}
          </div>
          <div className="flex-none w-[20%]">
            {!crosswordState.isSolved && <button 
              className="font-semibold w-[90%] h-14 border border-black hover:bg-pastel-yellow/[.4] rounded" 
              onClick={resetPuzzle}>
              Reset
            </button>}
          </div>

          <div className="flex-none w-[20%]">
            {!crosswordState.isSolved && <button 
              className="font-semibold w-[90%] h-14 border border-black hover:bg-pastel-yellow/[.4] rounded" 
              onClick={revealPuzzle}>
              Reveal
            </button>}
          </div>

          <div className="flex-none w-[20%]">
            {crosswordState.isSolved && <>
              <button 
                className="font-semibold w-[90%] h-14 border border-black hover:bg-pastel-yellow/[.4] rounded" 
                onClick={sharePuzzle}>
                  Share
              </button>
              {clipboardAlertVisible === true && 
                  <div
                  className="fixed inset-0 overflow-y-auto h-full w-full z-10"
                  id="my-modal"
                >
                  <div
                    className="relative top-0 mx-auto p-2 border w-fit shadow-lg rounded-md bg-white"
                  >
                    <div>
                      Copied to clipboard 📋
                    </div>
                  </div>
                </div>}
            </>}
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
