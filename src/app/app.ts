import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestResolver } from './test-resolver/test-resolver';

@Component({
  selector: 'app-root',
  imports: [TestResolver],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
