export const environment = {
  production: false,
  // baseUrl: 'https://localhost:44387',//for real api
  baseUrl: 'http://localhost:4200',
  useMocks: true// Set to TRUE when you want MSW, FALSE for Live API
};

/* to change for real api to msw
first : in envinment.development
1-baseUrl => http://localhost:4200
2-useMocks: true

second : in angular.json
3-  "ssl": false

4-ng serve -o
*/

/* to change for msw  to real api
first : in envinment.development
1-baseUrl => https://localhost:44387
2-useMocks: false

second : in angular.json
3-  "ssl": false

4-ng serve -o
*/
