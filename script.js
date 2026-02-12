const coresTipos = {
  grass: "var(--color-grass)",
  poison: "var(--color-poison)",
  fire: "var(--color-fire)",
  water: "var(--color-water)",
  bug: "var(--color-bug)",
  normal: "var(--color-normal)",
  electric: "var(--color-electric)",
  ground: "var(--color-ground)",
  fairy: "var(--color-fairy)",
  fighting: "var(--color-fighting)",
  psychic: "var(--color-psychic)",
  rock: "var(--color-rock)",
  ghost: "var(--color-ghost)",
  ice: "var(--color-ice)",
  dragon: "var(--color-dragon)",
  steel: "var(--color-steel)",
  dark: "var(--color-dark)",
  flying: "var(--color-flying)",
}

let proximaUrl = null
let AnteriorUrl = null
let urlAtual = "https://pokeapi.co/api/v2/pokemon"
let ordemAtual = "asc"

function definirOrdem(ordem) {
  ordemAtual = ordem
  puxarPokemons(urlAtual)
}

async function buscarTipos(tipo) {
  const request = await fetch(`https://pokeapi.co/api/v2/type/${tipo}/`)
  const response = await request.json()

  atualizarTitulo(`Type: ${response.name}`)

  listarPokemons(response.pokemon, true)
}

async function puxarPokemons(
  url = "https://pokeapi.co/api/v2/pokemon",
  buscarEspeciais = false,
) {
  const request = await fetch(url)
  const response = await request.json()

  urlAtual = url
  proximaUrl = response.next
  AnteriorUrl = response.previous

  const listaDePokemons = response.results
  listarPokemons(listaDePokemons, false, buscarEspeciais)

  atualizarContador(url, response.count, listaDePokemons.length)
}

async function listarPokemons(
  arraysDePokemons,
  buscarPorTipo = false,
  buscarEspeciais = false,
) {
  let pokedex = document.querySelector("#pokedex")
  pokedex.innerHTML = ""

  const promessas = arraysDePokemons.map(async pokemon => {
    let url = buscarPorTipo ? pokemon.pokemon.url : pokemon.url
    const request = await fetch(url)
    const response = await request.json()

    if (!buscarEspeciais && response.id > 1025) {
      return
    }

    return await response
  })

  const pokemonsDetalhados = await Promise.all(promessas)
  const pokemonsValidos = pokemonsDetalhados.filter(Boolean)

  if (ordemAtual === "desc") {
    pokemonsValidos.sort((a, b) => b.id - a.id)
  } else {
    pokemonsValidos.sort((a, b) => a.id - b.id)
  }

  pokemonsValidos.forEach(pokemon => {
    renderizarCardPokemon(pokemon)
  })
}

function renderizarCardPokemon(pokemon) {
  let pokedex = document.querySelector("#pokedex")

  let tiposHtml = ""

  pokemon.types.forEach(item => {
    const nomeTipo = item.type.name
    const cor = coresTipos[nomeTipo]

    tiposHtml += `
        <p class="px-2 py-1 rounded-md text-white text-xs uppercase" 
           style="background-color: ${cor}">
           ${nomeTipo}
        </p>`
  })

  const imagem = pokemon.sprites.front_default

  const imagemHtml = imagem
    ? `<img src="${imagem}" class="h-32 w-32 object-contain mx-auto my-2 scale-125">`
    : `<div class="h-32 w-32 flex items-center justify-center mx-auto my-2 text-gray-400 text-xs"> Pokémon without image </div>`

  pokedex.innerHTML += `
    <div class = " bg-white rounded-3xl py-6 px-4 shadow-sm hover:shadow-md hover:scale-102 transition-all relative flex flex-col justify-between h-auto cursor-pointer">
      <div class= 'flex justify-between'>
        <p class="text-gray-400 font-bold text-sm">#${String(pokemon.id).padStart(4, "0")}</p>
        <button class="cursor-pointer" onclick="favoritarPokemon()">
          <box-icon name='heart' color='#9ca3af' ></box-icon>
        </button>
        
      </div>
      ${imagemHtml}
      <div>
        <p class = 'font-bold text-xl capitalize mb-2 text-gray-800'>${pokemon.name}</p>
        <div class = 'flex gap-2 font-bold'>${tiposHtml}</div>
      </div>
    </div>
    `
}

puxarPokemons()

function atualizarContador(url, total, quantidadeAtual) {
  const contadorPokemon = document.querySelector("#contadorPokemons")

  const urlObj = new URL(url)
  const offSet = Number(urlObj.searchParams.get("offset")) || 0

  const inicio = offSet + 1
  const fim = offSet + quantidadeAtual

  contadorPokemon.innerHTML = `Showing ${inicio}-${fim} of ${total} pokémons`
}

function atualizarTitulo(texto) {
  const titulo = document.querySelector("#titulo")
  titulo.innerHTML = texto
}

async function proximosPokemons() {
  if (proximaUrl) {
    await puxarPokemons(proximaUrl)
  }
}
async function anterioresPokemons() {
  if (AnteriorUrl) {
    await puxarPokemons(AnteriorUrl)
  }
}

async function pesquisarPokemons(key, nome) {
  if (key === 13) {
    const request = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`)
    const response = await request.json()

    pokedex.innerHTML = ""

    renderizarCardPokemon(response)
  }
}

async function filtrarGeracao(inicio, fim, buscarEspeciais = false) {
  atualizarTitulo(`Gen ${inicio} - ${fim}`)
  const limit = fim - inicio + 1
  const offset = inicio - 1

  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`

  await puxarPokemons(url, buscarEspeciais)
}

async function filtrarCor(cor) {
  const request = await fetch(`https://pokeapi.co/api/v2/pokemon-color/${cor}/`)
  const response = await request.json()

  atualizarTitulo(`Color: ${response.name}`)

  let specieList = response.pokemon_species

  const pokemonUrlList = await Promise.all(
    specieList.map(async species => {
      const speciesRes = await fetch(species.url)
      const speciesData = await speciesRes.json()

      const def =
        speciesData.varieties.find(v => v.is_default) ||
        speciesData.varieties[0]
      return {
        url: def.pokemon.url,
      }
    }),
  )

  listarPokemons(pokemonUrlList)
}
