import { Context, HttpRequest } from '@azure/functions';
import { getRapydClient } from '../core/rapyd/client';
import { createSuccessResponse } from '../core/responses/createResponse';

const COUNTRIES_AND_CURRENCIES = createSuccessResponse(
  'COUNTRIES_AND_CURRENCIES',
  'Retrieved list of all supported countries and currencies.',
);

interface Country {
  id: number;
  name: string;
  iso_alpha2: string;
  iso_alpha3: string;
  currency_code: string;
  currency_name: string;
  currency_sign: string;
  phone_code: string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  numeric_code: string;
  digits_after_decimal_separator: number;
}

const cache = getCountriesAndCurrencies();

async function getCountriesAndCurrencies() {
  const client = await getRapydClient();

  const [countries, currencies] = await Promise.all([
    client.get('/v1/data/countries').then((response) => response.data<Country[], unknown>()),
    client.get('/v1/data/currencies').then((response) => response.data<Currency[], unknown>()),
  ]);

  return {
    countries: countries.map(country => ({ name: country.name, value: country.iso_alpha2 })),
    currencies: currencies.map(currency => ({ name: currency.name, value: currency.code })),
  };
}

export default async function (context: Context, req: HttpRequest) {
  return COUNTRIES_AND_CURRENCIES(await cache);
};
