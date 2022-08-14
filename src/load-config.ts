/**
 * json으로 설정한 Config 값 조회하기
 * @returns any
 */
export async function loadConfig(path='./config.json') {
    return fetch(path)
        .then(response => {
            if (!response.ok) {
                const message = `An error has occured: ${response.status}`
                throw new Error(message)
            }
            return response.json()
        })
}