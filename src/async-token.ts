/**
 * 비동기 호출이 연속적으로 발생했을 때, 최종것만 동작되도록 검증하는 클래스
 */
export class AsyncValidate {
    token = 0

    newToken(){
        let newToken = Date.now()
        
        // token 중복 방지 (필요한지는..혹시 모르니..)
        this.token = (this.token == newToken) ? newToken * 10 : newToken
    }

    new = () => this.newToken()

    getToken(){
        return this.token
    }

    get = () => this.getToken()

    validate(token:number){
        return this.token == token
    }
}