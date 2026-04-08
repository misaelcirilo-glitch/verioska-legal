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
  // --- DEFENSA ADECUADA ---
  {
    id: 'mx-013',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 12/2012',
    epoca: 'Décima Época',
    rubro: 'DEFENSA ADECUADA. ALCANCE DE LA INTERVENCIÓN DEL DEFENSOR EN LA AVERIGUACIÓN PREVIA',
    texto: 'El derecho a la defensa adecuada exige la presencia del defensor en todas las diligencias en que el imputado deba comparecer, incluida la declaración ministerial. La defensa debe ser técnica, real y efectiva, no meramente nominal. Su ausencia genera nulidad de las actuaciones.',
    temas: ['defensa adecuada', 'defensor', 'asistencia técnica', 'nulidad'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_inicial', 'investigacion_complementaria'],
    relevancia: 'alta',
    fechaPublicacion: '2012-08',
  },
  // --- TORTURA ---
  {
    id: 'mx-014',
    pais: 'MX',
    organo: 'Pleno SCJN',
    numeroTesis: 'P./J. 22/2014',
    epoca: 'Décima Época',
    rubro: 'TORTURA. CARGA DE LA PRUEBA Y OBLIGACIÓN DE INVESTIGAR DE OFICIO',
    texto: 'Cuando se denuncia tortura, las autoridades tienen la obligación de investigar de oficio. La carga probatoria de descartar la tortura recae en el Estado. Las pruebas obtenidas mediante tortura deben excluirse del proceso, conforme al Protocolo de Estambul.',
    temas: ['tortura', 'carga probatoria', 'investigación de oficio', 'Protocolo de Estambul', 'exclusión'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_inicial', 'intermedia', 'juicio_oral'],
    relevancia: 'alta',
    fechaPublicacion: '2014-04',
  },
  // --- AMPARO PENAL ---
  {
    id: 'mx-015',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 35/2018',
    epoca: 'Décima Época',
    rubro: 'AMPARO INDIRECTO. PROCEDE CONTRA AUTO DE VINCULACIÓN A PROCESO',
    texto: 'El amparo indirecto procede contra el auto de vinculación a proceso por afectar la libertad personal. El juez de Distrito puede analizar si existen datos de prueba suficientes para acreditar el hecho delictivo y la probable participación del imputado.',
    temas: ['amparo indirecto', 'vinculación a proceso', 'libertad personal', 'datos de prueba'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_complementaria', 'intermedia'],
    relevancia: 'alta',
    fechaPublicacion: '2018-12',
  },
  // --- PRINCIPIO DE PRESUNCIÓN DE INOCENCIA ---
  {
    id: 'mx-016',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 25/2014',
    epoca: 'Décima Época',
    rubro: 'PRESUNCIÓN DE INOCENCIA COMO ESTÁNDAR DE PRUEBA',
    texto: 'La presunción de inocencia exige que la condena se base en prueba más allá de toda duda razonable. Si la prueba de cargo es insuficiente o existe duda razonable, debe absolverse al imputado en aplicación del principio in dubio pro reo.',
    temas: ['presunción de inocencia', 'duda razonable', 'in dubio pro reo', 'estándar probatorio'],
    delitosRelacionados: [],
    etapasAplicables: ['juicio_oral'],
    relevancia: 'alta',
    fechaPublicacion: '2014-05',
  },
  // --- TESTIGO PROTEGIDO ---
  {
    id: 'mx-017',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 65/2016',
    epoca: 'Décima Época',
    rubro: 'TESTIGO COLABORADOR. SU TESTIMONIO REQUIERE CORROBORACIÓN PERIFÉRICA',
    texto: 'La declaración del testigo colaborador (criteriado o protegido) tiene valor probatorio limitado y requiere corroboración con otros elementos de prueba. No puede ser, por sí sola, suficiente para condenar. El juez debe valorar su credibilidad considerando los beneficios obtenidos.',
    temas: ['testigo colaborador', 'criteriado', 'corroboración', 'valor probatorio'],
    delitosRelacionados: ['delincuencia organizada'],
    etapasAplicables: ['juicio_oral'],
    relevancia: 'alta',
    fechaPublicacion: '2016-11',
  },
  // --- CADENA DE CUSTODIA ---
  {
    id: 'mx-018',
    pais: 'MX',
    organo: 'Tribunales Colegiados',
    numeroTesis: 'I.9o.P.97 P (10a.)',
    epoca: 'Décima Época',
    rubro: 'CADENA DE CUSTODIA. SU RUPTURA AFECTA LA EFICACIA PROBATORIA',
    texto: 'La cadena de custodia es esencial para garantizar la mismidad e integridad de los indicios y elementos materiales probatorios. Su ruptura no necesariamente conduce a la nulidad pero sí afecta la eficacia probatoria, pudiendo restarles valor o excluirlos.',
    temas: ['cadena de custodia', 'integridad', 'mismidad', 'eficacia probatoria'],
    delitosRelacionados: [],
    etapasAplicables: ['intermedia', 'juicio_oral'],
    relevancia: 'alta',
    fechaPublicacion: '2018-04',
  },
  // --- CRIMINALIDAD ORGANIZADA ---
  {
    id: 'mx-019',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 88/2017',
    epoca: 'Décima Época',
    rubro: 'DELINCUENCIA ORGANIZADA. ELEMENTOS DEL TIPO PENAL Y PERMANENCIA',
    texto: 'El delito de delincuencia organizada exige la concurrencia de tres o más personas, organizadas para cometer en forma permanente o reiterada los delitos del catálogo. La mera comisión conjunta no basta; debe acreditarse estructura, jerarquía y permanencia.',
    temas: ['delincuencia organizada', 'permanencia', 'estructura', 'jerarquía'],
    delitosRelacionados: ['delincuencia organizada', 'lavado de dinero', 'secuestro'],
    etapasAplicables: ['investigacion_inicial', 'intermedia', 'juicio_oral'],
    relevancia: 'alta',
    fechaPublicacion: '2017-12',
  },
  // --- PROCEDIMIENTO ABREVIADO ---
  {
    id: 'mx-020',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 79/2016',
    epoca: 'Décima Época',
    rubro: 'PROCEDIMIENTO ABREVIADO. EL ACUSADO NO PUEDE IMPUGNAR LA INDIVIDUALIZACIÓN DE LA PENA',
    texto: 'Cuando el acusado se acoge al procedimiento abreviado y acepta su responsabilidad, no puede posteriormente impugnar la individualización de la pena, ya que esta forma parte del acuerdo aceptado libremente con asesoría jurídica. Solo procede impugnar errores manifiestos.',
    temas: ['procedimiento abreviado', 'individualización de pena', 'impugnación', 'aceptación voluntaria'],
    delitosRelacionados: [],
    etapasAplicables: ['intermedia'],
    relevancia: 'alta',
    fechaPublicacion: '2017-01',
  },
  // --- DERECHO A NO AUTOINCRIMINARSE ---
  {
    id: 'mx-021',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 80/2017',
    epoca: 'Décima Época',
    rubro: 'NO AUTOINCRIMINACIÓN. SILENCIO DEL IMPUTADO NO PUEDE USARSE EN SU CONTRA',
    texto: 'El derecho a guardar silencio y no autoincriminarse impide que el silencio del imputado sea usado como indicio de culpabilidad. El juzgador no puede inferir conclusiones desfavorables del ejercicio de este derecho fundamental durante cualquier etapa del proceso.',
    temas: ['no autoincriminación', 'silencio', 'derechos del imputado'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_inicial', 'intermedia', 'juicio_oral'],
    relevancia: 'alta',
    fechaPublicacion: '2018-02',
  },
  // --- VÍCTIMA ---
  {
    id: 'mx-022',
    pais: 'MX',
    organo: 'Primera Sala SCJN',
    numeroTesis: '1a./J. 19/2017',
    epoca: 'Décima Época',
    rubro: 'VÍCTIMA. DERECHOS PROCESALES Y PARTICIPACIÓN ACTIVA EN EL PROCESO',
    texto: 'La víctima u ofendido tiene derecho a participar activamente en el proceso penal: ser informada, intervenir en audiencias, ofrecer pruebas, impugnar resoluciones del MP y demandar la reparación del daño. Su participación no se limita al ámbito civil.',
    temas: ['víctima', 'derechos procesales', 'reparación del daño', 'participación'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_inicial', 'intermedia', 'juicio_oral'],
    relevancia: 'alta',
    fechaPublicacion: '2017-04',
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
  // --- COLABORACIÓN EFICAZ ---
  {
    id: 'pe-013',
    pais: 'PE',
    organo: 'Corte Suprema - Pleno Jurisdiccional',
    numeroTesis: 'Acuerdo Plenario 2-2017/SPN',
    epoca: 'Vinculante',
    rubro: 'COLABORACIÓN EFICAZ. CORROBORACIÓN PERIFÉRICA Y BENEFICIOS PROCESALES',
    texto: 'La declaración del colaborador eficaz debe ser corroborada con elementos objetivos externos a su declaración. Los beneficios pueden incluir exención, reducción o remisión de pena. El juez controla la legalidad y proporcionalidad del acuerdo entre fiscal y colaborador.',
    temas: ['colaboración eficaz', 'corroboración periférica', 'beneficios procesales', 'declaración'],
    delitosRelacionados: ['crimen organizado', 'corrupción de funcionarios', 'lavado de activos'],
    etapasAplicables: ['investigacion_preparatoria', 'etapa_intermedia'],
    relevancia: 'alta',
    fechaPublicacion: '2017-09',
  },
  // --- CONFESIÓN SINCERA ---
  {
    id: 'pe-014',
    pais: 'PE',
    organo: 'Corte Suprema - Pleno Jurisdiccional',
    numeroTesis: 'Acuerdo Plenario 5-2008/CJ-116',
    epoca: 'Vinculante',
    rubro: 'CONFESIÓN SINCERA. REQUISITOS PARA LA REDUCCIÓN DE PENA',
    texto: 'La confesión sincera, para ser valorada como atenuante con reducción de pena (Art. 161 CPP), requiere: 1) ser espontánea y oportuna (antes de la acusación), 2) sincera y veraz, 3) coincidir con los hechos investigados. La reducción es de hasta 1/3 de la pena.',
    temas: ['confesión sincera', 'atenuante', 'reducción de pena', 'arrepentimiento'],
    delitosRelacionados: [],
    etapasAplicables: ['diligencias_preliminares', 'investigacion_preparatoria'],
    relevancia: 'alta',
    fechaPublicacion: '2008-11',
  },
  // --- VIOLACIÓN SEXUAL ---
  {
    id: 'pe-015',
    pais: 'PE',
    organo: 'Corte Suprema - Sala Penal Permanente',
    numeroTesis: 'Acuerdo Plenario 1-2011/CJ-116',
    epoca: 'Vinculante',
    rubro: 'DELITOS SEXUALES. VALORACIÓN DE LA SOLA DECLARACIÓN DE LA VÍCTIMA',
    texto: 'La sola declaración de la víctima de delito sexual puede ser suficiente para enervar la presunción de inocencia, siempre que cumpla los criterios del Acuerdo Plenario 2-2005: ausencia de incredibilidad subjetiva, verosimilitud y persistencia. Se debe considerar la naturaleza clandestina del delito.',
    temas: ['delitos sexuales', 'declaración víctima', 'valoración probatoria', 'sola declaración'],
    delitosRelacionados: ['violación sexual', 'actos contra el pudor'],
    etapasAplicables: ['juzgamiento'],
    relevancia: 'alta',
    fechaPublicacion: '2011-12',
  },
  // --- BENEFICIO PENITENCIARIO ---
  {
    id: 'pe-016',
    pais: 'PE',
    organo: 'Tribunal Constitucional',
    numeroTesis: 'Exp. 02700-2006-PHC/TC',
    epoca: 'Precedente',
    rubro: 'BENEFICIOS PENITENCIARIOS. NATURALEZA Y EXIGENCIAS DE MOTIVACIÓN',
    texto: 'Los beneficios penitenciarios (semilibertad, liberación condicional) no son derechos fundamentales sino estímulos al tratamiento penitenciario. Su denegatoria exige motivación reforzada que considere la conducta del interno, capacidad de reinserción y peligrosidad. Aplica la ley vigente al momento de los hechos (tempus regit actum).',
    temas: ['beneficios penitenciarios', 'semilibertad', 'liberación condicional', 'motivación'],
    delitosRelacionados: [],
    etapasAplicables: ['ejecucion_penal'],
    relevancia: 'alta',
    fechaPublicacion: '2007-03',
  },
  // --- AGRAVANTE POR REINCIDENCIA ---
  {
    id: 'pe-017',
    pais: 'PE',
    organo: 'Corte Suprema - Pleno Jurisdiccional',
    numeroTesis: 'Acuerdo Plenario 1-2008/CJ-116',
    epoca: 'Vinculante',
    rubro: 'REINCIDENCIA Y HABITUALIDAD. APLICACIÓN E IMPACTO EN LA PENA',
    texto: 'La reincidencia (Art. 46-B CP) requiere que el agente haya cumplido total o parcialmente una pena privativa de libertad y vuelva a delinquir. Aumenta la pena hasta un tercio. La habitualidad (Art. 46-C CP) requiere tres o más delitos en cinco años. Ambas son circunstancias agravantes cualificadas.',
    temas: ['reincidencia', 'habitualidad', 'agravantes', 'aumento de pena'],
    delitosRelacionados: [],
    etapasAplicables: ['juzgamiento'],
    relevancia: 'alta',
    fechaPublicacion: '2008-11',
  },
  // --- IMPUGNACIÓN ---
  {
    id: 'pe-018',
    pais: 'PE',
    organo: 'Corte Suprema - Sala Penal Permanente',
    numeroTesis: 'Casación 215-2011-Arequipa',
    epoca: 'Vinculante',
    rubro: 'RECURSO DE APELACIÓN. ALCANCES DE LA REVISIÓN POR LA SALA',
    texto: 'En el recurso de apelación de sentencia, la Sala Penal puede revisar la valoración probatoria realizada por el juez de juicio oral. No obstante, debe respetar el principio de inmediación, otorgando mayor peso a la apreciación directa del juez de primera instancia, salvo errores manifiestos en la motivación.',
    temas: ['apelación', 'revisión probatoria', 'inmediación', 'errores manifiestos'],
    delitosRelacionados: [],
    etapasAplicables: ['impugnacion'],
    relevancia: 'alta',
    fechaPublicacion: '2012-08',
  },
  // --- LAVADO DE ACTIVOS ---
  {
    id: 'pe-019',
    pais: 'PE',
    organo: 'Corte Suprema - Pleno Jurisdiccional',
    numeroTesis: 'Acuerdo Plenario 7-2011/CJ-116',
    epoca: 'Vinculante',
    rubro: 'LAVADO DE ACTIVOS. AUTONOMÍA DEL DELITO Y NO REQUIERE CONDENA POR DELITO PREVIO',
    texto: 'El delito de lavado de activos es autónomo respecto del delito fuente. Para su persecución no se requiere condena previa por el delito que generó los activos, basta acreditar el origen ilícito mediante indicios. La actividad criminal previa puede probarse por inferencia razonada de los hechos.',
    temas: ['lavado de activos', 'autonomía', 'delito fuente', 'origen ilícito', 'indicios'],
    delitosRelacionados: ['lavado de activos', 'tráfico ilícito de drogas', 'corrupción de funcionarios'],
    etapasAplicables: ['investigacion_preparatoria', 'juzgamiento'],
    relevancia: 'alta',
    fechaPublicacion: '2011-11',
  },
  // --- PRESUNCIÓN DE PELIGRO PROCESAL ---
  {
    id: 'pe-020',
    pais: 'PE',
    organo: 'Corte Suprema - Sala Penal Permanente',
    numeroTesis: 'Casación 626-2013-Moquegua',
    epoca: 'Vinculante',
    rubro: 'PRISIÓN PREVENTIVA. PRESUPUESTOS MATERIALES Y FORMALES',
    texto: 'Para imponer prisión preventiva se requiere acreditar: 1) graves elementos de convicción del delito y vinculación del imputado, 2) prognosis de pena superior a 4 años, 3) peligro procesal (fuga u obstaculización), 4) proporcionalidad. La concurrencia simultánea es necesaria, no alternativa.',
    temas: ['prisión preventiva', 'peligro procesal', 'fuga', 'obstaculización', 'prognosis de pena'],
    delitosRelacionados: [],
    etapasAplicables: ['investigacion_preparatoria'],
    relevancia: 'alta',
    fechaPublicacion: '2014-04',
  },
  // --- COSA JUZGADA ---
  {
    id: 'pe-021',
    pais: 'PE',
    organo: 'Tribunal Constitucional',
    numeroTesis: 'Exp. 04587-2004-AA/TC',
    epoca: 'Precedente',
    rubro: 'NE BIS IN IDEM. COSA JUZGADA Y PROHIBICIÓN DE DOBLE PROCESAMIENTO',
    texto: 'El principio ne bis in idem prohíbe el doble procesamiento o doble sanción por los mismos hechos cuando concurre triple identidad: sujeto, hecho y fundamento. La cosa juzgada material impide reabrir un proceso terminado por sentencia firme, sea condenatoria, absolutoria o sobreseimiento.',
    temas: ['ne bis in idem', 'cosa juzgada', 'doble procesamiento', 'triple identidad'],
    delitosRelacionados: [],
    etapasAplicables: ['etapa_intermedia', 'juzgamiento'],
    relevancia: 'alta',
    fechaPublicacion: '2005-08',
  },
  // --- AUDIENCIA DE CONTROL ---
  {
    id: 'pe-022',
    pais: 'PE',
    organo: 'Corte Suprema - Sala Penal Permanente',
    numeroTesis: 'Casación 134-2015-Ucayali',
    epoca: 'Vinculante',
    rubro: 'NULIDAD DE ACTOS PROCESALES. PROTECCIÓN AL DEBIDO PROCESO',
    texto: 'La nulidad procesal solo procede cuando el acto vulnera derechos fundamentales del imputado. Debe acreditarse perjuicio concreto. El principio de conservación de los actos exige que solo se anule lo estrictamente necesario, manteniendo la validez del resto del proceso.',
    temas: ['nulidad procesal', 'debido proceso', 'principio de conservación', 'perjuicio'],
    delitosRelacionados: [],
    etapasAplicables: ['etapa_intermedia', 'juzgamiento', 'impugnacion'],
    relevancia: 'media',
    fechaPublicacion: '2016-07',
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
