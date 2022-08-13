/**
 * 비동기 호출이 연속적으로 발생했을 때, 최종것만 동작되도록 검증하는 클래스
 * 비동기 호출 자체를 멈추지는 못하고, output 처리할 때 정도는 중복 방지할 수 있음.
 */
export class AsyncGuard {
    token = 0

    newToken() {
        let newToken = Date.now()

        // token 중복 방지 (필요한지는..혹시 모르니..)
        this.token = (this.token == newToken) ? newToken * 10 : newToken
    }

    new = () => this.newToken()

    getToken() {
        return this.token
    }

    get = () => this.getToken()

    validate(token: number) {
        return this.token == token
    }

    check = (token: number) => this.validate(token)
}