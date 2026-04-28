//  DEFINICIÓN DEL LENGUAJE 

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

// TOKENIZADOR 

function tokenizar(codigo) {
  const tokens = [];
  const lineas = codigo.split('\n');

  for (let nl = 0; nl < lineas.length; nl++) {
    const linea = lineas[nl];
    let i = 0;
    const ln = nl + 1;

    while (i < linea.length) {
      if (/\s/.test(linea[i])) { i++; continue; }

      // Cadena de texto
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

      // Operadores (>= y <= antes de > y <)
      let opFound = null;
      for (const op of OPERADORES) {
        if (linea.startsWith(op, i)) { opFound = op; break; }
      }
      if (opFound) {
        tokens.push({ lexema: opFound, tipo: 'OPERADOR', sub: NOMBRE_OP[opFound], ln });
        i += opFound.length;
        continue;
      }

      // Símbolos
      if (SIMBOLOS.has(linea[i])) {
        tokens.push({ lexema: linea[i], tipo: 'SIMBOLO', sub: NOMBRE_SYM[linea[i]], ln });
        i++; continue;
      }

      // Número
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

      // Secuencia alfanumérica
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

      // Error
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

    if (!lineTokens.length) {
      return `<span class="hl-line">${esc(linea) || ' '}</span>`;
    }

    let result = '';
    let pos = 0;

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

//  RENDER LÉXICO 

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
    const tipo = Object.keys(counts)[i];
    document.getElementById('sc-' + k).textContent = counts[tipo];
  });

  document.getElementById('highlight').innerHTML = buildHighlight(codigo, tokens);

  const lineCount = codigo.split('\n').length;
  document.getElementById('hl-lines').innerHTML =
    Array.from({length: lineCount}, (_, i) => i + 1).join('<br>');

  const tableWrap = document.getElementById('table-wrap');
  if (!tokens.length) {
    tableWrap.innerHTML = `<div class="empty"><div class="empty-icon">∅</div><span>Sin tokens encontrados</span></div>`;
  } else {
    let html = `<table class="token-table">
      <thead><tr>
        <th class="col-n">#</th>
        <th class="col-ln">Lín.</th>
        <th>Lexema</th>
        <th>Tipo de Token</th>
      </tr></thead><tbody>`;

    tokens.forEach((t, i) => {
      const sub = t.sub ? ` <span class="sub">(${esc(t.sub)})</span>` : '';
      const det = t.det ? ` <span class="sub">— ${esc(t.det)}</span>` : '';
      const rowClass = t.tipo === 'ERROR_LEXICO' ? ' class="row-err"' : '';
      html += `<tr${rowClass} style="animation-delay:${i * 0.018}s">
        <td class="col-n">${i + 1}</td>
        <td class="col-ln">${t.ln}</td>
        <td>${esc(t.lexema)}</td>
        <td>
          <span class="tk ${CLASE_TOKEN[t.tipo]}">${LABEL_BADGE[t.tipo]}</span>
          <span class="sub">${esc(t.tipo)}</span>${sub}${det}
        </td>
      </tr>`;
    });

    html += '</tbody></table>';
    tableWrap.innerHTML = html;
  }

  const statusEl = document.getElementById('status-msg');
  if (errCount > 0) {
    statusEl.innerHTML = `<span class="status-dot" style="background:var(--err)"></span><span class="status-err">${errCount} error${errCount > 1 ? 'es' : ''} léxico${errCount > 1 ? 's' : ''}</span> · ${tokens.length} tokens totales`;
  } else {
    statusEl.innerHTML = `<span class="status-dot" style="background:var(--id)"></span><span class="status-ok">Sin errores léxicos</span> · ${tokens.length} tokens totales`;
  }
}

// ═══════════════════════════════════════════════════════
//  FASE 2 — ANALIZADOR SINTÁCTICO DESCENDENTE RECURSIVO
// ═══════════════════════════════════════════════════════

class AnalizadorSintactico {
  constructor(tokens) {
    this.tokens = tokens.filter(t => t.tipo !== 'ERROR_LEXICO');
    this.pos    = 0;
  }

  actual()  { return this.tokens[this.pos] || null; }
  fin()     { return this.pos >= this.tokens.length; }

