---
title: "Ciclo de vida de un proyecto de análisis de datos."
date: 2026-08-20
category: "Análisis de datos"
tags: ["Análisis de datos", "ciencia de datos"]
---

Según un informe que leí de IBM, cada día se generan 2,5 quintillones de bytes en datos, pero solo el 90% de esos datos, permanecen sin estructurar ni analizar. Este numero de datos, están en registro, pero hay una cantidad sin precedente de datos que no se registran, pues viven en papel o simplemente en el aire.

La diferencia entre las organizaciones exitosas y las que no lo son no radica en el acceso a los datos, sino en contar con un **ciclo de vida de análisis de datos estructurado y repetible** que transforme esa información en bruto en una ventaja competitiva.

Aquí no solamente te enseñare a comprender las 6 fases del ciclo de vida del análisis de datos, sino también cómo cada fase se relaciona con el marco de Google, CRISP-DM, y los flujos de trabajo aumentados con IA que las organizaciones con visión de futuro están implementando en este 2026.

## ¿Qué marco de ciclo de vida de análisis de datos debería seguir?

  
Tres marcos de trabajo predominantes definen la estructura de los proyectos de análisis en 2026. Cada uno utiliza una terminología diferente, pero describen el mismo proceso fundamental. Comprender cómo se superponen te permitirá desenvolverte con soltura en cualquier entorno profesional, desde un puesto de analista de datos, hasta un equipo de ciencia de datos empresarial que utilice la metodología CRISP-DM de IBM.

| **Fase** | **Estándar de la industria** | **Marco de trabajo simple** | **CRISP-DM (IBM)** |
| --- | --- | --- | --- |
| **F1** | Definir el problema empresarial | **Preguntar** | Comprensión empresarial |
| F2 | Recopilación y diseño de datos | **Preparar** | Comprensión de datos |
| F3 | Procesamiento y limpieza de datos | **Proceso** | Preparación de datos |
| F4 | Análisis exploratorio (AED) | **Analizar** | Modelado |
| F5 | Creación y validación de modelos | **Compartir** | Evaluación |
| F6 | Visualización y acción | **Acto** | Despliegue |

* * *

## F1. Definir el problema empresarial.

Todo proyecto de análisis de datos se decide en esta fase. Sin una pregunta de negocio bien definida, incluso los datos perfectos generan respuestas inútiles. Según McKinsey, las organizaciones que definen claramente su objetivo analítico antes de recopilar un solo dato tienen **2,4 veces más probabilidades de obtener un retorno de la inversión (ROI) cuantificable** de su inversión en análisis de datos.

Pero, que se hace en la Fase 1?

- **Marco con criterios SMART:** Defina el objetivo como específico, medible, alcanzable, relevante y con plazos definidos. Ejemplo: «Reducir la pérdida de clientes en un 15 % en el tercer trimestre de 2026 mediante el análisis de señales de comportamiento».

- **Aplica los 5 porqués:** Analiza desde el síntoma hasta la causa raíz. «Las ventas cayeron» → Por que? «La tasa de conversión disminuyó» → Por que? «El abandono del carrito de compra se disparó» → Por que? «El tiempo de carga de la página se degradó». Ahora tienes una pregunta que se puede analizar.
- **Alinear a las partes interesadas desde el principio:** Documente quién toma las decisiones, quién utiliza la información y qué significa "suficientemente bueno". Esto evita el error más común: ofrecer respuestas analíticamente correctas a la pregunta equivocada

<aside data-tipo="idea" class="destacado"><p><strong>Caso práctico: Spotify Discover Weekly:</strong> El equipo de producto de Spotify partió de una simple pregunta: "<em>¿Cómo podemos mantener a los usuarios interesados ​​en la música que aún no han descubierto?</em>". Esa claridad, basada en el objetivo comercial de reducir la deserción de clientes, dio como resultado un motor de personalización que ahora utilizan más de 170 millones de oyentes al mes.</p></aside>

* * *

## F2. Recopilación y diseño de datos

