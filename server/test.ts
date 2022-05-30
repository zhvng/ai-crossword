import Crossword from "./src/Crossword";
import WordList from "./src/WordList";


// function testMiniCrossWord()

const wordList = new WordList()
console.log(wordList.getWords(4, new Map([[0, 'C'], [3, 'D']])));


const crossword = new Crossword(5, 5,
[[false, false, true, false, false],
[false, false, true, false, false],
[true, true, true, true, true],
[false, false, true, false, false],
[false, false, true, false, false]]);
crossword.fill(wordList);
console.log(crossword.export());