  esKw(lex) {
    const t = this.actual();
    return t && t.tipo === 'PALABRA_RESERVADA' && t.lexema.toUpperCase() === lex.toUpperCase();
  }
  esTipo()     { const t = this.actual(); return t && t.tipo === 'TIPO_DATO'; }
  esId()       { const t = this.actual(); return t && t.tipo === 'IDENTIFICADOR'; }
  esOp()       { const t = this.actual(); return t && t.tipo === 'OPERADOR'; }
  esValor()    { const t = this.actual(); return t && (t.tipo === 'NUMERO' || t.tipo === 'CADENA_TEXTO'); }
  esSimbolo(s) { const t = this.actual(); return t && t.tipo === 'SIMBOLO' && t.lexema === s; }

  consumir() { return this.tokens[this.pos++]; }

  esperar(condFn, descripcion) {
    if (!condFn()) {
      const t = this.actual();
      const ln = t ? t.ln : '?';
      const encontrado = t ? `"${t.lexema}" (${t.tipo})` : 'fin de programa';
      throw new Error(`Línea ${ln}: se esperaba ${descripcion} pero se encontró ${encontrado}`);
    }
    return this.consumir();
  }

  nodo(nombre, hijos = []) { return { nombre, hijos }; }
  hoja(token) { return { nombre: token.lexema, tipo: token.tipo, ln: token.ln, esHoja: true }; }

  parsePrograma() {
    const n = this.nodo('PROGRAMA');
    n.hijos.push(this.parseDeclaraciones());
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
      const t = this.actual();
      const ln = t ? t.ln : '?';
      throw new Error(`Línea ${ln}: se esperaba CAMPO (inicio de declaración) pero se encontró "${t ? t.lexema : 'fin de programa'}"`);
    }
    while (this.esKw('CAMPO')) {
      n.hijos.push(this.parseDeclaracion());
    }
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
    if (!this.esKw('SI')) {
      const t = this.actual();
      const ln = t ? t.ln : '?';
      throw new Error(`Línea ${ln}: se esperaba SI (inicio de regla) pero se encontró "${t ? t.lexema : 'fin de programa'}"`);
    }
    while (this.esKw('SI')) {
      n.hijos.push(this.parseRegla());
    }
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
      n.hijos.push(nc);
      return n;
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
      comp.hijos.push(this.hoja(this.esperar(() => this.esOp(), 'OPERADOR (>, <, >=, <=, =)')));
      comp.hijos.push(this.hoja(this.esperar(() => this.esValor(), 'NUMERO o CADENA_TEXTO')));
      n.hijos.push(comp);
      return this.parseCondicionBinaria(n);
    }

    const t = this.actual();
    const ln = t ? t.ln : '?';
    throw new Error(`Línea ${ln}: se esperaba una condición (IDENTIFICADOR, NO o paréntesis) pero se encontró "${t ? t.lexema : 'fin de programa'}"`);
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
    n.hijos.push(this.hoja(
      this.esperar(
        () => ['APROBAR','RECHAZAR','CONDICIONAR'].some(a => this.esKw(a)),
        'APROBAR, RECHAZAR o CONDICIONAR'
      )
    ));
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
    (nodo.hijos || []).forEach((hijo, i) => {
      const ultimo = i === nodo.hijos.length - 1;
      lineas = lineas.concat(renderArbol(hijo, prefijo + extension, ultimo));
    });
  }
  return lineas;
}

function arbolATexto(raiz) {
  let lineas = [`<span class="tree-node">${esc(raiz.nombre)}</span>`];
  (raiz.hijos || []).forEach((hijo, i) => {
    const ultimo = i === raiz.hijos.length - 1;
    lineas = lineas.concat(renderArbol(hijo, '', ultimo));
  });
  return lineas.join('\n');
}

//  RENDER SINTÁCTICO 

function renderSintactico(tokens) {
  const errLex   = cnt(tokens, 'ERROR_LEXICO');
  const sintEl   = document.getElementById('sint-resultado');
  const arbolWrap= document.getElementById('arbol-wrap');
  const arbolPre = document.getElementById('arbol-pre');

  if (errLex > 0) {
    sintEl.innerHTML = `
      <div class="sint-badge sint-warn">⚠ Análisis sintáctico no ejecutado</div>
      <p class="sint-msg">Corrija los <strong>${errLex} error${errLex > 1 ? 'es' : ''} léxico${errLex > 1 ? 's' : ''}</strong> antes de continuar con el análisis sintáctico.</p>`;
    arbolWrap.style.display = 'none';
    return null; // no hay árbol
  }

  try {
    const parser = new AnalizadorSintactico(tokens);
    const arbol  = parser.parsePrograma();
    sintEl.innerHTML = `<div class="sint-badge sint-ok">✓ Cadena aceptada — programa sintácticamente válido</div>`;
    arbolPre.innerHTML = arbolATexto(arbol);
    arbolWrap.style.display = 'block';
    return arbol; // devolver árbol para el semántico
  } catch (e) {
    sintEl.innerHTML = `
      <div class="sint-badge sint-err">✗ Error sintáctico</div>
      <p class="sint-err-msg">${esc(e.message)}</p>`;
    arbolWrap.style.display = 'none';
    return null;
  }
}

