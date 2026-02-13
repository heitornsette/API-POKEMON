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

const botao = document.querySelector("#btnAbrirModal")

async function abrirModalPokemon(nome) {
  const request = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`)
  const pokemon = await request.json()

  const response = await fetch("pokemonModal.html")
  const html = await response.text()

  const container = document.getElementById("modalContainer")
  container.innerHTML = html

  const modal = container.querySelector("dialog")

  modal.querySelector("#nome").innerText = pokemon.name
  modal.querySelector("#altura").innerText = pokemon.height / 10 + " m"
  modal.querySelector("#peso").innerText = pokemon.weight / 10 + " kg"
  modal.querySelector("#imagem").innerHTML =
    `<img src="${pokemon.sprites.front_default}" class="h-32 w-32 object-contain mx-auto my-2 scale-125">`
  modal.querySelector("#numero").innerText =
    `#${String(pokemon.id).padStart(4, "0")}`
  modal.querySelector("#id").innerText =
    `#${String(pokemon.id).padStart(4, "0")}`

  const tiposContainer = modal.querySelector("#tipos")
  const habilidadesContainer = modal.querySelector("#habilidades")
  const fraquezasContainer = modal.querySelector("#fraquezas")

  for (const item of pokemon.abilities) {
    const nomeHabilidades = item.ability.name

    habilidadesContainer.innerHTML += `
        <p class="px-3 py-1 rounded-lg text-slate-700 text-sm uppercase font-bold border border-gray-400">
           ${nomeHabilidades}
        </p>`
  }

  const responseEspecie = await fetch(pokemon.species.url)
  const especie = await responseEspecie.json()

  const textoDescricao = modal.querySelector("#textoDescricao")

  const normalizarTexto = t =>
    (t || "").replace(/\f/g, " ").replace(/\n/g, " ").trim()

  const entryEn = especie.flavor_text_entries.find(
    e => e.language.name === "en",
  )

  textoDescricao.textContent = entryEn
    ? normalizarTexto(entryEn.flavor_text)
    : "No description available."

  const responseEvolution = await fetch(especie.evolution_chain.url)
  const evolutionData = await responseEvolution.json()

  let nomes = []
  let atual = evolutionData.chain

  while (atual) {
    nomes.push(atual.species.name)

    if (!atual.evolves_to || atual.evolves_to.length === 0) break
    atual = atual.evolves_to[0]
  }

  nomes = nomes.slice(0, 3)

  const evolucoes = await Promise.all(
    nomes.map(async nome => {
      const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`)
      const p = await r.json()

      return {
        nome: p.name,
        id: p.id,
        sprite: p.sprites.front_default,
      }
    }),
  )

  for (let i = 1; i <= 3; i++) {
    const img = modal.querySelector(`#evo${i}Img`)
    const nome = modal.querySelector(`#evo${i}Name`)
    const numero = modal.querySelector(`#evo${i}Num`)

    const evo = evolucoes[i - 1]

    if (!evo) {
      if (img) img.src = ""
      if (nome) nome.textContent = ""
      if (numero) numero.textContent = ""
      continue
    }

    if (img) img.src = evo.sprite
    if (nome) nome.textContent = evo.nome
    if (numero) numero.textContent = `#${String(evo.id).padStart(3, "0")}`
  }

  const n = evolucoes.length

  const getSlotWrap = i =>
    modal
      .querySelector(`#evo${i}Img`)
      ?.closest("div.flex.flex-col.items-center")

  let evoRow = null
  {
    const w1 = getSlotWrap(1)
    let el = w1
    while (el && el !== modal) {
      const has1 = el.querySelector?.("#evo1Img")
      const has2 = el.querySelector?.("#evo2Img")
      const has3 = el.querySelector?.("#evo3Img")
      if (has1 && has2 && has3 && el.classList?.contains("flex")) {
        evoRow = el
        break
      }
      el = el.parentElement
    }
  }

  const arrowWraps = evoRow
    ? Array.from(evoRow.children).filter(el => {
        const txt = (el.textContent || "").trim()
        return txt === "→" && el.classList.contains("flex-1")
      })
    : []

  arrowWraps.forEach((wrap, idx) => {
    if (idx < n - 1) wrap.classList.remove("hidden")
    else wrap.classList.add("hidden")

    if (n === 2) {
      wrap.classList.remove("flex-1")
      wrap.classList.add("flex-none")
    } else {
      wrap.classList.remove("flex-none")
      wrap.classList.add("flex-1")
    }
  })

  for (let i = 1; i <= 3; i++) {
    const wrap = getSlotWrap(i)
    if (!wrap) continue
    if (i <= n) wrap.classList.remove("hidden")
    else wrap.classList.add("hidden")
  }

  if (evoRow) {
    evoRow.classList.remove("justify-between", "justify-start", "justify-end")
    evoRow.classList.add("justify-center")

    evoRow.classList.remove(
      "gap-0",
      "gap-2",
      "gap-3",
      "gap-4",
      "gap-5",
      "gap-6",
      "gap-8",
      "gap-10",
      "gap-12",
    )

    if (n === 1) evoRow.classList.add("gap-0")
    else if (n === 2) evoRow.classList.add("gap-12")
    else {
      evoRow.classList.remove("justify-center")
      evoRow.classList.add("justify-between", "gap-6")
    }
  }

  for (const item of pokemon.types) {
    const nomeTipo = item.type.name
    const cor = coresTipos[nomeTipo]

    tiposContainer.innerHTML += `
        <p class="px-3 py-1 rounded-full text-white text-sm uppercase font-bold shadow-md" 
           style="background-color: ${cor}">
           ${nomeTipo}
        </p>`

    const requestTipo = await fetch(
      `https://pokeapi.co/api/v2/type/${nomeTipo}/`,
    )
    const tipoData = await requestTipo.json()

    fraquezasContainer.innerHTML = ""

    tipoData.damage_relations.double_damage_from.forEach(fraqueza => {
      const nomeFraqueza = fraqueza.name
      const corFraqueza = coresTipos[nomeFraqueza]

      fraquezasContainer.innerHTML += `
        <span class="px-3 py-1 rounded-lg text-xs font-bold text-white uppercase m-[2px]" style="background-color: ${corFraqueza}">
          ${fraqueza.name}
        </span>
    `
    })
  }

  const baseStatsContainer = modal.querySelector("#baseStats")

  const nomeStats = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Speed",
  }

  const corStats = {
    hp: "bg-rose-500",
    attack: "bg-orange-500",
    defense: "bg-amber-500",
    "special-attack": "bg-blue-500",
    "special-defense": "bg-emerald-500",
    speed: "bg-pink-500",
  }

  const maxStat = 200

  baseStatsContainer.innerHTML = pokemon.stats
    .map(s => {
      const key = s.stat.name
      const label = nomeStats[key] || key
      const value = s.base_stat
      const pct = Math.min(100, Math.round((value / maxStat) * 100))
      const barClass = corStats[key] || "bg-slate-500"

      return `
      <div class="flex items-center gap-4">
        <p class="w-16 text-xs font-semibold text-slate-500">${label}</p>
        <p class="w-10 text-xs font-bold text-slate-700">${value}</p>
        <div class="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
          <div class="h-full rounded-full ${barClass}" style="width:${pct}%"></div>
        </div>
      </div>
    `
    })
    .join("")

  modal.showModal()
  document.body.style.overflow = "hidden"

  modal.querySelector("#fecharModal").addEventListener("click", () => {
    modal.close()
    document.body.style.overflow = "auto"
  })
}

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
    <div onclick="abrirModalPokemon('${pokemon.name}')" class = " bg-white rounded-3xl py-6 px-4 shadow-sm hover:shadow-md hover:scale-102 transition-all relative flex flex-col justify-between h-auto cursor-pointer">
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
