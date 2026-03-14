interface ContextoExpediente {
  etapaProcesal: string
  delito: string
  duplicidadTermino: boolean
  tieneDetencion: boolean
  tieneFormulacion: boolean
  tieneVinculacion: boolean
  hechos: { descripcion: string; relevancia: string }[]
  contradicciones: { tema: string; severidad: string }[]
  plazosVencidos: number
  pais?: string
  complejidad?: string
}

export interface EstrategiaSugerida {
  tipo: 'defensiva' | 'probatoria' | 'procesal' | 'negociacion'
  titulo: string
  descripcion: string
  fundamentoLegal: string
  articulosCnpp: string // mantener nombre por compatibilidad (se usa como articulosCodigo)
  confianza: number
}

// Base de conocimiento de estrategias por etapa procesal
const ESTRATEGIAS_POR_ETAPA: Record<string, EstrategiaSugerida[]> = {
  investigacion_inicial: [
    {
      tipo: 'defensiva',
      titulo: 'Control de legalidad de la detención',
      descripcion: 'Verificar que la detención cumplió con los requisitos constitucionales. Si fue detención en flagrancia, verificar que se actualizó algún supuesto del Art. 146 CNPP. Si fue por orden de aprehensión, verificar fundamentación y motivación.',
      fundamentoLegal: 'Art. 16 CPEUM, Arts. 146-148 CNPP',
      articulosCnpp: '146, 147, 148, 308',
      confianza: 0.9,
    },
    {
      tipo: 'procesal',
      titulo: 'Vigilar plazo de retención ante MP',
      descripcion: 'El MP tiene 48 horas (96h con duplicidad) para poner a disposición del juez o liberar. Si se excede, solicitar libertad inmediata por retención ilegal.',
      fundamentoLegal: 'Art. 16 CPEUM párrafo 10, Art. 140 CNPP',
      articulosCnpp: '140, 141',
      confianza: 0.95,
    },
    {
      tipo: 'probatoria',
      titulo: 'Preservar evidencia favorable',
      descripcion: 'Identificar y solicitar preservación de videos de cámaras de seguridad, registros telefónicos, testimonios de descargo antes de que se pierdan.',
      fundamentoLegal: 'Art. 218 CNPP - Cadena de custodia',
      articulosCnpp: '218, 227, 228',
      confianza: 0.8,
    },
  ],
  investigacion_complementaria: [
    {
      tipo: 'probatoria',
      titulo: 'Ofrecer pruebas de descargo',
      descripcion: 'Presentar elementos de prueba que desvirtúen la teoría del caso del MP. Incluir peritajes independientes, testimoniales de descargo y pruebas documentales.',
      fundamentoLegal: 'Art. 113 fracción IX CNPP',
      articulosCnpp: '113, 217, 218',
      confianza: 0.85,
    },
    {
      tipo: 'procesal',
      titulo: 'Vigilar plazo de cierre de investigación',
      descripcion: 'El juez fija plazo para cierre de investigación complementaria. Si el MP no formula acusación al vencer, solicitar sobreseimiento.',
      fundamentoLegal: 'Art. 321-322 CNPP',
      articulosCnpp: '321, 322, 327',
      confianza: 0.9,
    },
  ],
  intermedia: [
    {
      tipo: 'procesal',
      titulo: 'Exclusión de pruebas ilícitas',
      descripcion: 'Solicitar al juez la exclusión de pruebas obtenidas con violación de derechos fundamentales o que no cumplan requisitos de licitud.',
      fundamentoLegal: 'Art. 346 fracción III CNPP',
      articulosCnpp: '263, 264, 346',
      confianza: 0.85,
    },
    {
      tipo: 'negociacion',
      titulo: 'Procedimiento abreviado',
      descripcion: 'Evaluar si conviene solicitar procedimiento abreviado para obtener reducción de pena hasta 1/3. Requiere confesión y aceptación de hechos.',
      fundamentoLegal: 'Art. 201-207 CNPP',
      articulosCnpp: '201, 202, 203, 204, 205, 206, 207',
      confianza: 0.7,
    },
    {
      tipo: 'negociacion',
      titulo: 'Acuerdo reparatorio',
      descripcion: 'Si el delito permite acuerdo reparatorio (no violento, patrimonial o culposo), negociar reparación del daño para extinción de la acción penal.',
      fundamentoLegal: 'Art. 187-190 CNPP',
      articulosCnpp: '187, 188, 189, 190',
      confianza: 0.75,
    },
  ],
  juicio_oral: [
    {
      tipo: 'defensiva',
      titulo: 'Contrainterrogatorio estratégico',
      descripcion: 'Usar contradicciones detectadas entre declaraciones ministeriales y judiciales para cuestionar credibilidad de testigos de cargo en juicio oral.',
      fundamentoLegal: 'Art. 373 CNPP - Técnicas de interrogatorio',
      articulosCnpp: '371, 372, 373, 376',
      confianza: 0.85,
    },
    {
      tipo: 'defensiva',
      titulo: 'Duda razonable',
      descripcion: 'Argumentar que el MP no probó más allá de duda razonable los elementos del tipo penal. Señalar deficiencias probatorias específicas.',
      fundamentoLegal: 'Art. 359 CNPP - Valoración de prueba',
      articulosCnpp: '359, 400, 402, 405',
      confianza: 0.8,
    },
  ],
  amparo: [
    {
      tipo: 'procesal',
      titulo: 'Amparo indirecto por violación procesal',
      descripcion: 'Solicitar amparo contra actos del juez de control que violen derechos fundamentales: auto de vinculación indebido, medida cautelar desproporcionada, etc.',
      fundamentoLegal: 'Art. 107 fracción III CPEUM, Art. 170 Ley de Amparo',
      articulosCnpp: '153, 155, 316',
      confianza: 0.8,
    },
  ],
  apelacion: [
    {
      tipo: 'procesal',
      titulo: 'Recurso de apelación por agravio',
      descripcion: 'Identificar violaciones procesales sustanciales que ameriten apelación: indebida valoración de pruebas, violación al debido proceso, incongruencia en la sentencia.',
      fundamentoLegal: 'Art. 467-472 CNPP',
      articulosCnpp: '467, 468, 471, 472, 473',
      confianza: 0.85,
    },
  ],
}