Diseñar qué datos necesitas —antes de recopilar un solo byte— es tan estratégico como definir el problema de negocio.

Esta fase responde a tres preguntas:

1. ¿Qué datos representan con precisión el mundo real?
2. ¿Dónde se almacenan?
3. ¿Qué atributos son importantes?

La calidad de tu decisión en la Fase 1 determina la calidad de tu plan de datos en esta fase. A continuación, te presento algunas fuentes de datos primarios por dominio:

1. **Comercio electrónico / Venta minorista:** Existe Google Analytics, los datos transaccionales de Shopify, y CRM (Salesforce/HubSpot), API de gestión de inventario, datos de programas de fidelización.
2. **Cuidado de la salud:** Existen los Sistemas de HCE (Epic, Cerner), dispositivos portátiles IoT, API compatibles con FHIR, bases de datos de ensayos clínicos, datos de reclamaciones de seguros.
3. **Fabricación / IoT:** La Alimentación de sensores PLC/SCADA, sistemas ERP (SAP, Oracle), plataformas de cadena de suministro, bases de datos de control de calidad.
4. **Finanzas / Banca:** Sistemas bancarios centrales, flujos de datos de Bloomberg/Refinitiv, API de procesadores de pagos, bases de datos de informes regulatorios

* * *

## F3: Procesamiento y limpieza de datos

Las encuestas del sector revelan sistemáticamente que los profesionales de datos dedican entre **el 60 % y el 80 % del tiempo de un proyecto** a esta fase. Los datos brutos casi siempre están incompletos, son inconsistentes, están duplicados o tienen un formato incorrecto. El procesamiento de datos es el trabajo de ingeniería que posibilita el análisis, y omitirlo es la causa más común de resultados analíticos erróneos.

Existen 6 operaciones básicas de limpieza de datos.

**Eliminar duplicados**

Identificar y eliminar registros idénticos o casi idénticos que inflan los recuentos. Herramientas: pandas drop\_duplicates(), SQLDISTINCT

- **Simple:** Borrar filas repetidas para no contar dos veces lo mismo.
- **Ejemplo:** Si un cliente dio clic dos veces por error y se registraron dos compras idénticas con el mismo ID en el mismo segundo, eliminas una fila para dejar solo una compra real.

**Manejo de valores faltantes**

Decida: imputar con la media/mediana/moda, usar la imputación basada en máxima verosimilitud o marcar y excluir. La eliminación generalizada rara vez es la opción correcta.

- **Simple:** Rellenar los huecos vacíos con un valor lógico en lugar de borrar toda la fila.
- **Ejemplo:** Si en un formulario de 1,000 personas falta la edad de 5 usuarios, en vez de borrar a esos clientes, rellenas sus casillas vacías con la edad promedio del grupo (por ejemplo, 32 años).

**Estandarizar formatos**

Fechas, monedas, números de teléfono, códigos postales: hay que imponer un esquema único. Los formatos inconsistentes provocan fallos en las uniones y agregaciones sin previo aviso.

- **Simple:** Escribir los datos con la misma estructura para que el sistema no se confunda.
- **Ejemplo:** Convertir fechas mezcladas como `05/12/2026`, `2026-12-05` y `5 de dic` a un único formato estándar: `AAAA-MM-DD` (`2026-12-05`).

**Detectar valores atípicos**

Utilice el rango intercuartílico (IQR), la puntuación Z o los bosques de aislamiento. Determine si los valores atípicos son señales genuinas (fraude, fallo del equipo) o errores de entrada de datos

- **Simple:** Encontrar datos extremadamente raros y revisar si son errores de captura o eventos reales.
- **Ejemplo:** Si el sueldo promedio mensual en una lista es de $15,000 y aparece un registro de $1,500,000, revisas si fue un error de dedo (le sobraron ceros) o si corresponde al director general.

**Validar la integridad**

Confirme la integridad referencial entre tablas. Compruebe que las claves foráneas se resuelven, que los rangos son plausibles y que los valores categóricos coinciden con su vocabulario controlado.

