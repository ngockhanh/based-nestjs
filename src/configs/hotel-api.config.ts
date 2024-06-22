export type HotelApiConfig = {
  baseUrl: string,
  apiKey: string,
  auth: string,
  version: string,
};

/**
 * Hard coded constant since the implementation
 * will likely change if this version change.
 */
export const VERSION = '2023-08';

export default () => ({
  baseUrl: process.env.HOTEL_API_URL,
  apiKey: process.env.HOTEL_API_KEY,
  auth: process.env.HOTEL_API_AUTH,
  version: VERSION,
});
