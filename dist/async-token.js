export class AsyncValidate {
    token = 0;
    newToken() {
        let newToken = Date.now();
        this.token = (this.token == newToken) ? newToken * 10 : newToken;
    }
    new = () => this.newToken();
    getToken() {
        return this.token;
    }
    get = () => this.getToken();
    validate(token) {
        return this.token == token;
    }
}
