import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { isError, Resolver } from '@robinw151/resolver';
import { Country, CountryBase } from './test-resolver.interface';

@Injectable({
  providedIn: 'root',
})
export class TestResolverService {
  private readonly httpClient = inject(HttpClient);

  load() {
    const resolver = new Resolver({ search: '' })
      .register({
        id: 'loadCountries',
        fn: (_, { search }) => {
          if (!search) {
            return [];
          }

          return this.httpClient.get<CountryBase[]>('https://restcountries.com/v3.1/all', {
            params: {
              fields: 'cca2,cca3,name',
            },
          });
        },
      })
      .register(
        {
          id: 'loadCountry',
          fn: ({ loadCountries }, { search }) => {
            if (isError(loadCountries)) {
              throw loadCountries.error;
            }

            const country = loadCountries.data
              .map(({ cca2, cca3, name }) => {
                if (cca2.toLowerCase().includes(search.toLowerCase())) {
                  return { cca2, weight: 3 };
                }
                if (cca3.toLowerCase().includes(search.toLowerCase())) {
                  return { cca2, weight: 2 };
                }
                if (name.common.toLowerCase().includes(search.toLowerCase())) {
                  return { cca2, weight: 1 };
                }
                if (
                  Object.values(name.nativeName).some((nativeName) =>
                    nativeName.common.toLowerCase().includes(search.toLowerCase())
                  )
                ) {
                  return { cca2, weight: 1 };
                }
                return undefined;
              })
              .filter((country) => country !== undefined)
              .sort((a, b) => b.weight - a.weight)[0];

            if (!country) {
              throw new Error(`Country not found with search ${search}`);
            }

            return this.httpClient.get<Country[]>(
              `https://restcountries.com/v3.1/alpha/${country.cca2}`
            );
          },
        },
        ['loadCountries']
      );

    return resolver;
  }
}
