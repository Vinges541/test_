import { databaseService } from './database.service';
import { PersonDto, PersonId, PersonInput } from './person';

export class PersonNotFoundError extends Error {
  constructor(message?: string) {
    super(message);

    Object.setPrototypeOf(this, PersonNotFoundError.prototype);
  }
}

class PersonService {
  async findAll(): Promise<PersonDto[]> {
    return await databaseService.executeQuery(`select id,
                                                          full_name  as "fullName",
                                                          sex,
                                                          birth_date as "birthDate"
                                                   from insys.person`);
  }

  async findOne(personId: PersonId): Promise<PersonDto> {
    const result = await databaseService.executeQuery(
      `select id,
                    full_name  as "fullName",
                    sex,
                    birth_date as "birthDate"
             from insys.person
             where id = $1`,
      [personId],
    );
    if (result.length == 1) {
      return result[0];
    }
    throw new PersonNotFoundError();
  }

  async create(person: PersonInput): Promise<number> {
    const result = await databaseService.executeTransaction(
      `insert into insys.person (full_name, sex, birth_date)
             values ($1, $2, $3) returning id`,
      [person.fullName, person.sex, person.birthDate],
    );
    return result.rows[0].id;
  }

  async update(person: PersonDto) {
    const affectedRows = (
      await databaseService.executeTransaction(
        `update insys.person
                 set (full_name, sex, birth_date) = ($1, $2, $3)
                 WHERE id = $4`,
        [person.fullName, person.sex, person.birthDate, person.id],
      )
    ).rowCount;
    if (affectedRows !== 1) {
      throw new PersonNotFoundError();
    }
  }

  async delete(personId: PersonId) {
    const affectedRows = (
      await databaseService.executeTransaction(
        `delete
                 from insys.person
                 where id = $1`,
        [personId],
      )
    ).rowCount;
    if (affectedRows !== 1) {
      throw new PersonNotFoundError();
    }
  }
}

export const personService = new PersonService();
