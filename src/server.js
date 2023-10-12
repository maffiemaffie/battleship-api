const http = require('http');
const url = require('url');
const query = require('querystring');

const jsonHandler = require('./jsonResponses.js');
const htmlHandler = require('./htmlResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/index.js': htmlHandler.getIndexJS,
    '/configure-battleships.js': htmlHandler.getConfigureBattleshipsJS,
    '/boardTemplate': jsonHandler.getBoardTemplate,
    '/battleshipTemplate': jsonHandler.getBattleshipTemplate,
    '/status': jsonHandler.getStatus,
    '/data': jsonHandler.getGameData,
    notFound: jsonHandler.getNotFound,
  },
  HEAD: {
    '/boardTemplate': jsonHandler.getBoardTemplateMeta,
    '/battleshipTemplate': jsonHandler.getBattleshipTemplateMeta,
    '/status': jsonHandler.getStatusMeta,
    '/data': jsonHandler.getGameDataMeta,
    notFound: jsonHandler.getNotFoundMeta,
  },
  POST: {
    '/new': jsonHandler.createGame,
    '/join': jsonHandler.joinGame,
    '/ready': jsonHandler.setBattleships,
    '/shoot': jsonHandler.shootTarget,
    notFound: jsonHandler.getNotFoundMeta,
  },
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);

  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    let bodyJson = {};

    if (body.length !== 0) {
      const bodyString = Buffer.concat(body).toString();
      bodyJson = JSON.parse(bodyString);
    }

    if (!urlStruct[request.method]) {
      return urlStruct.HEAD.notFound(request, response);
    }

    if (urlStruct[request.method][parsedUrl.pathname]) {
      return urlStruct[request.method][parsedUrl.pathname](request, response, params, bodyJson);
    }

    return urlStruct[request.method].notFound(request, response);
  });
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
