import { User } from './interface';

export const admin: User = {
  id: 1,
  firstName: 'Aina',
  lastName: 'ANDRIA',
  name: 'Aina ANDRIA',
  email: 'aina@gmail.com',
  avatar: 'images/avatar.jpg',
};

export const guest: User = {
  firstName: 'Guest',
  lastName: '',
  name: 'unknown',
  email: 'unknown',
  photo: null,
};
