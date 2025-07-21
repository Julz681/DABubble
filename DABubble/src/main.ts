import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    const splash = document.getElementById('splash-screen');
    const title = document.querySelector('.title');

    // ✨ Frühes Anzeigen des Titels (Animation startet bereits im CSS bei 0.8s)
    setTimeout(() => {
      if (title) title.classList.add('final'); // → Wird kleiner & schwarz
    }, 2200); // etwas früher als Splash-Entfernung

    // 🧼 Splash entfernen – leicht später für sanften Übergang
    setTimeout(() => {
      if (splash) splash.remove();
    }, 2800);
  })
  .catch(err => console.error(err));



