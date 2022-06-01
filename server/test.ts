import Crossword from "./src/Crossword";
import WordList from "./src/WordList";
import * as dotenv from 'dotenv';
import assert = require("assert");
import { Configuration, OpenAIApi } from 'openai';
import GPT from "./src/GPT";

dotenv.config();
assert(process.env.OPENAI_API_KEY !== undefined);

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

async function testCrossword(){
    const gpt = new GPT(openai, false);

    const wordList = new WordList();
    const template = [
        [false, true, true, true, true],
        [false, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, false],
        [true, true, true, true, false]
    ];
    const crossword = new Crossword(5, 5, template);
    
    console.log(template.map(arr => arr.map(elem => elem ? '_' : '*').join(' ')).join('\n'));

    crossword.fill(wordList);
    const result = await crossword.export(gpt);
    console.log(result);

    for (const clue of result.clues) {
        const {startingSquare, direction} = clue.wordLocation;
        console.log(`(${startingSquare.row}, ${startingSquare.col})-${direction}: ${clue.clueText.trim().split('\n')[0]}`);
    }
}

testCrossword();