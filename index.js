function buscarPokemons(menssagem) {
    let pokedex = document.querySelector("#pokedex")

    fetch(`https://pokeapi.co/api/v2/pokemon/${menssagem}`)
    .then(nome => nome.json())
    .then(json => {
        console.log(json)

        let tipo2 = ""
        if(json.types.length > 1){
            tipo2 = `<div>Type 2: <span>${json.types[1].type.name}</span></div>`
        }

        pokedex.innerHTML = `
        <div>Nome: <span>${json.name}</span></div>
        <div>Id: <span>${json.id}</span></div>
        <div>Height: <span>${json.height}</span></div>
        <div>Type: <span>${json.types[0].type.name}</span></div>
        ${tipo2}
        `

    })
}