
//  DEFINICIÓN DEL LENGUAJE 
const PALABRAS_RESERVADAS = new Set([
  'SI', 'ENTONCES', 'Y', 'O', 'NO',
  'APROBAR', 'RECHAZAR', 'CONDICIONAR',
  'CAMPO', 'ENTRE', 'PRIORIDAD',
  'MONTO_MAXIMO', 'TASA', 'PLAZO'
]);

const TIPOS_DATO = new Set(['entero', 'texto', 'decimal', 'booleano', 'fecha']);

const OPERADORES = ['>=', '<=', '>', '<', '=', '!=', '*'];

const SIMBOLOS = new Set(['(', ')', ';', ',', ':']);

const NOMBRE_OP = {
  '>=': 'MAYOR_IGUAL', '<=': 'MENOR_IGUAL',
  '>':  'MAYOR_QUE',   '<':  'MENOR_QUE',
  '=':  'IGUAL',       '!=': 'DIFERENTE',
  '*': 'MULTIPLICACION',
};

const NOMBRE_SYM = {
  '(': 'PARENTESIS_IZQUIERDO', ')': 'PARENTESIS_DERECHO',
  ';': 'PUNTO_Y_COMA', ',': 'COMA', ':': 'DOS_PUNTOS'
};

const LABEL_BADGE = {
  PALABRA_RESERVADA: 'KW', TIPO_DATO: 'TD', IDENTIFICADOR: 'ID',
  OPERADOR: 'OP', NUMERO: 'NUM', CADENA_TEXTO: 'STR',
  SIMBOLO: 'SYM', BOOLEANO: 'BOOL', FECHA: 'DATE',
  DECIMAL: 'DEC', ERROR_LEXICO: 'ERR'
};

const CLASE_TOKEN = {
  PALABRA_RESERVADA: 'tk-kw', TIPO_DATO: 'tk-td', IDENTIFICADOR: 'tk-id',
  OPERADOR: 'tk-op', NUMERO: 'tk-num', CADENA_TEXTO: 'tk-str',
  SIMBOLO: 'tk-sym', BOOLEANO: 'tk-bool', FECHA: 'tk-date',
  DECIMAL: 'tk-dec', ERROR_LEXICO: 'tk-err'
};

const HL_CLASE = {
  PALABRA_RESERVADA: 'hl-kw', TIPO_DATO: 'hl-td', IDENTIFICADOR: 'hl-id',
  OPERADOR: 'hl-op', NUMERO: 'hl-num', CADENA_TEXTO: 'hl-str',
  SIMBOLO: 'hl-sym', BOOLEANO: 'hl-bool', FECHA: 'hl-date',
  DECIMAL: 'hl-dec', ERROR_LEXICO: 'hl-err'
};

//  EJEMPLOS PREDEFINIDOS 

const EJEMPLOS = {
  basico: `CAMPO entero ingreso ;
CAMPO entero edad ;

SI ingreso >= 5000 ENTONCES APROBAR ;
SI ingreso < 2000 ENTONCES RECHAZAR ;`,

  compuesto: `CAMPO entero ingreso ;
CAMPO entero edad ;
CAMPO entero deudas ;

SI ingreso >= 5000 Y edad >= 21 ENTONCES APROBAR ;
SI ingreso >= 3000 Y deudas <= 1000 ENTONCES CONDICIONAR ;
SI ingreso < 2000 O deudas > 5000 ENTONCES RECHAZAR ;`,

  expandido: `CAMPO decimal ingreso_mensual ;
CAMPO entero score_crediticio ;
CAMPO entero antiguedad_laboral ;
CAMPO decimal deuda_total ;
CAMPO booleano tiene_garantia ;
CAMPO texto historial ;

PRIORIDAD 1 : SI score_crediticio >= 750 Y ingreso_mensual >= 8000.00 ENTONCES APROBAR ;
PRIORIDAD 2 : SI score_crediticio ENTRE 600 Y 749 Y antiguedad_laboral >= 2 ENTONCES CONDICIONAR ;
PRIORIDAD 3 : SI deuda_total > 50000.00 O historial = "malo" ENTONCES RECHAZAR ;
PRIORIDAD 4 : SI tiene_garantia = verdadero Y ingreso_mensual >= 3000.00 ENTONCES CONDICIONAR ;`,

  monto: `CAMPO decimal ingreso_mensual ;
CAMPO entero score_crediticio ;
CAMPO decimal deuda_total ;
CAMPO entero plazo_meses ;

MONTO_MAXIMO : ingreso_mensual * 48 ;
TASA : SI score_crediticio >= 700 ENTONCES 8.5 ;
TASA : SI score_crediticio ENTRE 600 Y 699 ENTONCES 12.0 ;
TASA : SI score_crediticio < 600 ENTONCES 18.0 ;
PLAZO : SI plazo_meses <= 60 ENTONCES APROBAR ;

SI ingreso_mensual >= 5000.00 Y score_crediticio >= 650 ENTONCES APROBAR ;
SI ingreso_mensual >= 3000.00 Y deuda_total <= 20000.00 ENTONCES CONDICIONAR ;
SI score_crediticio < 500 ENTONCES RECHAZAR ;`,

  fechas: `CAMPO fecha fecha_nacimiento ;
CAMPO fecha fecha_contratacion ;
CAMPO decimal ingreso_mensual ;
CAMPO texto tipo_empleo ;

SI fecha_nacimiento <= 2003-01-01 Y ingreso_mensual >= 4000.00 ENTONCES APROBAR ;
SI tipo_empleo = "formal" Y fecha_contratacion <= 2022-01-01 ENTONCES CONDICIONAR ;
SI fecha_nacimiento > 2005-12-31 ENTONCES RECHAZAR ;`,

  error_semantico: `CAMPO entero ingreso ;
CAMPO texto historial ;

SI salario >= 5000 ENTONCES APROBAR ;
SI historial >= 3000 ENTONCES RECHAZAR ;`,

  error_lexico: `CAMPO entero ingreso ;
CAMPO texto historial ;

SI ingreso >= 5000 ENTONCES APROBAR ;
SI historial = "bueno ENTONCES RECHAZAR ;
SI 2campo <= 100 ENTONCES CONDICIONAR ;`
};

//  SUGERENCIAS DE ERROR 
function obtenerSugerencia(mensaje) {
  const m = mensaje.toLowerCase();
  const tip = '<span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;margin-right:4px">lightbulb</span>';
  if (m.includes('tipo_dato') || m.includes('entero') && m.includes('texto'))
    return `${tip} Usa <code>entero</code>, <code>decimal</code>, <code>booleano</code>, <code>fecha</code> o <code>texto</code>. Ej: <code>CAMPO decimal ingreso_mensual ;</code>`;
  if (m.includes('campo') && m.includes('inicio'))
    return `${tip} El programa debe comenzar con al menos una declaración <code>CAMPO</code>. Ej: <code>CAMPO entero ingreso ;</code>`;
  if (m.includes('si') && m.includes('inicio'))
    return `${tip} Después de las declaraciones necesitas al menos una regla. Ej: <code>SI ingreso >= 1000 ENTONCES APROBAR ;</code>`;
  if (m.includes('entonces'))
    return `${tip} Después de la condición va la palabra <code>ENTONCES</code>. Ej: <code>SI ingreso >= 5000 ENTONCES APROBAR ;</code>`;
  if (m.includes('aprobar') || m.includes('rechazar') || m.includes('condicionar'))
    return `${tip} Las acciones válidas son: <code>APROBAR</code>, <code>RECHAZAR</code> o <code>CONDICIONAR</code>.`;
  if (m.includes(';') || m.includes('punto_y_coma'))
    return `${tip} Cada declaración y regla debe terminar con <code>;</code>`;
  if (m.includes('operador'))
    return `${tip} Los operadores disponibles son: <code>&gt;=</code> <code>&lt;=</code> <code>&gt;</code> <code>&lt;</code> <code>=</code> <code>!=</code>`;
  if (m.includes('identificador') && m.includes('dígito'))
    return `${tip} Los nombres de campo no pueden iniciar con un número. Usa letras o guión bajo: <code>campo1</code> — <code>1campo</code> no válido.`;
  if (m.includes('cadena sin cerrar'))
    return `${tip} Cierra la cadena de texto con comillas dobles. Ej: <code>"bueno"</code>`;
  if (m.includes('no fue declarado'))
    return `${tip} Declara el campo antes de usarlo en una regla. Todos los <code>CAMPO</code> van al inicio del programa.`;
  if (m.includes('fue declarado como entero') && m.includes('texto'))
    return `${tip} Un campo <code>entero</code> solo puede compararse con números.`;
  if (m.includes('fue declarado como texto') && m.includes('número'))
    return `${tip} Un campo <code>texto</code> solo puede compararse con cadenas entre comillas.`;
  if (m.includes('ya fue declarado'))
    return `${tip} Cada campo debe declararse una sola vez.`;
  if (m.includes('booleano'))
    return `${tip} Un campo <code>booleano</code> se compara con <code>verdadero</code> o <code>falso</code>. Ej: <code>tiene_garantia = verdadero</code>`;
  if (m.includes('fecha'))
    return `${tip} Las fechas van en formato <code>AAAA-MM-DD</code>. Ej: <code>fecha_nacimiento <= 2000-01-15</code>`;
  if (m.includes('decimal'))
    return `${tip} Un campo <code>decimal</code> se compara con números con punto decimal. Ej: <code>ingreso >= 5000.00</code>`;
  if (m.includes('entre'))
    return `${tip} El operador ENTRE necesita dos valores: <code>SI score ENTRE 600 Y 750 ENTONCES ...</code>`;
  if (m.includes('token inesperado'))
    return `${tip} Puede haber un símbolo extra o falta un <code>;</code> en la línea anterior.`;
  return null;
}

