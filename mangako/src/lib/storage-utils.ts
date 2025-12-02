export function clearLocalStorage() {
    if (typeof window !== 'undefined') {
        const confirm = window.confirm(
            'Clear all data? This will remove all chapters, ratings, and user data.'
        )
        if (confirm) {
            localStorage.clear()
            window.location.reload()
        }
    }
}

export function getLocalStorageSize() {
    if (typeof window === 'undefined') return '0'
    let total = 0
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length
        }
    }
    return (total / 1024).toFixed(2) // KB
}
