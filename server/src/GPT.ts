import { OpenAIApi } from 'openai';


/**
 * Wrapper for openai gpt api
 * */ 
class GPT {

    constructor(
        private readonly openai: OpenAIApi,
        private readonly modelName: string | undefined,
        private readonly prod: boolean = true,
        ) {}

    /**
     * Generate a clue with a fine-tuned GPT-3 model.
     * Model name in .env file.
     * If fine tuned model is not provided, uses few shot learning model (generateClueOld).
     * 
     * @param word Word to generate clue for.
     * @returns Promise containing clue for the word.
     */
    public async generateClue(word: string): Promise<any> {
        if (this.prod) {
            if (this.modelName !== undefined && this.modelName !== '') {
                const prompt = `Word:${word}\n\n`;
                const completion = this.openai.createCompletion(this.modelName, {
                    prompt,
                    max_tokens: 256,
                    temperature: 0.7,
                    stop: '\n',
                });
                return completion;
            } else {
                return await this.generateClueOld(word);
            }
        } else {
            return {
                data: {
                    choices: [{
                        text: 'Placeholder clue. Pass in prod=true in constructor for a real clue.'
                    }],
                },
            };
        }
    }

    /**
     * Generate clue with a generalized GPT-3 model.
     * Employs few-shot learning to generate a clue for a word.
     * Less accurate than fine-tuned model.
     * 
     * @param word Word to generate clue for.
     * @returns Promise containing clue for the word.
     */
    private async generateClueOld(word: string): Promise<any> {
        if (this.prod) {
            const prompt = [
                'Write a clue for this word that could be found in a crossword puzzle. Specify if the word is plural or past tense.\n',
                'Word: FROZE',
                'Clue: past tense of what happens to water when it gets cold.\n',
                'Word: PHILADELPHIA',
                'Clue: it’s always sunny here.\n',
                `Word: ${word}`,
                'Clue:'].join('');
            const completion = this.openai.createCompletion("text-davinci-002", {prompt});
            return completion;
        } else {
            return {
                data: {
                    choices: [{
                        text: 'Placeholder clue. Pass in prod=true in constructor for a real clue.'
                    }],
                },
            };
        }
    }
}

export default GPT