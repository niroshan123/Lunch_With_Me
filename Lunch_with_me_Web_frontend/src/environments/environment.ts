// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
const BASE_URL = 'http://localhost:8080';

export const environment = {
  production: false,
  chatUrl: BASE_URL,
  backendUrl: BASE_URL,
   firebase: {
    apiKey: "AIzaSyAkNZFuzIva8UL4GNmCtUN9OUEQB1CxFBI",
    authDomain: "notification-fde31.firebaseapp.com",
    databaseURL: "https://notification-fde31.firebaseio.com",
    projectId: "notification-fde31",
    storageBucket: "notification-fde31.appspot.com",
    messagingSenderId: "171776216197",
    appId: "1:171776216197:web:627b266a885883b0"
  }
};
