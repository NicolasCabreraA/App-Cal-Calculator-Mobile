const baseURL = "https://calcount.develotion.com/";
const baseURLImage = "https://calcount.develotion.com/imgs/";
const ruteo = document.querySelector("#ruteo");

let map;
let latitud = -34.90369769147839;
let longitud = -56.190635247871626;


navigator.geolocation.getCurrentPosition(DispositivoUbi,MostrarError);
const ubicaciones = [
    { id: 11, nombre: "Argentina", coordenadas: [-34, -64] },
    { id: 27, nombre: "Bolivia", coordenadas: [-17, -65] },
    { id: 31, nombre: "Brazil", coordenadas: [-10, -55] },
    { id: 44, nombre: "Chile", coordenadas: [-30, -71] },
    { id: 48, nombre: "Colombia", coordenadas: [4, -72] },
    { id: 64, nombre: "Ecuador", coordenadas: [-2, -77.5] },
    { id: 172, nombre: "Paraguay", coordenadas: [-23, -58] },
    { id: 173, nombre: "Peru", coordenadas: [-10, -76] },
    { id: 235, nombre: "Uruguay", coordenadas: [-33, -56] },
    { id: 239, nombre: "Venezuela", coordenadas: [8, -66] }
];


Inicializar();

function Inicializar() {
    OcultarPantallas();
    AgregarEventos();
    ActualizarMenu();
}


function ActualizarMenu() {
    const estaLogueado = (localStorage.getItem("apiKey") != null && localStorage.getItem("apiKey") != "");

    const itemsMenu = document.getElementById('menu').querySelectorAll('ion-item');

    itemsMenu.forEach(item => {
        const ruta = item.getAttribute('href').replace('/', '');
        const esLoginRegistro = ruta === 'Login' || ruta === 'Registro';

        if (estaLogueado) {
            item.style.display = esLoginRegistro ? 'none' : 'block';
        } else {
            item.style.display = esLoginRegistro ? 'block' : 'none';
        }
    });
}



function OcultarPantallas() {
    let pantallas = document.querySelectorAll(".ion-page");
    for (let i = 1; i < pantallas.length; i++) {
        pantallas[i].style.display = "none";
    }
}
function CerrarMenu() {
    document.querySelector("#menu").close();
}
function AgregarEventos() {
    ruteo.addEventListener("ionRouteWillChange", Navegar);
    document.querySelector("#btnLogin").addEventListener("click", Login);
    document.querySelector("#btnRegistro").addEventListener("click", Registro);
    document.querySelector("#btnRegistroAlimento").addEventListener("click", RegistrarAlimentos);
    document.querySelector("#btnRegistro").addEventListener("click", Registro);
    document.querySelector("#confirmarBtn").addEventListener("click", agragarMarcadores);
    document.querySelector("#selectComida").addEventListener('ionChange', SelectAlimentos);
}

function Navegar(evt) {


    OcultarPantallas();

    switch (evt.detail.to) {
        case "/":
            document.querySelector("#inicio").style.display = "block";
            break;
        case "/Login":
            document.querySelector("#login").style.display = "block";
            break;
        case "/RegistrarAlimentos":
            SelectAlimentos();
            document.querySelector("#registrarAlimentos").style.display = "block";
            break;
        case "/ListadoAlimentos":
            ObtenerAlimentos();
            document.querySelector("#listadoAlimentos").style.display = "block";
            break;
        case "/InformeCalorias":
            InformeDeCalorias();
            document.querySelector("#informeCalorias").style.display = "block";
            break;
        case "/CargarMapa":
            setTimeout(() =>{
                cargarMapa();
            }, 1000);
            document.querySelector("#cargarMapa").style.display = "block";
            break;
        case "/CerrarSesion":
            CerrarSesion();
            ruteo.push("/");
        default:
            document.querySelector("#registro").style.display = "block";
            break;
    }
}


