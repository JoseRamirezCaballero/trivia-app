const bodyTag = document.querySelector('#bodytag')

async function obtenerCategorias(apiURL) {
    try {
        const response = await fetch(apiURL)
        if (!response.ok) {
            throw new Error('Error en la respuesta')
        }
        const data = await response.json()

        const selectElement = document.querySelector('#categorias')

        data.trivia_categories.forEach((categoria) => {
            const option = document.createElement('option')
            option.value = categoria.id
            option.textContent = categoria.name
            selectElement.appendChild(option)
        })

    } catch (error) {
        console.log(error)
    }
}
obtenerCategorias('https://opentdb.com/api_category.php')

async function generarTrivia(apiURL) {
    try {
        const response = await fetch(apiURL)
        if (!response.ok) {
            throw new Error('Error en la respuesta')
        }
        const data = await response.json()
        return data.results
    } catch (error) {
        console.log(error)
    }
}

const formTrivia = document.querySelector('#formTrivia')
const submitButton = formTrivia.querySelector('button[type="submit"]');
const inputCategoria = document.querySelector('#categorias')
const inputDificultad = document.querySelector('#dificultad')
const inputTipo = document.querySelector('#tipo')

const seccionSeleccion = document.querySelector('#seccionSeleccion')
const seccionTrivia = document.querySelector('#seccionTrivia')
formTrivia.addEventListener('submit', async (event) => {
    event.preventDefault()
    submitButton.disabled = true
    let api = 'https://opentdb.com/api.php?amount=10'

    const categoriaSeleccionada = inputCategoria.value
    const dificultadSeleccionada = inputDificultad.value
    const tipoSeleccionado = inputTipo.value

    if (categoriaSeleccionada !== 'any_category') {
        api += `&category=${categoriaSeleccionada}`
    }

    if (dificultadSeleccionada !== 'any_difficulty') {
        api += `&difficulty=${dificultadSeleccionada}`
    }

    if (tipoSeleccionado !== 'any_type') {
        api += `&type=${tipoSeleccionado}`
    }

    const trivia = await generarTrivia(api)

    crearPreguntas(trivia)

    seccionSeleccion.classList.add('hidden')
    seccionTrivia.classList.remove('hidden')
    bodyTag.classList.remove('overflow-hidden')
})

