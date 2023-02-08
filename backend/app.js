import dotenv from 'dotenv';
import AuthenticationServer from './AuthenticationServer.js';
import UsersRepository from './UsersRepository.js';

dotenv.config();

const repository = new UsersRepository();
const server = new AuthenticationServer(process.env.SERVER_PORT || 8081, repository);
server.listen();