function Login() {
    try {
        if (localStorage.getItem("apiKey") != null &&
            localStorage.getItem("apiKey") != "") {
            throw new Error("Ya estas logueado");
        }
        let nombreUsuario = document.querySelector("#txtNombreUsuario").value;
        let password = document.querySelector("#txtPassword").value;

        if (nombreUsuario.trim().length == 0 || password.trim().length == 0) {
            throw new Error("Los datos no son correctos");
        }
        fetch(baseURL + "login.php",
            {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    usuario: nombreUsuario,
                    password: password
                })
            })
            .then(function (response) {
                if (response.status == 401) {
                    return Promise.reject({ error: response.status, message: "No autorizado" })
                }
                if (response.status < 200 || response.status > 299) {
                    return Promise.reject({ error: response.status, message: "Datos incorrectos" })
                }
                return response.json();
            })
            .then(function (data) {
                document.querySelector("#mensajeLogin").innerHTML = `Login exitoso, Bienvenido ${nombreUsuario}`;
                document.querySelector("#txtNombreUsuario").value = "";
                document.querySelector("#txtPassword").value = "";
                localStorage.setItem("apiKey", data.apiKey);
                localStorage.setItem("userId", data.id);
                localStorage.setItem("caloriasDiarias", data.caloriasDiarias);
                ActualizarMenu();
            })
            .catch(function (error) {
                document.querySelector("#mensajeLogin").innerHTML = `${error.message}`;

            })

    } catch (Error) {
        document.querySelector("#mensajeLogin").innerHTML = `${Error.message}`;
    }
}
function Registro() {
    try {
        if (localStorage.getItem("apiKey") != null &&
            localStorage.getItem("apiKey") != "") {
            throw new Error("Ya estas logueado");
        }
        let usuario = document.querySelector("#txtUsuario").value;
        let password = document.querySelector("#txtPasswordRegistro").value;
        let idPais = document.querySelector("#selectPais").value;
        let caloriasDiarias = document.querySelector("#txtCalorias").value;
        ValidarDatos(usuario, password, idPais, caloriasDiarias);
        fetch(baseURL + "usuarios.php",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "usuario": usuario,
                    "password": password,
                    "idPais": idPais,
                    "caloriasDiarias": caloriasDiarias
                })
            })
            .then(function (response) {
                if (response.ok) {
                    document.querySelector("#mensajeRegistro").innerHTML = "Registro exitoso";
                    return response.json();
                }
                else {
                    return Promise.reject({ error: response.status, message: "No se pudo crear un usuario, intente con otro nombre" })
                }
            })
            .then(function (data) {
                console.log(data);
                if (data != null) {
                    document.querySelector("#mensajeRegistro").innerHTML = "Registro exitoso";
                    localStorage.setItem("apiKey", data.apiKey);
                    localStorage.setItem("userId", data.id);
                    localStorage.setItem("caloriasDiarias", data.caloriasDiarias);
                    ActualizarMenu();
                    LimpiarCampos();
                }
                else {
                    document.querySelector("#mensajeRegistro").innerHTML = `Error al registrarse`;
                }
            })
            .catch(function (error) {
                document.querySelector("#mensajeRegistro").innerHTML = `${error.message}`;
            })
    } catch (Error) {
        document.querySelector("#mensajeRegistro").innerHTML = Error.message;
    }
}

function ValidarDatos(usuario, password, idPais, caloriasDiarias) {
    if (usuario.trim().length == 0) {
        throw new Error("El usuario es requerido");
    }
    if (password.trim().length == 0) {
        throw new Error("La contraseña es requerida");
    }
    if (idPais == null) {
        throw new Error("El pais es requerido");
    }
    if (caloriasDiarias.trim().length == 0) {
        throw new Error("las calorias diarias son requeridas");
    }

}
function LimpiarCampos() {
    document.querySelector("#txtUsuario").value = "";
    document.querySelector("#txtPasswordRegistro").value = "";
    document.querySelector("#selectPais").value = null;
    document.querySelector("#txtCalorias").value = "";
}

function RegistrarAlimentos() {

    document.querySelector("#mensajeRegistroAlimento").innerHTML = "";
    let idcomida = document.querySelector("#selectComida").value;
    let fecha = document.querySelector("#fechaRegistro").value;
    let cantidad = document.querySelector("#idCantidad").value;
    try {
        ValidarDatosAlimentos(idcomida, cantidad, fecha);
        fetch(baseURL + "registros.php",
            {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    "apikey": localStorage.getItem("apiKey"),
                    "iduser": localStorage.getItem("userId")
                },
                body: JSON.stringify({
                    "idAlimento": idcomida,
                    "idUsuario": localStorage.getItem("userId"),
                    "cantidad": cantidad,
                    "fecha": fecha
                })
            })
            .then(function (response) {
                if (!response.ok) {
                    return Promise.reject({
                        codigo: response.status,
                        message: "No esta autorizado"
                    });
                }
                return response.json();
            })
            .then(function (data) {
                console.log(data);
                if (data != null) {
                    document.querySelector("#mensajeRegistroAlimento").innerHTML = "Registro de comida exitoso";
                    LimpiarCamposComida();
                }
                else {
                    document.querySelector("#mensajeRegistroAlimento").innerHTML = `Error al registrar la comida`;
                }
            })
            .catch(function (error) {
                document.querySelector("#mensajeRegistroAlimento").innerHTML = error.message;
            })
    } catch (Error) {
        document.querySelector("#mensajeRegistroAlimento").innerHTML = `${Error.message}`;
    }
}
function LimpiarCamposComida() {
    document.querySelector("#idCantidad").value = "";
    document.querySelector("#selectComida").value = null;
    const inputUnidad = document.querySelector("#idCantidad");
    inputUnidad.placeholder = "Ingrese cantidad";
}

