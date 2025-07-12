import useAuthStore from "../store/store"
async function FetchWithAuth(url, options = {}) {
    const { jwt, setJwt } = useAuthStore.getState();
    const access = jwt?.access;
    const refresh = jwt?.refresh;
    let response = await fetch(url, {
        ...options,
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${access}`
        },
    })
    if (response.status === 401 && jwt.refresh) {
        const refreshRes = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ refresh: refresh }),
        })
        if (refreshRes.ok) {
            const data = await refreshRes.json()
            console.log("token refreshed")
            setJwt({ access: data.access , refresh: refresh })
            response = await fetch(url, {
                ...options,
                headers: {
                    'content-type': 'application/json',
                    Authorization: `Bearer ${data.access}`
                },
            })
            return response
        } else {
            console.log("token reset")
            setJwt(null)
        }

    }
    return response
}

export default FetchWithAuth