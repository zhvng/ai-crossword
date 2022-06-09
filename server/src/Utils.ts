class Utils {
    /**
     * Shuffle an array.
     * 
     * @param input Array of anything (i.e. word list, locations) to shuffle
     * @returns Shuffled array
     */
    public static shuffle(input: Array<any>): Array<any> {
        const array = input.slice(0);
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    public static rotateArrayClockwise(matrix: Array<Array<any>>) {
        const matrixCopy = matrix.slice(0).map(arr => arr.slice(0));
        return matrixCopy[0].map((_, index) => matrixCopy.map(row => row[index]).reverse());
    }
}
export default Utils;