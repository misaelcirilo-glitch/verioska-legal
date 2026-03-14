// ============================================
// Catálogo de Jurisprudencia Penal - México y Perú
// Base curada de tesis, casaciones y sentencias clave
// ============================================

export interface Jurisprudencia {
  id: string
  pais: 'MX' | 'PE'
  organo: string          // SCJN, TCC, TC, Corte Suprema, etc.
  numeroTesis: string     // Ej: "1a./J. 34/2019"
  epoca: string           // Décima Época, etc.
  rubro: string           // Título/Rubro
  texto: string           // Texto de la tesis/casación
  temas: string[]         // Tags temáticos
  delitosRelacionados: string[]
  etapasAplicables: string[]
  relevancia: 'alta' | 'media'
  fechaPublicacion: string
}

// ============================================
// JURISPRUDENCIA MEXICANA (SCJN, TCC)
// ============================================
const JURISPRUDENCIA_MX: Jurisprudencia[] = [
  // --- DETENCIÓN Y FLAGRANCIA ---
  {
    id: 'mx-001',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 100/2017',
    epoca: 'Décima Época',
    rubro: 'FLAGRANCIA. PARA QUE SE ACTUALICE LA DETENCIÓN POR CASO URGENTE DEBE EXISTIR RIESGO FUNDADO DE QUE EL INDICIADO SE SUSTRAIGA DE LA ACCIÓN DE LA JUSTICIA',
    texto: 'La detención en flagrancia exige que la persona sea detenida en el momento de estar cometiendo el delito o inmediatamente después, con persecución material e ininterrumpida. No basta la mera referencia de un testigo sin que exista una relación temporal inmediata entre el hecho y la detención.',
    temas: ['flagrancia', 'detención', 'libertad personal', 'control de legalidad'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_inicial'],
    relevancia: 'alta',
    fechaPublicacion: '2017-10',
  },
  {
    id: 'mx-002',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 24/2016',
    epoca: 'Décima Época',
    rubro: 'PRUEBA ILÍCITA. EXCLUSIÓN DE LA DERIVADA DE UNA DETENCIÓN ARBITRARIA',
    texto: 'Toda prueba obtenida directa o indirectamente con motivo de una detención que no reúna los requisitos constitucionales de flagrancia u orden de aprehensión debe ser excluida del proceso penal, conforme a la regla de exclusión y la doctrina del fruto del árbol envenenado.',
    temas: ['prueba ilícita', 'exclusión probatoria', 'fruto del árbol envenenado', 'detención arbitraria'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_inicial', 'intermedia', 'juicio_oral'],
    relevancia: 'alta',
    fechaPublicacion: '2016-06',
  },
  // --- VINCULACIÓN A PROCESO ---
  {
    id: 'mx-003',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 34/2019',
    epoca: 'Décima Época',
    rubro: 'VINCULACIÓN A PROCESO. EL ESTÁNDAR PROBATORIO NO EXIGE ACREDITAR EL CUERPO DEL DELITO NI LA PROBABLE RESPONSABILIDAD',
    texto: 'Para la vinculación a proceso basta que de los antecedentes de la investigación se desprendan datos que establezcan que se ha cometido un hecho que la ley señala como delito y que exista probabilidad de que el indiciado lo cometió o participó en su comisión. Este estándar es menor al de la sentencia condenatoria.',
    temas: ['vinculación a proceso', 'estándar probatorio', 'datos de prueba'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_inicial', 'investigacion_complementaria'],
    relevancia: 'alta',
    fechaPublicacion: '2019-05',
  },
  // --- PRISIÓN PREVENTIVA ---
  {
    id: 'mx-004',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 41/2020',
    epoca: 'Décima Época',
    rubro: 'PRISIÓN PREVENTIVA OFICIOSA. EL CATÁLOGO DE DELITOS DEL ARTÍCULO 19 CONSTITUCIONAL ES DE INTERPRETACIÓN ESTRICTA',
    texto: 'El listado de delitos que ameritan prisión preventiva oficiosa debe interpretarse de manera estricta, sin que pueda ampliarse por analogía o mayoría de razón. Solo procede respecto de los delitos expresamente señalados en el artículo 19 constitucional.',
    temas: ['prisión preventiva', 'medidas cautelares', 'interpretación estricta', 'libertad personal'],
    delitosRelacionados: ['secuestro', 'delincuencia organizada', 'homicidio doloso', 'violación'],
    etapasAplicables: ['investigacion_inicial', 'investigacion_complementaria'],
    relevancia: 'alta',
    fechaPublicacion: '2020-08',
  },
  // --- CADENA DE CUSTODIA ---
  {
    id: 'mx-005',
    pais: 'MX',
    organo: 'Pleno de Circuito',
    numeroTesis: 'PC.I.P. J/42 P',
    epoca: 'Décima Época',
    rubro: 'CADENA DE CUSTODIA. SU RUPTURA GENERA DUDA RAZONABLE SOBRE LA AUTENTICIDAD DE LA EVIDENCIA',
    texto: 'Cuando se acredita la ruptura de la cadena de custodia respecto de evidencia material, se genera duda razonable sobre su autenticidad e integridad, lo que impacta en su valor probatorio. El juzgador debe ponderar si la irregularidad afecta sustancialmente la fiabilidad de la evidencia.',
    temas: ['cadena de custodia', 'evidencia', 'duda razonable', 'valor probatorio'],
    delitosRelacionados: [],
    etapasAplicables: ['intermedia', 'juicio_oral'],
    relevancia: 'alta',
    fechaPublicacion: '2018-03',
  },
  // --- PRESUNCIÓN DE INOCENCIA ---
  {
    id: 'mx-006',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 26/2014',
    epoca: 'Décima Época',
    rubro: 'PRESUNCIÓN DE INOCENCIA COMO ESTÁNDAR DE PRUEBA. EXIGE CERTEZA MÁS ALLÁ DE DUDA RAZONABLE',
    texto: 'La presunción de inocencia como estándar de prueba establece que para condenar se requiere certeza racional sobre la culpabilidad del acusado. Si después de la valoración integral de las pruebas subsiste una duda razonable, debe absolverse. El principio in dubio pro reo es su consecuencia directa.',
    temas: ['presunción de inocencia', 'duda razonable', 'in dubio pro reo', 'estándar de prueba'],
    delitosRelacionados: [],
    etapasAplicables: ['juicio_oral', 'apelacion'],
    relevancia: 'alta',
    fechaPublicacion: '2014-06',
  },
  // --- PROCEDIMIENTO ABREVIADO ---
  {
    id: 'mx-007',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 15/2018',
    epoca: 'Décima Época',
    rubro: 'PROCEDIMIENTO ABREVIADO. LA REDUCCIÓN DE PENA DEBE SER PROPORCIONAL Y NO PUEDE EXCEDER DE UN TERCIO DE LA PENA MÍNIMA',
    texto: 'En el procedimiento abreviado, la pena impuesta no puede ser mayor a la solicitada por el Ministerio Público y debe incluir una reducción que no exceda de un tercio de la pena mínima del delito. El beneficio premial constituye un incentivo legítimo para descongestionar el sistema.',
    temas: ['procedimiento abreviado', 'reducción de pena', 'justicia alternativa', 'negociación'],
    delitosRelacionados: [],
    etapasAplicables: ['intermedia'],
    relevancia: 'alta',
    fechaPublicacion: '2018-04',
  },
  // --- AMPARO ---
  {
    id: 'mx-008',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 53/2019',
    epoca: 'Décima Época',
    rubro: 'AMPARO INDIRECTO. PROCEDE CONTRA EL AUTO DE VINCULACIÓN A PROCESO CUANDO SE RECLAMAN VIOLACIONES AL DEBIDO PROCESO',
    texto: 'El auto de vinculación a proceso es un acto que afecta la libertad personal del imputado y por tanto es impugnable mediante amparo indirecto. No es necesario agotar los recursos ordinarios cuando se reclaman violaciones directas a derechos fundamentales.',
    temas: ['amparo', 'vinculación a proceso', 'debido proceso', 'libertad personal'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_complementaria', 'amparo'],
    relevancia: 'alta',
    fechaPublicacion: '2019-09',
  },
  // --- TESTIGOS ---
  {
    id: 'mx-009',
    pais: 'MX',
    organo: 'TCC Primer Circuito',
    numeroTesis: 'I.1o.P.234 P',
    epoca: 'Décima Época',
    rubro: 'CONTRADICCIONES EN DECLARACIONES TESTIMONIALES. IMPACTAN LA CREDIBILIDAD DEL TESTIGO',
    texto: 'Cuando un testigo incurre en contradicciones sustanciales entre su declaración ministerial y su declaración en juicio oral, el juzgador debe valorar tales inconsistencias para determinar la credibilidad del testimonio, especialmente si las contradicciones versan sobre hechos esenciales del evento delictivo.',
    temas: ['testigos', 'contradicciones', 'credibilidad', 'valoración probatoria', 'contrainterrogatorio'],
    delitosRelacionados: [],
    etapasAplicables: ['juicio_oral'],
    relevancia: 'alta',
    fechaPublicacion: '2019-11',
  },
  // --- TORTURA / DECLARACIONES ---
  {
    id: 'mx-010',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 10/2016',
    epoca: 'Décima Época',
    rubro: 'TORTURA. CUANDO SE ALEGA, LA CARGA DE LA PRUEBA RECAE EN EL ESTADO PARA DEMOSTRAR QUE LA CONFESIÓN FUE VOLUNTARIA',
    texto: 'Cuando el imputado alega haber sido víctima de tortura o tratos crueles para obtener su confesión, la carga de la prueba se invierte y corresponde al Estado demostrar que la declaración fue rendida libremente y sin coacción. De no acreditarse, la declaración debe excluirse.',
    temas: ['tortura', 'confesión', 'exclusión probatoria', 'carga de la prueba', 'derechos humanos'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_inicial', 'intermedia', 'juicio_oral'],
    relevancia: 'alta',
    fechaPublicacion: '2016-03',
  },
  // --- REPARACIÓN DEL DAÑO ---
  {
    id: 'mx-011',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 45/2017',
    epoca: 'Décima Época',
    rubro: 'ACUERDO REPARATORIO. PROCEDE RESPECTO DE DELITOS CULPOSOS Y PATRIMONIALES SIN VIOLENCIA',
    texto: 'Los acuerdos reparatorios son procedentes respecto de delitos que se persiguen por querella, delitos culposos y delitos patrimoniales sin violencia. Una vez cumplido el acuerdo, se extingue la acción penal. El juez debe verificar que el consentimiento de la víctima sea libre e informado.',
    temas: ['acuerdo reparatorio', 'justicia restaurativa', 'extinción de acción penal', 'víctima'],
    delitosRelacionados: ['robo sin violencia', 'fraude', 'abuso de confianza', 'daño en propiedad ajena'],
    etapasAplicables: ['investigacion_inicial', 'investigacion_complementaria', 'intermedia'],
    relevancia: 'alta',
    fechaPublicacion: '2017-07',
  },
  // --- SOBRESEIMIENTO ---
  {
    id: 'mx-012',
    pais: 'MX',
    organo: 'TCC Segundo Circuito',
    numeroTesis: 'II.3o.P.87 P',
    epoca: 'Décima Época',
    rubro: 'SOBRESEIMIENTO. PROCEDE CUANDO EL MP NO FORMULA ACUSACIÓN AL VENCIMIENTO DEL PLAZO DE INVESTIGACIÓN COMPLEMENTARIA',
    texto: 'Si transcurrido el plazo de investigación complementaria fijado por el juez, el Ministerio Público no formula acusación, procede el sobreseimiento de la causa penal conforme al artículo 327 del CNPP. Este sobreseimiento tiene efectos de sentencia absolutoria.',
    temas: ['sobreseimiento', 'plazo de investigación', 'acusación', 'sentencia absolutoria'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_complementaria', 'intermedia'],
    relevancia: 'alta',
    fechaPublicacion: '2018-09',
  },
]

// ============================================
// JURISPRUDENCIA PERUANA (TC, Corte Suprema)
// ============================================
const JURISPRUDENCIA_PE: Jurisprudencia[] = [
  // --- PRISIÓN PREVENTIVA ---
  {
    id: 'pe-001',
    pais: 'PE',
    organo: 'Corte Suprema - Sala Penal Permanente',
    numeroTesis: 'Casación 626-2013-Moquegua',
    epoca: 'Vinculante',
    rubro: 'PRISIÓN PREVENTIVA. PRESUPUESTOS MATERIALES Y AUDIENCIA DE DEBATE',
    texto: 'Para imponer prisión preventiva se exige la concurrencia copulativa de: 1) graves y fundados elementos de convicción, 2) prognosis de pena superior a 4 años, 3) peligro procesal (de fuga o de obstaculización). El fiscal debe sustentar cada presupuesto con elementos concretos. La audiencia debe ser contradictoria y respetar la inmediación.',
    temas: ['prisión preventiva', 'presupuestos materiales', 'peligro procesal', 'peligro de fuga'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_preparatoria'],
    relevancia: 'alta',
    fechaPublicacion: '2015-06',
  },
  {
    id: 'pe-002',
    pais: 'PE',
    organo: 'Tribunal Constitucional',
    numeroTesis: 'Exp. 04780-2017-PHC/TC',
    epoca: 'Precedente',
    rubro: 'PRISIÓN PREVENTIVA. MOTIVACIÓN REFORZADA Y PROPORCIONALIDAD',
    texto: 'La resolución que impone prisión preventiva requiere motivación reforzada y cualificada, dado que restringe la libertad personal. Debe explicar por qué las medidas alternativas (comparecencia con restricciones, impedimento de salida) resultan insuficientes para asegurar los fines del proceso.',
    temas: ['prisión preventiva', 'motivación', 'proporcionalidad', 'libertad personal', 'medidas alternativas'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_preparatoria'],
    relevancia: 'alta',
    fechaPublicacion: '2018-10',
  },
  // --- PRESUNCIÓN DE INOCENCIA ---
  {
    id: 'pe-003',
    pais: 'PE',
    organo: 'Tribunal Constitucional',
    numeroTesis: 'Exp. 00156-2012-PHC/TC',
    epoca: 'Precedente',
    rubro: 'PRESUNCIÓN DE INOCENCIA. DERECHO FUNDAMENTAL Y REGLA PROBATORIA',
    texto: 'La presunción de inocencia opera como derecho fundamental, regla de tratamiento y regla probatoria. Como regla probatoria, exige que la condena se base en prueba suficiente que genere certeza sobre la responsabilidad penal. La duda favorece al procesado (in dubio pro reo).',
    temas: ['presunción de inocencia', 'in dubio pro reo', 'prueba suficiente', 'certeza'],
    delitosRelacionados: [],
    etapasAplicables: ['juzgamiento', 'impugnacion'],
    relevancia: 'alta',
    fechaPublicacion: '2012-08',
  },
  // --- TUTELA DE DERECHOS ---
  {
    id: 'pe-004',
    pais: 'PE',
    organo: 'Corte Suprema - Sala Penal Permanente',
    numeroTesis: 'Casación 136-2013-Tacna',
    epoca: 'Vinculante',
    rubro: 'TUTELA DE DERECHOS. ALCANCES Y LEGITIMIDAD PARA SOLICITAR',
    texto: 'La audiencia de tutela de derechos (Art. 71.4 NCPP) procede cuando se vulneran derechos del imputado durante la investigación. Permite solicitar al juez que subsane la omisión o dicte medidas de corrección o protección. Es un mecanismo de control judicial de la investigación fiscal.',
    temas: ['tutela de derechos', 'control judicial', 'derechos del imputado', 'investigación fiscal'],
    delitosRelacionados: [],
    etapasAplicables: ['diligencias_preliminares', 'investigacion_preparatoria'],
    relevancia: 'alta',
    fechaPublicacion: '2014-03',
  },
  // --- TERMINACIÓN ANTICIPADA ---
  {
    id: 'pe-005',
    pais: 'PE',
    organo: 'Corte Suprema - Pleno Jurisdiccional',
    numeroTesis: 'Acuerdo Plenario 5-2009/CJ-116',
    epoca: 'Vinculante',
    rubro: 'TERMINACIÓN ANTICIPADA. BENEFICIO PREMIAL Y CONFESIÓN SINCERA',
    texto: 'La terminación anticipada permite una reducción de pena de hasta 1/6. Si concurre con confesión sincera, el beneficio adicional de 1/3 se calcula sobre la pena ya reducida. Ambos beneficios son acumulables. El acuerdo debe ser aprobado por el juez verificando legalidad y proporcionalidad.',
    temas: ['terminación anticipada', 'confesión sincera', 'reducción de pena', 'beneficio premial'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_preparatoria'],
    relevancia: 'alta',
    fechaPublicacion: '2009-11',
  },
  // --- PRUEBA ILÍCITA ---
  {
    id: 'pe-006',
    pais: 'PE',
    organo: 'Corte Suprema - Sala Penal Permanente',
    numeroTesis: 'Casación 591-2015-Huánuco',
    epoca: 'Vinculante',
    rubro: 'PRUEBA ILÍCITA. EXCLUSIÓN Y DOCTRINA DEL FRUTO DEL ÁRBOL ENVENENADO',
    texto: 'La prueba obtenida con vulneración del contenido esencial de los derechos fundamentales es prueba ilícita y debe excluirse. La exclusión se extiende a las pruebas derivadas (fruto del árbol envenenado), salvo las excepciones de fuente independiente, descubrimiento inevitable y vínculo atenuado.',
    temas: ['prueba ilícita', 'exclusión probatoria', 'fruto del árbol envenenado', 'derechos fundamentales'],
    delitosRelacionados: [],
    etapasAplicables: ['etapa_intermedia', 'juzgamiento'],
    relevancia: 'alta',
    fechaPublicacion: '2016-05',
  },
  // --- CONTROL DE PLAZO ---
  {
    id: 'pe-007',
    pais: 'PE',
    organo: 'Corte Suprema - Sala Penal Permanente',
    numeroTesis: 'Casación 02-2008-La Libertad',
    epoca: 'Vinculante',
    rubro: 'CONTROL DE PLAZO. EL JUEZ DEBE ORDENAR LA CONCLUSIÓN DE LA INVESTIGACIÓN CUANDO SE EXCEDE EL PLAZO',
    texto: 'Cuando el fiscal excede el plazo de investigación preparatoria, el imputado puede solicitar control de plazo ante el JIP. El juez, previa audiencia, debe ordenar al fiscal que concluya la investigación en un plazo no mayor de 10 días. Si no formula acusación, procede el sobreseimiento.',
    temas: ['control de plazo', 'investigación preparatoria', 'plazo razonable', 'sobreseimiento'],
    delitosRelacionados: [],
    etapasAplicables: ['diligencias_preliminares', 'investigacion_preparatoria'],
    relevancia: 'alta',
    fechaPublicacion: '2008-12',
  },
  // --- ACUSACIÓN ---
  {
    id: 'pe-008',
    pais: 'PE',
    organo: 'Corte Suprema - Pleno Jurisdiccional',
    numeroTesis: 'Acuerdo Plenario 6-2009/CJ-116',
    epoca: 'Vinculante',
    rubro: 'CONTROL DE ACUSACIÓN. REQUISITOS FORMALES Y SUSTANCIALES',
    texto: 'En la audiencia de control de acusación, el juez debe verificar: 1) requisitos formales (identificación del acusado, hechos, tipificación, medios de prueba), 2) requisitos sustanciales (elementos de convicción suficientes). Las partes pueden formular observaciones, deducir excepciones y solicitar sobreseimiento.',
    temas: ['control de acusación', 'etapa intermedia', 'requisitos de acusación', 'sobreseimiento'],
    delitosRelacionados: [],
    etapasAplicables: ['etapa_intermedia'],
    relevancia: 'alta',
    fechaPublicacion: '2009-11',
  },
  // --- DETENCIÓN ---
  {
    id: 'pe-009',
    pais: 'PE',
    organo: 'Tribunal Constitucional',
    numeroTesis: 'Exp. 06423-2007-PHC/TC',
    epoca: 'Precedente',
    rubro: 'DETENCIÓN POLICIAL. PLAZO DE 48 HORAS Y FLAGRANCIA DELICTIVA',
    texto: 'La detención policial en flagrancia no puede exceder las 48 horas. Transcurrido ese plazo sin que se ponga al detenido a disposición del juez o fiscal, la detención deviene en arbitraria. En casos de terrorismo, espionaje y tráfico ilícito de drogas, el plazo es de 15 días naturales.',
    temas: ['detención policial', 'flagrancia', 'plazo de detención', 'habeas corpus'],
    delitosRelacionados: ['terrorismo', 'espionaje', 'tráfico ilícito de drogas'],
    etapasAplicables: ['diligencias_preliminares'],
    relevancia: 'alta',
    fechaPublicacion: '2008-06',
  },
  // --- VALORACIÓN PROBATORIA ---
  {
    id: 'pe-010',
    pais: 'PE',
    organo: 'Corte Suprema - Pleno Jurisdiccional',
    numeroTesis: 'Acuerdo Plenario 2-2005/CJ-116',
    epoca: 'Vinculante',
    rubro: 'DECLARACIÓN DEL TESTIGO. REQUISITOS DE VALORACIÓN Y CONTRADICCIONES',
    texto: 'Para valorar la declaración testimonial se deben considerar: 1) ausencia de incredibilidad subjetiva (no enemistad, resentimiento), 2) verosimilitud del testimonio (coherencia, corroboración periférica), 3) persistencia en la incriminación (uniformidad y firmeza). Las contradicciones sustanciales afectan la credibilidad.',
    temas: ['valoración probatoria', 'testigos', 'credibilidad', 'contradicciones', 'persistencia'],
    delitosRelacionados: [],
    etapasAplicables: ['juzgamiento', 'impugnacion'],
    relevancia: 'alta',
    fechaPublicacion: '2005-09',
  },
  // --- CRIMEN ORGANIZADO ---
  {
    id: 'pe-011',
    pais: 'PE',
    organo: 'Corte Suprema - Sala Penal Permanente',
    numeroTesis: 'Casación 92-2017-Arequipa',
    epoca: 'Vinculante',
    rubro: 'ORGANIZACIÓN CRIMINAL. REQUISITOS DE LA LEY 30077 PARA SU CALIFICACIÓN',
    texto: 'Para calificar un caso como crimen organizado bajo la Ley 30077 se requiere: 1) tres o más personas, 2) reparto de roles, 3) permanencia en el tiempo, 4) actuación concertada, 5) finalidad de cometer delitos graves. La mera pluralidad de agentes no configura organización criminal.',
    temas: ['crimen organizado', 'organización criminal', 'Ley 30077', 'pluralidad de agentes'],
    delitosRelacionados: ['asociación ilícita', 'lavado de activos', 'extorsión', 'tráfico ilícito de drogas'],
    etapasAplicables: ['diligencias_preliminares', 'investigacion_preparatoria', 'etapa_intermedia'],
    relevancia: 'alta',
    fechaPublicacion: '2018-02',
  },
  // --- REPARACIÓN CIVIL ---
  {
    id: 'pe-012',
    pais: 'PE',
    organo: 'Corte Suprema - Pleno Jurisdiccional',
    numeroTesis: 'Acuerdo Plenario 6-2006/CJ-116',
    epoca: 'Vinculante',
    rubro: 'REPARACIÓN CIVIL. DETERMINACIÓN Y CRITERIOS DE FIJACIÓN',
    texto: 'La reparación civil comprende la restitución del bien y la indemnización por daños y perjuicios. Su fijación no depende de la gravedad del delito sino del daño causado. El juez debe motivar el monto considerando el daño emergente, lucro cesante y daño moral.',
    temas: ['reparación civil', 'daños y perjuicios', 'indemnización', 'víctima'],
    delitosRelacionados: [],
    etapasAplicables: ['juzgamiento', 'etapa_intermedia'],
    relevancia: 'alta',
    fechaPublicacion: '2006-12',
  },
]

// ============================================
// FUNCIONES DE BÚSQUEDA
// ============================================

const TODO_CATALOGO = [...JURISPRUDENCIA_MX, ...JURISPRUDENCIA_PE]

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function buscarJurisprudencia(params: {
  consulta?: string
  pais?: 'MX' | 'PE'
  tema?: string
  etapa?: string
  delito?: string
}): Jurisprudencia[] {
  let resultados = [...TODO_CATALOGO]

  // Filtrar por país
  if (params.pais) {
    resultados = resultados.filter(j => j.pais === params.pais)
  }

  // Filtrar por etapa
  if (params.etapa) {
    resultados = resultados.filter(j => j.etapasAplicables.includes(params.etapa!))
  }

  // Filtrar por tema
  if (params.tema) {
    const temaNorm = normalizarTexto(params.tema)
    resultados = resultados.filter(j =>
      j.temas.some(t => normalizarTexto(t).includes(temaNorm))
    )
  }

  // Filtrar por delito
  if (params.delito) {
    const delitoNorm = normalizarTexto(params.delito)
    resultados = resultados.filter(j =>
      j.delitosRelacionados.length === 0 || // Aplica a todos los delitos
      j.delitosRelacionados.some(d => normalizarTexto(d).includes(delitoNorm))
    )
  }

  // Búsqueda por texto libre
  if (params.consulta) {
    const palabras = normalizarTexto(params.consulta).split(' ').filter(p => p.length > 2)
    if (palabras.length > 0) {
      resultados = resultados
        .map(j => {
          const textoCompleto = normalizarTexto(`${j.rubro} ${j.texto} ${j.temas.join(' ')}`)
          const coincidencias = palabras.filter(p => textoCompleto.includes(p)).length
          return { ...j, _score: coincidencias / palabras.length }
        })
        .filter(j => (j as { _score: number })._score > 0.3)
        .sort((a, b) => (b as { _score: number })._score - (a as { _score: number })._score)
    }
  }

  return resultados
}

export function obtenerJurisprudenciaPorId(id: string): Jurisprudencia | undefined {
  return TODO_CATALOGO.find(j => j.id === id)
}

export function obtenerTemasDisponibles(pais?: 'MX' | 'PE'): string[] {
  const fuente = pais ? TODO_CATALOGO.filter(j => j.pais === pais) : TODO_CATALOGO
  const temas = new Set<string>()
  fuente.forEach(j => j.temas.forEach(t => temas.add(t)))
  return Array.from(temas).sort()
}
