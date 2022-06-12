// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import Crossword from '@jaredreisinger/react-crossword';

export const HomeView: FC = ({ }) => {

  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl md:pl-12 font-bold bg-clip-text">
          AI Crossword
        </h1>
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