function ValidarDatosAlimentos(idcomida, cantidad, fecha) {
    if (idcomida == undefined || idcomida == 0) {
        throw new Error("El alimento es requerido");
    }
    if (cantidad == "") {
        throw new Error("La cantidad es requerida");
    }
    if (fecha == null) {
        throw new Error("La fecha es requerida");
    }
    if (fecha.length == 0) {
        throw new Error("La fecha es requerida");
    }

    let fechaSeleccionada = new Date(fecha);
    let fechaActual = new Date();
    if (fechaSeleccionada > fechaActual) {
        throw new Error("La fecha de la comida no puede estar en el futuro.");
    }
}

function SelectAlimentos() {

    try {
        fetch(baseURL + "alimentos.php",
            {
                headers: {
                    "Content-type": "application/json",
                    "apikey": localStorage.getItem("apiKey"),
                    "iduser": localStorage.getItem("userId")
                }
            })
            .then(function (response) {
                if (!response.ok) {
                    return Promise.reject({
                        codigo: response.status,
                        message: "No esta autorizado"
                    });
                }
                return response.json();
            })
            .then(function (data) {

                let Alimento = ""
                for (let i = 0; i < data.alimentos.length; i++) {

                    Alimento += `<ion-select-option value="${data.alimentos[i].id}">${data.alimentos[i].nombre}</ion-select-option><br>`;
                }
                document.querySelector("#selectComida").innerHTML = Alimento;

                let selectedValue = document.querySelector("#selectComida").value;


                const alimentoSeleccionado = data.alimentos.find(alimento => alimento.id == selectedValue);


                if (alimentoSeleccionado) {

                    let ultimaLetraPorcion = alimentoSeleccionado.porcion.slice(-1);
                    if (ultimaLetraPorcion == "g") {
                        ultimaLetraPorcion = "gramos"
                    } else if (ultimaLetraPorcion == "m") {
                        ultimaLetraPorcion = "mililitros"
                    } else {
                        ultimaLetraPorcion = "unidades"
                    }

                    const inputUnidad = document.querySelector("#idCantidad");
                    inputUnidad.placeholder = `Ingrese cantidad en ${ultimaLetraPorcion}`;
                }
            })
            .catch(function (Error) {
                document.querySelector("#mensajeRegistroAlimento").innerHTML = Error.message;
            })
    } catch (Error) {
        document.querySelector("#mensajeRegistroAlimento").innerHTML = Error.message;
    }
}

async function SistemaAlimentos(idAlimento) {
    try {
        const response = await fetch(baseURL + "alimentos.php", {
            headers: {
                "Content-type": "application/json",
                "apikey": localStorage.getItem("apiKey"),
                "iduser": localStorage.getItem("userId")
            }
        });

        if (!response.ok) {
            throw {
                codigo: response.status,
                message: "No está autorizado"
            };
        }

        const data = await response.json();

        for (let i = 0; i < data.alimentos.length; i++) {
            let alimentoActual = data.alimentos[i];
            if (idAlimento == alimentoActual.id) {
                console.log(alimentoActual);
                return alimentoActual;
            }
        }
    } catch (error) {
        document.querySelector("#listadop").innerHTML = error.message;
        return null;
    }
}

