import { RequestListener } from 'http';
import { personController } from './person.controller';

export const router: RequestListener = async function (req, res) {
  try {
    if (req.url === '/api/person') {
      switch (req.method) {
        case 'GET':
          await personController.findAll(res);
          break;
        case 'POST':
          await personController.create(req, res);
          break;
        default:
          res.writeHead(404);
          res.end();
      }
    } else if (req.url.match(/\/api\/person\/([a-zA-Z0-9]+)/)) {
      switch (req.method) {
        case 'GET':
          await personController.findOne(req, res);
          break;
        case 'PUT':
          await personController.update(req, res);
          break;
        case 'DELETE':
          await personController.delete(req, res);
          break;
        default:
          res.writeHead(404);
          res.end();
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  } catch (error) {
    res.writeHead(500);
    res.end();
  }
};
