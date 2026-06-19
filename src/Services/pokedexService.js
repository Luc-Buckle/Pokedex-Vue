export async function laadAllePokemon() {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302')
  const data = await res.json()

  return data.results.map(p => ({
    naam: p.name,
    id: parseInt(p.url.split('/').filter(Boolean).pop())
  }))
}

export async function laadPagina(lijst, paginaNummer) {
  const start = paginaNummer * 12
  const batch = lijst.slice(start, start + 12)

  const resultaten = await Promise.all(
    batch.map(async p => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`)
        if (!res.ok) return null
        return res.json()
      } catch {
        return null
      }
    })
  )

  return resultaten.filter(p => p !== null)
}