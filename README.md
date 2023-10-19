# battleship-api
[![maffiemaffie](https://circleci.com/gh/maffiemaffie/battleship-api.svg?style=shield)](https://app.circleci.com/pipelines/github/maffiemaffie/battleship-api) 🚢⛴️🛥️🛳️🚤  

Online multiplayer battleship :)

## Let me play 🛳️
The code is currently being hosted [here](https://battleship-api-37b96d1716ba.herokuapp.com)!  
Just start a game, send your friend the game id and you're good to go.

## Let me host it myself 🚢
You can do that as well, just clone the repo. You can rebuild it yourself (compiles the typescript and bundles it with the rest of the server code), but the repo also includes the already built [dist](/dist/) directory which the `start` command uses to start the server.
```bash
npm install
npm start
```

## Let me build it myself ⛴️
Ok sure. You'll need the usual webpack and typescript dependencies. When you're ready to build, use:
```
npm run buildBundle
```

## Let me steal your API 🚤
You can :)  
All the API code is in the [src](/src/) folder:
```
src
├── battleship.ts
├── htmlResponses.js
├── jsonResponses.js
└── server.js
```
- [`battleship.ts`](/src/battleship.ts) is the battleship game logic. This can work on it's own without an API.  
- [`htmlResponses.js`](/src/htmlResponses.js) just serves to load the assets in my [client](/client/) folder. It probably won't be useful other than as an example of how to use the API.
- [`jsonResponses.js`](/src/jsonResponses.js) provides all the guts of the API, linking all the endpoints to the game logic. In this example, player data is stored in server memory. You may consider using a database in your implementation.
- [`server.js`](/src/server.js) starts the server and directs API calls to the two files listed above.

## Let me see your awesome API documentation :) 🛥️
[Well if you insist 😳](/docs/api-docs.md)
