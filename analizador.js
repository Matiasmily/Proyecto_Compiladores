// ═══════════════════════════════════════════════════════
//  DEFINICIÓN DEL LENGUAJE
// ═══════════════════════════════════════════════════════

const PALABRAS_RESERVADAS = new Set([
  'SI', 'ENTONCES', 'Y', 'O', 'NO',
  'APROBAR', 'RECHAZAR', 'CONDICIONAR', 'CAMPO'
]);

const TIPOS_DATO = new Set(['entero', 'texto']);

const OPERADORES = ['>=', '<=', '>', '<', '='];

const SIMBOLOS = new Set(['(', ')', ';', ',']);

const NOMBRE_OP = {
  '>=': 'MAYOR_IGUAL', '<=': 'MENOR_IGUAL',
  '>': 'MAYOR_QUE', '<': 'MENOR_QUE', '=': 'IGUAL'
};

const NOMBRE_SYM = {
  '(': 'PARENTESIS_IZQUIERDO', ')': 'PARENTESIS_DERECHO',
  ';': 'PUNTO_Y_COMA', ',': 'COMA'
};

const LABEL_BADGE = {
  PALABRA_RESERVADA: 'KW', TIPO_DATO: 'TD', IDENTIFICADOR: 'ID',
  OPERADOR: 'OP', NUMERO: 'NUM', CADENA_TEXTO: 'STR',
  SIMBOLO: 'SYM', ERROR_LEXICO: 'ERR'
};

const CLASE_TOKEN = {
  PALABRA_RESERVADA: 'tk-kw', TIPO_DATO: 'tk-td', IDENTIFICADOR: 'tk-id',
  OPERADOR: 'tk-op', NUMERO: 'tk-num', CADENA_TEXTO: 'tk-str',
  SIMBOLO: 'tk-sym', ERROR_LEXICO: 'tk-err'
};

const HL_CLASE = {
  PALABRA_RESERVADA: 'hl-kw', TIPO_DATO: 'hl-td', IDENTIFICADOR: 'hl-id',
  OPERADOR: 'hl-op', NUMERO: 'hl-num', CADENA_TEXTO: 'hl-str',
  SIMBOLO: 'hl-sym', ERROR_LEXICO: 'hl-err'
};

// ═══════════════════════════════════════════════════════
//  EJEMPLOS PREDEFINIDOS
// ═══════════════════════════════════════════════════════

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

  texto: `CAMPO entero ingreso ;
CAMPO texto historial ;
CAMPO texto empleado ;

SI historial = "bueno" Y ingreso >= 3000 ENTONCES APROBAR ;
SI historial = "malo" ENTONCES RECHAZAR ;
SI empleado = "si" Y ingreso >= 2000 ENTONCES CONDICIONAR ;`,

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

// ═══════════════════════════════════════════════════════
//  SUGERENCIAS DE ERROR
// ═══════════════════════════════════════════════════════