//  TOKENIZADOR 
function tokenizar(codigo) {
  const tokens = [];
  const lineas = codigo.split('\n');
  const BOOLEANOS = new Set(['verdadero', 'falso']);

  for (let nl = 0; nl < lineas.length; nl++) {
    const linea = lineas[nl];
    let i = 0;
    const ln = nl + 1;

    while (i < linea.length) {
      // Espacios
      if (/\s/.test(linea[i])) { i++; continue; }

      // Comentarios //
      if (linea[i] === '/' && linea[i+1] === '/') break;

      // Cadenas de texto
      if (linea[i] === '"') {
        let j = i + 1;
        while (j < linea.length && linea[j] !== '"') j++;
        if (j < linea.length) {
          tokens.push({ lexema: linea.slice(i, j + 1), tipo: 'CADENA_TEXTO', ln });
          i = j + 1;
        } else {
          tokens.push({ lexema: linea.slice(i), tipo: 'ERROR_LEXICO', ln, det: 'cadena sin cerrar' });
          i = linea.length;
        }
        continue;
      }

      // Operadores
      let opFound = null;
      for (const op of OPERADORES) {
        if (linea.startsWith(op, i)) { opFound = op; break; }
      }
      if (opFound) {
        tokens.push({ lexema: opFound, tipo: 'OPERADOR', sub: NOMBRE_OP[opFound], ln });
        i += opFound.length; continue;
      }

      // Símbolos
      if (SIMBOLOS.has(linea[i])) {
        tokens.push({ lexema: linea[i], tipo: 'SIMBOLO', sub: NOMBRE_SYM[linea[i]], ln });
        i++; continue;
      }

      // Números
      if (/[0-9]/.test(linea[i])) {
        let j = i;
        while (j < linea.length && /[0-9]/.test(linea[j])) j++;

        // Decimal
        if (j < linea.length && linea[j] === '.' && /[0-9]/.test(linea[j+1])) {
          j++;
          while (j < linea.length && /[0-9]/.test(linea[j])) j++;
          if (j < linea.length && /[a-zA-ZáéíóúÁÉÍÓÚñÑ_]/.test(linea[j])) {
            let k = j;
            while (k < linea.length && /[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9_]/.test(linea[k])) k++;
            tokens.push({ lexema: linea.slice(i, k), tipo: 'ERROR_LEXICO', ln, det: 'identificador inicia con dígito' });
            i = k;
          } else {
            tokens.push({ lexema: linea.slice(i, j), tipo: 'DECIMAL', ln });
            i = j;
          }
          continue;
        }

        // Fecha AAAA-MM-DD
        const posibleFecha = linea.slice(i, i+10);
        if (/^\d{4}-\d{2}-\d{2}/.test(posibleFecha)) {
          tokens.push({ lexema: posibleFecha, tipo: 'FECHA', ln });
          i += 10; continue;
        }

        // Entero o error
        if (j < linea.length && /[a-zA-ZáéíóúÁÉÍÓÚñÑ_]/.test(linea[j])) {
          let k = j;
          while (k < linea.length && /[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9_]/.test(linea[k])) k++;
          tokens.push({ lexema: linea.slice(i, k), tipo: 'ERROR_LEXICO', ln, det: 'identificador inicia con dígito' });
          i = k;
        } else {
          tokens.push({ lexema: linea.slice(i, j), tipo: 'NUMERO', ln });
          i = j;
        }
        continue;
      }

      // Palabras: reservadas, tipos, booleanos, identificadores
      if (/[a-zA-ZáéíóúÁÉÍÓÚñÑ_]/.test(linea[i])) {
        let j = i;
        while (j < linea.length && /[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9_\-]/.test(linea[j])) j++;
        const lex = linea.slice(i, j);
        const upper = lex.toUpperCase();

        if (PALABRAS_RESERVADAS.has(upper))
          tokens.push({ lexema: lex, tipo: 'PALABRA_RESERVADA', ln });
        else if (TIPOS_DATO.has(lex.toLowerCase()))
          tokens.push({ lexema: lex, tipo: 'TIPO_DATO', ln });
        else if (BOOLEANOS.has(lex.toLowerCase()))
          tokens.push({ lexema: lex, tipo: 'BOOLEANO', ln });
        else
          tokens.push({ lexema: lex, tipo: 'IDENTIFICADOR', ln });
        i = j; continue;
      }

      // Símbolo no reconocido
      tokens.push({ lexema: linea[i], tipo: 'ERROR_LEXICO', ln, det: 'símbolo no reconocido' });
      i++;
    }
  }
  return tokens;
}
//  HELPERS
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function cnt(tokens, tipo) {
  return tokens.filter(t => t.tipo === tipo).length;
}

//  SYNTAX HIGHLIGHT

function buildHighlight(codigo, tokens) {
  const lineas = codigo.split('\n');
  const porLinea = {};
  tokens.forEach(t => {
    if (!porLinea[t.ln]) porLinea[t.ln] = [];
    porLinea[t.ln].push(t);
  });
  return lineas.map((linea, idx) => {
    const ln = idx + 1;
    const lineTokens = porLinea[ln] || [];
    const hasErr = lineTokens.some(t => t.tipo === 'ERROR_LEXICO');
    if (!lineTokens.length) return `<span class="hl-line">${esc(linea) || ' '}</span>`;
    let result = '', pos = 0;
    lineTokens.forEach(t => {
      const idx2 = linea.indexOf(t.lexema, pos);
      if (idx2 === -1) return;
      if (idx2 > pos) result += esc(linea.slice(pos, idx2));
      result += `<span class="${HL_CLASE[t.tipo] || 'hl-id'}" title="${t.tipo}${t.det ? ' — ' + t.det : ''}">${esc(t.lexema)}</span>`;
      pos = idx2 + t.lexema.length;
    });
    if (pos < linea.length) result += esc(linea.slice(pos));
    return `<span class="hl-line${hasErr ? ' has-error' : ''}">${result || ' '}</span>`;
  }).join('\n');
}

//  RENDER LÉXICO

