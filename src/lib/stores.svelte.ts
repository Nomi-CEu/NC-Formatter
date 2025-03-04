import { type Data } from './data';

interface Store {
	rawText: string;
	data: Data | undefined;
}

const store = $state({
	rawText: '',
	data: undefined
} as Store);

export default store;
