export type Sex = 'male' | 'female';

export type PersonInput = { fullName: string; sex: Sex; birthDate: Date };
export type PersonId = number;
export type PersonDto = { id: PersonId } & PersonInput;
