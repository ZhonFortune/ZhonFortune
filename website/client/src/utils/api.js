const API_BASE =
	import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : '/api';

async function request(path, options = {}) {
	const resp = await fetch(`${API_BASE}${path}`, {
		headers: { "Content-Type": "application/json", ...(options.headers || {}) },
		...options,
	});

	if (!resp.ok) {
		const text = await resp.text();
		throw new Error(`API ${path} failed: ${resp.status} ${text}`);
	}

	return resp.json();
}

export const fetchSettings = () => request("/stack/settings");
export const fetchHome = () => request("/stack/home");
export const fetchSocial = () => request("/stack/social");
export const fetchProjects = () => request("/stack/projects")

export default {
	fetchSettings,
	fetchHome,
	fetchSocial,
};
