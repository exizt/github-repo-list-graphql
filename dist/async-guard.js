export class AsyncGuard {
    token = 0;
    newToken() {
        const newToken = Date.now();
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
    check = (token) => this.validate(token);
}
