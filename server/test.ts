import Crossword from "./src/Crossword";
import WordList from "./src/WordList";
import * as dotenv from 'dotenv';
import assert = require("assert");
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();
assert(process.env.OPENAI_API_KEY !== undefined);

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

async function testCrossword(){

    const wordList = new WordList();
    const template = [
        [true, true, true, true, true],
        [true, false, true, false, false],
        [true, true, true, true, true],
        [false, false, true, false, true],
        [false, false, true, true, true]
    ];
    const crossword = new Crossword(5, 5, template);
    
    console.log(template.map(arr => arr.map(elem => elem ? '_' : 'x').join(' ')).join('\n'));

    crossword.fill(wordList);
    const result = await crossword.export(openai);
    console.log(result);

    for (const clue of result.clues) {
        const {startingSquare, direction} = clue.wordLocation;
        console.log(`(${startingSquare.row}, ${startingSquare.col})-${direction}: ${clue.clueText}`);
    }
}

testCrossword();