// ═══════════════════════════════════════════════════════
//  FASE 3 — ANALIZADOR SEMÁNTICO
// ═══════════════════════════════════════════════════════

class AnalizadorSemantico {
  constructor() {
    // Tabla de símbolos: { nombre -> { nombre, tipo, linea } }
    this.tabla = {};
    this.pasos = []; // log del proceso paso a paso
  }

  // ── Helpers ──────────────────────────────────────────

  log(msg) { this.pasos.push(msg); }

  tipoValor(nodoHoja) {
    if (nodoHoja.tipo === 'NUMERO')       return 'entero';
    if (nodoHoja.tipo === 'CADENA_TEXTO') return 'texto';
    return null;
  }

  // ── Punto de entrada ─────────────────────────────────

  analizar(arbol) {
    // PASO 1: tabla vacía (ya inicializada en constructor)
    this.log('PASO 1 — Tabla de símbolos inicializada vacía.');

    // PASO 2: recorrer declaraciones
    const nodoDeclaraciones = arbol.hijos.find(h => h.nombre === 'DECLARACIONES');
    if (nodoDeclaraciones) {
      this.log('PASO 2 — Recorriendo declaraciones de campos...');
      for (const decl of nodoDeclaraciones.hijos) {
        this.procesarDeclaracion(decl);
      }
    }

    // PASO 3: recorrer reglas y validar comparaciones
    const nodoReglas = arbol.hijos.find(h => h.nombre === 'REGLAS');
    if (nodoReglas) {
      this.log('PASO 3 — Recorriendo reglas y validando comparaciones...');
      for (const regla of nodoReglas.hijos) {
        this.procesarRegla(regla);
      }
    }

    this.log('✓ Análisis semántico completado sin errores.');
    return this.tabla;
  }

  // ── Procesar una declaración ─────────────────────────

  procesarDeclaracion(nodoDecl) {
    // Hojas: CAMPO, tipo, identificador, ;
    const hojas = nodoDecl.hijos.filter(h => h.esHoja);
    const tipoToken = hojas.find(h => h.tipo === 'TIPO_DATO');
    const idToken   = hojas.find(h => h.tipo === 'IDENTIFICADOR');

    if (!tipoToken || !idToken) return;

    const nombre = idToken.nombre.toLowerCase();
    const tipo   = tipoToken.nombre.toLowerCase();
    const linea  = idToken.ln;

    // ¿Ya existe? → redeclaración
    if (this.tabla[nombre]) {
      throw new Error(
        `Línea ${linea}: el campo '${nombre}' ya fue declarado anteriormente (línea ${this.tabla[nombre].linea}).\n` +
        `No se permite declarar el mismo campo más de una vez.`
      );
    }

    // Agregar a la tabla
    this.tabla[nombre] = { nombre, tipo, linea };
    this.log(`  → Campo '${nombre}' (${tipo}) agregado a la tabla de símbolos. [línea ${linea}]`);
  }

  // ── Procesar una regla (busca comparaciones dentro) ──

  procesarRegla(nodo) {
    if (!nodo || !nodo.hijos) return;
    for (const hijo of nodo.hijos) {
      if (hijo.nombre === 'COMPARACION') {
        this.procesarComparacion(hijo);
      } else if (!hijo.esHoja) {
        this.procesarRegla(hijo); // recorrido recursivo
      }
    }
  }

  // ── Validar una comparación ───────────────────────────