// Base de conocimiento peruano (NCPP)
const ESTRATEGIAS_NCPP: Record<string, EstrategiaSugerida[]> = {
  diligencias_preliminares: [
    {
      tipo: 'defensiva',
      titulo: 'Control de legalidad de la detención policial',
      descripcion: 'Verificar que la detención policial cumplió el plazo de 48 horas (Art. 264 NCPP). Si fue detención preliminar judicial, verificar que no excedió las 72 horas.',
      fundamentoLegal: 'Art. 264 NCPP, Art. 2 inc. 24-f Constitución',
      articulosCnpp: '259, 260, 261, 264',
      confianza: 0.9,
    },
    {
      tipo: 'procesal',
      titulo: 'Audiencia de tutela de derechos',
      descripcion: 'Si se vulneraron derechos del imputado durante las diligencias preliminares, solicitar audiencia de tutela ante el JIP para que cese la vulneración.',
      fundamentoLegal: 'Art. 71.4 NCPP',
      articulosCnpp: '71',
      confianza: 0.85,
    },
    {
      tipo: 'procesal',
      titulo: 'Control de plazo de diligencias preliminares',
      descripcion: 'Las diligencias preliminares tienen plazo de 60 días (prorrogable). Si el fiscal excede el plazo sin formalizar, solicitar control de plazo ante el JIP.',
      fundamentoLegal: 'Art. 334.2 NCPP',
      articulosCnpp: '334, 343',
      confianza: 0.9,
    },
  ],
  investigacion_preparatoria: [
    {
      tipo: 'probatoria',
      titulo: 'Ofrecer medios de prueba de descargo',
      descripcion: 'Presentar al fiscal medios de prueba que desvirtúen la imputación. Solicitar actos de investigación: pericias, testimoniales, documentales.',
      fundamentoLegal: 'Art. 337.4 NCPP',
      articulosCnpp: '337, 338',
      confianza: 0.85,
    },
    {
      tipo: 'procesal',
      titulo: 'Control de plazo de investigación preparatoria',
      descripcion: 'Si el fiscal excede el plazo de investigación (120d simples, 8m complejos, 36m crimen organizado), solicitar control de plazo ante el JIP.',
      fundamentoLegal: 'Art. 343.2 NCPP',
      articulosCnpp: '342, 343',
      confianza: 0.9,
    },
    {
      tipo: 'defensiva',
      titulo: 'Oposición a prisión preventiva',
      descripcion: 'Cuestionar los presupuestos materiales: graves y fundados elementos de convicción, prognosis de pena mayor a 4 años, peligro procesal. Ofrecer caución o comparecencia con restricciones.',
      fundamentoLegal: 'Art. 268-271 NCPP, Casación 626-2013-Moquegua',
      articulosCnpp: '268, 269, 270, 271',
      confianza: 0.85,
    },
    {
      tipo: 'negociacion',
      titulo: 'Terminación anticipada',
      descripcion: 'Evaluar si conviene solicitar terminación anticipada para obtener reducción de pena de 1/6. Requiere acuerdo con el fiscal sobre pena y reparación civil.',
      fundamentoLegal: 'Art. 468-471 NCPP',
      articulosCnpp: '468, 469, 470, 471',
      confianza: 0.7,
    },
  ],
  etapa_intermedia: [
    {
      tipo: 'procesal',
      titulo: 'Observaciones a la acusación fiscal',
      descripcion: 'En la audiencia de control de acusación, formular observaciones formales y sustanciales. Solicitar sobreseimiento si no hay elementos suficientes.',
      fundamentoLegal: 'Art. 350-352 NCPP',
      articulosCnpp: '344, 345, 350, 351, 352',
      confianza: 0.85,
    },
    {
      tipo: 'procesal',
      titulo: 'Exclusión de prueba ilícita',
      descripcion: 'Solicitar exclusión de medios de prueba obtenidos con vulneración de derechos fundamentales o que no cumplan con los requisitos de pertinencia, conducencia y utilidad.',
      fundamentoLegal: 'Art. VIII Título Preliminar NCPP, Art. 155.2 NCPP',
      articulosCnpp: '155, 159',
      confianza: 0.85,
    },
    {
      tipo: 'negociacion',
      titulo: 'Principio de oportunidad',
      descripcion: 'Si el delito es de mínima lesividad o el imputado ha reparado el daño, solicitar aplicación del principio de oportunidad para extinguir la acción penal.',
      fundamentoLegal: 'Art. 2 NCPP',
      articulosCnpp: '2',
      confianza: 0.75,
    },
  ],
  juzgamiento: [
    {
      tipo: 'defensiva',
      titulo: 'Contraexamen estratégico',
      descripcion: 'Utilizar contradicciones entre declaraciones en diligencias preliminares y juicio para desacreditar testigos de cargo. Aplicar técnicas de litigación oral.',
      fundamentoLegal: 'Art. 378 NCPP - Examen de testigos',
      articulosCnpp: '375, 378, 379',
      confianza: 0.85,
    },
    {
      tipo: 'defensiva',
      titulo: 'Insuficiencia probatoria - In dubio pro reo',
      descripcion: 'Argumentar que la fiscalía no alcanzó certeza sobre la responsabilidad penal. Si existe duda razonable, solicitar absolución.',
      fundamentoLegal: 'Art. II.1 Título Preliminar NCPP, Art. 398.1 NCPP',
      articulosCnpp: '394, 398, 399',
      confianza: 0.8,
    },
  ],
  impugnacion: [
    {
      tipo: 'procesal',
      titulo: 'Recurso de apelación de sentencia',
      descripcion: 'Apelar dentro de los 5 días hábiles señalando causales: error en la apreciación de prueba, defecto de motivación, inobservancia de garantías constitucionales.',
      fundamentoLegal: 'Art. 416-419 NCPP',
      articulosCnpp: '414, 416, 417, 418, 419',
      confianza: 0.85,
    },
    {
      tipo: 'procesal',
      titulo: 'Recurso de casación',
      descripcion: 'Si la pena privativa supera los 6 años o existen causales específicas, interponer casación ante la Corte Suprema dentro de 10 días hábiles.',
      fundamentoLegal: 'Art. 427-436 NCPP',
      articulosCnpp: '427, 428, 429, 430',
      confianza: 0.8,
    },
  ],
}

