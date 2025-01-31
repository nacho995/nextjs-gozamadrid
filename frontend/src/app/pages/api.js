export async function getCountryPrefix(data) {
  const response = await fetch('http://localhost:3002/prefix', {
   method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    const countryPrefix = await response.json()
    return countryPrefix
  }

  