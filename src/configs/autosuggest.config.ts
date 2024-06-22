export type AutosuggestConfig = {
  baseUrl: string,
  apiKey: string,
};

export default () => ({
  baseUrl: process.env.AUTOSUGGEST_BASE_URL,
  apiKey: process.env.AUTOSUGGEST_API_KEY,
});