function obtenerSugerencia(mensaje) {
  const m = mensaje.toLowerCase();
  if (m.includes('tipo_dato') || (m.includes('entero') && m.includes('texto')))
    return '💡 Usa <code>entero</code> para números o <code>texto</code> para cadenas. Ej: <code>CAMPO entero ingreso ;</code>';
  if (m.includes('campo') && m.includes('inicio'))
    return '💡 El programa debe comenzar con al menos una declaración <code>CAMPO</code>. Ej: <code>CAMPO entero ingreso ;</code>';
  if (m.includes('si') && m.includes('inicio'))
    return '💡 Después de las declaraciones necesitas al menos una regla. Ej: <code>SI ingreso >= 1000 ENTONCES APROBAR ;</code>';
  if (m.includes('entonces'))
    return '💡 Después de la condición va la palabra <code>ENTONCES</code>. Ej: <code>SI ingreso >= 5000 ENTONCES APROBAR ;</code>';
  if (m.includes('aprobar') || m.includes('rechazar') || m.includes('condicionar'))
    return '💡 Las acciones válidas son: <code>APROBAR</code>, <code>RECHAZAR</code> o <code>CONDICIONAR</code>.';
  if (m.includes(';') || m.includes('punto_y_coma'))
    return '💡 Cada declaración y regla debe terminar con <code>;</code>';
  if (m.includes('operador'))
    return '💡 Los operadores disponibles son: <code>&gt;=</code> <code>&lt;=</code> <code>&gt;</code> <code>&lt;</code> <code>=</code>';
  if (m.includes('identificador') && m.includes('dígito'))
    return '💡 Los nombres de campo no pueden iniciar con un número. Usa letras o guión bajo: <code>campo1</code> ✓ — <code>1campo</code> ✗';
  if (m.includes('cadena sin cerrar'))
    return '💡 Cierra la cadena de texto con comillas dobles. Ej: <code>"bueno"</code>';
  if (m.includes('no fue declarado'))
    return '💡 Declara el campo antes de usarlo en una regla. Todos los <code>CAMPO</code> van al inicio del programa.';
  if (m.includes('fue declarado como entero') && m.includes('texto'))
    return '💡 Un campo <code>entero</code> solo puede compararse con números, no con cadenas entre comillas.';
  if (m.includes('fue declarado como texto') && m.includes('número'))
    return '💡 Un campo <code>texto</code> solo puede compararse con cadenas entre comillas. Ej: <code>= "valor"</code>';
  if (m.includes('ya fue declarado'))
    return '💡 Cada campo debe declararse una sola vez. Elimina la declaración duplicada.';
  if (m.includes('token inesperado'))
    return '💡 Puede haber un símbolo extra o falta un <code>;</code> en la línea anterior.';
  return null;
}

// ═══════════════════════════════════════════════════════
//  TOKENIZADOR
// ═══════════════════════════════════════════════════════

function tokenizar(codigo) {
  const tokens = [];
  const lineas = codigo.split('\n');
  for (let nl = 0; nl < lineas.length; nl++) {
    const linea = lineas[nl];
    let i = 0;
    const ln = nl + 1;
    while (i < linea.length) {
      if (/\s/.test(linea[i])) { i++; continue; }
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
      let opFound = null;
      for (const op of OPERADORES) {
        if (linea.startsWith(op, i)) { opFound = op; break; }
      }
      if (opFound) {
        tokens.push({ lexema: opFound, tipo: 'OPERADOR', sub: NOMBRE_OP[opFound], ln });
        i += opFound.length; continue;
      }
      if (SIMBOLOS.has(linea[i])) {
        tokens.push({ lexema: linea[i], tipo: 'SIMBOLO', sub: NOMBRE_SYM[linea[i]], ln });
        i++; continue;
      }
      if (/[0-9]/.test(linea[i])) {
        let j = i;
        while (j < linea.length && /[0-9]/.test(linea[j])) j++;
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
      if (/[a-zA-ZáéíóúÁÉÍÓÚñÑ_]/.test(linea[i])) {
        let j = i;
        while (j < linea.length && /[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9_]/.test(linea[j])) j++;
        const lex = linea.slice(i, j);
        if (PALABRAS_RESERVADAS.has(lex.toUpperCase()))
          tokens.push({ lexema: lex, tipo: 'PALABRA_RESERVADA', ln });
        else if (TIPOS_DATO.has(lex.toLowerCase()))
          tokens.push({ lexema: lex, tipo: 'TIPO_DATO', ln });
        else
          tokens.push({ lexema: lex, tipo: 'IDENTIFICADOR', ln });
        i = j; continue;
      }
      tokens.push({ lexema: linea[i], tipo: 'ERROR_LEXICO', ln, det: 'símbolo no reconocido' });
      i++;
    }
  }
  return tokens;
}

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function cnt(tokens, tipo) {
  return tokens.filter(t => t.tipo === tipo).length;
}

// ═══════════════════════════════════════════════════════
//  SYNTAX HIGHLIGHT
// ═══════════════════════════════════════════════════════

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
      result += `<span class="${HL_CLASE[t.tipo]}" title="${t.tipo}${t.det ? ' — ' + t.det : ''}">${esc(t.lexema)}</span>`;
      pos = idx2 + t.lexema.length;
    });
    if (pos < linea.length) result += esc(linea.slice(pos));
    return `<span class="hl-line${hasErr ? ' has-error' : ''}">${result || ' '}</span>`;
  }).join('\n');
}

