import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  projectId: 'dabubble-f0c5b',
  appId: '1:681646405483:web:ca06fd189a73328e9f7e2e',
  storageBucket: 'dabubble-f0c5b.appspot.com',
  apiKey: 'AIzaSyDose1H_0Pbm__bAvyddd5XgWqoTX1MocE',
  authDomain: 'dabubble-f0c5b.firebaseapp.com',
  messagingSenderId: '681646405483',
};

initializeApp(firebaseConfig);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
