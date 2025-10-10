import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { hasNoErrors } from '@robinw151/resolver';
import { debounceTime, of } from 'rxjs';
import { TestResolverService } from './test-resolver.service';

@Component({
  selector: 'app-test-resolver',
  imports: [FormsModule],
  templateUrl: './test-resolver.html',
  styleUrl: './test-resolver.css',
})
export class TestResolver {
  private readonly testResolverService = inject(TestResolverService);
  private readonly testResolver = this.testResolverService.load();

  protected readonly search = signal('');
  protected readonly countryResource = rxResource({
    params: () => {
      return { search: this.search() };
    },
    stream: ({ params }) => {
      const { search } = params;
      if (!search) {
        return of(undefined);
      }

      return this.testResolver.resolve({ globalArgs: { search } }).pipe(debounceTime(250));
    },
  });

  protected readonly isLoading = computed(() => this.countryResource.isLoading());
  protected readonly isError = computed(() => {
    if (this.countryResource.error()) {
      return true;
    }

    const countryResource = this.countryResource.value();
    return !!(countryResource && !hasNoErrors(countryResource.tasks));
  });
  protected readonly country = computed(() => {
    const countryResource = this.countryResource.value();
    return countryResource && hasNoErrors(countryResource.tasks)
      ? countryResource.tasks.loadCountry.data[0]
      : undefined;
  });
  protected readonly text = computed(() => {
    const object = this.country();
    const objectLoading = this.isLoading();
    const objectError = this.isError();

    if (objectLoading) {
      return 'Loading...';
    }

    if (objectError) {
      return 'Error.';
    }

    if (!object) {
      return '';
    }

    return JSON.stringify(object, null, 2);
  });
}
