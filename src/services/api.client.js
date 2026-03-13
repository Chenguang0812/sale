export async function apiClient(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(data?.message || 'API request failed')
    }

    return data
}