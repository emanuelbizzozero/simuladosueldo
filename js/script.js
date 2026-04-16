// Formato contable argentino: $ 1.234.567,89
function formatoPesos(valor) {
    return '$ ' + valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function parsePesos(str) {
    return parseFloat(str.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
}

// Cantidad de módulos por categoría
let modulosPorCategoria = {
    1: 845,
    2: 716,
    3: 606,
    4: 529,
    5: 461,
    6: 402,
    7: 350,
    8: 306,
    9: 254,
    10: 224,
    11: 199,
    12: 176,
    13: 155,
    14: 138
};
let valorAntiguedadCustom = null;

const BASE_CONCEPTOS = [
    'Sueldo Básico',
    'Dedicación Funcional',
    'Antigüedad',
    'Adicional por Capacitación',
    'RC 02/23',
    'Título',
    'Adicional por Módulos',
    'Norma ISO',
    'Presentismo'
];

const PERMANENCIA_MODULOS = {
    'Permanencia en la categoría 2 años': { cat1a3: 3.011, cat4a8: 2.482 },
    'Permanencia en la categoría 4 años': { cat1a3: 6.113, cat4a8: 5.026 },
    'Permanencia en la categoría 6 años': { cat1a3: 9.308, cat4a8: 7.632 },
    'Permanencia en la categoría 8 años': { cat1a3: 12.600, cat4a8: 10.305 }
};

const ADICIONAL_MODULOS = {
    1: { modulos: 326.10, valorModulo: 2831.79 },
    2: { modulos: 244.81, valorModulo: null }, // null significa usar el valor estándar
    3: { modulos: 175.35, valorModulo: null },
    4: { modulos: 126.43, valorModulo: null },
    5: { modulos: 83.11, valorModulo: null },
    6: { modulos: 45.39, valorModulo: null },
    7: { modulos: 12.02, valorModulo: null }
};

// Función para calcular adicional por capacitación
function getAdicionalCapacitacion(categoria) {
    return 39 + (categoria - 1);
}

// Función para calcular norma ISO
function getNormaISO(categoria, cantidadModulos, valorModulo) {
    let porcentaje = 0;
    if (categoria >= 1 && categoria <= 3) porcentaje = 0.09;
    else if (categoria >= 4 && categoria <= 8) porcentaje = 0.11;
    else if (categoria >= 9 && categoria <= 14) porcentaje = 0.13;
    return porcentaje * cantidadModulos * valorModulo;
}

function getPermanenciaModulos(concepto, categoria) {
    const config = PERMANENCIA_MODULOS[concepto];
    if (!config) return 0;
    if (categoria >= 1 && categoria <= 3) return config.cat1a3;
    if (categoria >= 4 && categoria <= 8) return config.cat4a8;
    return 0;
}

function getValorAntiguedad(vModulo) {
    return valorAntiguedadCustom !== null ? valorAntiguedadCustom : (vModulo * 6.6);
}

function refreshCategoriaOption(categoria) {
    const option = document.querySelector('#categoriaSelect option[value="' + categoria + '"]');
    if (option) option.textContent = 'Categoría ' + categoria + ' - ' + modulosPorCategoria[categoria] + ' módulos';
}

// Actualizar cantidad módulos por categoría
function updateCantidadModulos() {
    const categoria = parseInt(document.getElementById('categoriaSelect').value) || 0;
    const adicional = getAdicionalCapacitacion(categoria);
    document.getElementById('adicionalCapacitacionSeteo').value = adicional;
    updateSueldoTable();
}

// Actualizar tabla sueldo basada en seteo
function updateSueldoTable() {
    const categoria = parseInt(document.getElementById('categoriaSelect').value) || 0;
    const cantidadModulos = modulosPorCategoria[categoria] || 0;
    const valorModulo = parseFloat(document.getElementById('valorModulo').value) || 0;
    const valorAntiguedad = getValorAntiguedad(valorModulo);
    document.getElementById('valorAntiguedad').value = valorAntiguedad.toFixed(2);
    const anosAntiguedadRaw = document.getElementById('anosAntiguedad').value.trim();
    const tituloRaw = document.getElementById('tituloSelect').value;
    const anosAntiguedad = parseFloat(anosAntiguedadRaw) || 0;
    const tituloPorcentaje = parseFloat(tituloRaw) || 0;

    if (categoria === 0 || valorModulo === 0) return;

    // Validar que antigüedad y título estén completos antes de calcular
    if (anosAntiguedadRaw === '' || tituloRaw === '') {
        document.getElementById('anosAntiguedad').style.borderColor = anosAntiguedadRaw === '' ? 'red' : '';
        document.getElementById('tituloSelect').style.borderColor = tituloRaw === '' ? 'red' : '';
        document.getElementById('alertaSeteo').style.display = 'block';
        return;
    }

    // Limpiar bordes y alerta de validación
    document.getElementById('anosAntiguedad').style.borderColor = '';
    document.getElementById('tituloSelect').style.borderColor = '';
    document.getElementById('alertaSeteo').style.display = 'none';

    const rows = document.querySelectorAll('#sueldoTable tbody tr');
    let subtotalSueldo = 0;

    rows.forEach((row, index) => {
        const conceptoEl = row.querySelector('.concepto-nombre');
        const concepto = conceptoEl ? conceptoEl.textContent.trim() : row.cells[0].textContent.trim();
        let subtotal = 0;
        let cantMod = cantidadModulos;
        let totalValue = cantMod * valorModulo;
        let valorFila = valorModulo;

        if (concepto === 'Adicional por Función') {
            const aplicaAdicionalFuncion = categoria >= 1 && categoria <= 3;
            const remuneracionCategoria = cantidadModulos * valorModulo;
            cantMod = 1;
            valorFila = aplicaAdicionalFuncion ? remuneracionCategoria * 0.10 : 0;
            subtotal = valorFila;
            totalValue = subtotal;

            row.querySelector('.cantidad').value = cantMod;
            row.querySelector('.valor').value = valorFila.toFixed(2);
            row.querySelector('.total').textContent = formatoPesos(totalValue);
            subtotalSueldo += subtotal;
            return;
        }

        if (PERMANENCIA_MODULOS[concepto]) {
            cantMod = getPermanenciaModulos(concepto, categoria);
            valorFila = valorModulo;
            subtotal = cantMod * valorFila;
            totalValue = subtotal;

            row.querySelector('.cantidad').value = cantMod.toFixed(3);
            row.querySelector('.valor').value = valorFila.toFixed(2);
            row.querySelector('.total').textContent = formatoPesos(totalValue);
            subtotalSueldo += subtotal;
            return;
        }

        if (row.classList.contains('extra-item-row') || !BASE_CONCEPTOS.includes(concepto)) {
            cantMod = parseFloat(row.querySelector('.cantidad').value) || 0;
            valorFila = parseFloat(row.querySelector('.valor').value) || 0;
            subtotal = cantMod * valorFila;
            totalValue = subtotal;

            row.querySelector('.total').textContent = formatoPesos(totalValue);
            subtotalSueldo += subtotal;
            return;
        }

        if (concepto === 'Sueldo Básico') {
            subtotal = (0.3 * cantidadModulos) * valorModulo;
            totalValue = subtotal;
        } else if (concepto === 'Dedicación Funcional') {
            subtotal = (0.7 * cantidadModulos) * valorModulo;
            totalValue = subtotal;
        } else if (concepto === 'Antigüedad') {
            cantMod = anosAntiguedad;
            valorFila = valorAntiguedad;
            subtotal = cantMod * valorAntiguedad;
            totalValue = subtotal;
        } else if (concepto === 'Adicional por Capacitación') {
            cantMod = getAdicionalCapacitacion(categoria);
            subtotal = cantMod * valorModulo;
            totalValue = subtotal;
        } else if (concepto === 'RC 02/23') {
            cantMod = 85.141;
            subtotal = 85.141 * valorModulo;
            totalValue = cantMod * valorModulo;
        } else if (concepto === 'Título') {
            subtotal = tituloPorcentaje * cantidadModulos * valorModulo;
            totalValue = subtotal;
        } else if (concepto === 'Adicional por Módulos') {
            const adicionalData = ADICIONAL_MODULOS[categoria];
            if (adicionalData) {
                cantMod = adicionalData.modulos;
                valorFila = adicionalData.valorModulo || valorModulo;
                subtotal = cantMod * valorFila;
                totalValue = subtotal;
            } else {
                cantMod = 0;
                valorFila = valorModulo;
                subtotal = 0;
                totalValue = 0;
            }
        } else if (concepto === 'Norma ISO') {
            subtotal = getNormaISO(categoria, cantidadModulos, valorModulo);
            totalValue = subtotal;
        } else if (concepto === 'Presentismo') {
            const modPres = window._presentismoModulos !== undefined ? window._presentismoModulos : 100;
            cantMod = modPres;
            subtotal = modPres * valorModulo;
            totalValue = subtotal;
        }

        row.querySelector('.cantidad').value = cantMod;
        row.querySelector('.valor').value = valorFila;
        row.querySelector('.total').textContent = formatoPesos(totalValue);

        subtotalSueldo += subtotal;
    });

    document.getElementById('subtotalSueldo').textContent = formatoPesos(subtotalSueldo);
    updateDescuentos();
}

// Event listeners para seteo
document.getElementById('categoriaSelect').addEventListener('change', updateCantidadModulos);
document.getElementById('valorModulo').addEventListener('input', updateSueldoTable);
document.getElementById('anosAntiguedad').addEventListener('input', updateSueldoTable);
document.getElementById('tituloSelect').addEventListener('change', updateSueldoTable);

const CLAVE_ADMIN = 'queremosaumento';
const adminPassword = document.getElementById('adminPassword');
const adminAuthMsg = document.getElementById('adminAuthMsg');
const adminAuthBlock = document.getElementById('adminAuthBlock');
const adminConfigBlock = document.getElementById('adminConfigBlock');
const adminCategoriaSelect = document.getElementById('adminCategoriaSelect');
const adminCantidadModulos = document.getElementById('adminCantidadModulos');
const adminValorModulo = document.getElementById('adminValorModulo');
const adminValorAntiguedad = document.getElementById('adminValorAntiguedad');
const adminSaveMsg = document.getElementById('adminSaveMsg');

function cargarSeteoAdmin(categoria) {
    adminCategoriaSelect.value = String(categoria);
    adminCantidadModulos.value = modulosPorCategoria[categoria] || 0;
    const valorModuloActual = parseFloat(document.getElementById('valorModulo').value) || 0;
    adminValorModulo.value = valorModuloActual.toFixed(2);
    adminValorAntiguedad.value = getValorAntiguedad(valorModuloActual).toFixed(2);
    adminSaveMsg.style.display = 'none';
}

document.getElementById('adminSeteoModal').addEventListener('show.bs.modal', function() {
    adminPassword.value = '';
    adminAuthMsg.style.display = 'none';
    adminAuthBlock.style.display = 'block';
    adminConfigBlock.style.display = 'none';
});

document.getElementById('adminUnlockBtn').addEventListener('click', function() {
    if (adminPassword.value === CLAVE_ADMIN) {
        adminAuthMsg.style.display = 'none';
        adminAuthBlock.style.display = 'none';
        adminConfigBlock.style.display = 'block';
        const categoriaActual = parseInt(document.getElementById('categoriaSelect').value) || 1;
        cargarSeteoAdmin(categoriaActual);
    } else {
        adminAuthMsg.style.display = 'block';
    }
});

adminCategoriaSelect.addEventListener('change', function() {
    const categoria = parseInt(adminCategoriaSelect.value) || 1;
    adminCantidadModulos.value = modulosPorCategoria[categoria] || 0;
    adminSaveMsg.style.display = 'none';
});

document.getElementById('adminGuardarBtn').addEventListener('click', function() {
    const categoria = parseInt(adminCategoriaSelect.value);
    const cantidad = parseFloat(adminCantidadModulos.value);
    const valorModuloNuevo = parseFloat(adminValorModulo.value);
    const valorAntiguedadNuevo = parseFloat(adminValorAntiguedad.value);

    if (!categoria || Number.isNaN(cantidad) || Number.isNaN(valorModuloNuevo) || Number.isNaN(valorAntiguedadNuevo)) {
        return;
    }
    if (cantidad < 0 || valorModuloNuevo < 0 || valorAntiguedadNuevo < 0) {
        return;
    }

    modulosPorCategoria[categoria] = cantidad;
    refreshCategoriaOption(categoria);
    document.getElementById('valorModulo').value = valorModuloNuevo.toFixed(2);
    valorAntiguedadCustom = valorAntiguedadNuevo;

    adminSaveMsg.style.display = 'inline';
    updateCantidadModulos();
});

// Presentismo
window._presentismoModulos = 100;
const btnNo = document.getElementById('presentismoNoBtn');
const btnCompleto = document.getElementById('presentismoCompletoBtn');
const btnReducido = document.getElementById('presentismoReducidoBtn');

function setPresentismoActivo(opcion) {
    // opcion: 'completo' | 'reducido' | 'no'
    btnCompleto.className = 'btn btn-sm btn-outline-success flex-fill';
    btnReducido.className = 'btn btn-sm btn-reducido-off flex-fill';
    btnNo.className = 'btn btn-sm btn-outline-danger flex-fill';
    if (opcion === 'completo') {
        window._presentismoModulos = 100;
        btnCompleto.className = 'btn btn-sm btn-success flex-fill';
    } else if (opcion === 'reducido') {
        window._presentismoModulos = 60;
        btnReducido.className = 'btn btn-sm btn-reducido-on flex-fill';
    } else {
        window._presentismoModulos = 0;
        btnNo.className = 'btn btn-sm btn-danger flex-fill';
    }
    updateSueldoTable();
}

btnCompleto.addEventListener('click', function() { setPresentismoActivo('completo'); });
btnReducido.addEventListener('click', function() { setPresentismoActivo('reducido'); });
btnNo.addEventListener('click', function() { setPresentismoActivo('no'); });

function existeConceptoEnSueldo(concepto) {
    const rows = document.querySelectorAll('#sueldoTable tbody tr');
    return Array.from(rows).some((row) => {
        const conceptoEl = row.querySelector('.concepto-nombre');
        const nombre = conceptoEl ? conceptoEl.textContent.trim() : row.cells[0].textContent.trim();
        return nombre.toLowerCase() === concepto.toLowerCase();
    });
}

function existeConceptoEnDescuentos(concepto) {
    const rows = document.querySelectorAll('#descuentosTable tbody tr.extra-descuento-row');
    return Array.from(rows).some((row) => {
        const nombre = row.querySelector('.concepto-nombre')?.textContent.trim() || '';
        return nombre.toLowerCase() === concepto.toLowerCase();
    });
}

function agregarItemAdicional() {
    const checkboxes = document.querySelectorAll('.item-checkbox:checked');
    const seleccionados = Array.from(checkboxes).map(cb => cb.value).filter(v => v !== '');

    if (seleccionados.length === 0) return;

    const descuentosItems = ['APL', 'ATE', 'UPCN', 'Das Familia'];
    
    seleccionados.forEach(concepto => {
        // Si es APL, ATE o UPCN, agregarlo a descuentos
        if (descuentosItems.includes(concepto)) {
            if (existeConceptoEnDescuentos(concepto)) return;
            const tbodyDescuentos = document.querySelector('#descuentosTable tbody');
            const row = document.createElement('tr');
            row.className = 'extra-descuento-row';
            row.innerHTML = `
                <td>
                    <div class="d-flex justify-content-between align-items-center gap-2">
                        <span class="concepto-nombre">${concepto}</span>
                        <button type="button" class="btn btn-sm btn-outline-danger quitar-descuento-btn">Quitar</button>
                    </div>
                </td>
                <td><span class="descuento-valor">$ 0,00</span></td>
            `;
            tbodyDescuentos.appendChild(row);
        } else {
            // Si es otro item, agregarlo a sueldo
            if (existeConceptoEnSueldo(concepto)) return;
            const tbody = document.querySelector('#sueldoTable tbody');
            const row = document.createElement('tr');
            row.className = 'extra-item-row';
            const esItemAutomatico = concepto === 'Adicional por Función' || !!PERMANENCIA_MODULOS[concepto];
            if (esItemAutomatico) {
                row.innerHTML = `
                    <td>
                        <div class="d-flex justify-content-between align-items-center gap-2">
                            <span class="concepto-nombre">${concepto}</span>
                            <button type="button" class="btn btn-sm btn-outline-danger quitar-item-btn">Quitar</button>
                        </div>
                    </td>
                    <td><input type="number" class="form-control cantidad" value="0" min="0" step="0.001" readonly></td>
                    <td><input type="number" class="form-control valor" value="0" min="0" step="0.01" readonly></td>
                    <td><span class="total">$ 0,00</span></td>
                `;
            } else {
                row.innerHTML = `
                    <td>
                        <div class="d-flex justify-content-between align-items-center gap-2">
                            <span class="concepto-nombre">${concepto}</span>
                            <button type="button" class="btn btn-sm btn-outline-danger quitar-item-btn">Quitar</button>
                        </div>
                    </td>
                    <td><input type="number" class="form-control cantidad" value="0" min="0" step="0.01"></td>
                    <td><input type="number" class="form-control valor" value="0" min="0" step="0.01"></td>
                    <td><span class="total">$ 0,00</span></td>
                `;
            }
            tbody.appendChild(row);
        }
    });
    // Desmarcar todos los checkboxes después de agregar
    document.querySelectorAll('.item-checkbox').forEach(cb => cb.checked = false);
    updateSueldoTable();
}

document.getElementById('agregarItemBtn').addEventListener('click', agregarItemAdicional);

document.querySelector('#sueldoTable tbody').addEventListener('input', function(event) {
    if (event.target.classList.contains('cantidad') || event.target.classList.contains('valor')) {
        updateSueldoTable();
    }
});

document.querySelector('#sueldoTable tbody').addEventListener('click', function(event) {
    if (event.target.classList.contains('quitar-item-btn')) {
        const row = event.target.closest('tr');
        if (row) {
            row.remove();
            updateSueldoTable();
        }
    }
});

// Event listener para remover items de descuentos
document.querySelector('#descuentosTable tbody').addEventListener('click', function(event) {
    if (event.target.classList.contains('quitar-descuento-btn')) {
        const row = event.target.closest('tr');
        if (row) {
            row.remove();
            updateDescuentos();
        }
    }
});

// Calcular descuentos automáticamente como % del subtotal sueldo
function updateDescuentos() {
    const subtotal = parsePesos(document.getElementById('subtotalSueldo').textContent);

    const porcentajes = [
        { id: 'dasOsTitular',      pct: 0.03      },  // 3%
        { id: 'dasOsFdoTrasp',     pct: 0.005     },  // 0.5%
        { id: 'aporteJubilatorio', pct: 0.11      },  // 11%
        { id: 'aporteLey19032',    pct: 0.03      },  // 3%
        { id: 'dasSeguroSepelio',  pct: 0.003     },  // 0.3%
        { id: 'bcoCasaSegVida',    pct: 0.0000036 },  // 0.00036%
    ];

    let subtotalDescuentos = 0;
    porcentajes.forEach(({ id, pct }) => {
        const valor = subtotal * pct;
        document.getElementById(id).textContent = formatoPesos(valor);
        subtotalDescuentos += valor;
    });

    // Calcular descuentos adicionales desde la tabla de descuentos
    const descuentosPorcentajes = {
        'APL': 0.02,      // 2%
        'ATE': 0.025,     // 2.5%
        'UPCN': 0.03,     // 3%
        'Das Familia': 0.03 // 3%
    };
    
    const extraRows = document.querySelectorAll('#descuentosTable tbody tr.extra-descuento-row');
    extraRows.forEach(row => {
        const conceptoEl = row.querySelector('.concepto-nombre');
        const concepto = conceptoEl ? conceptoEl.textContent.trim() : '';
        if (descuentosPorcentajes[concepto]) {
            const descuentoValor = subtotal * descuentosPorcentajes[concepto];
            row.querySelector('.descuento-valor').textContent = formatoPesos(descuentoValor);
            subtotalDescuentos += descuentoValor;
        }
    });

    document.getElementById('subtotalDescuentos').textContent = formatoPesos(subtotalDescuentos);

    // Actualizar total neto en vivo
    const subtotalSueldoVal = parsePesos(document.getElementById('subtotalSueldo').textContent);
    const totalNeto = subtotalSueldoVal - subtotalDescuentos;
    document.getElementById('resSubtotalSueldo').textContent = formatoPesos(subtotalSueldoVal);
    document.getElementById('resSubtotalDescuentos').textContent = formatoPesos(subtotalDescuentos);
    document.getElementById('resTotalNeto').innerHTML = '<strong>' + formatoPesos(totalNeto) + '</strong>';
}

// Inicializar cálculos
updateDescuentos();