async function ObtenerAlimentos() {
    if (localStorage.getItem("apiKey") != null && localStorage.getItem("apiKey") != "") {
        try {
            const response = await fetch(baseURL + `/registros.php?idUsuario=${localStorage.getItem("userId")}`, {
                headers: {
                    "Content-type": "application/json",
                    "apikey": localStorage.getItem("apiKey"),
                    "iduser": localStorage.getItem("userId")
                }
            });

            if (response.status == 401) {
                throw {
                    codigo: response.status,
                    message: "Debe iniciar sesión para visualizar los registros"
                };
            }

            const data = await response.json();
            console.log(data.registros);


            let registros = data.registros;
            let fecha1 = document.querySelector("#fecha1Id").value;
            let fecha2 = document.querySelector("#fecha2Id").value;

            if (fecha1 && fecha2) {
                fecha1 = fecha1.split('T')[0];
                fecha2 = fecha2.split('T')[0];
                registros = registros.filter(registro => {
                    const fechaRegistro = new Date(registro.fecha.split('T')[0]);
                    return fechaRegistro >= new Date(fecha1) && fechaRegistro <= new Date(fecha2);
                });
            }


            let datosRegistrados = "";
            document.querySelector("#listado").innerHTML = datosRegistrados;
            for (let i = 0; i < registros.length; i++) {
                let alimentoActual = await SistemaAlimentos(registros[i].idAlimento);
                console.log(registros[i]);
                if (alimentoActual) {
                    let medidaCalorias = "";
                    if (alimentoActual.porcion.endsWith("g")) {
                        medidaCalorias = alimentoActual.calorias / 100;
                    } else if (alimentoActual.porcion.endsWith("m")) {
                        medidaCalorias = alimentoActual.calorias / 100;
                    } else {
                        medidaCalorias = alimentoActual.calorias;
                    }
                    datosRegistrados += `<ion-card>
                    <img alt="${alimentoActual.nombre}" src="${baseURLImage}${alimentoActual.imagen}.png" />
                    <ion-card-header>
                        <ion-card-title>${alimentoActual.nombre}</ion-card-title>
                    </ion-card-header>
                    <ion-card-content>
                        <p>Calorías: ${(medidaCalorias * registros[i].cantidad).toFixed(2)}</p>
                        <p>Fecha: ${registros[i].fecha}</p>
                        <ion-button expand="full" onclick="EliminarRegistro(${registros[i].id})" color="danger">Borrar alimento</ion-button>
                    </ion-card-content>
                </ion-card>`;
                }
            }
            document.querySelector("#listado").innerHTML += datosRegistrados;
        } catch (error) {
            document.querySelector("#listado").innerHTML = error.message;
        }
    } else {
        document.querySelector("#listado").innerHTML = "Debe iniciar sesión para visualizar el listado de productos";
    }
}


