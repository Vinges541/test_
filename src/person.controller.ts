import { IncomingMessage, ServerResponse } from 'http';
import { PersonInput } from './person';
import { PersonNotFoundError, personService } from './person.service';

class UnprocessableEntityError extends Error {
  constructor(message?: string) {
    super(message);

    Object.setPrototypeOf(this, UnprocessableEntityError.prototype);
  }
}

class PersonController {
  private parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          resolve(JSON.parse(body));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private static parsePersonInput(body: any) {
    if (typeof body !== 'object' || body === null) {
      throw new UnprocessableEntityError();
    }
    let personInput: PersonInput;
    try {
      personInput = {
        fullName: body.fullName,
        sex: body.sex,
        birthDate: new Date(body.birthDate),
      };
    } catch (error) {
      throw new UnprocessableEntityError();
    }
    if (
      Object.values(personInput).includes(undefined) ||
      !(personInput.sex === 'male' || personInput.sex === 'female')
    ) {
      throw new UnprocessableEntityError();
    }
    return personInput;
  }

  private static sendJSONResponse(
    res: ServerResponse,
    statusCode: number,
    obj: any,
  ) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
  }

  private static sendResponse(res: ServerResponse, statusCode: number) {
    res.writeHead(statusCode);
    res.end();
  }

  async findAll(res: ServerResponse) {
    PersonController.sendJSONResponse(res, 200, await personService.findAll());
  }

  async findOne(req: IncomingMessage, res: ServerResponse) {
    const personId = Number(req.url.split('/')[3]);
    try {
      PersonController.sendJSONResponse(
        res,
        200,
        await personService.findOne(personId),
      );
    } catch (error) {
      if (error instanceof PersonNotFoundError) {
        PersonController.sendResponse(res, 404);
      } else {
        throw error;
      }
    }
  }

  async create(req: IncomingMessage, res: ServerResponse) {
    let personInput: PersonInput;
    try {
      const body = await this.parseBody(req);
      personInput = PersonController.parsePersonInput(body);
    } catch (error) {
      if (error instanceof UnprocessableEntityError) {
        PersonController.sendResponse(res, 422);
        return;
      }
      throw error;
    }

    PersonController.sendJSONResponse(res, 201, {
      id: await personService.create(personInput),
    });
  }

  async update(req: IncomingMessage, res: ServerResponse) {
    const personId = Number(req.url.split('/')[3]);
    let personInput: PersonInput;
    try {
      const body = await this.parseBody(req);
      personInput = PersonController.parsePersonInput(body);
    } catch (error) {
      if (error instanceof UnprocessableEntityError) {
        PersonController.sendResponse(res, 422);
        return;
      }
      throw error;
    }
    await personService.update({ id: personId, ...personInput });
    PersonController.sendResponse(res, 200);
  }

  async delete(req: IncomingMessage, res: ServerResponse) {
    const personId = Number(req.url.split('/')[3]);
    PersonController.sendJSONResponse(
      res,
      204,
      await personService.delete(personId),
    );
  }
}

export const personController = new PersonController();
