# Simulación de Sueldo

Una página web de una sola página (one-page) responsive para simular el cálculo de sueldo neto con bloques específicos.

## Bloques

- **Bloque de Seteo**: Selección de categoría (1-14), cantidad de módulos por categoría (automática), valor del módulo, adicional por capacitación (automático), años de antigüedad, título (con porcentajes) y opción para agregar a sueldo.
- **Bloque de Sueldo**: Tabla con conceptos salariales y columnas para cantidad de módulos, valor del módulo, total y no remunerativo.
- **Bloque de Descuentos**: Campos para descuentos con subtotal.

## Uso

1. Selecciona la categoría (1-14) en el bloque de seteo. Se mostrarán automáticamente la cantidad de módulos correspondiente y el adicional por capacitación.
2. Ingresa el valor del módulo y años de antigüedad.
3. La tabla de sueldo se actualizará automáticamente con cálculos basados en reglas específicas.
4. Edita los descuentos si es necesario.
5. Calcula el total neto.

## Cantidad de Módulos por Categoría

- 1: 845
- 2: 716
- 3: 606
- 4: 529
- 5: 461
- 6: 402
- 7: 350
- 8: 306
- 9: 254
- 10: 224
- 11: 199
- 12: 176
- 13: 155
- 14: 138

## Reglas de Cálculo

- **Cantidad de Módulos**: Valor fijo por categoría (ver tabla arriba).
- **Valor del Módulo**: Tomado del campo en seteo.
- **Total**: Cantidad × Valor del Módulo.
- **Subtotales** (suma para subtotal general):
  - Sueldo Básico: 30% de cantidad módulos × valor módulo (total también).
  - Dedicación Funcional: 70% de cantidad módulos × valor módulo (total también).
  - Antigüedad: Años de antigüedad × valor módulo (cantidad módulos en tabla = años de antigüedad).
  - Adicional por Capacitación: Valor fijo por categoría (39 para 1, 40 para 2, ..., 52 para 14) × valor módulo (cantidad módulos en tabla = valor fijo).
  - RC 02/23: 85.141 × valor módulo (cantidad fija 85.141).
  - Título: Porcentaje seleccionado × cantidad módulos × valor módulo.
  - Norma ISO: Porcentaje según categoría × cantidad módulos × valor módulo (9% para 1-3, 11% para 4-8, 13% para 9-14).
  - Presentismo: 100 × valor módulo.

- **Total** (columna en tabla):
  - Generalmente cantidad módulos × valor módulo, pero para Sueldo Básico y Dedicación Funcional es igual al subtotal.

## Tecnologías

- HTML5
- CSS3 (Bootstrap)
- JavaScript