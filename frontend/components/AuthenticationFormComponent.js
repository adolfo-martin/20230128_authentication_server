import AuthenticationService from '../services/AuthenticationService.js';

export default class AuthenticationFormComponent extends HTMLElement {
    #attachShadow;
    #title;
    #username;
    #template = `
        <style>
            :host {
                font-size: 32px;
                display: inline-grid;
                grid-template-columns: auto auto;
                gap: 0.5em;
            }

            header, button {
                grid-column: 1 / span 2;
            }

            header {
                text-align: center;
            }
            
            label {
                text-align: right;
            }

            button {
                width: fit-content;
                margin: auto;
            }

            .username, .password, button {
                font-family: inherit;
                font-size: inherit;
            }
        </style>

        <header></header>

        <label>Usuario:</label>
        <input type="text" class="username">

        <label>Contraseña:</label>
        <input type="password" class="password">

        <button>Autentificar</button>
    `;


    constructor() {
        super();

        this.#attachShadow = this.attachShadow({ mode: 'open' });
        this.#attachShadow.innerHTML = this.#template;

        this.#setupAuthenticateButton();
    }


    static get observedAttributes() {
        return ['title', 'username'];
    }


    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'title') {
            this.title = newValue;
        } else if (name === 'username') {
            this.username = newValue;
        }
    }


    get title() {
        return this.#title;
    }


    set title(value) {
        this.#title = value;
        const nHeader = this.#attachShadow.querySelector('header');
        nHeader.textContent = value;

    }


    get username() {
        return this.#username;
    }


    set username(value) {
        this.#username = value;
        this.#attachShadow.querySelector('.username').value = value;
    }


    #setupAuthenticateButton() {
        const nButton = this.#attachShadow.querySelector('button');
        const outerThis = this;
        nButton.addEventListener('click', async e => {
            try {
                const service = new AuthenticationService();

                const username = outerThis.#attachShadow.querySelector('.username').value;
                const password = outerThis.#attachShadow.querySelector('.password').value;

                const token = await service.authenticateUsernameAndPasswordAndRetrieveToken(username, password);
                outerThis.#dispatchSuccessfulAuthentication(token);                
            } catch (error) {
                outerThis.#dispatchWrongAuthentication(error.message);
            }
        });
    }


    #dispatchSuccessfulAuthentication(token) {
        const event = new CustomEvent('successfulauthentication', { detail: { token } });
        this.dispatchEvent(event);
    }


    #dispatchWrongAuthentication(message) {
        const event = new CustomEvent('wrongauthentication', { detail: { message } });
        this.dispatchEvent(event);
    }
}


window.customElements.define('authentication-form', AuthenticationFormComponent);