function EliminarRegistro(idRegistro) {
    if (localStorage.getItem("apiKey") != null && localStorage.getItem("apiKey") != "") {
        try {
            fetch(baseURL + `registros.php?idRegistro=${idRegistro}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-type": "application/json",
                        "apikey": localStorage.getItem("apiKey"),
                        "iduser": localStorage.getItem("userId")
                    },
                })
                .then(function (response) {
                    if (response.ok) {
                        document.querySelector("#mensajeRegistro").innerHTML = "Registro borrado con exito";
                        setTimeout(() => {
                            ObtenerAlimentos();
                        }, 1000);
                        return response.json();
                    }
                    else {
                        return Promise.reject({ error: response.status, message: "No se pudo borrar el registro" })
                    }
                })
                .then(function (data) {
                    console.log(data);

                })
                .catch(function (error) {
                    document.querySelector("#mensajeRegistro").innerHTML = `${error.message}`;
                })

        } catch (error) {
            document.querySelector("#listado").innerHTML = error.message;
        }
    } else {
        document.querySelector("#listado").innerHTML = "Debe iniciar sesión para visualizar el listado de productos";
    }
}



async function InformeDeCalorias() {
    const fechaActual = new Date().toISOString().split('T')[0];
    if (localStorage.getItem("apiKey") != null && localStorage.getItem("apiKey") != "") {
        try {
            const responseRegistros = await fetch(baseURL + `/registros.php?idUsuario=${localStorage.getItem("userId")}`, {
                headers: {
                    "Content-type": "application/json",
                    "apikey": localStorage.getItem("apiKey"),
                    "iduser": localStorage.getItem("userId")
                }
            });

            if (responseRegistros.status == 401) {
                throw {
                    codigo: responseRegistros.status,
                    message: "Debe iniciar sesión para visualizar los registros"
                };
            }

            const dataRegistros = await responseRegistros.json();
            console.log(dataRegistros.registros);

            let totalCalorias = 0;
            let caloriasDiariasHoy = 0;

            for (const registro of dataRegistros.registros) {
                const alimentoActual = await SistemaAlimentos(registro.idAlimento);

                if (alimentoActual) {
                    let medidaCalorias = "";
                    if (alimentoActual.porcion.endsWith("g")) {
                        medidaCalorias = alimentoActual.calorias / 100;
                    } else if (alimentoActual.porcion.endsWith("m")) {
                        medidaCalorias = alimentoActual.calorias / 100;
                    } else {
                        medidaCalorias = alimentoActual.calorias;
                    }

                    totalCalorias += medidaCalorias * registro.cantidad;


                    if (registro.fecha === fechaActual) {
                        let medidaCalorias2 = "";
                        if (alimentoActual.porcion.endsWith("g")) {
                            medidaCalorias2 = alimentoActual.calorias / 100;
                        } else if (alimentoActual.porcion.endsWith("m")) {
                            medidaCalorias2 = alimentoActual.calorias / 100;
                        } else {
                            medidaCalorias2 = alimentoActual.calorias;
                        }

                        caloriasDiariasHoy += medidaCalorias2 * registro.cantidad;
                    }
                }
            }
            let calTotales = "";
            calTotales += `${totalCalorias.toFixed(2)}`;
            document.querySelector("#pTotal").innerHTML = calTotales;

            let calDiarias = "";
            let caloriasDiariasRecomendadas = localStorage.getItem("caloriasDiarias");
            const porcentaje = (caloriasDiariasHoy / caloriasDiariasRecomendadas) * 100;
            if (caloriasDiariasHoy > caloriasDiariasRecomendadas) {
                calDiarias += `
                <ion-label color="danger">
                    <h1>Calorias Diarias</h1>
                    <p>${caloriasDiariasHoy}</p>
                </ion-label>`
            } else if (porcentaje >= 90) {
                calDiarias += `
                <ion-label color="warning">
                    <h1>Calorias Diarias</h1>
                    <p>${caloriasDiariasHoy}</p>
                </ion-label>`
            } else {
                calDiarias += `
                <ion-label color="success">
                    <h1>Calorias Diarias</h1>
                    <p>${caloriasDiariasHoy}</p>
                </ion-label>`
            }
            document.querySelector("#diarias").innerHTML = calDiarias;

        } catch (error) {
            document.querySelector("#informeError").innerHTML = error.message;
        }
    } else {
        document.querySelector("#informeError").innerHTML = "Debe iniciar sesión para visualizar el informe de calorías";
    }
}


function cargarMapa() {

    map = L.map('map').setView([latitud, longitud], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map)
    L.marker([latitud, longitud]).addTo(map)
        .bindPopup('Este dispositivo')
        .openPopup();
}

async function agragarMarcadores() {

    let valor = parseInt(document.querySelector('#valor').value);
    try {
        let response = await fetch(baseURL + "usuariosPorPais.php", {
            headers: {
                "Content-Type": "application/json",
                "apikey": localStorage.getItem("apiKey"),
                "iduser": localStorage.getItem("userId")
            }
        });
        let data = await response.json();
        console.log(data);
        let ubiMasUsuarios = data.paises.filter(function (pais) {
            return pais.cantidadDeUsuarios > valor;
        });

        let ubicacionesSeleccionadas = ubiMasUsuarios.filter(function (ubicacionSeleccionada) {
            let encontrado = ubicaciones.filter(function (pais) {
                return pais.id === ubicacionSeleccionada.id;
            });

            if (encontrado.length > 0) {
                return true;
            } else {
                return false;
            }
        });

        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });



        ubicacionesSeleccionadas.map(function (ubicacionSeleccionada) {
            return ubicaciones.filter(function (pais) {
                return pais.id === ubicacionSeleccionada.id;
            })[0];
        })

        for (let i = 0; i < ubicacionesSeleccionadas.length; i++) {
            let pais = ubicaciones.filter(function (p) {
                return p.id === ubicacionesSeleccionadas[i].id;
            })[0];

            if (ubiMasUsuarios < valor) {
                L.marker(pais.coordenadas).remove();
            }
            L.marker(pais.coordenadas).addTo(map)
                .bindPopup(pais.nombre);
        }

        
    } catch (error) {
        console.log(error);
        MostrarError(error);
    }
}


function CerrarSesion() {
    localStorage.clear();
    document.querySelector("#mensajeLogin").innerHTML = "";
    document.querySelector("#mensajeRegistro").innerHTML = "";
    document.querySelector("#mensajeRegistroAlimento").innerHTML = "";
    document.querySelector("#listadop").innerHTML = "";
    document.querySelector("#informeError").innerHTML = "";
    ActualizarMenu();
}

function Volver() {
    ruteo.back();

}


function DispositivoUbi(geolocation){
    latitud = geolocation.coords.latitude
    longitud = geolocation.coords.longitude

}


function MostrarError(error) {
    let toast = document.createElement("ion-toast");
    toast.message = error.message;
    toast.duration = 1000;
    document.body.appendChild(toast);
    return toast.present();
}
