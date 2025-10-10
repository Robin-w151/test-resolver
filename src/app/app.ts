import { Component } from '@angular/core';
import { TestResolver } from './test-resolver/test-resolver';

@Component({
  selector: 'app-root',
  imports: [TestResolver],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
