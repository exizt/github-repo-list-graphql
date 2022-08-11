export async function loadConfig() {
    return fetch("./config.json")
        .then(response => {
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        }
        return response.json();
    });
}
