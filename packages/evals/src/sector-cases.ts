import { catalunyaDatasetSchema, type CatalunyaDataset } from './catalunya';

// Short public excerpts observed separately from the candidate guides.
// These controlled cases do not certify the real retrieval or publication gate.
const observations = [
  {
    id: 'food-rsipac',
    url: 'https://tramits.gencat.cat/ca/tramits/tramits-temes/Registre-sanitari-dindustries-i-productes-alimentaris-de-Catalunya-RSIPAC-00001?moda=1',
    urlEs:
      'https://tramits.gencat.cat/es/tramits/tramits-temes/Registre-sanitari-dindustries-i-productes-alimentaris-de-Catalunya-RSIPAC-00001?moda=1',
    version: '2025-11-13',
    excerpt: "han de sol·licitar una autorització prèvia abans d'iniciar l'activitat",
    excerptEs: 'deben solicitar una autorización previa antes de iniciar la actividad',
    fact: 'autorització prèvia',
    factEs: 'autorización previa',
    ca: 'Què demana la fitxa als establiments subjectes al Reglament CE 853/2004?',
    es: '¿Qué pide la ficha a establecimientos sujetos al Reglamento CE 853/2004?',
    missingCa:
      'Una botiga ven aliments en línia. Quin registre i modalitat exactes li pertoquen sense saber-ne els productes ni destinataris?',
    missingEs:
      'Una tienda vende alimentos en línea. ¿Qué registro y modalidad exactos le corresponden sin conocer productos ni destinatarios?',
    forbidden: 'exempt de controls sanitaris',
  },
  {
    id: 'tourism-hut',
    url: 'https://canalempresa.gencat.cat/ca/03_sectors_d_activitat/06_hostaleria_i_turisme/establiments_turistics/habitatges_d_us_turistic/DL3_2023/',
    urlEs:
      'https://canalempresa.gencat.cat/es/03_sectors_d_activitat/06_hostaleria_i_turisme/establiments_turistics/habitatges_d_us_turistic/DL3_2023/',
    version: '2023-11-09',
    excerpt:
      'una llicència urbanística municipal i una autorització turística prèviament a l’obertura',
    excerptEs:
      'una licencia urbanística municipal y una autorización turística previamente a la apertura',
    fact: 'autorització turística',
    factEs: 'autorización turística',
    ca: 'Quines autoritzacions prèvies es descriuen per a un HUT nou en un municipi afectat?',
    es: '¿Qué autorizaciones previas se describen para un HUT nuevo en un municipio afectado?',
    missingCa:
      'Puc obrir ara un HUT en aquest immoble sense conèixer el planejament i les suspensions municipals?',
    missingEs:
      '¿Puedo abrir ahora un HUT en este inmueble sin conocer el planeamiento y las suspensiones municipales?',
    forbidden: 'obertura garantida',
  },
  {
    id: 'health-centre',
    url: 'https://tramits.gencat.cat/ca/tramits/tramits-temes/Autoritzacio-de-centres-o-serveis-sanitaris?moda=2',
    urlEs:
      'https://tramits.gencat.cat/es/tramits/tramits-temes/Autoritzacio-de-centres-o-serveis-sanitaris?moda=2',
    version: '2026-07-21',
    excerpt: 'S’ha de disposar d’aquesta autorització abans de l’inici de l’activitat',
    excerptEs: 'Se tiene que disponer de esta autorización antes del inicio de la actividad',
    fact: 'abans de l’inici',
    factEs: 'antes del inicio',
    ca: 'Cal tenir autorització per obrir un centre sanitari cobert per aquest procediment?',
    es: '¿Hace falta autorización para abrir un centro sanitario cubierto por este procedimiento?',
    missingCa:
      'Un local de benestar és un centre sanitari autoritzable sense saber-ne l’oferta assistencial?',
    missingEs:
      '¿Un local de bienestar es un centro sanitario autorizable sin conocer su oferta asistencial?',
    forbidden: 'comença sense autorització',
  },
  {
    id: 'transport-mdsl',
    url: 'https://tramits.gencat.cat/ca/tramits/tramits-temes/Autoritzacio-de-transport-public-lleuger-de-mercaderies-per-carretera-al-territori-catala-MDSL?moda=1',
    urlEs:
      'https://tramits.gencat.cat/es/tramits/tramits-temes/Autoritzacio-de-transport-public-lleuger-de-mercaderies-per-carretera-al-territori-catala-MDSL?moda=1',
    version: '2023-03-24',
    excerpt: 'transportar mercaderies per compte d’altres a canvi d’una retribució econòmica',
    excerptEs: 'transportar mercancías por cuenta de otro a cambio de una retribución económica',
    fact: 'per compte d’altres',
    factEs: 'por cuenta de otro',
    ca: 'Per a compte de qui descriu la fitxa el transport MDSL?',
    es: '¿Por cuenta de quién describe la ficha el transporte MDSL?',
    missingCa:
      'És MDSL un repartiment sense saber si és per compte propi o aliè, la MMA i el territori?',
    missingEs:
      '¿Es MDSL un reparto sin saber si es por cuenta propia o ajena, la MMA y el territorio?',
    forbidden: 'MDSL universal',
  },
  {
    id: 'industry-workshop',
    url: 'https://tramits.gencat.cat/ca/tramits/tramits-temes/Taller-de-reparacio-de-vehicles-automobils?moda=1',
    urlEs:
      'https://tramits.gencat.cat/es/tramits/tramits-temes/Taller-de-reparacio-de-vehicles-automobils?moda=1',
    version: '2026-07-07',
    excerpt: 'han de presentar a l’Administració una declaració responsable',
    excerptEs: 'deben presentar a la Administración una declaración responsable',
    fact: 'declaració responsable',
    factEs: 'declaración responsable',
    ca: 'Quina declaració sectorial descriu la fitxa per a un taller de vehicles?',
    es: '¿Qué declaración sectorial describe la ficha para un taller de vehículos?',
    missingCa: 'Puc reutilitzar l’alta del taller anterior sense saber si canvia l’emplaçament?',
    missingEs:
      '¿Puedo reutilizar el alta del taller anterior sin saber si cambia el emplazamiento?',
    forbidden: 'mateixa declaració',
  },
  {
    id: 'environment-annex',
    url: 'https://canalempresa.gencat.cat/ca/02_serveis_per_temes/04_sostenibilitat/01_afectacio_al_medi/03_prevencio_i_control_ambiental_de_les_activitats_empresarials/',
    urlEs:
      'https://canalempresa.gencat.cat/es/integraciodepartamentaltramit/tramit/PerTemes/Comunicacio-previa-ambiental-Annex-III',
    version: '2014-02-12',
    versionEs: '2016-03-11',
    excerpt: 'les descrites a l’annex III de la Llei de prevenció i control ambiental',
    excerptEs:
      'Se someten a este régimen las actividades relacionadas en el Anexo III de la Ley 20/2009',
    fact: 'annex III',
    factEs: 'Anexo III',
    ca: 'Quin annex es vincula a la comunicació prèvia ambiental?',
    es: '¿Qué anexo se vincula a la comunicación previa ambiental?',
    missingCa: 'Quin annex correspon a una activitat només pel nom comercial?',
    missingEs: '¿Qué anexo corresponde a una actividad solo por su nombre comercial?',
    forbidden: 'annex assignat per CNAE',
  },
  {
    id: 'shows-extraordinary',
    url: 'https://interior.gencat.cat/ca/arees_dactuacio/espectacles/espectacles_i_activitats_caracter_extraordinari/index.html',
    urlEs:
      'https://interior.gencat.cat/es/arees_dactuacio/espectacles/espectacles_i_activitats_caracter_extraordinari/index.html',
    version: '2026-06-19',
    versionEs: '2016-01-19',
    excerpt:
      'en espais oberts, de caràcter públic o privat, supòsits en els quals estan sotmesos a llicència municipal',
    excerptEs:
      'en espacios abiertos, de carácter público o privado, supuestos en los que están sometidos a licencia municipal',
    fact: 'llicència municipal',
    factEs: 'licencia municipal',
    ca: 'Qui dona la llicència per a un espectacle extraordinari en espai obert?',
    es: '¿Quién concede la licencia para un espectáculo extraordinario en espacio abierto?',
    missingCa:
      'És competència automàtica de la Generalitat un concert sense saber espai, aforament ni llicència existent?',
    missingEs:
      '¿Es competencia automática de la Generalitat un concierto sin saber espacio, aforo ni licencia existente?',
    forbidden: 'Generalitat en tots els casos',
  },
  {
    id: 'installations-low-voltage',
    url: 'https://tramits.gencat.cat/ca/tramits/tramits-temes/Presentacio-de-la-declaracio-responsable-per-a-installacions-electriques-de-baixa-tensio-posada-en-servei-modificacions-i-baixa?moda=1',
    urlEs:
      'https://tramits.gencat.cat/es/tramits/tramits-temes/Presentacio-de-la-declaracio-responsable-per-a-installacions-electriques-de-baixa-tensio-posada-en-servei-modificacions-i-baixa?moda=1',
    version: '2026-06-29',
    excerpt:
      'Has de presentar la declaració responsable abans de posar en funcionament la instal·lació',
    excerptEs:
      'Tienes que presentar la declaración responsable antes de poner en funcionamiento la instalación',
    fact: 'abans de posar en funcionament',
    factEs: 'antes de poner en funcionamiento',
    ca: 'Quan es declara una instal·lació nova de baixa tensió?',
    es: '¿Cuándo se declara una instalación nueva de baja tensión?',
    missingCa:
      'Puc posar en servei una instal·lació sense saber si és nova, modificació o autoconsum i si necessita inspecció?',
    missingEs:
      '¿Puedo poner en servicio una instalación sin saber si es nueva, modificación o autoconsumo y si necesita inspección?',
    forbidden: 'RITSIC substitueix RASIC',
  },
] as const;