// ═══════════════════════════════════════════════════════
//  RENDER LÉXICO
// ═══════════════════════════════════════════════════════

function renderLexico(tokens, codigo) {
  const errCount = cnt(tokens, 'ERROR_LEXICO');
  const counts = {
    PALABRA_RESERVADA: cnt(tokens, 'PALABRA_RESERVADA'),
    TIPO_DATO:         cnt(tokens, 'TIPO_DATO'),
    IDENTIFICADOR:     cnt(tokens, 'IDENTIFICADOR'),
    OPERADOR:          cnt(tokens, 'OPERADOR'),
    NUMERO:            cnt(tokens, 'NUMERO'),
    CADENA_TEXTO:      cnt(tokens, 'CADENA_TEXTO'),
    SIMBOLO:           cnt(tokens, 'SIMBOLO'),
    ERROR_LEXICO:      errCount
  };
  ['kw','td','id','op','num','str','sym','err'].forEach((k, i) => {
    document.getElementById('sc-' + k).textContent = counts[Object.keys(counts)[i]];
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
      html += `<tr${rowClass} style="animation-delay:${i * 0.018}s">
        <td class="col-n">${i+1}</td><td class="col-ln">${t.ln}</td>
        <td>${esc(t.lexema)}</td>
        <td><span class="tk ${CLASE_TOKEN[t.tipo]}">${LABEL_BADGE[t.tipo]}</span>
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

// ═══════════════════════════════════════════════════════
//  FASE 2 — ANALIZADOR SINTÁCTICO
// ═══════════════════════════════════════════════════════

class AnalizadorSintactico {
  constructor(tokens) {
    this.tokens = tokens.filter(t => t.tipo !== 'ERROR_LEXICO');
    this.pos = 0;
  }
  actual()  { return this.tokens[this.pos] || null; }
  fin()     { return this.pos >= this.tokens.length; }
  esKw(lex) { const t = this.actual(); return t && t.tipo === 'PALABRA_RESERVADA' && t.lexema.toUpperCase() === lex.toUpperCase(); }
  esTipo()     { const t = this.actual(); return t && t.tipo === 'TIPO_DATO'; }
  esId()       { const t = this.actual(); return t && t.tipo === 'IDENTIFICADOR'; }
  esOp()       { const t = this.actual(); return t && t.tipo === 'OPERADOR'; }
  esValor()    { const t = this.actual(); return t && (t.tipo === 'NUMERO' || t.tipo === 'CADENA_TEXTO'); }
  esSimbolo(s) { const t = this.actual(); return t && t.tipo === 'SIMBOLO' && t.lexema === s; }
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
    n.hijos.push(this.parseReglas());
    if (!this.fin()) { const t = this.actual(); throw new Error(`Línea ${t.ln}: token inesperado "${t.lexema}" después del programa`); }
    return n;
  }
  parseDeclaraciones() {
    const n = this.nodo('DECLARACIONES');
    if (!this.esKw('CAMPO')) { const t = this.actual(); const ln = t?t.ln:'?'; throw new Error(`Línea ${ln}: se esperaba CAMPO (inicio de declaración) pero se encontró "${t?t.lexema:'fin de programa'}"`); }
    while (this.esKw('CAMPO')) n.hijos.push(this.parseDeclaracion());
    return n;
  }
  parseDeclaracion() {
    const n = this.nodo('DECLARACION');
    n.hijos.push(this.hoja(this.esperar(() => this.esKw('CAMPO'), 'CAMPO')));
    n.hijos.push(this.hoja(this.esperar(() => this.esTipo(), 'TIPO_DATO (entero o texto)')));
    n.hijos.push(this.hoja(this.esperar(() => this.esId(), 'IDENTIFICADOR')));
    n.hijos.push(this.hoja(this.esperar(() => this.esSimbolo(';'), ';')));
    return n;
  }
  parseReglas() {
    const n = this.nodo('REGLAS');
    if (!this.esKw('SI')) { const t = this.actual(); const ln = t?t.ln:'?'; throw new Error(`Línea ${ln}: se esperaba SI (inicio de regla) pero se encontró "${t?t.lexema:'fin de programa'}"`); }
    while (this.esKw('SI')) n.hijos.push(this.parseRegla());
    return n;
  }
  parseRegla() {
    const n = this.nodo('REGLA');
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
      const comp = this.nodo('COMPARACION');
      comp.hijos.push(this.hoja(this.consumir()));
      comp.hijos.push(this.hoja(this.esperar(() => this.esOp(), 'OPERADOR')));
      comp.hijos.push(this.hoja(this.esperar(() => this.esValor(), 'NUMERO o CADENA_TEXTO')));
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
    n.hijos.push(this.hoja(this.esperar(() => ['APROBAR','RECHAZAR','CONDICIONAR'].some(a => this.esKw(a)), 'APROBAR, RECHAZAR o CONDICIONAR')));
    return n;
  }
}

// ═══════════════════════════════════════════════════════
//  RENDER ÁRBOL
// ═══════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════
//  RENDER SINTÁCTICO
// ═══════════════════════════════════════════════════════

function renderSintactico(tokens) {
  const errLex = cnt(tokens, 'ERROR_LEXICO');
  const sintEl = document.getElementById('sint-resultado');
  const arbolWrap = document.getElementById('arbol-wrap');
  const arbolPre  = document.getElementById('arbol-pre');

  if (errLex > 0) {
    sintEl.innerHTML = `
      <div class="sint-badge sint-warn">⚠ Análisis sintáctico no ejecutado</div>
      <p class="sint-msg">Corrija los <strong>${errLex} error${errLex>1?'es':''} léxico${errLex>1?'s':''}</strong> antes de continuar.</p>
      <div class="sugerencia">💡 Revisa los tokens marcados en rojo en el panel de resaltado.</div>`;
    arbolWrap.style.display = 'none';
    return null;
  }

  try {
    const parser = new AnalizadorSintactico(tokens);
    const arbol  = parser.parsePrograma();
    sintEl.innerHTML = `<div class="sint-badge sint-ok">✓ Cadena aceptada — programa sintácticamente válido</div>`;
    arbolPre.innerHTML = arbolATexto(arbol);
    arbolWrap.style.display = 'block';
    return arbol;
  } catch (e) {
    const sug = obtenerSugerencia(e.message);
    sintEl.innerHTML = `
      <div class="sint-badge sint-err">✗ Error sintáctico</div>
      <p class="sint-err-msg">${esc(e.message)}</p>
      ${sug ? `<div class="sugerencia">${sug}</div>` : ''}`;
    arbolWrap.style.display = 'none';
    return null;
  }
}

// ═══════════════════════════════════════════════════════
//  FASE 3 — ANALIZADOR SEMÁNTICO
// ═══════════════════════════════════════════════════════

class AnalizadorSemantico {
  constructor() { this.tabla = {}; this.pasos = []; }
  log(msg) { this.pasos.push(msg); }
  tipoValor(nodoHoja) {
    if (nodoHoja.tipo === 'NUMERO')       return 'entero';
    if (nodoHoja.tipo === 'CADENA_TEXTO') return 'texto';
    return null;
  }
  analizar(arbol) {
    this.log('PASO 1 — Tabla de símbolos inicializada vacía.');
    const decls = arbol.hijos.find(h => h.nombre === 'DECLARACIONES');
    if (decls) {
      this.log('PASO 2 — Recorriendo declaraciones de campos...');
      for (const d of decls.hijos) this.procesarDeclaracion(d);
    }
    const reglas = arbol.hijos.find(h => h.nombre === 'REGLAS');
    if (reglas) {
      this.log('PASO 3 — Recorriendo reglas y validando comparaciones...');
      for (const r of reglas.hijos) this.procesarRegla(r);
    }
    this.log('✓ Análisis semántico completado sin errores.');
    return this.tabla;
  }
  procesarDeclaracion(nodoDecl) {
    const hojas = nodoDecl.hijos.filter(h => h.esHoja);
    const tipoToken = hojas.find(h => h.tipo === 'TIPO_DATO');
    const idToken   = hojas.find(h => h.tipo === 'IDENTIFICADOR');
    if (!tipoToken || !idToken) return;
    const nombre = idToken.nombre.toLowerCase();
    const tipo   = tipoToken.nombre.toLowerCase();
    const linea  = idToken.ln;
    if (this.tabla[nombre]) throw new Error(`Línea ${linea}: el campo '${nombre}' ya fue declarado anteriormente (línea ${this.tabla[nombre].linea}).\nNo se permite declarar el mismo campo más de una vez.`);
    this.tabla[nombre] = { nombre, tipo, linea };
    this.log(`  → Campo '${nombre}' (${tipo}) agregado a la tabla de símbolos. [línea ${linea}]`);
  }
  procesarRegla(nodo) {
    if (!nodo || !nodo.hijos) return;
    for (const hijo of nodo.hijos) {
      if (hijo.nombre === 'COMPARACION') this.procesarComparacion(hijo);
      else if (!hijo.esHoja) this.procesarRegla(hijo);
    }
  }
  procesarComparacion(nodoComp) {
    const hojas = nodoComp.hijos.filter(h => h.esHoja);
    const idToken    = hojas[0];
    const valorToken = hojas[2];
    if (!idToken || !valorToken) return;
    const nombre = idToken.nombre.toLowerCase();
    const linea  = idToken.ln;
    if (!this.tabla[nombre]) throw new Error(`Línea ${linea}: el campo '${nombre}' no fue declarado.\nTodos los campos deben declararse con CAMPO antes de usarse en reglas.`);
    const tipoCampo = this.tabla[nombre].tipo;
    const tipoVal   = this.tipoValor(valorToken);
    if (tipoCampo === 'entero' && tipoVal === 'texto') throw new Error(`Línea ${linea}: el campo '${nombre}' fue declarado como entero,\npero se está comparando con el valor ${valorToken.nombre} que es de tipo texto.\nUn campo entero solo puede compararse con valores numéricos.`);
    if (tipoCampo === 'texto' && tipoVal === 'entero') throw new Error(`Línea ${linea}: el campo '${nombre}' fue declarado como texto,\npero se está comparando con el valor ${valorToken.nombre} que es de tipo número.\nUn campo texto solo puede compararse con cadenas entre comillas.`);
    this.log(`  → Comparación '${nombre} ... ${valorToken.nombre}': tipos compatibles (${tipoCampo}). ✓`);
  }
}

// ═══════════════════════════════════════════════════════
//  RENDER SEMÁNTICO
// ═══════════════════════════════════════════════════════

// Guardamos la tabla globalmente para usarla en el simulador
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
      <div class="sint-badge sint-warn">⚠ Análisis semántico no ejecutado</div>
      <p class="sint-msg">El análisis semántico requiere que las fases léxica y sintáctica sean exitosas.</p>`;
    tablaWrap.style.display = 'none';
    simPanel.style.display  = 'none';
    return;
  }

  try {
    const semantico = new AnalizadorSemantico();
    const tabla     = semantico.analizar(arbol);
    const entradas  = Object.values(tabla);

    const logHtml = semantico.pasos.map(p => `<div class="sem-log-line">${esc(p)}</div>`).join('');
    semEl.innerHTML = `
      <div class="sint-badge sint-ok">✓ Programa semánticamente válido</div>
      <div class="sem-log">${logHtml}</div>`;

    let html = `<thead><tr>
      <th class="col-n">#</th><th>Nombre del Campo</th>
      <th>Tipo de Dato</th><th>Línea de Declaración</th>
    </tr></thead><tbody>`;
    entradas.forEach((e, i) => {
      html += `<tr style="animation-delay:${i*0.06}s${i%2===1?';background:rgba(255,255,255,0.015)':''}">
        <td class="col-n">${i+1}</td>
        <td><span class="tk tk-id">${esc(e.nombre)}</span></td>
        <td><span class="tk ${e.tipo==='entero'?'tk-num':'tk-str'}">${esc(e.tipo)}</span></td>
        <td class="col-ln" style="text-align:left;padding-left:1rem;">${e.linea}</td>
      </tr>`;
    });
    html += '</tbody>';
    tablaEl.innerHTML = html;
    tablaWrap.style.display = 'block';

    // Guardar para el simulador
    _tablaSimbolos = tabla;
    _arbolPrograma = arbol;

    // Mostrar y construir el simulador
    construirFormularioSimulador(tabla);
    simPanel.style.display = 'block';

  } catch (e) {
    const sug = obtenerSugerencia(e.message);
    semEl.innerHTML = `
      <div class="sint-badge sint-err">✗ Error semántico</div>
      <p class="sint-err-msg">${esc(e.message)}</p>
      ${sug ? `<div class="sugerencia">${sug}</div>` : ''}`;
    tablaWrap.style.display = 'none';
    simPanel.style.display  = 'none';
  }
}

// ═══════════════════════════════════════════════════════
//  SIMULADOR DE SOLICITUD DE CRÉDITO
// ═══════════════════════════════════════════════════════

function construirFormularioSimulador(tabla) {
  const form = document.getElementById('sim-form');
  const entradas = Object.values(tabla);

  // Ocultar resultado anterior
  document.getElementById('sim-resultado-wrap').style.display = 'none';

  let html = '';
  entradas.forEach(e => {
    const esEntero = e.tipo === 'entero';
    const label = e.nombre.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    html += `
      <div class="sim-field">
        <label class="sim-label">
          <span class="sim-field-name">${esc(label)}</span>
          <span class="tk ${esEntero ? 'tk-num' : 'tk-str'}" style="margin-left:0.4rem;">${esc(e.tipo)}</span>
        </label>
        ${esEntero
          ? `<input class="sim-input" type="number" id="sim-${esc(e.nombre)}" placeholder="Ej: 5000" />`
          : `<input class="sim-input sim-input-text" type="text" id="sim-${esc(e.nombre)}" placeholder='Ej: "bueno"' />`
        }
      </div>`;
  });

  form.innerHTML = html;
}

function obtenerValoresSolicitud() {
  const valores = {};
  const entradas = Object.values(_tablaSimbolos);
  for (const e of entradas) {
    const input = document.getElementById(`sim-${e.nombre}`);
    if (!input) continue;
    const raw = input.value.trim();
    if (raw === '') {
      throw new Error(`El campo "${e.nombre}" está vacío. Por favor ingresa un valor.`);
    }
    if (e.tipo === 'entero') {
      const num = Number(raw);
      if (isNaN(num)) throw new Error(`El campo "${e.nombre}" debe ser un número entero.`);
      valores[e.nombre] = num;
    } else {
      // texto: quitar comillas si las puso
      valores[e.nombre] = raw.replace(/^"|"$/g, '').toLowerCase();
    }
  }
  return valores;
}

function evaluarCondicion(nodoCondicion, valores) {
  if (!nodoCondicion || !nodoCondicion.hijos) return false;

  for (const hijo of nodoCondicion.hijos) {
    if (hijo.nombre === 'COMPARACION') {
      return evaluarComparacion(hijo, valores);
    }
    if (hijo.nombre === 'CONDICION_COMPUESTA') {
      return evaluarCondicionCompuesta(hijo, valores);
    }
  }
  return false;
}

function evaluarCondicionCompuesta(nodo, valores) {
  const hijos = nodo.hijos;

  // NO <condicion>
  if (hijos.length === 2 && hijos[0].esHoja && hijos[0].nombre.toUpperCase() === 'NO') {
    return !evaluarCondicion(hijos[1], valores);
  }

  // ( <condicion> )
  if (hijos.length === 3 && hijos[0].esHoja && hijos[0].nombre === '(') {
    return evaluarCondicion(hijos[1], valores);
  }

  // <condicion> Y/O <condicion>
  if (hijos.length === 3 && !hijos[0].esHoja) {
    const izq = evaluarCondicion(hijos[0], valores);
    const op  = hijos[1].nombre.toUpperCase();
    const der = evaluarCondicion(hijos[2], valores);
    if (op === 'Y') return izq && der;
    if (op === 'O') return izq || der;
  }

  return false;
}

function evaluarComparacion(nodoComp, valores) {
  const hojas = nodoComp.hijos.filter(h => h.esHoja);
  const campo    = hojas[0].nombre.toLowerCase();
  const operador = hojas[1].nombre;
  const valorToken = hojas[2];

  const valorCampo = valores[campo];
  let valorComparar;

  if (valorToken.tipo === 'NUMERO') {
    valorComparar = Number(valorToken.nombre);
  } else {
    // CADENA_TEXTO: quitar comillas y pasar a minúscula
    valorComparar = valorToken.nombre.replace(/^"|"$/g, '').toLowerCase();
  }

  switch (operador) {
    case '>':  return valorCampo >  valorComparar;
    case '<':  return valorCampo <  valorComparar;
    case '>=': return valorCampo >= valorComparar;
    case '<=': return valorCampo <= valorComparar;
    case '=':  return valorCampo == valorComparar;
  }
  return false;
}

function reconstruirTextoRegla(nodoRegla) {
  // Reconstruye texto legible de la regla
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

  try {
    const valores = obtenerValoresSolicitud();

    // Obtener las reglas del árbol
    const nodoReglas = _arbolPrograma.hijos.find(h => h.nombre === 'REGLAS');
    if (!nodoReglas) throw new Error('No hay reglas para evaluar.');

    let accionFinal = null;
    let reglaAplicada = null;
    let numeroRegla = 0;

    for (const regla of nodoReglas.hijos) {
      numeroRegla++;
      // La condición es el segundo hijo (índice 1): SI [condicion] ENTONCES [accion] ;
      const nodoCondicion = regla.hijos.find(h => h.nombre === 'CONDICION');
      const nodoAccion    = regla.hijos.find(h => h.nombre === 'ACCION');

      if (!nodoCondicion || !nodoAccion) continue;

      const cumple = evaluarCondicion(nodoCondicion, valores);

      if (cumple) {
        accionFinal  = nodoAccion.hijos[0].nombre.toUpperCase();
        reglaAplicada = { numero: numeroRegla, texto: reconstruirTextoRegla(regla) };
        break;
      }
    }

    // Mostrar resultado
    resultWrap.style.display = 'block';
    resultWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (!accionFinal) {
      resultEl.innerHTML = `<div class="sim-res sim-res-ninguna">⚪ Ninguna regla aplicó</div>`;
      detalleEl.innerHTML = `<p class="sim-detalle-txt">Ninguna de las reglas definidas se cumplió con los datos ingresados. El sistema no puede tomar una decisión.</p>`;
      return;
    }

    const iconos   = { APROBAR: '✅', RECHAZAR: '❌', CONDICIONAR: '🟡' };
    const clases   = { APROBAR: 'sim-res-aprobar', RECHAZAR: 'sim-res-rechazar', CONDICIONAR: 'sim-res-condicionar' };
    const mensajes = {
      APROBAR:     'La solicitud cumple con los criterios establecidos.',
      RECHAZAR:    'La solicitud no cumple con los criterios mínimos.',
      CONDICIONAR: 'La solicitud puede ser aprobada bajo condiciones adicionales.'
    };

    resultEl.innerHTML = `
      <div class="sim-res ${clases[accionFinal]}">
        <span class="sim-res-icon">${iconos[accionFinal]}</span>
        <span class="sim-res-text">${accionFinal}</span>
      </div>`;

    detalleEl.innerHTML = `
      <p class="sim-detalle-txt">${mensajes[accionFinal]}</p>
      <div class="sim-regla-aplicada">
        <span class="sim-regla-label">Regla ${reglaAplicada.numero} aplicada:</span>
        <code class="sim-regla-codigo">${esc(reglaAplicada.texto)}</code>
      </div>`;

  } catch (e) {
    resultWrap.style.display = 'block';
    resultEl.innerHTML = `<div class="sim-res sim-res-err">⚠ ${esc(e.message)}</div>`;
    detalleEl.innerHTML = '';
  }
}

// ═══════════════════════════════════════════════════════
//  ACCIONES DE INTERFAZ
// ═══════════════════════════════════════════════════════

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
    document.getElementById('sc-' + k).textContent = '0';
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
  editor.value = EJEMPLOS.compuesto;
  updateLineNumbers();
  ocultarHint();
  setTimeout(() => analizar(), 150);
}

document.addEventListener('click', e => {
  const overlay = document.getElementById('modal-onboarding');
  if (e.target === overlay) cerrarModal();
});

window.addEventListener('DOMContentLoaded', () => {
  updateLineNumbers();
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