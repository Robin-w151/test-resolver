import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { hasNoErrors } from '@robinw151/resolver';
import { debounceTime, switchMap, tap } from 'rxjs';
import { Country } from './test-resolver.interface';
import { TestResolverService } from './test-resolver.service';

@Component({
  selector: 'app-test-resolver',
  imports: [FormsModule],
  templateUrl: './test-resolver.html',
  styleUrl: './test-resolver.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestResolver {
  private readonly testResolverService = inject(TestResolverService);

  protected readonly search = signal('');
  protected readonly country = signal<Country | undefined>(undefined);
  protected readonly isLoading = signal(false);
  protected readonly isError = signal(false);
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

  constructor() {
    const resolver = this.testResolverService.load();
    toObservable(this.search)
      .pipe(
        debounceTime(250),
        tap((search) => {
          this.isLoading.set(!!search);
          this.isError.set(false);
        }),
        switchMap((search) => {
          return resolver.resolve({ globalArgs: { search } });
        }),
        tap((data) => {
          console.log('Data:', data);
          this.isLoading.set(false);
          if (!data.globalArgs.search) {
            this.country.set(undefined);
          } else if (hasNoErrors(data.tasks)) {
            this.country.set(data.tasks.loadCountry.data[0]);
          } else {
            this.isError.set(true);
          }
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }
}
