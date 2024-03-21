import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';


export default class AuthenticationServer {
    _refreshTokens = [];

    constructor(port, repository) {
        this._port = port;
        this._repository = repository;

        this._app = express();
        this._app.use(cors());
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: true }));

        this._configureRoutes();
    }


    listen() {
        this._app.listen(this._port, () =>
            console.log(`Authentication server is listening on port ${this._port}`)
        );
    }


    _configureRoutes() {
        // this._app.get('/', this._sendMessagePleaseUseOurApi.bind(this));
        this._app.post('/api/login_user', this._loginUser.bind(this));
        this._app.get('/api/validate_token', this._validateToken.bind(this));
        this._app.post('/api/refresh_token', this._refreshToken.bind(this));
        this._app.delete('/api/logout_user', this._deleteUser.bind(this));

        this._app.get('/api/users', this._validateTokenMiddleware.bind(this), this._sendUsers.bind(this));
        // this._app.get('/api/users', this._sendUsers.bind(this));

        this._app.all('*', this._sendMessagePleaseUseOurApi.bind(this));
    }


    _sendMessagePleaseUseOurApi(req, res) {
        res.status(400)
            .send({ ok: false, message: 'Please, use our API' });
    }


    _loginUser(req, res) {
        const username = req.body.username;
        const password = req.body.password;

        if (!this._repository.isValidUserAndPassword(username, password)) {
            setTimeout(
                () => res.status(401).json({ ok: false, message: 'Username or password is wrong' }),
                2000
            )
            return;
        }

        const userAsObject = this._repository.retrieveUserByUsername(username);
        const user = {
            username,
            firstname: userAsObject.firstname,
            lastname: userAsObject.lastname,
        }

        const accessToken = this._generateAccessToken(user);
        const refreshToken = this._generateRefressToken(user);
        this._refreshTokens.push(refreshToken);
        setTimeout(
            () => res.status(201).json({ ok: true, accessToken, refreshToken }),
            2000
        );
    }


    _generateAccessToken(user) {
        return jwt.sign(
            user,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: `${60 * 60 * 4}s` },
        )
    }


    _generateRefressToken(user) {
        return jwt.sign(
            user,
            process.env.REFRESH_TOKEN_SECRET,
        )
    }


    _validateToken(req, res) {
        let token = req.body.token;

        if (!token) {
            token = getBearerToken(req.params.token);
        }

        console.log(token);

        if (!token) {
            res.status(401)
                .json({ ok: false, message: 'There is no token.' });
            return;
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                res.status(401)
                    .json({ ok: false, message: 'The access token is not valid.' });
                return;
            }

            res.status(200)
                .json({ ok: true, message: 'The token is valid' });
        });

        function getBearerToken(req) {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            return token;
        }
    }


    _refreshToken(req, res) {
        const refreshToken = req.body.token;
        if (refreshToken === null) {
            res.status(401)
                .json({ ok: false, message: 'There is no refresh token.' });
            return;
        }

        if (!this._refreshTokens.includes(refreshToken)) {
            res.status(401)
                .json({ ok: false, message: 'The refresh token is not valid.' });
            return;
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                res.status(401)
                    .json({ ok: false, message: 'The refresh token is not valid.' });
                return;
            }

            const accessToken = this._generateAccessToken(user);
            res.status(201)
                .json({ ok: true, accessToken });
        })
    }


    _deleteUser(req, res) {
        refreshToken = req.body.token;
        this._refreshTokens = this._refreshTokens
            .filter(token => token !== refreshToken);
        res.status(204)
            .json({ ok: true, message: 'The token was deleted.' });
    }


    _validateTokenMiddleware(req, res, next) {
        const token = getBearerToken(req);
        if (!token) {
            res.status(401)
                .json({ ok: false, message: 'There is no token.' });
            return;
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                res.status(403)
                    .json({ ok: false, message: 'The access token is not valid.' });
                return;
            }

            req.user = user;
            next();
        })

        function getBearerToken(req) {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            return token;
        }
    }


    _sendUsers(req, res) {
        if (AuthenticationServer._isThereTechnicalProblem()) {
            setTimeout(
                () => res.status(500).json({ ok: false, message: 'Cannot retrieve users from database' }),
                2000
            );
            return;
        }

        const users = this._repository.retrieveUsers();
        setTimeout(
            () => res.status(200).json({ ok: true, users }),
            2000
        );
    }

    static _isThereTechnicalProblem() {
        return Math.random() < 0.5 ? true : false;
    }
}