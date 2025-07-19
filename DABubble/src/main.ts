import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    // Splash-Screen nach Angular-Bootstrap entfernen
    const splash = document.getElementById('splash-screen');
    if (splash) {
      setTimeout(() => splash.remove(), 3000);
    }
  })
  .catch(err => console.error(err));