- **Simple:** Comprobar que los datos tengan sentido lógico y que las tablas conecten bien entre sí.
- **Ejemplo:** Verificar que no existan ventas asignadas a un `ID_Cliente = 99` si ese cliente no existe en la tabla de clientes, o que no haya registros con edades negativas como `-5`.

**Ingeniería de características**

Cree columnas derivadas: puntuaciones de recencia/frecuencia/monetarias, promedios móviles, características de ratio y variables categóricas codificadas que aumenten la señal para los modelos posteriores.

- **Simple:** Crear datos nuevos a partir de los datos existentes para darle mejor información al análisis.
- **Ejemplo:** Si tienes la columna `Fecha_de_Nacimiento`, creas una columna nueva llamada `Edad` restando ese año al año actual, facilitando clasificar a los usuarios por rangos de edad.  

* * *

## F4: Análisis exploratorio de datos EDA (Exploratory Data Analysis)

El análisis exploratorio de datos (AED) es donde los analistas desarrollan una intuición sobre el conjunto de datos, antes de comprometerse con cualquier modelo o visualización. El objetivo es descubrir distribuciones, correlaciones, estacionalidad, anomalías y diferencias entre segmentos que impulsen las hipótesis. Omitir o apresurar el AED es la razón por la que los equipos terminan presentando gráficos que parecen convincentes, basados ​​en datos mal interpretados.

El **Análisis Exploratorio de Datos (AED)** es simplemente **explorar y conocer tus datos** antes de hacer cualquier reporte, gráfica o modelo. Es el paso donde descubres la historia que te cuentan los datos.

Aquí están los 5 pilares explicados de forma directa:

### 1\. Distribución

- **¿Qué es?:** Cómo se reparten o agrupan tus datos.
- **En simple:** Es ver si la mayoría de tus clientes tienen entre 20 y 30 años, o si tienes de todas las edades por igual.

### 2\. Correlación

- **¿Qué es?:** Qué tan relacionado está una variable o un dato con otro.
- **En simple:** Ver si al subir una cosa, la otra también sube (ejemplo: a más temperatura, más venta de agua. Mas gasto en marketing, mejores ventas)

### 3\. Estacionalidad

- **¿Qué es?:** Patrones que se repiten en fechas o tiempos específicos.
- **En simple:** Saber que todos los diciembres tus ventas suben por navidad o que todos los domingos el tráfico baja.

### 4\. Anomalías

- **¿Qué es?:** Datos raros o fuera de lo normal.
- **En simple:** Encontrar una venta de $1,000,000 cuando tu venta promedio es de $100 (para saber si es un error o un fraude).

### 5\. Diferencias entre segmentos

- **¿Qué es?:** Comparar distintos grupos entre sí.
- **En simple:** Ver si los clientes que compran por Internet gastan más o menos que los que compran en la tienda física.

### Técnicas de EDA por tipo de pregunta

| **Tipo de pregunta** | **Técnica** | **Herramientas** |
| --- | --- | --- |
| ¿Qué aspecto tiene la distribución? | Histogramas, diagramas de caja, gráficos de densidad | Python (matplotlib/seaborn), Tableau |
| ¿Existe alguna relación entre dos variables? | Matriz de correlación, diagramas de dispersión, mapas de calor | pandas, Power BI, R ggplot2 |
| ¿Existen grupos naturales? | Agrupamiento K-means, t-SNE/UMAP | scikit-learn, BigQuery ML |
| ¿Qué cambió con el tiempo? | Descomposición de series temporales, promedios móviles | statsmodels, Looker, Grafana |
| ¿Qué factores influyeron en esta métrica? | Importancia de las características, gráficos de dependencia parcial | XGBoost, SHAP, IA de vértices |

* * *

# F5: Construccion y validacion del modelo

En 2026, la "creación de modelos" abarca desde un modelo de regresión simple hasta un modelo LLM optimizado e integrado en un flujo de inteligencia empresarial. La disciplina fundamental en esta fase es la validación: garantizar que el modelo se generalice a datos no vistos y que cumpla con la métrica empresarial definida en la Fase 1, y no solo con una métrica técnica como la precisión.

