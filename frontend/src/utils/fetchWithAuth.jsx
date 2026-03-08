import useAuthStore from "../store/store"
async function FetchWithAuth(url, options = {}) {
    const { jwt, setJwt } = useAuthStore.getState();
    const access = jwt?.access;
    const refresh = jwt?.refresh;
    const headers = { ...(options.headers || {}) };
    if (access) {
        headers['Authorization'] = `Bearer ${access}`;
    }
    
    if (!(options.body instanceof FormData) && !headers['content-type']) {
        headers['content-type'] = 'application/json';
    }

    let response = await fetch(url, {
        ...options,
        headers: headers,
    })
    if (response.status === 401 && jwt.refresh) {
        const refreshRes = await fetch('https://dottech-blog-app.onrender.com/api/token/refresh/', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ refresh: refresh }),
        })
        if (refreshRes.ok) {
            const data = await refreshRes.json()
            console.log("token refreshed")
            setJwt({ access: data.access , refresh: refresh })
            
            const retryHeaders = {
                Authorization: `Bearer ${data.access}`,
                ...(options.headers || {})
            };
            if (!(options.body instanceof FormData) && !retryHeaders['content-type']) {
                retryHeaders['content-type'] = 'application/json';
            }

            response = await fetch(url, {
                ...options,
                headers: retryHeaders,
            })
            return response
        } else {
            console.log("token reset")
            setJwt(null)
            window.location.href = '/login';
        }

    } else if (response.status === 401 && !jwt?.refresh) {
        setJwt(null);
        window.location.href = '/login';
    }
    return response
}

export default FetchWithAuth