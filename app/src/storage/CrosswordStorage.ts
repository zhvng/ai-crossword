import { CrosswordData, CrosswordState, CrosswordType } from "models/types";
import { requestMiniCrossword } from "utils/requests";

class CrosswordStorage {
    private static getStorageKeys(type: CrosswordType) {
        return {
            crosswordKey: `${type}Crossword`,
            stateKey: `${type}State`,
        };
    }

    private static getDefaultCrosswordState(): CrosswordState {
        return {
            startingTimestamp: new Date().getTime(),
            endingTimestamp: undefined,
            isSolved: false,
        };
    };

    public static async getCurrentCrossword(type: CrosswordType): Promise<{crosswordData: CrosswordData, crosswordState: CrosswordState}> {
        const storageExists = CrosswordStorage.checkCrosswordStorage(type);
        if (!storageExists) {
            const data: CrosswordData = await requestMiniCrossword();
            const defaultState = CrosswordStorage.getDefaultCrosswordState();
            CrosswordStorage.createCrosswordStorage(type, data, defaultState);
            return {
                crosswordData: data,
                crosswordState: defaultState,
            };
        } else {
            return CrosswordStorage.getCrosswordStorage(type);
        }
    }
    public static async getNewCrossword(type: CrosswordType): Promise<{crosswordData: CrosswordData, crosswordState: CrosswordState}> {
        const data: CrosswordData = await requestMiniCrossword();
        const defaultState = CrosswordStorage.getDefaultCrosswordState();
        CrosswordStorage.updateCrosswordStorage(type, data, defaultState);
        return {crosswordData: data, crosswordState: defaultState};
    }
    public static async puzzleSolved(type: CrosswordType): Promise<CrosswordState> {
        const endingTimestamp = new Date().getTime();
        const storageExists = CrosswordStorage.checkCrosswordStorage(type);
        if (!storageExists) {
            throw new Error("Puzzle does not exist!");
        } else {
            const { crosswordState } = CrosswordStorage.getCrosswordStorage(type);
            crosswordState.endingTimestamp = endingTimestamp;
            crosswordState.isSolved = true;
            CrosswordStorage.updateCrosswordStorage(type, undefined, crosswordState);
            return crosswordState;
        }
    }
    public static async resetPuzzleState(type: CrosswordType): Promise<CrosswordState> {
        const storageExists = CrosswordStorage.checkCrosswordStorage(type);
        if (!storageExists) {
            throw new Error("Puzzle does not exist!");
        } else {
            const defaultCrosswordState = CrosswordStorage.getDefaultCrosswordState();
            CrosswordStorage.updateCrosswordStorage(type, undefined, defaultCrosswordState);
            return defaultCrosswordState;
        }
    }

    private static checkCrosswordStorage(type: CrosswordType): boolean {
        const {crosswordKey, stateKey} = CrosswordStorage.getStorageKeys(type);
        return localStorage.getItem(crosswordKey) !== null 
            && localStorage.getItem(stateKey) !== null;
    }

    private static createCrosswordStorage(type: CrosswordType, data: CrosswordData, state: CrosswordState) {
        const {crosswordKey, stateKey} = CrosswordStorage.getStorageKeys(type);
        
        if (!CrosswordStorage.checkCrosswordStorage(type)) {
            localStorage.setItem(crosswordKey, JSON.stringify(data));
            localStorage.setItem(stateKey, JSON.stringify(state));
        } else {
            throw new Error('Store already exists');
        }
    }
    private static updateCrosswordStorage(type: CrosswordType, data: CrosswordData | undefined, state: CrosswordState | undefined) {
        const {crosswordKey, stateKey} = CrosswordStorage.getStorageKeys(type);
        
        if (data !== undefined) localStorage.setItem(crosswordKey, JSON.stringify(data));
        if (state !== undefined) localStorage.setItem(stateKey, JSON.stringify(state));
    }

    private static getCrosswordStorage(type: CrosswordType): {crosswordData: CrosswordData, crosswordState: CrosswordState} {
        const {crosswordKey, stateKey} = CrosswordStorage.getStorageKeys(type);

        const data: string | null = localStorage.getItem(crosswordKey);
        const state: string | null = localStorage.getItem(stateKey);
        if (data === null || state === null) {
            throw new Error('No crossword for type');
        } else {
            return {
                crosswordData: JSON.parse(data),
                crosswordState: JSON.parse(state),
            }
        }
    }
}

export default CrosswordStorage;