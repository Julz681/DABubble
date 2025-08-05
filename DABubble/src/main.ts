import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    const splash = document.getElementById('splash-screen');
    const title = document.querySelector('.title');

    setTimeout(() => {
      if (title) title.classList.add('final');
    }, 2200);

    setTimeout(() => {
      if (splash) splash.remove();
    }, 2800);
  })
  .catch((err) => console.error(err));