const puntajeModal = document.querySelector('#puntaje-modal')
const mensajeFinal = document.querySelector('#mensajeFinal')
const labelPuntaje = document.querySelector('#labelPuntaje')
function crearPreguntas(trivia) {
    const contenedor = document.createElement('form')
    contenedor.classList.add('py-8', 'px-24', 'mx-auto', 'max-w-screen-xl', 'lg:py-16', 'h-screen')
    contenedor.id = 'formQuestion'
    trivia.forEach((pregunta, index) => {
        const contenedorPregunta = document.createElement('div')
        contenedorPregunta.classList.add('bg-gray-800', 'border', 'border-gray-700', 'rounded-lg', 'p-8', 'md:p-12', 'mb-8')
        contenedor.appendChild(contenedorPregunta)

        const spanCategoria = document.createElement('span')
        spanCategoria.classList.add('bg-purple-900', 'text-purple-300', 'text-xs', 'font-medium', 'mr-2', 'px-2.5', 'py-0.5', 'rounded', 'inline-flex', 'mb-2')
        spanCategoria.textContent = pregunta.category
        contenedorPregunta.appendChild(spanCategoria)

        const spanDificultad = document.createElement('span')
        spanDificultad.classList.add('text-xs', 'font-medium', 'mr-2', 'px-2.5', 'py-0.5', 'rounded', 'inline-flex', 'mb-2')
        if (pregunta.difficulty === 'easy') {
            spanDificultad.classList.add('bg-blue-900', 'text-blue-300')
            spanDificultad.textContent = 'Easy'
        }
        if (pregunta.difficulty === 'medium') {
            spanDificultad.classList.add('bg-yellow-900', 'text-yellow-300')
            spanDificultad.textContent = 'Medium'
        }
        if (pregunta.difficulty === 'hard') {
            spanDificultad.classList.add('bg-red-900', 'text-red-300')
            spanDificultad.textContent = 'Hard'
        }
        contenedorPregunta.appendChild(spanDificultad)

        const textoPregunta = document.createElement('h1')
        textoPregunta.classList.add('text-white', 'text-2xl', 'font-bold', 'mb-4')
        textoPregunta.textContent = pregunta.question
        contenedorPregunta.appendChild(textoPregunta)

        const opcionesRespuesta = [...pregunta.incorrect_answers, pregunta.correct_answer];
        mezclarOpciones(opcionesRespuesta)
        opcionesRespuesta.forEach((opcion, opcionIndex) => {
            const input_container = document.createElement('div');
            input_container.classList.add('flex', 'items-center', 'mb-2');
            contenedorPregunta.appendChild(input_container);

            const input_radio = document.createElement('input');
            input_radio.id = `radioOption${index}${opcionIndex}`;
            input_radio.type = 'radio';
            input_radio.value = opcion;
            input_radio.name = `opcion${index}`;
            input_radio.required = true
            input_radio.classList.add('w-4', 'h-4', 'text-blue-600', 'focus:ring-blue-600', 'ring-offset-gray-800', 'focus:ring-2', 'bg-gray-700', 'border-gray-600');
            input_container.appendChild(input_radio);

            const label = document.createElement('label');
            label.htmlFor = `radioOption${index}${opcionIndex}`;
            label.classList.add('ml-2', 'text-sm', 'font-medium', 'text-gray-300');
            label.textContent = opcion;
            input_container.appendChild(label);
        });

        seccionTrivia.appendChild(contenedor)
    })

    const botonSubmit = document.createElement('button');
    botonSubmit.type = 'submit';
    botonSubmit.classList.add('py-3', 'px-5', 'text-sm', 'font-medium', 'text-white', 'rounded-lg', 'bg-blue-800', 'w-full', 'hover:bg-blue-900', 'mb-8');
    botonSubmit.textContent = 'Resultado';
    contenedor.appendChild(botonSubmit);

    contenedor.addEventListener('submit', (event) => {
        event.preventDefault();

        let puntaje = 0;

        trivia.forEach((pregunta, index) => {
            const opcionesRadio = document.getElementsByName(`opcion${index}`);
            opcionesRadio.forEach(opcionRadio => {
                if (opcionRadio.checked) {
                    if (opcionRadio.value === pregunta.correct_answer) {
                        puntaje += 100;
                    }
                }
            });
        });

        puntajeModal.classList.remove('hidden');
        mensajeFinal.textContent = '';

        if (puntaje === 0 || puntaje === 100) {
            mensajeFinal.textContent = '¡Ánimo, la próxima será mejor!';
        } else if (puntaje === 200 || puntaje === 300) {
            mensajeFinal.textContent = '¡Eres un verdadero aprendiz!';
        } else if (puntaje === 400 || puntaje === 500) {
            mensajeFinal.textContent = '¡Buena jugada, futuro sabio!';
        } else if (puntaje === 600 || puntaje === 700) {
            mensajeFinal.textContent = '¡Impresionante, eres un genio!';
        } else if (puntaje === 800 || puntaje === 900) {
            mensajeFinal.textContent = '¡Increíble, tienes una mente brillante!';
        } else if (puntaje === 1000) {
            mensajeFinal.textContent = '¡Felicidades, eres el Rey de la Trivia!';
        }

        labelPuntaje.textContent = `Puntaje: ${puntaje} / 1000`;
    });

}

function mezclarOpciones(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const btnSeguirIntentando = document.querySelector('#btnSeguirIntentando')

btnSeguirIntentando.addEventListener('click', () => {
    puntajeModal.classList.add('hidden')
})


