const setAll = async (mode, state) => {
    const response = await fetch("/api/zones", {
        method: 'PUT',
        body: JSON.stringify({mode: mode, state: state}),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log(response);
    const parsed = await response.json();
    console.log(parsed);
};