function renderLexico(tokens, codigo) {
  const errCount = cnt(tokens, 'ERROR_LEXICO');
  const counts = {
    PALABRA_RESERVADA: cnt(tokens, 'PALABRA_RESERVADA'),
    TIPO_DATO:         cnt(tokens, 'TIPO_DATO'),
    IDENTIFICADOR:     cnt(tokens, 'IDENTIFICADOR'),
    OPERADOR:          cnt(tokens, 'OPERADOR'),
    NUMERO:            cnt(tokens, 'NUMERO') + cnt(tokens, 'DECIMAL'),
    CADENA_TEXTO:      cnt(tokens, 'CADENA_TEXTO') + cnt(tokens, 'BOOLEANO') + cnt(tokens, 'FECHA'),
    SIMBOLO:           cnt(tokens, 'SIMBOLO'),
    ERROR_LEXICO:      errCount
  };
  ['kw','td','id','op','num','str','sym','err'].forEach((k, i) => {
    const el = document.getElementById('sc-' + k);
    if (el) el.textContent = counts[Object.keys(counts)[i]];
  });
  document.getElementById('highlight').innerHTML = buildHighlight(codigo, tokens);
  const lineCount = codigo.split('\n').length;
  document.getElementById('hl-lines').innerHTML =
    Array.from({length: lineCount}, (_, i) => i + 1).join('<br>');

  const tableWrap = document.getElementById('table-wrap');
  if (!tokens.length) {
    tableWrap.innerHTML = `<div class="empty"><div class="empty-icon">∅</div><span>Sin tokens encontrados</span></div>`;
  } else {
    let html = `<table class="token-table"><thead><tr>
      <th class="col-n">#</th><th class="col-ln">Lín.</th>
      <th>Lexema</th><th>Tipo de Token</th>
    </tr></thead><tbody>`;
    tokens.forEach((t, i) => {
      const sub = t.sub ? ` <span class="sub">(${esc(t.sub)})</span>` : '';
      const det = t.det ? ` <span class="sub">— ${esc(t.det)}</span>` : '';
      const rowClass = t.tipo === 'ERROR_LEXICO' ? ' class="row-err"' : '';
      const badge = LABEL_BADGE[t.tipo] || 'ID';
      const clase = CLASE_TOKEN[t.tipo] || 'tk-id';
      html += `<tr${rowClass} style="animation-delay:${i * 0.018}s">
        <td class="col-n">${i+1}</td><td class="col-ln">${t.ln}</td>
        <td>${esc(t.lexema)}</td>
        <td><span class="tk ${clase}">${badge}</span>
            <span class="sub">${esc(t.tipo)}</span>${sub}${det}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    tableWrap.innerHTML = html;
  }

  const statusEl = document.getElementById('status-msg');
  if (errCount > 0) {
    statusEl.innerHTML = `<span class="status-dot" style="background:var(--err)"></span><span class="status-err">${errCount} error${errCount>1?'es':''} léxico${errCount>1?'s':''}</span> · ${tokens.length} tokens totales`;
  } else {
    statusEl.innerHTML = `<span class="status-dot" style="background:var(--id)"></span><span class="status-ok">Sin errores léxicos</span> · ${tokens.length} tokens totales`;
  }
}

//  FASE 2 — ANALIZADOR SINTÁCTICO

class AnalizadorSintactico {
  constructor(tokens) {
    this.tokens = tokens.filter(t =>
      t.tipo !== 'ERROR_LEXICO'
    );
    this.pos = 0;
  }
  actual()     { return this.tokens[this.pos] || null; }
  fin()        { return this.pos >= this.tokens.length; }
  esKw(lex)    { const t = this.actual(); return t && t.tipo === 'PALABRA_RESERVADA' && t.lexema.toUpperCase() === lex.toUpperCase(); }
  esTipo()     { const t = this.actual(); return t && t.tipo === 'TIPO_DATO'; }
  esId()       { const t = this.actual(); return t && t.tipo === 'IDENTIFICADOR'; }
  esOp()       { const t = this.actual(); return t && t.tipo === 'OPERADOR'; }
  esValor()    { const t = this.actual(); return t && (t.tipo === 'NUMERO' || t.tipo === 'CADENA_TEXTO' || t.tipo === 'BOOLEANO' || t.tipo === 'FECHA' || t.tipo === 'DECIMAL'); }
  esSimbolo(s) { const t = this.actual(); return t && t.tipo === 'SIMBOLO' && t.lexema === s; }
  esNumODec()  { const t = this.actual(); return t && (t.tipo === 'NUMERO' || t.tipo === 'DECIMAL'); }
  consumir()   { return this.tokens[this.pos++]; }
  esperar(condFn, descripcion) {
    if (!condFn()) {
      const t = this.actual();
      const ln = t ? t.ln : '?';
      throw new Error(`Línea ${ln}: se esperaba ${descripcion} pero se encontró ${t ? `"${t.lexema}" (${t.tipo})` : 'fin de programa'}`);
    }
    return this.consumir();
  }
  nodo(nombre, hijos = []) { return { nombre, hijos }; }
  hoja(token) { return { nombre: token.lexema, tipo: token.tipo, ln: token.ln, esHoja: true }; }

  parsePrograma() {
    const n = this.nodo('PROGRAMA');
    n.hijos.push(this.parseDeclaraciones());
    // Directivas opcionales (MONTO_MAXIMO, TASA, PLAZO)
    const dirs = this.parseDirectivas();
    if (dirs.hijos.length > 0) n.hijos.push(dirs);
    n.hijos.push(this.parseReglas());
    if (!this.fin()) {
      const t = this.actual();
      throw new Error(`Línea ${t.ln}: token inesperado "${t.lexema}" después del programa`);
    }
    return n;
  }

  parseDeclaraciones() {
    const n = this.nodo('DECLARACIONES');
    if (!this.esKw('CAMPO')) {
      const t = this.actual(); const ln = t?t.ln:'?';
      throw new Error(`Línea ${ln}: se esperaba CAMPO (inicio de declaración) pero se encontró "${t?t.lexema:'fin de programa'}"`);
    }
    while (this.esKw('CAMPO')) n.hijos.push(this.parseDeclaracion());
    return n;
  }

  parseDeclaracion() {
    const n = this.nodo('DECLARACION');
    n.hijos.push(this.hoja(this.esperar(() => this.esKw('CAMPO'), 'CAMPO')));
    n.hijos.push(this.hoja(this.esperar(() => this.esTipo(), 'TIPO_DATO')));
    n.hijos.push(this.hoja(this.esperar(() => this.esId(), 'IDENTIFICADOR')));
    n.hijos.push(this.hoja(this.esperar(() => this.esSimbolo(';'), ';')));
    return n;
  }

  // Directivas: MONTO_MAXIMO, TASA, PLAZO
  parseDirectivas() {
    const n = this.nodo('DIRECTIVAS');
    while (this.esKw('MONTO_MAXIMO') || this.esKw('TASA') || this.esKw('PLAZO')) {
      n.hijos.push(this.parseDirectiva());
    }
    return n;
  }

  parseDirectiva() {
    const n = this.nodo('DIRECTIVA');
    const kw = this.consumir();
    n.hijos.push(this.hoja(kw));
    n.hijos.push(this.hoja(this.esperar(() => this.esSimbolo(':'), ':')));

    if (this.esKw('SI')) {
      // Directiva con regla condicional
      n.hijos.push(this.hoja(this.esperar(() => this.esKw('SI'), 'SI')));
      n.hijos.push(this.parseCondicion());
      n.hijos.push(this.hoja(this.esperar(() => this.esKw('ENTONCES'), 'ENTONCES')));
      n.hijos.push(this.hoja(this.esperar(() => this.esNumODec(), 'NUMERO o DECIMAL')));
    } else if (this.esId()) {
      // Directiva con expresión: campo * constante
      n.hijos.push(this.hoja(this.consumir())); // campo
      if (!this.esSimbolo(';')) {
        const t = this.actual();
        if (t && ['*','+','-','/'].includes(t.lexema)) {
          n.hijos.push(this.hoja(this.consumir())); // operador aritmético
          n.hijos.push(this.hoja(this.esperar(() => this.esNumODec(), 'NUMERO')));
        }
      }
    } else if (this.esNumODec()) {
      n.hijos.push(this.hoja(this.consumir()));
    }
    n.hijos.push(this.hoja(this.esperar(() => this.esSimbolo(';'), ';')));
    return n;
  }

  parseReglas() {
    const n = this.nodo('REGLAS');
    if (!this.esKw('SI') && !this.esKw('PRIORIDAD')) {
      const t = this.actual(); const ln = t?t.ln:'?';
      throw new Error(`Línea ${ln}: se esperaba SI o PRIORIDAD (inicio de regla) pero se encontró "${t?t.lexema:'fin de programa'}"`);
    }
    while (this.esKw('SI') || this.esKw('PRIORIDAD')) n.hijos.push(this.parseRegla());
    return n;
  }

  parseRegla() {
    const n = this.nodo('REGLA');

    // Soporte para PRIORIDAD N :
    if (this.esKw('PRIORIDAD')) {
      const prioNodo = this.nodo('PRIORIDAD_DEF');
      prioNodo.hijos.push(this.hoja(this.consumir())); // PRIORIDAD
      prioNodo.hijos.push(this.hoja(this.esperar(() => this.esNumODec() || this.actual()?.tipo === 'NUMERO', 'NUMERO')));
      prioNodo.hijos.push(this.hoja(this.esperar(() => this.esSimbolo(':'), ':')));
      n.hijos.push(prioNodo);
    }

    n.hijos.push(this.hoja(this.esperar(() => this.esKw('SI'), 'SI')));
    n.hijos.push(this.parseCondicion());
    n.hijos.push(this.hoja(this.esperar(() => this.esKw('ENTONCES'), 'ENTONCES')));
    n.hijos.push(this.parseAccion());
    n.hijos.push(this.hoja(this.esperar(() => this.esSimbolo(';'), ';')));
    return n;
  }

  parseCondicion() {
    const n = this.nodo('CONDICION');
    if (this.esKw('NO')) {
      const nc = this.nodo('CONDICION_COMPUESTA');
      nc.hijos.push(this.hoja(this.consumir()));
      nc.hijos.push(this.parseCondicion());
      n.hijos.push(nc); return n;
    }
    if (this.esSimbolo('(')) {
      const nc = this.nodo('CONDICION_COMPUESTA');
      nc.hijos.push(this.hoja(this.consumir()));
      nc.hijos.push(this.parseCondicion());
      nc.hijos.push(this.hoja(this.esperar(() => this.esSimbolo(')'), ')')));
      n.hijos.push(nc);
      return this.parseCondicionBinaria(n);
    }
    if (this.esId()) {
      const campo = this.hoja(this.consumir());
      // Operador ENTRE
      if (this.esKw('ENTRE')) {
        const comp = this.nodo('COMPARACION_RANGO');
        comp.hijos.push(campo);
        comp.hijos.push(this.hoja(this.consumir())); // ENTRE
        comp.hijos.push(this.hoja(this.esperar(() => this.esNumODec(), 'NUMERO')));
        comp.hijos.push(this.hoja(this.esperar(() => this.esKw('Y'), 'Y')));
        comp.hijos.push(this.hoja(this.esperar(() => this.esNumODec(), 'NUMERO')));
        n.hijos.push(comp);
        return this.parseCondicionBinaria(n);
      }
      // Comparación normal
      const comp = this.nodo('COMPARACION');
      comp.hijos.push(campo);
      comp.hijos.push(this.hoja(this.esperar(() => this.esOp(), 'OPERADOR')));
      comp.hijos.push(this.hoja(this.esperar(() => this.esValor(), 'valor')));
      n.hijos.push(comp);
      return this.parseCondicionBinaria(n);
    }
    const t = this.actual(); const ln = t?t.ln:'?';
    throw new Error(`Línea ${ln}: se esperaba una condición pero se encontró "${t?t.lexema:'fin de programa'}"`);
  }

  parseCondicionBinaria(izq) {
    if (this.esKw('Y') || this.esKw('O')) {
      const nc = this.nodo('CONDICION_COMPUESTA');
      nc.hijos.push(izq);
      nc.hijos.push(this.hoja(this.consumir()));
      nc.hijos.push(this.parseCondicion());
      const padre = this.nodo('CONDICION');
      padre.hijos.push(nc);
      return padre;
    }
    return izq;
  }

  parseAccion() {
    const n = this.nodo('ACCION');
    n.hijos.push(this.hoja(this.esperar(() =>
      ['APROBAR','RECHAZAR','CONDICIONAR'].some(a => this.esKw(a)),
      'APROBAR, RECHAZAR o CONDICIONAR')));
    return n;
  }
}
//  RENDER ÁRBOL

function renderArbol(nodo, prefijo, esUltimo) {
  const conector  = esUltimo ? '└── ' : '├── ';
  const extension = esUltimo ? '    ' : '│   ';
  let lineas = [];
  if (nodo.esHoja) {
    const tipo = nodo.tipo ? `  <span class="tree-tipo">(${nodo.tipo})</span>` : '';
    lineas.push(`${prefijo}${conector}<span class="tree-leaf">${esc(nodo.nombre)}</span>${tipo}`);
  } else {
    lineas.push(`${prefijo}${conector}<span class="tree-node">${esc(nodo.nombre)}</span>`);
    (nodo.hijos||[]).forEach((hijo, i) => {
      lineas = lineas.concat(renderArbol(hijo, prefijo + extension, i === nodo.hijos.length - 1));
    });
  }
  return lineas;
}

function arbolATexto(raiz) {
  let lineas = [`<span class="tree-node">${esc(raiz.nombre)}</span>`];
  (raiz.hijos||[]).forEach((hijo, i) => {
    lineas = lineas.concat(renderArbol(hijo, '', i === raiz.hijos.length - 1));
  });
  return lineas.join('\n');
}

//  RENDER SINTÁCTICO

function renderSintactico(tokens) {
  const errLex = cnt(tokens, 'ERROR_LEXICO');
  const sintEl    = document.getElementById('sint-resultado');
  const arbolWrap = document.getElementById('arbol-wrap');
  const arbolPre  = document.getElementById('arbol-pre');

  if (errLex > 0) {
    sintEl.innerHTML = `
      <div class="sint-badge sint-warn"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">warning</span> Análisis sintáctico no ejecutado</div>
      <p class="sint-msg">Corrija los <strong>${errLex} error${errLex>1?'es':''} léxico${errLex>1?'s':''}</strong> antes de continuar.</p>
      <div class="sugerencia"><span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;margin-right:4px">lightbulb</span> Revisa los tokens marcados en rojo en el panel de resaltado.</div>`;
    arbolWrap.style.display = 'none';
    return null;
  }

  try {
    const parser = new AnalizadorSintactico(tokens);
    const arbol  = parser.parsePrograma();
    sintEl.innerHTML = `<div class="sint-badge sint-ok"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">check_circle</span> Cadena aceptada — programa sintácticamente válido</div>`;
    arbolPre.innerHTML = arbolATexto(arbol);
    arbolWrap.style.display = 'block';
    return arbol;
  } catch (e) {
    const sug = obtenerSugerencia(e.message);
    sintEl.innerHTML = `
      <div class="sint-badge sint-err"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">cancel</span> Error sintáctico</div>
      <p class="sint-err-msg">${esc(e.message)}</p>
      ${sug ? `<div class="sugerencia">${sug}</div>` : ''}`;
    arbolWrap.style.display = 'none';
    return null;
  }
}

//  FASE 3 — ANALIZADOR SEMÁNTICO

class AnalizadorSemantico {
  constructor() {
    this.tabla    = {};
    this.pasos    = [];
    this.advertencias = [];
  }
  log(msg) { this.pasos.push(msg); }
  warn(msg) { this.advertencias.push(msg); }

  tipoCompatible(tipoCampo, tipoToken) {
    if (tipoCampo === 'entero'   && tipoToken === 'NUMERO')       return true;
    if (tipoCampo === 'decimal'  && (tipoToken === 'DECIMAL' || tipoToken === 'NUMERO')) return true;
    if (tipoCampo === 'texto'    && tipoToken === 'CADENA_TEXTO') return true;
    if (tipoCampo === 'booleano' && tipoToken === 'BOOLEANO')     return true;
    if (tipoCampo === 'fecha'    && tipoToken === 'FECHA')        return true;
    return false;
  }

  nombreTipoToken(tipoToken) {
    const map = { NUMERO: 'entero', DECIMAL: 'decimal', CADENA_TEXTO: 'texto', BOOLEANO: 'booleano', FECHA: 'fecha' };
    return map[tipoToken] || tipoToken;
  }

  analizar(arbol) {
    this.log('PASO 1 — Tabla de símbolos inicializada vacía.');
    const decls = arbol.hijos.find(h => h.nombre === 'DECLARACIONES');
    if (decls) {
      this.log('PASO 2 — Procesando declaraciones de campos...');
      for (const d of decls.hijos) this.procesarDeclaracion(d);
    }
    const dirs = arbol.hijos.find(h => h.nombre === 'DIRECTIVAS');
    if (dirs && dirs.hijos.length > 0) {
      this.log('PASO 3 — Procesando directivas financieras...');
      for (const d of dirs.hijos) this.procesarDirectiva(d);
    }
    const reglas = arbol.hijos.find(h => h.nombre === 'REGLAS');
    if (reglas) {
      this.log('PASO 4 — Validando comparaciones en reglas...');
      for (const r of reglas.hijos) this.procesarRegla(r);
    }

    // Advertencias: campos declarados pero no usados
    const usados = new Set();
    if (reglas) this.recogerCamposUsados(reglas, usados);
    for (const nombre of Object.keys(this.tabla)) {
      if (!usados.has(nombre)) {
        this.warn(`El campo '${nombre}' está declarado pero no se usa en ninguna regla.`);
      }
    }

    this.log('Análisis semántico completado' +
      (this.advertencias.length > 0 ? ` con ${this.advertencias.length} advertencia(s).` : ' sin errores.'));
    return this.tabla;
  }

  recogerCamposUsados(nodo, set) {
    if (nodo.esHoja) return;
    if ((nodo.nombre === 'COMPARACION' || nodo.nombre === 'COMPARACION_RANGO') && nodo.hijos[0]?.esHoja) {
      set.add(nodo.hijos[0].nombre.toLowerCase());
    }
    (nodo.hijos || []).forEach(h => this.recogerCamposUsados(h, set));
  }

  procesarDeclaracion(nodoDecl) {
    const hojas = nodoDecl.hijos.filter(h => h.esHoja);
    const tipoToken = hojas.find(h => h.tipo === 'TIPO_DATO');
    const idToken   = hojas.find(h => h.tipo === 'IDENTIFICADOR');
    if (!tipoToken || !idToken) return;
    const nombre = idToken.nombre.toLowerCase();
    const tipo   = tipoToken.nombre.toLowerCase();
    const linea  = idToken.ln;
    if (this.tabla[nombre])
      throw new Error(`Línea ${linea}: el campo '${nombre}' ya fue declarado (línea ${this.tabla[nombre].linea}).`);
    this.tabla[nombre] = { nombre, tipo, linea };
    this.log(`  → Campo '${nombre}' (${tipo}) agregado. [línea ${linea}]`);
  }

  procesarDirectiva(nodo) {
    // Solo validamos que los identificadores usados existan
    (nodo.hijos || []).forEach(h => {
      if (h.esHoja && h.tipo === 'IDENTIFICADOR') {
        const nombre = h.nombre.toLowerCase();
        if (!this.tabla[nombre])
          throw new Error(`Línea ${h.ln}: el campo '${nombre}' usado en directiva no fue declarado.`);
      }
      if (!h.esHoja) this.procesarRegla(h);
    });
  }

  procesarRegla(nodo) {
    if (!nodo || !nodo.hijos) return;
    for (const hijo of nodo.hijos) {
      if (hijo.nombre === 'COMPARACION')       this.procesarComparacion(hijo);
      else if (hijo.nombre === 'COMPARACION_RANGO') this.procesarComparacionRango(hijo);
      else if (!hijo.esHoja)                   this.procesarRegla(hijo);
    }
  }

  procesarComparacion(nodoComp) {
    const hojas = nodoComp.hijos.filter(h => h.esHoja);
    const idToken    = hojas[0];
    const valorToken = hojas[2];
    if (!idToken || !valorToken) return;
    const nombre = idToken.nombre.toLowerCase();
    const linea  = idToken.ln;
    if (!this.tabla[nombre])
      throw new Error(`Línea ${linea}: el campo '${nombre}' no fue declarado.`);
    const tipoCampo = this.tabla[nombre].tipo;
    if (!this.tipoCompatible(tipoCampo, valorToken.tipo)) {
      const tipoVal = this.nombreTipoToken(valorToken.tipo);
      throw new Error(`Línea ${linea}: incompatibilidad de tipos — '${nombre}' es ${tipoCampo} pero se compara con valor de tipo ${tipoVal}.`);
    }
    this.log(`  → '${nombre}' (${tipoCampo}) vs '${valorToken.nombre}': ✓`);
  }

  procesarComparacionRango(nodoComp) {
    const hojas = nodoComp.hijos.filter(h => h.esHoja);
    const idToken = hojas[0];
    if (!idToken) return;
    const nombre = idToken.nombre.toLowerCase();
    const linea  = idToken.ln;
    if (!this.tabla[nombre])
      throw new Error(`Línea ${linea}: el campo '${nombre}' no fue declarado.`);
    const tipoCampo = this.tabla[nombre].tipo;
    if (tipoCampo !== 'entero' && tipoCampo !== 'decimal')
      throw new Error(`Línea ${linea}: ENTRE solo puede usarse con campos numéricos (entero o decimal), '${nombre}' es ${tipoCampo}.`);
    this.log(`  → Rango ENTRE para '${nombre}' (${tipoCampo}): ✓`);
  }
}

//  RENDER SEMÁNTICO

let _tablaSimbolos = null;
let _arbolPrograma = null;

function renderSemantico(arbol) {
  const semEl     = document.getElementById('sem-resultado');
  const tablaWrap = document.getElementById('tabla-simbolos-wrap');
  const tablaEl   = document.getElementById('tabla-simbolos');
  const simPanel  = document.getElementById('simulador-panel');

  _tablaSimbolos = null;
  _arbolPrograma = null;

  if (!arbol) {
    semEl.innerHTML = `
      <div class="sint-badge sint-warn"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">warning</span> Análisis semántico no ejecutado</div>
      <p class="sint-msg">Requiere que las fases léxica y sintáctica sean exitosas.</p>`;
    tablaWrap.style.display = 'none';
    simPanel.style.display  = 'none';
    return;
  }

  try {
    const semantico = new AnalizadorSemantico();
    const tabla     = semantico.analizar(arbol);
    const entradas  = Object.values(tabla);

    const logHtml = semantico.pasos.map(p => `<div class="sem-log-line">${esc(p)}</div>`).join('');
    const warnHtml = semantico.advertencias.length > 0
      ? `<div class="sem-warnings">${semantico.advertencias.map(w =>
          `<div class="sem-warn-line">${esc(w)}</div>`).join('')}</div>`
      : '';

    semEl.innerHTML = `
      <div class="sint-badge sint-ok"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">check_circle</span> Programa semánticamente válido</div>
      <div class="sem-log">${logHtml}</div>
      ${warnHtml}`;

    let html = `<thead><tr>
      <th class="col-n">#</th><th>Nombre</th>
      <th>Tipo</th><th>Línea</th>
    </tr></thead><tbody>`;
    const tipoClase = { entero:'tk-num', decimal:'tk-dec', texto:'tk-str', booleano:'tk-bool', fecha:'tk-date' };
    entradas.forEach((e, i) => {
      html += `<tr style="animation-delay:${i*0.06}s">
        <td class="col-n">${i+1}</td>
        <td><span class="tk tk-id">${esc(e.nombre)}</span></td>
        <td><span class="tk ${tipoClase[e.tipo]||'tk-id'}">${esc(e.tipo)}</span></td>
        <td class="col-ln" style="text-align:left;padding-left:1rem">${e.linea}</td>
      </tr>`;
    });
    html += '</tbody>';
    tablaEl.innerHTML = html;
    tablaWrap.style.display = 'block';

    _tablaSimbolos = tabla;
    _arbolPrograma = arbol;

    construirFormularioSimulador(tabla);
    simPanel.style.display = 'block';

  } catch (e) {
    const sug = obtenerSugerencia(e.message);
    semEl.innerHTML = `
      <div class="sint-badge sint-err"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">cancel</span> Error semántico</div>
      <p class="sint-err-msg">${esc(e.message)}</p>
      ${sug ? `<div class="sugerencia">${sug}</div>` : ''}`;
    tablaWrap.style.display = 'none';
    simPanel.style.display  = 'none';
  }
}
//  SIMULADOR — FORMULARIO DINÁMICO

let _historial = [];
let _ultimoResultado = null;

function construirFormularioSimulador(tabla) {
  const form = document.getElementById('sim-form');
  const entradas = Object.values(tabla);
  document.getElementById('sim-resultado-wrap').style.display = 'none';
  document.getElementById('sim-btn-row').style.display = 'flex';

  const placeholders = {
    entero:   { ph: 'Ej: 5000',        hint: 'Número entero' },
    decimal:  { ph: 'Ej: 5000.00',     hint: 'Número con decimales' },
    texto:    { ph: 'Ej: bueno',       hint: 'Texto sin comillas' },
    booleano: { ph: 'verdadero / falso', hint: 'Valor booleano' },
    fecha:    { ph: 'AAAA-MM-DD',      hint: 'Ej: 1990-06-15' }
  };

  let html = `
    <div class="sim-section-title"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:6px">person</span> Datos del Solicitante</div>
    <div class="sim-fields-grid">
      <div class="sim-field">
        <label class="sim-label"><span class="sim-field-name">Nombre Completo</span></label>
        <input class="sim-input" type="text" id="sim-solicitante-nombre" placeholder="Ej: María García López" />
      </div>
      <div class="sim-field">
        <label class="sim-label"><span class="sim-field-name">DPI / Identificación</span></label>
        <input class="sim-input" type="text" id="sim-solicitante-dpi" placeholder="Ej: 1234567890101" />
      </div>
    </div>
    <div class="sim-divider"></div>
    <div class="sim-section-title"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:6px">assignment</span> Datos para Evaluación</div>
    <div class="sim-fields-grid">`;

  entradas.forEach(e => {
    const info  = placeholders[e.tipo] || { ph: '', hint: '' };
    const label = e.nombre.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const tipoClase = { entero:'tk-num', decimal:'tk-dec', texto:'tk-str', booleano:'tk-bool', fecha:'tk-date' };

    let inputHtml = '';
    if (e.tipo === 'booleano') {
      inputHtml = `<select class="sim-input sim-select" id="sim-${esc(e.nombre)}">
        <option value="">— Selecciona —</option>
        <option value="verdadero">Verdadero</option>
        <option value="falso">Falso</option>
      </select>`;
    } else if (e.tipo === 'fecha') {
      inputHtml = `<input class="sim-input" type="date" id="sim-${esc(e.nombre)}" />`;
    } else {
      inputHtml = `<input class="sim-input ${e.tipo==='texto'?'sim-input-text':''}"
        type="${e.tipo==='entero'||e.tipo==='decimal'?'number':'text'}"
        ${e.tipo==='decimal'?'step="0.01"':''}
        id="sim-${esc(e.nombre)}" placeholder="${info.ph}" />`;
    }

    html += `
      <div class="sim-field">
        <label class="sim-label">
          <span class="sim-field-name">${esc(label)}</span>
          <span class="tk ${tipoClase[e.tipo]||'tk-id'}" style="margin-left:0.4rem">${esc(e.tipo)}</span>
        </label>
        ${inputHtml}
        <span class="sim-field-hint">${info.hint}</span>
      </div>`;
  });

  html += `</div>`;
  form.innerHTML = html;
}

function obtenerDatosSolicitante() {
  const nombre = document.getElementById('sim-solicitante-nombre').value.trim();
  const dpi    = document.getElementById('sim-solicitante-dpi').value.trim();
  if (!nombre) throw new Error('El nombre del solicitante es obligatorio.');
  if (!dpi)    throw new Error('El DPI o número de identificación es obligatorio.');
  return { nombre, dpi };
}

function obtenerValoresSolicitud() {
  const valores = {};
  for (const e of Object.values(_tablaSimbolos)) {
    const input = document.getElementById(`sim-${e.nombre}`);
    if (!input) continue;
    const raw = input.value.trim();
    if (raw === '') throw new Error(`El campo "${e.nombre}" está vacío.`);

    if (e.tipo === 'entero') {
      const num = Number(raw);
      if (isNaN(num) || !Number.isInteger(num)) throw new Error(`"${e.nombre}" debe ser un número entero.`);
      valores[e.nombre] = num;
    } else if (e.tipo === 'decimal') {
      const num = parseFloat(raw);
      if (isNaN(num)) throw new Error(`"${e.nombre}" debe ser decimal.`);
      valores[e.nombre] = num;
    } else if (e.tipo === 'booleano') {
      valores[e.nombre] = raw.toLowerCase() === 'verdadero';
    } else if (e.tipo === 'fecha') {
      valores[e.nombre] = raw; 
    } else {
      valores[e.nombre] = raw.replace(/^"|"$/g, '').toLowerCase();
    }
  }
  return valores;
}

function reiniciarSimulador() {
  const nombreInput = document.getElementById('sim-solicitante-nombre');
  const dpiInput = document.getElementById('sim-solicitante-dpi');
  if (nombreInput) nombreInput.value = '';
  if (dpiInput) dpiInput.value = '';

  if (_tablaSimbolos) {
    for (const e of Object.values(_tablaSimbolos)) {
      const input = document.getElementById(`sim-${e.nombre}`);
      if (input) input.value = '';
    }
  }

  const resultWrap = document.getElementById('sim-resultado-wrap');
  if (resultWrap) resultWrap.style.display = 'none';
  
  const resultEl = document.getElementById('sim-resultado');
  if (resultEl) resultEl.innerHTML = '';
  
  const detalleEl = document.getElementById('sim-detalle');
  if (detalleEl) detalleEl.innerHTML = '';
}

//  MOTOR DE EVALUACIÓN 

function evaluarCondicionConTraza(nodoCondicion, valores) {
  if (!nodoCondicion || !nodoCondicion.hijos) return { resultado: false, traza: [] };
  for (const hijo of nodoCondicion.hijos) {
    if (hijo.nombre === 'COMPARACION')       return evaluarComparacionConTraza(hijo, valores);
    if (hijo.nombre === 'COMPARACION_RANGO') return evaluarRangoConTraza(hijo, valores);
    if (hijo.nombre === 'CONDICION_COMPUESTA') return evaluarCompuestaConTraza(hijo, valores);
  }
  return { resultado: false, traza: [] };
}

function evaluarCompuestaConTraza(nodo, valores) {
  const hijos = nodo.hijos;

  // NO <cond>
  if (hijos.length === 2 && hijos[0].esHoja && hijos[0].nombre.toUpperCase() === 'NO') {
    const sub = evaluarCondicionConTraza(hijos[1], valores);
    return {
      resultado: !sub.resultado,
      traza: [{ tipo: 'NOT', resultado: !sub.resultado, sub: sub.traza }]
    };
  }

  // ( <cond> )
  if (hijos.length === 3 && hijos[0].esHoja && hijos[0].nombre === '(') {
    return evaluarCondicionConTraza(hijos[1], valores);
  }

  // <cond> Y/O <cond>
  if (hijos.length === 3 && !hijos[0].esHoja) {
    const izq = evaluarCondicionConTraza(hijos[0], valores);
    const op  = hijos[1].nombre.toUpperCase();
    const der = evaluarCondicionConTraza(hijos[2], valores);
    const resultado = op === 'Y' ? (izq.resultado && der.resultado) : (izq.resultado || der.resultado);
    return {
      resultado,
      traza: [{ tipo: op, resultado, izq: izq.traza, der: der.traza }]
    };
  }
  return { resultado: false, traza: [] };
}

function evaluarComparacionConTraza(nodoComp, valores) {
  const hojas = nodoComp.hijos.filter(h => h.esHoja);
  const campo    = hojas[0].nombre.toLowerCase();
  const operador = hojas[1].nombre;
  const valorToken = hojas[2];

  const valorCampo = valores[campo];
  const tipoCampo  = _tablaSimbolos[campo]?.tipo;
  let valorComparar;

  if (valorToken.tipo === 'NUMERO')       valorComparar = Number(valorToken.nombre);
  else if (valorToken.tipo === 'DECIMAL') valorComparar = parseFloat(valorToken.nombre);
  else if (valorToken.tipo === 'BOOLEANO') valorComparar = valorToken.nombre.toLowerCase() === 'verdadero';
  else valorComparar = valorToken.nombre.replace(/^"|"$/g, '').toLowerCase();

  let resultado = false;
  switch (operador) {
    case '>':  resultado = valorCampo >  valorComparar; break;
    case '<':  resultado = valorCampo <  valorComparar; break;
    case '>=': resultado = valorCampo >= valorComparar; break;
    case '<=': resultado = valorCampo <= valorComparar; break;
    case '=':  resultado = String(valorCampo).toLowerCase() == String(valorComparar).toLowerCase(); break;
    case '!=': resultado = String(valorCampo).toLowerCase() != String(valorComparar).toLowerCase(); break;
  }

  // Calcular diferencia para campos numéricos
  let diferencia = null;
  if ((tipoCampo === 'entero' || tipoCampo === 'decimal') && typeof valorCampo === 'number' && typeof valorComparar === 'number') {
    diferencia = valorCampo - valorComparar;
  }

  return {
    resultado,
    traza: [{
      tipo: 'CMP',
      campo,
      tipoCampo,
      operador,
      valorCampo,
      valorComparar,
      resultado,
      diferencia
    }]
  };
}

function evaluarRangoConTraza(nodoComp, valores) {
  const hojas = nodoComp.hijos.filter(h => h.esHoja);
  const campo = hojas[0].nombre.toLowerCase();
  const min   = parseFloat(hojas[2].nombre);
  const max   = parseFloat(hojas[4].nombre);
  const val   = valores[campo];
  const resultado = val >= min && val <= max;

  return {
    resultado,
    traza: [{
      tipo: 'RANGO',
      campo,
      tipoCampo: _tablaSimbolos[campo]?.tipo,
      min, max, valorCampo: val,
      resultado
    }]
  };
}
//  GENERADOR DE EXPLICACIONES 

function formatearValor(val, tipo) {
  if (tipo === 'decimal') return Number(val).toLocaleString('es-GT', { minimumFractionDigits: 2 });
  if (tipo === 'entero')  return Number(val).toLocaleString('es-GT');
  if (tipo === 'booleano') return val ? 'verdadero' : 'falso';
  return val;
}

function explicarTraza(traza, nivel = 0) {
  const lineas = [];
  for (const t of traza) {
    if (t.tipo === 'CMP') {
      const icon = t.resultado ? '<span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">check_circle</span>' : '<span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">cancel</span>';
      const fval = formatearValor(t.valorCampo, t.tipoCampo);
      const fcmp = formatearValor(t.valorComparar, t.tipoCampo);
      const nombreCampo = t.campo.replace(/_/g,' ');

      let texto = '';
      if (t.resultado) {
        texto = generarExplicacionExito(t, fval, fcmp, nombreCampo);
      } else {
        texto = generarExplicacionFallo(t, fval, fcmp, nombreCampo);
      }
      lineas.push({ icon, texto, resultado: t.resultado, nivel,
        campo: t.campo, valorCampo: t.valorCampo, valorComparar: t.valorComparar,
        operador: t.operador, diferencia: t.diferencia, tipoCampo: t.tipoCampo });
    }
    if (t.tipo === 'RANGO') {
      const icon = t.resultado ? '<span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">check_circle</span>' : '<span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">cancel</span>';
      const fval = formatearValor(t.valorCampo, t.tipoCampo);
      const nombreCampo = t.campo.replace(/_/g,' ');
      const texto = t.resultado
        ? `<strong>${nombreCampo}</strong> (${fval}) se encuentra dentro del rango [${t.min} – ${t.max}]`
        : `<strong>${nombreCampo}</strong> (${fval}) está <em>fuera</em> del rango requerido [${t.min} – ${t.max}]`;
      lineas.push({ icon, texto, resultado: t.resultado, nivel,
        campo: t.campo, diferencia: null });
    }
    if (t.tipo === 'Y' || t.tipo === 'O') {
      lineas.push(...explicarTraza(t.izq || [], nivel));
      lineas.push(...explicarTraza(t.der || [], nivel));
    }
    if (t.tipo === 'NOT') {
      lineas.push(...explicarTraza(t.sub || [], nivel + 1));
    }
  }
  return lineas;
}

function generarExplicacionExito(t, fval, fcmp, nombreCampo) {
  const ops = {
    '>=': `es <strong>${fval}</strong>, que cumple el mínimo requerido de <strong>${fcmp}</strong>`,
    '<=': `es <strong>${fval}</strong>, que está por debajo del máximo de <strong>${fcmp}</strong>`,
    '>':  `es <strong>${fval}</strong>, que supera el umbral de <strong>${fcmp}</strong>`,
    '<':  `es <strong>${fval}</strong>, que está por debajo de <strong>${fcmp}</strong>`,
    '=':  `es <strong>${fval}</strong>, que coincide con el valor requerido "<strong>${fcmp}</strong>"`,
    '!=': `es <strong>${fval}</strong>, que es diferente al valor excluido "<strong>${fcmp}</strong>"`
  };
  return `<strong>${nombreCampo}</strong> ${ops[t.operador] || `cumple la condición (${t.operador} ${fcmp})`}`;
}

function generarExplicacionFallo(t, fval, fcmp, nombreCampo) {
  const diff = t.diferencia !== null ? Math.abs(t.diferencia) : null;
  const ops = {
    '>=': `es <strong>${fval}</strong>, pero se requiere un mínimo de <strong>${fcmp}</strong>${diff!==null ? ` — faltan <strong>${formatearValor(diff, t.tipoCampo)}</strong> para alcanzarlo` : ''}`,
    '<=': `es <strong>${fval}</strong>, pero no debe superar <strong>${fcmp}</strong>${diff!==null ? ` — excede por <strong>${formatearValor(diff, t.tipoCampo)}</strong>` : ''}`,
    '>':  `es <strong>${fval}</strong>, pero debe ser mayor que <strong>${fcmp}</strong>`,
    '<':  `es <strong>${fval}</strong>, pero debe ser menor que <strong>${fcmp}</strong>`,
    '=':  `es <strong>"${fval}"</strong>, pero se requiere el valor <strong>"${fcmp}"</strong>`,
    '!=': `es <strong>"${fval}"</strong>, que coincide con el valor excluido <strong>"${fcmp}"</strong>`
  };
  return `<strong>${nombreCampo}</strong> ${ops[t.operador] || `no cumple la condición (${t.operador} ${fcmp})`}`;
}

//  ANÁLISIS DE REGLAS NO APLICADAS

function analizarReglasNoAplicadas(nodoReglas, valores, reglaAplicadaIdx) {
  const detalle = [];
  nodoReglas.hijos.forEach((regla, idx) => {
    const nodoCondicion = regla.hijos.find(h => h.nombre === 'CONDICION');
    const nodoAccion    = regla.hijos.find(h => h.nombre === 'ACCION');
    if (!nodoCondicion || !nodoAccion) return;

    const { resultado, traza } = evaluarCondicionConTraza(nodoCondicion, valores);
    const accion = nodoAccion.hijos[0]?.nombre?.toUpperCase() || '?';
    const texto  = reconstruirTextoRegla(regla);
    const prioNodo = regla.hijos.find(h => h.nombre === 'PRIORIDAD_DEF');
    const prio   = prioNodo ? prioNodo.hijos[1]?.nombre : null;

    detalle.push({
      numero: idx + 1,
      prioridad: prio,
      accion,
      texto,
      cumplida: resultado,
      esAplicada: idx === reglaAplicadaIdx,
      trazaLineas: explicarTraza(traza)
    });
  });
  return detalle;
}

//  RENDER DE TABLA DE REGLAS EVALUADAS

function renderTablaReglas(detalle) {
  const iconAccion = { APROBAR: '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">check_circle</span>', RECHAZAR: '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">cancel</span>', CONDICIONAR: '<span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">warning</span>' };
  const claseAccion = { APROBAR: 'badge-apr', RECHAZAR: 'badge-rec', CONDICIONAR: 'badge-con' };

  let html = `<div class="reglas-tabla-wrap">
    <table class="reglas-eval-table">
      <thead><tr>
        <th>#</th>
        <th>Regla</th>
        <th>Acción</th>
        <th>¿Cumplida?</th>
        <th>Estado</th>
      </tr></thead><tbody>`;

  detalle.forEach(r => {
    const estadoHtml = r.esAplicada
      ? `<span class="badge-aplicada">← APLICADA</span>`
      : (r.cumplida ? `<span class="badge-cumplida-no">Omitida</span>` : `<span class="badge-no-cumplida">No cumplida</span>`);
    html += `<tr class="${r.esAplicada ? 'fila-aplicada' : ''}">
      <td class="col-n">${r.numero}${r.prioridad ? `<br><span style="font-size:0.7rem;color:var(--text-dim)">P${r.prioridad}</span>` : ''}</td>
      <td><code class="regla-mini">${esc(r.texto)}</code></td>
      <td><span class="eval-badge ${claseAccion[r.accion]||''}">${iconAccion[r.accion]||''} ${r.accion}</span></td>
      <td class="col-cumplida">${r.cumplida ? 'Sí' : 'No'}</td>
      <td>${estadoHtml}</td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  return html;
}

//  RENDER DE EXPLICACIÓN DETALLADA

function renderExplicacionDetallada(accion, detalle, reglaAplicada) {
  const mensajesBase = {
    APROBAR:     'La solicitud fue <strong>aprobada</strong> porque se cumplieron todos los requisitos de la siguiente regla:',
    RECHAZAR:    'La solicitud fue <strong>rechazada</strong> porque se cumplió la siguiente condición de rechazo:',
    CONDICIONAR: 'La solicitud fue <strong>condicionada</strong> porque cumple parcialmente los criterios, requiriendo garantías adicionales:'
  };

  // Explicación de la regla aplicada
  const reglaDet = detalle.find(r => r.esAplicada);
  let html = `<div class="exp-seccion">
    <div class="exp-titulo"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">push_pin</span> Motivo del resultado</div>
    <p class="exp-intro">${mensajesBase[accion] || 'Se aplicó la siguiente regla:'}</p>
    <code class="exp-regla-codigo">${esc(reglaDet?.texto || '')}</code>
  </div>`;

  // Desglose condición por condición
  if (reglaDet && reglaDet.trazaLineas.length > 0) {
    html += `<div class="exp-seccion">
      <div class="exp-titulo"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">manage_search</span> Desglose de condiciones</div>
      <div class="exp-condiciones">`;
    for (const linea of reglaDet.trazaLineas) {
      html += `<div class="exp-cond-item exp-cond-${linea.resultado ? 'ok' : 'fail'}">
        <span class="exp-cond-icon">${linea.icon}</span>
        <span class="exp-cond-texto">${linea.texto}</span>
      </div>`;
    }
    html += `</div></div>`;
  }

  // Reglas que NO se cumplieron con explicación de qué faltó
  const noAplicadas = detalle.filter(r => !r.esAplicada && !r.cumplida);
  if (noAplicadas.length > 0) {
    html += `<div class="exp-seccion">
      <div class="exp-titulo"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">rule</span> Por qué no aplicaron otras reglas</div>`;
    for (const r of noAplicadas) {
      const fallidas = r.trazaLineas.filter(l => !l.resultado);
      if (fallidas.length === 0) continue;
      html += `<div class="exp-regla-no-apl">
        <div class="exp-regla-no-apl-header">
          Regla ${r.numero} — <span class="exp-accion-label">${r.accion}</span> — no se aplicó porque:
        </div>`;
      for (const f of fallidas) {
        html += `<div class="exp-cond-item exp-cond-fail">
        <span class="exp-cond-icon"><span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">cancel</span></span>
        <span class="exp-cond-texto">${f.texto}</span>
        </div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
  }

  // Recomendaciones si es CONDICIONAR o RECHAZAR
  if (accion === 'CONDICIONAR' || accion === 'RECHAZAR') {
    const recomendaciones = generarRecomendaciones(detalle, accion);
    if (recomendaciones.length > 0) {
      html += `<div class="exp-seccion exp-recom">
        <div class="exp-titulo"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">lightbulb</span> Recomendaciones para mejorar el perfil</div>
        <ul class="exp-recom-lista">`;
      for (const rec of recomendaciones) {
        html += `<li class="exp-recom-item">${rec}</li>`;
      }
      html += `</ul></div>`;
    }
  }

  return html;
}

function generarRecomendaciones(detalle, accion) {
  const recs = [];
  // Revisar todas las reglas de APROBAR que no se cumplieron
  const reglasMejores = detalle.filter(r => r.accion === 'APROBAR' && !r.cumplida);
  for (const r of reglasMejores) {
    for (const linea of r.trazaLineas) {
      if (!linea.resultado && linea.campo) {
        const campo = linea.campo.replace(/_/g,' ');
        if (linea.operador === '>=' && linea.diferencia !== null) {
          recs.push(`Incrementar <strong>${campo}</strong> en al menos <strong>${formatearValor(Math.abs(linea.diferencia), linea.tipoCampo)}</strong> para alcanzar el requisito mínimo.`);
        } else if (linea.operador === '<=' && linea.diferencia !== null) {
          recs.push(`Reducir <strong>${campo}</strong> en al menos <strong>${formatearValor(Math.abs(linea.diferencia), linea.tipoCampo)}</strong> para no superar el límite.`);
        } else if (linea.operador === '=') {
          recs.push(`Verificar que <strong>${campo}</strong> tenga el valor requerido.`);
        }
      }
    }
  }
  // Evitar duplicados
  return [...new Set(recs)].slice(0, 4);
}

//  EVALUACIÓN PRINCIPAL

function reconstruirTextoRegla(nodoRegla) {
  const hojas = [];
  function recoger(n) {
    if (n.esHoja) { hojas.push(n.nombre); return; }
    (n.hijos || []).forEach(recoger);
  }
  recoger(nodoRegla);
  return hojas.join(' ');
}

function evaluarSolicitud() {
  const resultWrap = document.getElementById('sim-resultado-wrap');
  const resultEl   = document.getElementById('sim-resultado');
  const detalleEl  = document.getElementById('sim-detalle');
  const loaderWrap = document.getElementById('sim-loader-wrap');

  try {
    const solicitante = obtenerDatosSolicitante();
    const valores     = obtenerValoresSolicitud();

    const nodoReglas = _arbolPrograma.hijos.find(h => h.nombre === 'REGLAS');
    if (!nodoReglas) throw new Error('No hay reglas para evaluar.');

    resultWrap.style.display = 'none';
    if (loaderWrap) {
      loaderWrap.style.display = 'flex';
      loaderWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    setTimeout(() => {
      try {
        if (loaderWrap) loaderWrap.style.display = 'none';

        // Encontrar regla aplicada
        let accionFinal       = null;
        let reglaAplicadaIdx  = -1;
        let reglaAplicadaTxt  = '';

        nodoReglas.hijos.forEach((regla, idx) => {
          if (accionFinal !== null) return;
          const nodoCondicion = regla.hijos.find(h => h.nombre === 'CONDICION');
          const nodoAccion    = regla.hijos.find(h => h.nombre === 'ACCION');
          if (!nodoCondicion || !nodoAccion) return;
          const { resultado } = evaluarCondicionConTraza(nodoCondicion, valores);
          if (resultado) {
            accionFinal      = nodoAccion.hijos[0].nombre.toUpperCase();
            reglaAplicadaIdx = idx;
            reglaAplicadaTxt = reconstruirTextoRegla(regla);
          }
        });

        // Análisis completo de todas las reglas
        const detalleReglas = analizarReglasNoAplicadas(nodoReglas, valores, reglaAplicadaIdx);

        resultWrap.style.display = 'block';
        resultWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        const ahora    = new Date();
        const fechaStr = ahora.toLocaleDateString('es-GT', { day:'2-digit', month:'long', year:'numeric' });
        const horaStr  = ahora.toLocaleTimeString('es-GT', { hour:'2-digit', minute:'2-digit' });
        const folio    = 'SOL-' + Date.now().toString().slice(-6);

        const iconos   = { APROBAR: 'check_circle', RECHAZAR: 'cancel', CONDICIONAR: 'warning' };
        const clases   = { APROBAR: 'sim-res-aprobar', RECHAZAR: 'sim-res-rechazar', CONDICIONAR: 'sim-res-condicionar' };

        if (!accionFinal) {
          resultEl.innerHTML = `<div class="sim-res sim-res-ninguna"><span class="material-symbols-outlined" style="font-size:24px;vertical-align:middle;">remove_circle_outline</span> Ninguna regla aplicó</div>`;
          detalleEl.innerHTML = `
            <p class="sim-detalle-txt">Ninguna de las reglas definidas se cumplió con los datos ingresados.</p>
            <div class="exp-seccion">
              <div class="exp-titulo"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">fact_check</span> Evaluación de todas las reglas</div>
              ${renderTablaReglas(detalleReglas)}
            </div>`;
          agregarHistorial({ solicitante, accion: 'SIN RESULTADO', folio, fechaStr, horaStr });
          return;
        }

        resultEl.innerHTML = `
          <div class="sim-res ${clases[accionFinal]}">
            <span class="material-symbols-outlined sim-res-icon" style="font-size:32px;">${iconos[accionFinal]}</span>
            <span class="sim-res-text">${accionFinal}</span>
          </div>`;

        const datosHtml = Object.entries(valores).map(([k, v]) => {
          const tipo = _tablaSimbolos[k]?.tipo || 'texto';
          return `<span class="sim-dato-chip"><b>${k.replace(/_/g,' ')}</b>: ${formatearValor(v, tipo)}</span>`;
        }).join('');

        detalleEl.innerHTML = `
          <div class="sim-folio">Folio: <strong>${folio}</strong> &nbsp;·&nbsp; ${fechaStr} ${horaStr}</div>
          <div class="sim-solicitante-info">
            <span><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">person</span> <strong>${esc(solicitante.nombre)}</strong></span>
            <span><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">badge</span> DPI: ${esc(solicitante.dpi)}</span>
          </div>
          <div class="sim-datos-evaluados">${datosHtml}</div>

          <!-- Explicación inteligente -->
          <div class="exp-panel">
            ${renderExplicacionDetallada(accionFinal, detalleReglas, reglaAplicadaTxt)}
          </div>

          <!-- Tabla de todas las reglas evaluadas -->
            <div class="exp-seccion">
            <div class="exp-titulo"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;margin-right:4px">fact_check</span> Evaluación de todas las reglas</div>
            ${renderTablaReglas(detalleReglas)}
          </div>

          <div class="sim-pdf-row">
            <button class="btn btn-pdf" onclick="generarPDF()"><span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">download</span> Descargar dictamen PDF</button>
          </div>`;

        _ultimoResultado = { folio, nombre: solicitante.nombre, dpi: solicitante.dpi,
          accion: accionFinal, regla: reglaAplicadaTxt, fecha: fechaStr, hora: horaStr,
          valores, detalleReglas };

        agregarHistorial({ solicitante, accion: accionFinal, folio, fechaStr, horaStr, regla: reglaAplicadaTxt });

      } catch (err) {
        if (loaderWrap) loaderWrap.style.display = 'none';
        resultWrap.style.display = 'block';
        resultEl.innerHTML = `<div class="sim-res sim-res-err"><span class="material-symbols-outlined" style="font-size:20px;vertical-align:middle">error</span> ${esc(err.message)}</div>`;
        detalleEl.innerHTML = '';
      }
    }, 700);

  } catch (e) {
    if (loaderWrap) loaderWrap.style.display = 'none';
    resultWrap.style.display = 'block';
    resultEl.innerHTML = `<div class="sim-res sim-res-err"><span class="material-symbols-outlined" style="font-size:20px;vertical-align:middle">error</span> ${esc(e.message)}</div>`;
    detalleEl.innerHTML = '';
  }
}
//  HISTORIAL

function agregarHistorial(entry) {
  _historial.unshift(entry);
  renderHistorial();
  const wrap = document.getElementById('historial-wrap');
  if (wrap) wrap.style.display = 'block';
}

function renderHistorial() {
  const el = document.getElementById('historial-tabla');
  if (!el) return;
  const clases = { APROBAR:'hist-aprobar', RECHAZAR:'hist-rechazar', CONDICIONAR:'hist-condicionar', 'SIN RESULTADO':'hist-ninguna' };
  let html = `<thead><tr>
    <th class="col-n">#</th><th>Folio</th><th>Solicitante</th>
    <th>DPI</th><th>Resultado</th><th>Fecha</th><th>Hora</th>
  </tr></thead><tbody>`;
  _historial.forEach((e, i) => {
    html += `<tr style="animation-delay:${i*0.04}s">
      <td class="col-n">${_historial.length - i}</td>
      <td><span style="font-family:'JetBrains Mono',monospace;font-size:0.75rem;color:var(--text-dim)">${esc(e.folio)}</span></td>
      <td>${esc(e.solicitante.nombre)}</td>
      <td><span style="font-family:'JetBrains Mono',monospace;font-size:0.78rem">${esc(e.solicitante.dpi)}</span></td>
      <td><span class="hist-badge ${clases[e.accion]||''}">${esc(e.accion)}</span></td>
      <td style="font-size:0.78rem;color:var(--text-mid)">${esc(e.fechaStr)}</td>
      <td style="font-size:0.78rem;color:var(--text-mid)">${esc(e.horaStr)}</td>
    </tr>`;
  });
  html += '</tbody>';
  el.innerHTML = html;
}

//  PDF
function generarPDF() {
  if (!_ultimoResultado) return;
  const { folio, nombre, dpi, accion, regla, fecha, hora, valores, detalleReglas } = _ultimoResultado;
  const colores  = { APROBAR:'#1a6b3a', RECHAZAR:'#9B2C2C', CONDICIONAR:'#7B4F00' };
  const fondos   = { APROBAR:'#F0FFF4', RECHAZAR:'#FFF5F5', CONDICIONAR:'#FFFBEB' };
  const labelAccion = { APROBAR: 'APROBADO', RECHAZAR: 'RECHAZADO', CONDICIONAR: 'CONDICIONADO' };
  const color    = colores[accion] || '#333';
  const fondo    = fondos[accion]  || '#fff';

  const datosRows = Object.entries(valores).map(([k, v]) => {
    const tipo = _tablaSimbolos[k]?.tipo || 'texto';
    const label = k.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase());
    return `<tr><th>${label}</th><td>${formatearValor(v, tipo)}</td></tr>`;
  }).join('');

  // Desglose de condiciones en PDF
  const reglaDet = detalleReglas?.find(r => r.esAplicada);
  const condRows = reglaDet?.trazaLineas?.map(l => {
    const estado = l.resultado ? '[OK]' : '[NO]';
    return `<tr><td style="font-weight:bold;color:${l.resultado ? '#1a6b3a' : '#9B2C2C'};width:40px">${estado}</td><td>${l.texto.replace(/<[^>]+>/g,'')}</td></tr>`;
  }).join('') || '';

  // Reglas no cumplidas
  const noAplRows = detalleReglas?.filter(r => !r.esAplicada && !r.cumplida).map(r => {
    const fallidas = r.trazaLineas.filter(l => !l.resultado);
    return fallidas.map(f =>
      `<tr><td style="font-weight:bold;color:#9B2C2C;width:40px">[NO]</td><td>${f.texto.replace(/<[^>]+>/g,'')}</td></tr>`
    ).join('');
  }).join('') || '';

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<style>
body { font-family: 'Times New Roman', Times, serif; margin: 0; padding: 0; color: #111; background: #fff; }
.page { max-width: 800px; margin: 0 auto; padding: 40px; background: white; }
.hdr { border-bottom: 3px solid #0f52ba; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
.hdr-logo { font-size: 24px; font-weight: bold; color: #0f52ba; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, sans-serif; }
.hdr-logo-sub { font-size: 10px; color: #555; letter-spacing: 2px; }
.hdr-f { text-align: right; font-size: 12px; color: #333; font-family: Arial, sans-serif; }
.hdr-f strong { display: block; font-size: 14px; margin-bottom: 4px; }
h1 { text-align: center; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
.sec { margin-bottom: 25px; }
.sec-title { font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; background: #f4f4f4; padding: 5px 10px; border-left: 4px solid #0f52ba; font-family: Arial, sans-serif; }
table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 13px; font-family: Arial, sans-serif; }
table th, table td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; text-transform: none; }
table th { background: #fafafa; font-weight: bold; width: 40%; font-size: 12px; color: #444; text-transform: none; }
.res-box { text-align: center; border: 2px solid #0f52ba; padding: 20px; margin: 20px 0; background: #f8fbff; }
.res-txt { font-size: 22px; font-weight: bold; color: #0f52ba; text-transform: uppercase; font-family: Arial, sans-serif; letter-spacing: 1px; }
.res-sub { font-size: 12px; color: #555; margin-top: 5px; font-family: Arial, sans-serif; }
.regla { font-family: 'Courier New', Courier, monospace; background: #f9f9f9; padding: 12px; border: 1px solid #ccc; font-size: 12px; color: #333; }
.footer { margin-top: 60px; padding-top: 20px; font-size: 11px; text-align: justify; color: #555; border-top: 1px solid #ccc; font-family: Arial, sans-serif; line-height: 1.5; }
.signatures { display: flex; justify-content: space-around; margin-top: 60px; margin-bottom: 30px; }
.sig-box { text-align: center; width: 40%; }
.sig-line { border-top: 1px solid #000; margin-bottom: 5px; }
.sig-name { font-weight: bold; font-size: 12px; font-family: Arial, sans-serif; color: #111; }
.sig-title { font-size: 11px; color: #555; font-family: Arial, sans-serif; }
@media print{ body{background:#fff;} .page{padding:0;} }
</style></head><body>
<div class="page">
  <div class="hdr">
    <div>
      <div class="hdr-logo">Banco Central</div>
      <div class="hdr-logo-sub">DEPARTAMENTO DE RIESGO CREDITICIO</div>
    </div>
    <div class="hdr-f">
      <strong>Folio: ${folio}</strong>
      Fecha: ${fecha} - ${hora}
    </div>
  </div>
  
  <h1>Dictamen Oficial de Solicitud de Crédito</h1>

  <div class="sec">
    <div class="sec-title">I. Datos del Solicitante</div>
    <table>
      <tr><th>Nombre Completo</th><td>${nombre}</td></tr>
      <tr><th>Documento de Identificación (DPI)</th><td>${dpi}</td></tr>
    </table>
  </div>

  <div class="sec">
    <div class="sec-title">II. Resolución del Comité Automatizado</div>
    <div class="res-box" style="border-color:${color}; background:${fondo}">
      <div class="res-txt" style="color:${color}">${labelAccion[accion] || accion}</div>
      <div class="res-sub">Evaluación emitida bajo los parámetros de riesgo vigentes.</div>
    </div>
  </div>

  <div class="sec">
    <div class="sec-title">III. Detalles de Evaluación Financiera</div>
    <table>
      ${datosRows}
    </table>
  </div>

  <div class="sec">
    <div class="sec-title">IV. Fundamento de la Resolución</div>
    <div class="regla">${regla}</div>
  </div>

  ${condRows ? `<div class="sec"><div class="sec-title">V. Desglose de Condiciones Verificadas</div><table>${condRows}</table></div>` : ''}
  ${noAplRows ? `<div class="sec"><div class="sec-title">VI. Restricciones y Condiciones No Cumplidas</div><table>${noAplRows}</table></div>` : ''}

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-name">Sistema Automatizado</div>
      <div class="sig-title">Firma Electrónica Autorizada</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-name">Sello de Conformidad</div>
      <div class="sig-title">Departamento de Auditoría</div>
    </div>
  </div>

  <div class="footer">
    <strong>Aviso Legal:</strong> Este documento constituye un dictamen de evaluación de crédito emitido automáticamente por el sistema de reglas de negocio de la institución. Las condiciones aquí estipuladas son confidenciales y están dirigidas exclusivamente al solicitante. Cualquier alteración de este documento invalida su autenticidad. Para verificaciones adicionales, consulte con el Departamento de Riesgo usando el folio proporcionado.
  </div>
</div>
</body></html>`;

  const ventana = window.open('', '_blank');
  if (!ventana) {
    alert('El bloqueador de ventanas emergentes impidió abrir el PDF. Por favor, permita las ventanas emergentes para este sitio.');
    return;
  }
  ventana.document.write(html);
  ventana.document.close();
  ventana.focus();
  setTimeout(() => ventana.print(), 500);
}

//  INTERFAZ

function updateLineNumbers() {
  const lines = document.getElementById('editor').value.split('\n').length;
  document.getElementById('line-nums').innerHTML =
    Array.from({length: lines}, (_, i) => i + 1).join('<br>');
}

function syncScroll() {
  document.getElementById('line-nums').scrollTop = document.getElementById('editor').scrollTop;
}

function ocultarHint() {
  const hint = document.getElementById('editor-hint');
  if (hint) hint.style.opacity = '0';
}

function analizar() {
  const codigo = document.getElementById('editor').value;
  if (!codigo.trim()) return;
  const tokens = tokenizar(codigo);
  renderLexico(tokens, codigo);
  const arbol = renderSintactico(tokens);
  renderSemantico(arbol);
}

function limpiar() {
  document.getElementById('editor').value = '';
  updateLineNumbers();
  document.getElementById('editor-hint').style.opacity = '1';
  document.getElementById('highlight').innerHTML =
    `<div class="empty-highlight"><div class="empty-icon">✦</div><span>El código resaltado aparecerá aquí</span></div>`;
  document.getElementById('hl-lines').innerHTML = '';
  document.getElementById('table-wrap').innerHTML =
    `<div class="empty"><div class="empty-icon">⌨</div><span>Escribe código y presiona Analizar</span></div>`;
  document.getElementById('status-msg').innerHTML = '';
  document.getElementById('sint-resultado').innerHTML =
    `<div class="empty" style="min-height:60px;"><span>El resultado del análisis sintáctico aparecerá aquí</span></div>`;
  document.getElementById('arbol-wrap').style.display = 'none';
  document.getElementById('sem-resultado').innerHTML =
    `<div class="empty" style="min-height:60px;"><span>El resultado del análisis semántico aparecerá aquí</span></div>`;
  document.getElementById('tabla-simbolos-wrap').style.display = 'none';
  document.getElementById('simulador-panel').style.display = 'none';
  ['kw','td','id','op','num','str','sym','err'].forEach(k => {
    const el = document.getElementById('sc-' + k);
    if (el) el.textContent = '0';
  });
  _tablaSimbolos = null;
  _arbolPrograma = null;
}

function cargarEjemplo(nombre) {
  const codigo = EJEMPLOS[nombre];
  if (!codigo) return;
  const editor = document.getElementById('editor');
  editor.value = codigo;
  updateLineNumbers();
  ocultarHint();
  document.querySelectorAll('.ej-btn, .ej-btn-err').forEach(b => b.classList.remove('ej-btn-active'));
  event.target.classList.add('ej-btn-active');
  setTimeout(() => event.target.classList.remove('ej-btn-active'), 600);
  analizar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleReferencia() {
  const panel = document.getElementById('referencia-panel');
  const btn   = document.getElementById('btn-ref');
  const visible = panel.style.display !== 'none';
  panel.style.display = visible ? 'none' : 'block';
  btn.classList.toggle('btn-ref-active', !visible);
}

function abrirModal() {
  document.getElementById('modal-onboarding').classList.add('modal-visible');
}

function cerrarModal() {
  document.getElementById('modal-onboarding').classList.remove('modal-visible');
  localStorage.setItem('analizador_visto', '1');
}

function cargarEjemploDesdeModal() {
  cerrarModal();
  const editor = document.getElementById('editor');
  editor.value = EJEMPLOS.expandido;
  updateLineNumbers();
  ocultarHint();
  setTimeout(() => analizar(), 150);
}

document.addEventListener('click', e => {
  const overlay = document.getElementById('modal-onboarding');
  if (e.target === overlay) cerrarModal();
});

// === CONTROL DE PESTAÑAS ===
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  updateLineNumbers();
  initTabs();
  const editor = document.getElementById('editor');
  editor.addEventListener('input', () => {
    updateLineNumbers();
    if (editor.value.trim()) ocultarHint();
  });
  editor.addEventListener('scroll', syncScroll);
  if (!localStorage.getItem('analizador_visto')) {
    setTimeout(() => abrirModal(), 400);
  }
});