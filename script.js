document.addEventListener("DOMContentLoaded", async function () {
    const listaTareas = document.getElementById("lista-tareas");
    const tareas = [];

    const botonAñadir = document.getElementById("añadir");
    const zonaContador = document.getElementById("contadores");
    const contadorProgreso = document.createElement("p");
    const contadorPendiente = document.createElement("p");
    const contadorFinalizado = document.createElement("p");

    const ordenarPorTiempo = document.getElementById("ordenarPorTiempo");
    const ordenarPorFecha = document.getElementById("ordenarPorFecha");

    let contadorTareasProgreso = 0;
    let contadorTareasPendiente = 0;
    let contadorTareasFinalizado = 0;

    const url = "https://www.alpati.net/DWEC/api/";

    botonAñadir.addEventListener("click", async function () {
        const nombreTareaInput = document.getElementById("nombreTarea");
        const tiempoInput = document.getElementById("tiempo");
        const fechaMaxInput = document.getElementById("fechaMax");
        const fechaAltaInput = document.getElementById("fechaAlta");
        const descripcionInput = document.getElementById("descripcion");

        const nombreTarea = nombreTareaInput.value;
        const tiempo = parseFloat(tiempoInput.value);
        const fechaMax = fechaMaxInput.value;
        const fechaAlta = fechaAltaInput.value;
        const estadoValue = document.getElementById("estados").value;
        const descripcion = descripcionInput.value;

        nombreTareaInput.value = "";
        tiempoInput.value = "";
        fechaMaxInput.value = "";
        fechaAltaInput.value = "";

        const nuevaTarea = {
            task_id: null,
            task_owner: "10",
            task_name: nombreTarea,
            task_description: descripcion,
            task_status: estadoValue,
            task_estimated_time: tiempo,
            task_deadline: fechaMax,
            task_created: fechaAlta,
        };

        tareas.push(nuevaTarea);

        await agregarTareaApi(nuevaTarea);
        await listarTareasApi();


    });

    function actualizarTareas() {
        listaTareas.innerHTML = "";
        tareas.forEach((tarea, index) => {
            const filaTarea = document.createElement("tr");
            filaTarea.innerHTML = `
                <td>${tarea.task_name}</td>
                <td>${formatearTiempo(tarea.task_estimated_time)}</td>
                <td>${formatearFecha(tarea.task_deadline)}</td>
                <td>${formatearFecha(tarea.task_created)}</td>
                <td>
                    <select class="estado-select">
                    <option value="En progreso" ${tarea.task_status === "En progreso" ? "selected" : ""}>En progreso</option>
                    <option value="Pendiente" ${tarea.task_status === "Pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="Finalizado" ${tarea.task_status === "Finalizado" ? "selected" : ""}>Finalizado</option>
                    </select>
                </td>
                <td>
                    <i class="fi fi-rr-pen-square cambiarEstado"></i>
                    <i class="fi fi-ss-trash-xmark eliminarTarea"></i>
                </td>
            `;
            listaTareas.appendChild(filaTarea);

            const select = filaTarea.querySelector("select.estado-select");

            select.addEventListener("change", function () {
                tareas[index].task_status = select.value;
                actualizarContadores();

            });
        });

    }

    listaTareas.addEventListener("click", async function (e) {
        if (e.target.classList.contains("eliminarTarea")) {
            const index = [...listaTareas.children].indexOf(e.target.parentElement.parentElement);

            if (tareas.length > 0) {
                const idTareaEliminar = tareas[index].task_id;
                tareas.splice(index, 1);
                actualizarTareas();

                await eliminarTareaApi(idTareaEliminar);
                await listarTareasApi();
            }

        } else if (e.target.classList.contains("cambiarEstado")) {
            const index = [...listaTareas.children].indexOf(e.target.parentElement.parentElement);
            const select = listaTareas.children[index].querySelector(".estado-select");
            const nuevoEstado = select.value;
            tareas[index].task_status = nuevoEstado;

            console.log("ID de la tarea:", tareas[index].task_id);
            console.log("Estado:", nuevoEstado);

            await actualizarEstadoTareaApi(tareas[index].task_id, nuevoEstado);
            await listarTareasApi();

            actualizarContadores();
        }
    });

    let ordenAscendente = true;

    ordenarPorTiempo.addEventListener("click", function () {
        if (ordenAscendente) {
            tareas.sort((a, b) => a.task_estimated_time - b.task_estimated_time);
        } else {
            tareas.sort((a, b) => b.task_estimated_time - a.task_estimated_time);
        }
        ordenAscendente = !ordenAscendente;
        actualizarTareas();
    });

    ordenarPorFecha.addEventListener("click", function () {
        if (ordenAscendente) {
            tareas.sort((a, b) => new Date(a.task_created) - new Date(b.task_created));
        } else {
            tareas.sort((a, b) => new Date(b.task_created) - new Date(a.task_created));
        }
        ordenAscendente = !ordenAscendente;
        actualizarTareas();
    });

    function actualizarContadores() {
        contadorTareasProgreso = tareas.filter((tarea) => tarea.task_status === "En progreso").length;
        contadorTareasPendiente = tareas.filter((tarea) => tarea.task_status === "Pendiente").length;
        contadorTareasFinalizado = tareas.filter((tarea) => tarea.task_status === "Finalizado").length;

        contadorProgreso.textContent = `En progreso: ${contadorTareasProgreso}`;
        contadorPendiente.textContent = `Pendiente: ${contadorTareasPendiente}`;
        contadorFinalizado.textContent = `Finalizado: ${contadorTareasFinalizado}`;

        zonaContador.innerHTML = "";
        zonaContador.appendChild(contadorProgreso);
        zonaContador.appendChild(contadorPendiente);
        zonaContador.appendChild(contadorFinalizado);
    }

    function formatearTiempo(tiempo) {
        if (tiempo !== undefined) {
            const [horas, minutos] = tiempo.toString().split('.');

            let tiempoFormateado = "";

            if (horas > 0) {
                tiempoFormateado += `${horas}h. `;
            }

            if (minutos > 0) {
                tiempoFormateado += `${minutos}min`;
            }

            return tiempoFormateado;
        }

        return "";

    }

    function formatearFecha(fecha) {
        if (fecha !== undefined) {
            const [anyo, mes, dia] = fecha.split("-");

            let fechaFormateada = "";

            fechaFormateada += `${dia}/${mes}/${anyo}`;

            return fechaFormateada;
        }

        return ""

    }

    await listarTareasApi();

    async function listarTareasApi() {
        const response = await fetch(url + "get_user_tasks/10", {
            method: "GET",
            headers: {
                "accept": "application/json",
                "accept-encoding": "gzip, deflate",
                "accept-language": "en-US,en;q=0.8",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
            }
        });
        const data = await response.json();
        console.log(data)
        tareas.length = 0;
        tareas.push(...data);
        actualizarTareas();
        actualizarContadores();
    }

    async function agregarTareaApi(nuevaTarea) {
        try {
            const response = await fetch(url + "create_task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                    "accept-encoding": "gzip, deflate",
                    "accept-language": "en-US,en;q=0.8",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
                },
                body: JSON.stringify(nuevaTarea),
            });

            if (!response.ok) {
                throw new Error(`Error al crear tarea: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            nuevaTarea.task_id = data.task_id;
        } catch (error) {
            console.error(error);
        } finally {
            console.log("Se ha terminado el try y se ha agregado la tarea")
        }
    }

    async function actualizarEstadoTareaApi(idTarea, nuevoEstado) {
        try {
            const tarea = tareas.find(t => t.task_id === idTarea);

            const tareaActualizada = {
                task_name: tarea.task_name,
                task_description: tarea.task_description,
                task_status: nuevoEstado,
                task_estimated_time: tarea.task_estimated_time,
                task_deadline: tarea.task_deadline,
                task_created: tarea.task_created
            }

            const response = await fetch(url + `update_task/${idTarea}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                    "accept-encoding": "gzip, deflate",
                    "accept-language": "en-US,en;q=0.8",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
                },
                body: JSON.stringify(tareaActualizada),
            });

            if (!response.ok) {
                throw new Error(`Error al actualizar tarea: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error(error);
        }
    }


    async function eliminarTareaApi(idTarea) {
        await fetch(url + `delete_task/${idTarea}`, {
            method: "DELETE",
            headers: {
                "accept": "application/json",
                "accept-encoding": "gzip, deflate",
                "accept-language": "en-US,en;q=0.8",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
            }
        });
    }

});