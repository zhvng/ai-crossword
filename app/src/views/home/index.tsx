// Next, React
import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router'

export const HomeView: FC = ({ }) => {
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    router.push('/mini');
  }

  return (

    <div className="mx-auto p-4 h-screen w-full">
      <div className="flex flex-col justify-center text-center items-center h-full">
        <div className='w-64'>
          <p className='pb-10'>
            AI Crossword uses natural language processing to generate crossword puzzles. 
          </p>
          <button 
              onClick={handleClick}
              className="font-semibold w-[100%] h-14 border border-black  hover:bg-pastel-yellow/[.4] rounded" >
              Generate ✨
          </button>
          <p className='pt-10 text-xs'>
            Dedicated to Brooke 🐈
          </p>
        </div>

        {/* <Crossword data={{
          across: {
            1: {
              clue: 'The first clue',
              answer: 'AI',
              row: 0,
              col: 0,
            }
          },
          down: {
            1: {
              clue: 'The second clue',
              answer: 'AI',
              row: 0,
              col: 0,
          }}
        }}></Crossword> */}
      </div>
    </div>
  );
};
