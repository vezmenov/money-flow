import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import './styles.css';

const buildInfo = {
  version: String(import.meta.env.VITE_BUILD_VERSION ?? 'dev'),
  builtAt: String(import.meta.env.VITE_BUILD_TIME ?? 'unknown'),
};

console.info(`[money-flow] build ${buildInfo.version} (${buildInfo.builtAt})`);
(globalThis as typeof globalThis & { __MONEY_FLOW_BUILD__?: typeof buildInfo }).__MONEY_FLOW_BUILD__ =
  buildInfo;

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes, withHashLocation())],
}).catch((error) => {
  console.error(error);
});