export function generarEstrategias(contexto: ContextoExpediente): EstrategiaSugerida[] {
  const estrategias: EstrategiaSugerida[] = []

  // 1. Estrategias base por etapa procesal según país
  const catalogo = contexto.pais === 'PE' ? ESTRATEGIAS_NCPP : ESTRATEGIAS_POR_ETAPA
  const basePorEtapa = catalogo[contexto.etapaProcesal] || []
  estrategias.push(...basePorEtapa)

  const esPeru = contexto.pais === 'PE'

  // 2. Si hay contradicciones detectadas, agregar estrategia de contrainterrogatorio
  if (contexto.contradicciones.length > 0) {
    const criticas = contexto.contradicciones.filter(c => c.severidad === 'critica' || c.severidad === 'alta')
    if (criticas.length > 0) {
      estrategias.push({
        tipo: 'defensiva',
        titulo: `Explotar ${criticas.length} contradicción(es) detectada(s)`,
        descripcion: `Se detectaron ${criticas.length} contradicciones de severidad alta/crítica en temas: ${criticas.map(c => c.tema).join(', ')}. Utilizar en contrainterrogatorio para desacreditar testimonios.`,
        fundamentoLegal: esPeru
          ? 'Art. 378 NCPP - Contraexamen de testigos'
          : 'Art. 376 CNPP - Contradicción de testigos',
        articulosCnpp: esPeru ? '378, 379' : '373, 376',
        confianza: 0.9,
      })
    }
  }

  // 3. Si hay plazos vencidos, agregar estrategia de prescripción/libertad
  if (contexto.plazosVencidos > 0) {
    estrategias.push({
      tipo: 'procesal',
      titulo: 'Plazos vencidos - solicitar consecuencia legal',
      descripcion: `Se detectaron ${contexto.plazosVencidos} plazo(s) vencido(s). Solicitar la consecuencia legal correspondiente: ${esPeru ? 'control de plazo ante el JIP, cesación de prisión preventiva, sobreseimiento.' : 'libertad por retención ilegal, sobreseimiento por no formular acusación, etc.'}`,
      fundamentoLegal: esPeru
        ? 'Art. 343 NCPP - Control de plazo'
        : 'Art. 140-141 CNPP, Art. 327 CNPP',
      articulosCnpp: esPeru ? '334, 342, 343' : '140, 141, 321, 327',
      confianza: 0.95,
    })
  }

  // 4. México: duplicidad de término | Perú: complejidad del caso
  if (contexto.duplicidadTermino && !esPeru) {
    estrategias.push({
      tipo: 'defensiva',
      titulo: 'Cuestionar duplicidad de término constitucional',
      descripcion: 'La duplicidad de término fue solicitada por el MP. Verificar que se cumplieron los requisitos: delito grave, complejidad del caso. Si no se justifica, impugnar la duplicidad.',
      fundamentoLegal: 'Art. 19 CPEUM párrafo 4',
      articulosCnpp: '313, 314, 316',
      confianza: 0.75,
    })
  }

  if (esPeru && contexto.complejidad === 'crimen_organizado') {
    estrategias.push({
      tipo: 'defensiva',
      titulo: 'Cuestionar calificación de criminalidad organizada',
      descripcion: 'Verificar que la calificación como organización criminal cumple los requisitos de la Ley 30077: pluralidad de agentes, permanencia, estructura jerárquica, finalidad delictiva.',
      fundamentoLegal: 'Ley 30077 - Ley contra el Crimen Organizado',
      articulosCnpp: '268, 272',
      confianza: 0.8,
    })
  }

  // Ordenar por confianza descendente
  return estrategias.sort((a, b) => b.confianza - a.confianza)
}
