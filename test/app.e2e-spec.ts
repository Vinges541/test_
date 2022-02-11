import { config } from 'dotenv';

config();

import * as request from 'supertest';
import { Server, createServer } from 'http';
import { router } from '../src/router';
import { personService } from '../src/person.service';
import { Sex } from '../src/person';
import { databaseService } from '../src/database.service';

describe('AppController (e2e)', () => {
  let app: Server;
  const person: { fullName: string; sex: Sex; birthDate: string } = {
    fullName: 'John Doe',
    sex: 'male',
    birthDate: new Date().toISOString(),
  };
  const changed = {
    fullName: 'Changed',
    sex: 'female',
    birthDate: new Date().toISOString(),
  };
  let myId: number;

  beforeAll(async () => {
    app = createServer(router);
    myId = await personService.create(
      Object.assign({}, person, { birthDate: new Date(person.birthDate) }),
    );
  });

  afterAll(async () => {
    await databaseService.close();
    app.close();
  });

  it('should return array of persons', (done) => {
    request(app)
      .get('/api/person')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body).toEqual(
          expect.arrayContaining([
            Object.assign({}, person, { id: expect.anything() }),
          ]),
        );
        done();
      });
  });

  it('should return unprocessable entity', (done) => {
    request(app)
      .post('/api/person')
      .send({ fullName: 'asd', sex: 'malformed' })
      .expect(422, done);
  });

  it('should create person', (done) => {
    request(app)
      .post('/api/person')
      .send(person)
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        expect(res.body.id).toBeDefined();
        expect(res.body.id).toEqual(expect.any(Number));
        done();
      });
  });

  it('should update person', (done) => {
    request(app).put(`/api/person/${myId}`).send(changed).expect(200, done);
  });

  it('should show person changes', (done) => {
    request(app)
      .get(`/api/person/${myId}`)
      .send(person)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        expect(res.body).toMatchObject(changed);
        done();
      });
  });

  it('should delete person', (done) => {
    request(app).delete(`/api/person/${myId}`).send(person).expect(204, done);
  });

  it('should show person absence', (done) => {
    request(app).get(`/api/person/${myId}`).send(person).expect(404, done);
  });
});
