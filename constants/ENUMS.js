const ESTADO_UF =
{
    RJ: 'RIO DE JANEIRO'
};

const ETNIA =
{
    ASIATICY: "ASIÁTICO(A)",
    BRANCY: "BRANCO(A)",
    INDIGENY: "INDÍGENA",
    NEGRY: "NEGRO(A)"
};

const FAIXA_ESTATURA =
{
    ATE10001: "Até 1,00 m",
    ENTRE10001_150: "1,01 m a 1,50 m",
    ENTRE15001_200: "1,51 m a 2,00 m",
    ENTRE20001_250: "2,01 m a 2,50 m",
    ENTRE25001_300: "2,50 m a 3,00 m"
};

const FAIXA_ETARIA =
{
    ATE10:       { descricao: "Até 10 anos", min: 0, max: 10 },
    ENTRE11_20:  { descricao: "De 11 a 20 anos", min: 11, max: 20 },
    ENTRE21_30:  { descricao: "De 21 a 30 anos", min: 21, max: 30 },
    ENTRE31_40:  { descricao: "De 31 a 40 anos", min: 31, max: 40 },
    ENTRE41_50:  { descricao: "De 41 a 50 anos", min: 41, max: 50 },
    ENTRE51_60:  { descricao: "De 51 a 60 anos", min: 51, max: 60 },
    ENTRE61_70:  { descricao: "De 61 a 70 anos", min: 61, max: 70 },
    ENTRE71_80:  { descricao: "De 71 a 80 anos", min: 71, max: 80 },
    ENTRE81_90:  { descricao: "De 81 a 90 anos", min: 81, max: 90 },
    ENTRE91_100: { descricao: "De 91 a 100 anos", min: 91, max: 100 }
};

const FAIXA_PESO =
{
    ATE50: "Até 50 kg",
    ENTRE50_100: "De 50,01 kg a 100 kg",
    ENTRE10001_150: "De 100,01 kg a 150 kg",
    ENTRE15001_200: "De 150,01 kg a 200 kg",
    ENTRE20001_250: "De 200,01 kg a 250 kg",
    ENTRE25001_300: "De 250,01 kg a 300 kg"
};

const GENERO = { MASCULINO: "MASCULINO", FEMININO: "FEMININO", AMBOS: "AMBOS" };

const PAIS =
{
    BRASIL: "BRASIL",
    EUA:    "ESTADOS UNIDOS",
    MEXICO: "MÉXICO"
};

const PERFIL_USUARIO = { ADMIN: "ADMIN", EDITOR: "EDITOR", CONSULTOR: "CONSULTOR" };

const SEXO_PERSONAGEM = { FEMININO: "FEMININO", MASCULINO: "MASCULINO" };

const STATUS_EMISSORA = { ATIVA: "ATIVA", ENCERRADA: "ENCERRADA" };

const TIPO_OBRA = { NOVELA: "NOVELA", MINISSERIE: "MINISSÉRIE", SERIE: "SÉRIE", TELENOVELA: "TELENOVELA" };

const TIPO_PARTICIPACAO =
{
    PROTAGONISTA: 'PROTAGONISTA',
    ANTAGONISTA: 'ANTAGONISTA',
    COADJUVANTE: 'COADJUVANTE',
    PARTICIPACAO_ESPECIAL: 'PARTICIPAÇÃO ESPECIAL',
    FIGURANTE: 'FIGURANTE'
};

const TIPO_RELACIONAMENTO_PERSONAGEM =
{
    PAI: 'PAI',
    MAE: 'MÃE',
    FILHO: 'FILHO',
    FILHA: 'FILHA',
    IRMAO: 'IRMÃO',
    IRMA: 'IRMÃ',
    CONJUGE: 'CÔNJUGE',
    NAMORADY: 'NAMORADO(A)',
    AMIGY: 'AMIGO(A)',
    INIMIGY: 'INIMIGO(A)'
};

module.exports =
{
    ETNIA,
    ESTADO_UF,
    FAIXA_ESTATURA,
    FAIXA_ETARIA,
    FAIXA_PESO,
    GENERO,
    PAIS,
    PERFIL_USUARIO,
    SEXO_PERSONAGEM,
    STATUS_EMISSORA,
    TIPO_OBRA,
    TIPO_RELACIONAMENTO_PERSONAGEM
};