  procesarComparacion(nodoComp) {
    const hojas = nodoComp.hijos.filter(h => h.esHoja);
    const idToken    = hojas[0]; // identificador
    const valorToken = hojas[2]; // valor

    if (!idToken || !valorToken) return;

    const nombre = idToken.nombre.toLowerCase();
    const linea  = idToken.ln;

    // ¿Existe en la tabla?
    if (!this.tabla[nombre]) {
      throw new Error(
        `Línea ${linea}: el campo '${nombre}' no fue declarado.\n` +
        `Todos los campos deben declararse con CAMPO antes de usarse en reglas.`
      );
    }

    const tipoCampo = this.tabla[nombre].tipo;
    const tipoVal   = this.tipoValor(valorToken);

    // Compatibilidad de tipos
    if (tipoCampo === 'entero' && tipoVal === 'texto') {
      throw new Error(
        `Línea ${linea}: el campo '${nombre}' fue declarado como entero,\n` +
        `pero se está comparando con el valor ${valorToken.nombre} que es de tipo texto.\n` +
        `Un campo entero solo puede compararse con valores numéricos.`
      );
    }

    if (tipoCampo === 'texto' && tipoVal === 'entero') {
      throw new Error(
        `Línea ${linea}: el campo '${nombre}' fue declarado como texto,\n` +
        `pero se está comparando con el valor ${valorToken.nombre} que es de tipo número.\n` +
        `Un campo texto solo puede compararse con cadenas entre comillas.`
      );
    }

    this.log(`  → Comparación '${nombre} ... ${valorToken.nombre}': tipos compatibles (${tipoCampo}). ✓`);
  }
}

// ── Render Semántico ─────────────────────────────────────

function renderSemantico(arbol) {
  const semEl    = document.getElementById('sem-resultado');
  const tablaWrap= document.getElementById('tabla-simbolos-wrap');
  const tablaEl  = document.getElementById('tabla-simbolos');

  // Si no hay árbol (error léxico o sintáctico previo)
  if (!arbol) {
    semEl.innerHTML = `
      <div class="sint-badge sint-warn">⚠ Análisis semántico no ejecutado</div>
      <p class="sint-msg">El análisis semántico requiere que las fases léxica y sintáctica sean exitosas.</p>`;
    tablaWrap.style.display = 'none';
    return;
  }

  try {
    const semantico = new AnalizadorSemantico();
    const tabla = semantico.analizar(arbol);
    const entradas = Object.values(tabla);

    // Badge de éxito + log de pasos
    const logHtml = semantico.pasos.map(p => `<div class="sem-log-line">${esc(p)}</div>`).join('');
    semEl.innerHTML = `
      <div class="sint-badge sint-ok">✓ Programa semánticamente válido</div>
      <div class="sem-log">${logHtml}</div>`;

    // Tabla de símbolos
    let html = `<thead><tr>
      <th class="col-n">#</th>
      <th>Nombre del Campo</th>
      <th>Tipo de Dato</th>
      <th>Línea de Declaración</th>
    </tr></thead><tbody>`;

    entradas.forEach((e, i) => {
      const shade = i % 2 === 1;
      html += `<tr style="animation-delay:${i * 0.06}s${shade ? ';background:rgba(255,255,255,0.015)' : ''}">
        <td class="col-n">${i + 1}</td>
        <td><span class="tk tk-id">${esc(e.nombre)}</span></td>
        <td><span class="tk ${e.tipo === 'entero' ? 'tk-num' : 'tk-str'}">${esc(e.tipo)}</span></td>
        <td class="col-ln" style="text-align:left; padding-left:1rem;">${e.linea}</td>
      </tr>`;
    });

    html += '</tbody>';
    tablaEl.innerHTML = html;
    tablaWrap.style.display = 'block';

  } catch (e) {
    semEl.innerHTML = `
      <div class="sint-badge sint-err">✗ Error semántico</div>
      <p class="sint-err-msg">${esc(e.message)}</p>`;
    tablaWrap.style.display = 'none';
  }
}

//  ACTUALIZAR NÚMEROS DE LÍNEA DEL EDITOR 

function updateLineNumbers() {
  const lines = document.getElementById('editor').value.split('\n').length;
  document.getElementById('line-nums').innerHTML =
    Array.from({length: lines}, (_, i) => i + 1).join('<br>');
}

//  SINCRONIZAR SCROLL EDITOR Y NÚMEROS 

function syncScroll() {
  const editor = document.getElementById('editor');
  document.getElementById('line-nums').scrollTop = editor.scrollTop;
}

//  ACCIONES 

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
  ['kw','td','id','op','num','str','sym','err'].forEach(k => {
    document.getElementById('sc-' + k).textContent = '0';
  });
}

// Init
window.addEventListener('DOMContentLoaded', () => {
  updateLineNumbers();
  document.getElementById('editor').addEventListener('input', updateLineNumbers);
  document.getElementById('editor').addEventListener('scroll', syncScroll);
});