export const sectorDataset: CatalunyaDataset = catalunyaDatasetSchema.parse({
  version: 'd07-controlled-2026-10-04',
  stage: 'controlled',
  description:
    'Casos sectorials bilingües de font pública i abstenció; falta executar T-004 contra el motor real.',
  cases: observations.flatMap((observation) =>
    (['ca', 'es'] as const).flatMap((language) => [
      {
        id: `${observation.id}-${language}-fact`,
        query: observation[language],
        domain: 'D-07',
        subtopic: observation.id,
        profile: observation.id,
        language,
        city: null,
        year: 2026,
        critical: 'obligation',
        sources: [
          {
            sourceId: 'gencat-public',
            documentId: observation.id,
            version:
              language === 'ca'
                ? observation.version
                : 'versionEs' in observation
                  ? observation.versionEs
                  : observation.version,
            url: language === 'ca' ? observation.url : observation.urlEs,
            jurisdiction: 'ES-CT',
            consultedAt: '2026-10-04',
            excerpt: language === 'ca' ? observation.excerpt : observation.excerptEs,
          },
        ],
        expected: {
          shouldAnswer: true,
          jurisdiction: 'ES-CT',
          requiredFacts: [language === 'ca' ? observation.fact : observation.factEs],
          forbiddenFacts: [],
        },
      },
      {
        id: `${observation.id}-${language}-abstain`,
        query: language === 'ca' ? observation.missingCa : observation.missingEs,
        domain: 'D-07',
        subtopic: observation.id,
        profile: observation.id,
        language,
        city: null,
        year: 2026,
        critical: 'jurisdiction',
        sources: [],
        expected: {
          shouldAnswer: false,
          jurisdiction: 'ES-CT',
          requiredFacts: [],
          forbiddenFacts: [observation.forbidden],
        },
      },
    ]),
  ),
});
