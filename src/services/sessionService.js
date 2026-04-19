const TOKEN_KEY = "codex_token";
const USER_KEY = "codex_user";

const getFromStorage = (storage, key) => storage.getItem(key);

export const getAuthToken = () => {
	return getFromStorage(localStorage, TOKEN_KEY) || getFromStorage(sessionStorage, TOKEN_KEY);
};

export const getAuthUserRaw = () => {
	return getFromStorage(localStorage, USER_KEY) || getFromStorage(sessionStorage, USER_KEY);
};

export const getAuthUser = () => {
	const userRaw = getAuthUserRaw();

	if (!userRaw) {
		return null;
	}

	try {
		return JSON.parse(userRaw);
	} catch (_error) {
		return null;
	}
};

export const saveAuthSession = ({ token, user, recordarSesion }) => {
	const targetStorage = recordarSesion ? localStorage : sessionStorage;
	const otherStorage = recordarSesion ? sessionStorage : localStorage;

	otherStorage.removeItem(TOKEN_KEY);
	otherStorage.removeItem(USER_KEY);

	targetStorage.setItem(TOKEN_KEY, token);
	targetStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
	sessionStorage.removeItem(TOKEN_KEY);
	sessionStorage.removeItem(USER_KEY);
};