### Tipos de análisis implementados en esta fase

  
**Análisis descriptivo (¿Qué sucedió?):** *Ejemplo:* Tu panel de control muestra que las ventas de la tienda cayeron un 20% el mes pasado.

**Análisis de diagnóstico (¿Por qué sucedió?):** *Ejemplo:* Revisas los datos a fondo y descubres que las ventas cayeron porque la página web falló durante 3 días y los envíos se retrasaron.

**Análisis predictivo (¿Qué sucederá?):** *Ejemplo:* Usas datos históricos para calcular que, si viene una temporada de lluvias el próximo mes, la demanda de impermeables subirá un 35%.

**Análisis prescriptivo (¿Qué deberíamos hacer?):** *Ejemplo:* El sistema te recomienda automáticamente comprar 500 impermeables extra hoy mismo y cambiar de proveedor de envíos para no perder clientes.

* * *

## F6: Visualización, Comunicación y Acción

El análisis que no impulsa la toma de decisiones carece de valor empresarial. La fase 6 es donde el trabajo analítico se convierte en cambio organizacional. Requiere dos habilidades distintas que la mayoría de los programas de capacitación no enfatizan lo suficiente: **la narración narración de datos.** (traducir los conocimientos a las partes interesadas no técnicas) y **la operación** (integrar el modelo o panel de control en los flujos de trabajo diarios para que siga generando valor)  

**Lidera con la perspicacia:**

No obligues a los interesados ​​a buscar la conclusión. Empieza con una frase como «La tasa de abandono ha aumentado un 18 % en el grupo de 25 a 34 años», no con un gráfico que deban interpretar. Titula tus gráficos con conclusiones, no con etiquetas.

**Relaciona la tabla con la pregunta:**

Tendencia a lo largo del tiempo → gráfico de líneas. De parte a todo → gráfico circular o mapa de árbol. Comparación entre categorías → gráfico de barras. Correlación → diagrama de dispersión. Nunca utilice un gráfico circular para más de 5 segmentos

**Plan para la puesta en marcha**

Un análisis puntual pierde validez rápidamente. Cree paneles de control que se actualicen automáticamente, modelos con procesos de reentrenamiento programados y sistemas de alerta que se activen cuando los indicadores clave de rendimiento (KPI) se desvíen.

* * *

## Conjunto de herramientas analíticas por fase (2026)

Elegir la herramienta adecuada para cada fase es fundamental. La siguiente tabla refleja el conjunto de herramientas profesionales estándar a partir de 2026: las mismas herramientas que utilizan los equipos de datos de empresas como Airbnb, Uber, Netflix y las prácticas de análisis de McKinsey.

| **Fase** | **Herramientas básicas** | **Aumentado por IA (2026)** | **Nivel de habilidad** |
| --- | --- | --- | --- |
| **1\. Definir el problema** | Miro, Notion, JIRA | ChatGPT, Claude (planteamiento del problema) | **Principiante** |
| **2\. Recopilar y diseñar** | Python (requests), SQL, APIs | Airbyte, Fivetran, Google Cloud | **Intermedio** |
| **3\. Procesar y limpiar** | pandas, dbt, Apache Spark | Agentes de código OpenAI / Claude, Trifacta | **Intermedio** |
| **4\. Análisis exploratorio de datos (EDA) / Análisis** | Jupyter, Python, R, SQL | Tableau AI, Power BI Copilot, Hex | **Intermedio** |
| **5\. Modelar y validar** | scikit-learn, XGBoost, PyTorch | Vertex AI, Azure ML, SageMaker | **Avanzado** |
| **6\. Visualiza y actúa.** | Tableau, Power BI, Looker | Google Looker Studio AI, Sigma | **Principiante** |

* * *

Espero que algo de aquí te haya servido, continuare a lo largo de mi blog, explicar mas temas y conceptos de datos y tecnología.
