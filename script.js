// =====================================================================
// script.js — ACERVO DIGITAL RICHARD BASTOS
// Melhorias desta versão:
//  • Separação BR / Estrangeiras via paisAtual
//  • Cache de itens processados (evita reprocessar ao mudar filtro)
//  • IntersectionObserver: carrega imagem só quando o card entra na tela
//  • Pré-carregamento das imagens do modal ao abrir (front + back em paralelo)
// =====================================================================

let escalaZoom = 1;
let notasGlobais = [];
let notaAtualIndex = 0;
let abaAtivaAtual    = 'CEDULAS';
let filtroStatusAtual = 'TODOS';
let paisAtual        = 'BR';   // 'BR' ou 'ESTRANG'

// Cache: evita reprocessar a lista a cada mudança de filtro/aba
const _cache = { BR: null, ESTRANG: null };

// IntersectionObserver compartilhado — inicializado uma vez
let _imgObserver = null;

// ==========================================
// IMAGEM DE SEGURANÇA (FALLBACK)
// ==========================================
const imagemErroPlaceholder = "https://placehold.co/600x300/0A2E1A/D4AF37?text=Imagem+Indisponivel";

// ==========================================
// INTERSECTION OBSERVER — LAZY LOAD REAL
// ==========================================
function getImgObserver() {
    if (_imgObserver) return _imgObserver;
    _imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const img = entry.target;
            const src = img.dataset.src;
            if (!src) return;
            img.src = src;
            img.removeAttribute('data-src');
            _imgObserver.unobserve(img);
        });
    }, {
        rootMargin: '200px 0px',  // começa a carregar 200px antes de aparecer
        threshold: 0
    });
    return _imgObserver;
}

// ==========================================
// SCROLL + MENU HAMBÚRGUER
// ==========================================
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 80) {
        header.classList.add('shrink');
    } else {
        header.classList.remove('shrink');
        header.classList.remove('menu-open');
    }
    const btnTopo = document.getElementById('btnTopo');
    if (btnTopo) {
        if (window.scrollY > 300) btnTopo.classList.remove('hide');
        else btnTopo.classList.add('hide');
    }
});

function toggleMenu() { document.querySelector('header').classList.toggle('menu-open'); }
function fecharMenuMobile() { const h = document.querySelector('header'); if (h) h.classList.remove('menu-open'); }

// ==========================================
// TRADUTOR DE NÚMEROS PARA EXTENSO
// ==========================================
function numeroParaExtenso(num) {
    if (isNaN(num)) return num;
    if (num === 0)  return "ZERO";
    const unidades = ["","UM","DOIS","TRÊS","QUATRO","CINCO","SEIS","SETE","OITO","NOVE","DEZ","ONZE","DOZE","TREZE","QUATORZE","QUINZE","DEZESSEIS","DEZESSETE","DEZOITO","DEZENOVE"];
    const dezenas  = ["","","VINTE","TRINTA","QUARENTA","CINQUENTA","SESSENTA","SETENTA","OITENTA","NOVENTA"];
    const centenas = ["","CENTO","DUZENTOS","TREZENTOS","QUATROCENTOS","QUINHENTOS","SEISCENTOS","SETECENTOS","OITOCENTOS","NOVECENTOS"];
    function menor1000(n) {
        if (n === 100) return "CEM";
        let r = [], c = Math.floor(n/100), d = n%100;
        if (c > 0) r.push(centenas[c]);
        if (d > 0) { if (d < 20) r.push(unidades[d]); else { r.push(dezenas[Math.floor(d/10)]); let u=d%10; if(u>0) r.push(unidades[u]); } }
        return r.join(" E ");
    }
    let mil = Math.floor(num/1000), resto = num%1000, partes = [];
    if (mil > 0) partes.push(mil === 1 ? "MIL" : menor1000(mil) + " MIL");
    if (resto > 0) { let t = menor1000(resto); partes.push((mil > 0 && (resto < 100 || resto%100 === 0)) ? "E "+t : t); }
    return partes.join(" ");
}

// ==========================================
// FUNÇÕES DE NAVEGAÇÃO
// ==========================================

/* Toggle Cédulas ↔ Moedas */
function toggleAba() {
    mudarAba(abaAtivaAtual === 'CEDULAS' ? 'MOEDAS' : 'CEDULAS');
}

function mudarAba(tipo) {
    abaAtivaAtual = tipo;
    const toggle = document.getElementById('typeToggle');
    const lblCed = document.getElementById('toggle-label-cedulas');
    const lblMoe = document.getElementById('toggle-label-moedas');
    if (tipo === 'MOEDAS') {
        toggle.classList.add('moedas');
        lblCed.classList.remove('active');
        lblMoe.classList.add('active');
    } else {
        toggle.classList.remove('moedas');
        lblCed.classList.add('active');
        lblMoe.classList.remove('active');
    }
    montarGaleria();
    fecharMenuMobile();
}

/* Botões Nacionais / Estrangeiras */
function mudarPais(pais) {
    paisAtual = pais;
    document.getElementById('btn-br').classList.toggle('active',      pais === 'BR');
    document.getElementById('btn-estrang').classList.toggle('active', pais === 'ESTRANG');
    const wrap = document.getElementById('paisFilterWrap');
    if (pais === 'ESTRANG') {
        wrap.style.display = 'flex';
        atualizarDropdownPaises();
    } else {
        wrap.style.display = 'none';
        paisFiltroAtual = 'TODOS';
    }
    montarGaleria();
    fecharMenuMobile();
}

/* Dropdown de país dentro de Estrangeiras */
let paisFiltroAtual = 'TODOS';

function mudarPaisFilter(valor) {
    paisFiltroAtual = valor;
    montarGaleria();
}

function atualizarDropdownPaises() {
    const itens  = getItensProcessados('ESTRANG');
    const paises = [...new Set(itens.map(n => n.era))].sort();
    const sel    = document.getElementById('paisSelect');
    sel.innerHTML = '<option value="TODOS">🌍 Todos os Países</option>';
    paises.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p; opt.textContent = p;
        sel.appendChild(opt);
    });
    sel.value = paisFiltroAtual;
}

function mudarFiltro(status) {
    filtroStatusAtual = status;
    ['todos','troca','acervo'].forEach(f => document.getElementById('filter-'+f).classList.remove('active'));
    document.getElementById('filter-' + status.toLowerCase()).classList.add('active');
    montarGaleria();
    fecharMenuMobile();
}

function irParaTopo() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

function recolherTodasAsAlas() {
    document.querySelectorAll('.section-header').forEach(h => h.classList.add('collapsed'));
    document.querySelectorAll('.gallery-grid').forEach(g => g.classList.add('collapsed'));
    irParaTopo();
}

function injetarBotoesFlutuantes() {
    if (document.getElementById('floating-actions')) return;
    const div = document.createElement('div');
    div.id = 'floating-actions'; div.className = 'floating-actions';
    const btnR = document.createElement('button');
    btnR.className = 'float-btn'; btnR.innerHTML = '🗂️';
    btnR.title = "Minimizar todas as Alas"; btnR.onclick = recolherTodasAsAlas;
    const btnT = document.createElement('button');
    btnT.className = 'float-btn hide'; btnT.id = 'btnTopo'; btnT.innerHTML = '▲';
    btnT.title = "Voltar ao Topo"; btnT.onclick = irParaTopo;
    div.appendChild(btnR); div.appendChild(btnT); document.body.appendChild(div);
}

// ==========================================
// PROCESSADOR DE LISTA DE ARQUIVOS
// Retorna array de objetos nota, com cache.
// ==========================================
function processarLista(listaRaw) {
    let listaLimpa = [];
    (Array.isArray(listaRaw) ? listaRaw : [listaRaw]).forEach(linha => {
        String(linha).split(/(?=<a\s)/i).forEach(b => { if (b.trim()) listaLimpa.push(b.trim()); });
    });

    return listaLimpa.filter(item => item.includes('-FRONT')).map(item => {
        let partes = item.split('|').map(p => p.trim());
        let urlFrontFinal = "", textoRestante = [];

        partes.forEach(p => {
            if (p.includes('http') || p.includes('<a ') || p.includes('<img')) urlFrontFinal = p;
            else if (p !== "") textoRestante.push(p);
        });

        if (urlFrontFinal.includes('<img') && urlFrontFinal.includes('src=')) {
            const m = urlFrontFinal.match(/src=["']([^"']+)["']/i);
            if (m) urlFrontFinal = m[1];
        }

        const filename    = urlFrontFinal.substring(urlFrontFinal.lastIndexOf('/') + 1);
        let baseFilename  = filename.split('-FRONT')[0];
        let tipoItem      = baseFilename.includes("-MOEDA-") ? "MOEDAS" : "CEDULAS";
        let statusAtual   = "TROCA", qtd = 1, detalheManual = "";

        textoRestante.forEach(p => {
            let pU = p.toUpperCase();
            if (pU.startsWith("ACERVO") || pU.startsWith("TROCA")) {
                statusAtual = pU.startsWith("ACERVO") ? "ACERVO" : "TROCA";
                if (pU.includes('-')) {
                    let va = pU.split('-')[1].trim();
                    if (tipoItem === "MOEDAS" && !isNaN(parseInt(va))) qtd = parseInt(va);
                    else detalheManual += (detalheManual ? " / " : "") + va;
                }
            } else {
                detalheManual += (detalheManual ? " / " : "") + p;
            }
        });

        let valor = baseFilename.split('-')[0];
        let moeda = "CRUZEIROS", era = "CRUZEIRO", chaveHistoria = "", isEstrang = false, serialOriginal = baseFilename;

        if (baseFilename.includes("-ESTRANGEIRA-")) {
            isEstrang = true;
            let pE = baseFilename.split('-ESTRANGEIRA-');
            moeda = pE[0].split('-').slice(1).join(' ');
            let ladoDir = pE[1].replace('-MOEDA-', '-');
            let partesDir = ladoDir.split('-');
            serialOriginal = partesDir.pop();
            era = partesDir.join(' ').toUpperCase();
            chaveHistoria = `${valor}-${moeda.replace(/ /g,'_')}-${era.replace(/ /g,'_')}`;
            if (!serialOriginal || serialOriginal === baseFilename) serialOriginal = "S/N";
        } else if (baseFilename.includes("CRUZEIROS-REAIS") || baseFilename.includes("CRUZEIRO-REAL")) {
            moeda = baseFilename.includes("CRUZEIROS") ? "CRUZEIROS REAIS" : "CRUZEIRO REAL";
            era = "CRUZEIRO REAL"; chaveHistoria = `${valor}-${moeda.replace(' ','-')}`;
        } else if (baseFilename.includes("-REAIS") || baseFilename.includes("-REAL")) {
            moeda = baseFilename.includes("REAIS") ? "REAIS" : "REAL";
            era = "REAL"; chaveHistoria = `${valor}-${moeda}`;
        } else if (baseFilename.includes("CRUZADOS-NOVOS")) {
            moeda = "CRUZADOS NOVOS"; era = "CRUZADOS NOVOS"; chaveHistoria = `${valor}-CRUZADOS-NOVOS`;
        } else if (baseFilename.includes("CRUZADOS")) {
            moeda = "CRUZADOS"; era = "CRUZADO"; chaveHistoria = `${valor}-CRUZADOS`;
        } else if (baseFilename.includes("CRUZEIRO")) {
            moeda = baseFilename.includes("CRUZEIROS") ? "CRUZEIROS" : "CRUZEIRO";
            era = "CRUZEIRO"; chaveHistoria = `${valor}-CRUZEIRO${baseFilename.includes("CRUZEIROS") ? 'S' : ''}`;
        }

        if (!isEstrang) {
            let pref = `${valor}-${moeda.replace(' ','-')}-`;
            if (baseFilename.includes('CRUZEIROS-A')) pref = `${valor}-CRUZEIROS-`;
            if (baseFilename.includes('CRUZEIRO-B'))  pref = `${valor}-CRUZEIRO-`;
            if (tipoItem === "MOEDAS") pref = `${valor}-${moeda.replace(' ','-')}-MOEDA-`;
            serialOriginal = baseFilename.replace(pref, '');
        }

        if (detalheManual) serialOriginal = (serialOriginal && serialOriginal !== "S/N") ? `${serialOriginal} / ${detalheManual}` : detalheManual;

        // Busca a URL do BACK na mesma lista
        let backEntry = listaLimpa.find(u => u.includes(baseFilename + '-BACK'));
        let urlBackFinal = backEntry || "";
        if (backEntry) {
            let pb = backEntry.split('|').map(p => p.trim());
            let bs = "";
            pb.forEach(p => { if (p.includes('http') || p.includes('<a ') || p.includes('<img')) bs = p; });
            if (bs.includes('<img') && bs.includes('src=')) { const mb = bs.match(/src=["']([^"']+)["']/i); if(mb) bs=mb[1]; }
            urlBackFinal = bs;
        }

        return {
            urlFront: urlFrontFinal, urlBack: urlBackFinal,
            valorNum: parseInt(valor), valorExibicao: numeroParaExtenso(parseInt(valor)),
            moeda, era, serial: serialOriginal, chaveHistoria,
            tipo: tipoItem, status: statusAtual, isEstrang, qtd
        };
    });
}

function getItensProcessados(pais) {
    if (_cache[pais]) return _cache[pais];
    const lista = pais === 'BR'
        ? (typeof listaDeArquivosUrlBR      !== 'undefined' ? listaDeArquivosUrlBR      : [])
        : (typeof listaDeArquivosUrlEstrang !== 'undefined' ? listaDeArquivosUrlEstrang : []);
    _cache[pais] = processarLista(lista);
    return _cache[pais];
}

// ==========================================
// CONSTRUTOR DA GALERIA
// ==========================================
function montarGaleria() {
    const container = document.getElementById('main-container');
    container.innerHTML = '';
    notasGlobais = [];

    const todosItens = getItensProcessados(paisAtual);

    const itensParaExibir = todosItens.filter(item => {
        const okAba    = item.tipo === abaAtivaAtual;
        const okStatus = filtroStatusAtual === 'TODOS' || item.status === filtroStatusAtual;
        const okPais   = paisAtual === 'BR' || paisFiltroAtual === 'TODOS' || item.era === paisFiltroAtual;
        return okAba && okStatus && okPais;
    });

    if (itensParaExibir.length === 0) {
        container.innerHTML = `<h3 style='color:#777;text-align:center;margin-top:50px;'>Nenhuma correspondência encontrada.</h3>`;
        return;
    }

    // Ordena eras: nacionais fixas em primeiro, estrangeiras por país
    const erasNacionais   = ["CRUZEIRO","CRUZADO","CRUZADOS NOVOS","CRUZEIRO REAL","REAL"];
    const erasEstrangeiras = [...new Set(itensParaExibir.filter(n => n.isEstrang).map(n => n.era))].sort();
    const ordemEras = [...erasNacionais, ...erasEstrangeiras];

    const observer = getImgObserver();

    ordemEras.forEach(era => {
        const itensDaEra = itensParaExibir.filter(n => n.era === era).sort((a,b) => a.valorNum - b.valorNum);
        if (!itensDaEra.length) return;

        const h = document.createElement('div');
        h.className = 'section-header collapsed';
        if (erasEstrangeiras.includes(era))        h.innerText = `ALA INTERNACIONAL — ${era}`;
        else if (era === "CRUZADOS NOVOS")          h.innerText = "ALA DOS CRUZADOS NOVOS";
        else if (era === "CRUZEIRO REAL")           h.innerText = "ALA DOS CRUZEIROS REAIS";
        else if (era === "REAL")                    h.innerText = "ALA DO REAL";
        else                                        h.innerText = `ALA DOS ${era}S`;

        const grid = document.createElement('div');
        grid.className = 'gallery-grid collapsed';
        h.onclick = () => { h.classList.toggle('collapsed'); grid.classList.toggle('collapsed'); };
        container.appendChild(h);

        itensDaEra.forEach(n => {
            notasGlobais.push(n);
            const currentIndex = notasGlobais.length - 1;

            let classeCarimbo = n.status === "ACERVO" ? "stamp-acervo" : "stamp-troca";
            let textoCarimbo  = n.status === "ACERVO" ? "ACERVO" : "P/ TROCA";
            let badgeQtd      = (n.qtd > 1 && n.tipo === "MOEDAS") ? `<div class="qtd-badge">${n.qtd} UNID.</div>` : '';

            const card = document.createElement('div');
            card.className = 'note-card';
            card.innerHTML = `
                <div class="img-wrapper">
                    <div class="stamp-overlay ${classeCarimbo}"><b>${textoCarimbo}</b></div>
                    ${badgeQtd}
                    <img data-src="${n.urlFront}"
                         src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                         loading="lazy"
                         onload="if(this.src&&!this.src.startsWith('data:')){this.classList.add('loaded');this.parentElement.classList.add('is-loaded');}"
                         onerror="this.onerror=null;this.style.display='none';this.parentElement.classList.add('is-error');">
                </div>
                <div class="card-info">
                    <b>${n.valorExibicao} ${n.moeda}</b>
                    <span>DETALHES: ${n.serial}</span>
                </div>
            `;
            card.onclick = () => abrirModalInterativo(currentIndex);

            // Registra no IntersectionObserver
            const img = card.querySelector('img');
            observer.observe(img);

            grid.appendChild(card);
        });

        container.appendChild(grid);
    });
}

// ==========================================
// MODAL E INTERAÇÕES
// ==========================================
function preCarregarImagem(url) {
    if (!url) return;
    const img = new Image();
    img.src = url;
}

function abrirModalInterativo(index) {
    notaAtualIndex = index;
    const n = notasGlobais[index];

    // Pré-carrega o próximo e anterior em background
    if (index + 1 < notasGlobais.length) preCarregarImagem(notasGlobais[index+1].urlFront);
    if (index - 1 >= 0)                  preCarregarImagem(notasGlobais[index-1].urlFront);

    const imgF = document.getElementById('imgFront');
    const imgB = document.getElementById('imgBack');

    [imgF, imgB].forEach(i => {
        i.classList.remove('loaded');
        i.parentElement.classList.remove('is-loaded','is-error');
        i.style.display = 'block';
    });

    imgF.src = n.urlFront;
    imgF.onload  = function() { this.classList.add('loaded'); this.parentElement.classList.add('is-loaded'); };
    imgF.onerror = function() { this.style.display='none'; this.parentElement.classList.add('is-error'); };

    const backUrl = n.urlBack || n.urlFront;
    imgB.src = backUrl;
    imgB.onload  = function() { this.classList.add('loaded'); this.parentElement.classList.add('is-loaded'); };
    imgB.onerror = function() { this.style.display='none'; this.parentElement.classList.add('is-error'); };

    document.getElementById('infoTitle').innerText   = `${n.valorExibicao} ${n.moeda}`;
    document.getElementById('specValor').innerText   = `${n.valorNum} ${n.moeda}`;
    document.getElementById('specSerial').innerText  = n.serial;

    const badgeStatus  = document.getElementById('modalStatusBadge');
    const waContainer  = document.getElementById('wa-btn-container');
    const waBtn        = document.getElementById('wa-btn');
    let qtdTextoModal  = (n.qtd > 1 && n.tipo === "MOEDAS")
        ? `<span style="background:var(--gold);color:white;padding:3px 8px;border-radius:12px;font-size:12px;margin-left:10px;">${n.qtd} UNID.</span>` : '';

    if (n.status === "ACERVO") {
        badgeStatus.innerHTML    = `<b style='color:#dc3545;margin:0;'>ACERVO PESSOAL</b> ${qtdTextoModal}`;
        badgeStatus.style.borderColor = "#dc3545";
        if (waContainer) waContainer.style.display = "none";
    } else {
        badgeStatus.innerHTML    = `<b style='color:#28a745;margin:0;'>P/ TROCA</b> ${qtdTextoModal}`;
        badgeStatus.style.borderColor = "#28a745";
        if (waContainer) waContainer.style.display = "block";
        const numeroWA = "5511970979335";
        let textoQtd   = (n.qtd > 1 && n.tipo === "MOEDAS") ? ` (Vi que você tem ${n.qtd} unidades disponíveis)` : '';
        const mensagem = encodeURIComponent(`Olá Richard! Vi no seu Acervo Digital o item de ${n.valorExibicao} ${n.moeda} (${n.isEstrang ? n.era : 'Detalhes: '+n.serial}) e tenho interesse em negociar uma troca!${textoQtd}`);
        if (waBtn) waBtn.href = `https://wa.me/${numeroWA}?text=${mensagem}`;
    }

    let dadosHist = typeof bancoHistorico !== 'undefined' ? bancoHistorico[n.chaveHistoria] : null;
    if (!dadosHist && n.chaveHistoria.endsWith('S')) dadosHist = bancoHistorico[n.chaveHistoria.slice(0,-1)];
    if (!dadosHist) {
        if      (n.isEstrang)                                      dadosHist = bancoHistorico["DEFAULT_ESTRANGEIRA"];
        else if (n.era === "REAL")                                 dadosHist = bancoHistorico["DEFAULT_REAL"];
        else if (n.era === "CRUZEIRO REAL")                        dadosHist = bancoHistorico["DEFAULT_CRUZEIRO_REAL"];
        else if (n.era === "CRUZADO" || n.era === "CRUZADOS NOVOS") dadosHist = bancoHistorico["DEFAULT_CRUZADO"];
        else                                                       dadosHist = bancoHistorico["DEFAULT_CRUZEIRO"];
    }

    document.getElementById('infoDesc').innerText      = dadosHist ? dadosHist.hist : "Descrição indisponível.";
    document.getElementById('infoCuriosity').innerText = dadosHist ? dadosHist.cur  : "";

    document.getElementById('flipper').classList.remove('flipped');
    document.getElementById('btnPrev').disabled = (index === 0);
    document.getElementById('btnNext').disabled = (index === notasGlobais.length - 1);

    document.getElementById('modalInterativo').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function navegar(direcao) {
    const novoIndex = notaAtualIndex + direcao;
    if (novoIndex >= 0 && novoIndex < notasGlobais.length) abrirModalInterativo(novoIndex);
}

function toggleFlip() { document.getElementById('flipper').classList.toggle('flipped'); }

// ==========================================
// SUPER ZOOM
// ==========================================
function abrirSuperZoom() {
    const estaVirado = document.getElementById('flipper').classList.contains('flipped');
    const n = notasGlobais[notaAtualIndex];
    const src = (estaVirado && n.urlBack) ? n.urlBack : n.urlFront;
    document.getElementById('zoomImg').src = src;
    escalaZoom = 1;
    document.getElementById('zoomImg').style.transform = 'scale(1)';
    document.getElementById('superZoom').classList.add('open');
}

function controlarScrollZoom(e) {
    e.preventDefault();
    escalaZoom = e.deltaY < 0 ? Math.min(4, escalaZoom + 0.2) : Math.max(1, escalaZoom - 0.2);
    document.getElementById('zoomImg').style.transform = `scale(${escalaZoom})`;
}

function atualizarPosicaoZoom(e) {
    const i = e.target;
    i.style.transformOrigin = `${(e.offsetX/i.offsetWidth)*100}% ${(e.offsetY/i.offsetHeight)*100}%`;
}

function fecharModal(id) {
    document.getElementById(id).classList.remove('open');
    if (id === 'modalInterativo') document.body.style.overflow = '';
}

function fecharTudo() {
    fecharModal('superZoom');
    fecharModal('modalInterativo');
    document.getElementById('flipper').classList.remove('flipped');
}

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        if (document.getElementById('searchOverlay').classList.contains('open')) { fecharBusca(); return; }
        if (document.getElementById('superZoom').classList.contains('open')) fecharModal('superZoom');
        else fecharTudo();
    }
    // Navegação por teclado dentro dos resultados de busca
    if (document.getElementById('searchOverlay').classList.contains('open')) {
        const items = document.querySelectorAll('.search-item');
        if (!items.length) return;
        let sel = document.querySelector('.search-item.selected');
        let idx = sel ? [...items].indexOf(sel) : -1;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (sel) sel.classList.remove('selected');
            idx = (idx + 1) % items.length;
            items[idx].classList.add('selected');
            items[idx].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (sel) sel.classList.remove('selected');
            idx = (idx - 1 + items.length) % items.length;
            items[idx].classList.add('selected');
            items[idx].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            const atual = document.querySelector('.search-item.selected');
            if (atual) atual.click();
        }
        return;
    }
    if (!document.getElementById('superZoom').classList.contains('open') &&
         document.getElementById('modalInterativo').classList.contains('open')) {
        if (e.key === "ArrowLeft")  navegar(-1);
        if (e.key === "ArrowRight") navegar(1);
    }
});

// ==========================================
// SISTEMA DE BUSCA
// ==========================================
let _todosItensCache = null;

/* Retorna todos os itens de BR + Estrang combinados, com índice de exibição */
function getTodosItensParaBusca() {
    if (_todosItensCache) return _todosItensCache;
    const br      = getItensProcessados('BR');
    const estrang = getItensProcessados('ESTRANG');
    _todosItensCache = [
        ...br.map(n      => ({ ...n, _pais: 'BR' })),
        ...estrang.map(n => ({ ...n, _pais: 'ESTRANG' }))
    ];
    return _todosItensCache;
}

function toggleBusca() {
    const ov = document.getElementById('searchOverlay');
    if (ov.classList.contains('open')) { fecharBusca(); return; }
    ov.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('searchInput').focus(), 80);
}

function fecharBusca() {
    document.getElementById('searchOverlay').classList.remove('open');
    document.body.style.overflow = '';
    limparBusca();
}

function limparBusca() {
    const inp = document.getElementById('searchInput');
    inp.value = '';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('searchClear').classList.remove('visible');
    inp.focus();
}

/* Highlight: tenta a query inteira; se não bater (ex: "1 won" vs "UM WON"),
   ignora tokens numéricos e destaca só as palavras no texto exibido */
function highlight(text, query) {
    if (!query) return text;
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re  = new RegExp(`(${esc(query)})`, 'gi');
    if (re.test(text)) return text.replace(re, '<mark>$1</mark>');
    // Query tem número — destaca só os tokens não-numéricos
    let result = text;
    query.split(/\s+/).filter(w => w && isNaN(w)).forEach(word => {
        result = result.replace(new RegExp(`(${esc(word)})`, 'gi'), '<mark>$1</mark>');
    });
    return result;
}

/* Score de relevância: compara contra extenso E contra número puro */
function calcScore(item, q) {
    const titulo    = `${item.valorExibicao} ${item.moeda}`.toLowerCase();
    const tituloNum = `${item.valorNum} ${item.moeda}`.toLowerCase();
    const era       = item.era.toLowerCase();
    const serial    = item.serial.toLowerCase();

    const serialLimpo = serial.replace(/[\s\-\/]/g, '');
    const qLimpo      = q.replace(/[\s\-\/]/g, '');

    // --- Prioridade 1: nome/moeda ---
    const soPureNum = /^\d+$/.test(q);
    if (soPureNum) {
        // Número exato no título: "1" → "1 won", não "10", "100"
        if (tituloNum.startsWith(q + ' ') || tituloNum === q) return 5;
        // Não bateu no título → tenta serial (ex: "557817")
        if (serialLimpo.startsWith(qLimpo)) return 1;
        if (serialLimpo.includes(qLimpo))   return 1;
        return 0;
    }

    // Query com texto (ex: "won", "1 won", "cruzeiro")
    if (titulo.startsWith(q) || tituloNum.startsWith(q)) return 5;
    if (titulo.includes(q)   || tituloNum.includes(q))   return 4;

    // --- Prioridade 2: país / era ---
    if (era.startsWith(q)) return 3;
    if (era.includes(q))   return 2;

    // --- Prioridade 3: número de série (aceita letra ou número no início) ---
    if (serialLimpo.startsWith(qLimpo)) return 1;
    if (serialLimpo.includes(qLimpo))   return 1;

    return 0;
}

function executarBusca(query) {
    const q   = query.trim().toLowerCase();
    const res = document.getElementById('searchResults');
    const clr = document.getElementById('searchClear');

    clr.classList.toggle('visible', q.length > 0);

    if (q.length < 1) { res.innerHTML = ''; return; }

    const todos = getTodosItensParaBusca();
    const matches = todos
        .map(n => ({ n, score: calcScore(n, q) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score || a.n.valorNum - b.n.valorNum)
        .slice(0, 18)   // máx 18 sugestões
        .map(x => x.n);

    if (!matches.length) {
        res.innerHTML = `<div class="search-no-result">Nenhuma peça encontrada para "<b>${query}</b>"</div>`;
        return;
    }

    res.innerHTML = matches.map((n, i) => {
        const titulo = `${n.valorExibicao} ${n.moeda}`;
        const flagPais = n._pais === 'BR' ? '🇧🇷' : '🌍';
        const badgeStatus = n.status === 'ACERVO'
            ? '<span class="search-item-badge" style="border-color:rgba(220,53,69,.4);color:#ff6b7a;">ACERVO</span>'
            : '<span class="search-item-badge" style="border-color:rgba(40,167,69,.4);color:#6bff9a;">P/ TROCA</span>';
        return `
        <div class="search-item" data-index="${i}" onclick="selecionarResultado(${i})">
            <img class="search-thumb" src="${n.urlFront}"
                 onerror="this.style.opacity='.3'" loading="lazy">
            <div class="search-item-info">
                <div class="search-item-title">${highlight(titulo, q)}</div>
                <div class="search-item-sub">
                    ${flagPais} ${n.era} &nbsp;·&nbsp; ${n.serial}
                    &nbsp; ${badgeStatus}
                </div>
            </div>
            <span class="search-item-arrow">›</span>
        </div>`;
    }).join('');

    // Guarda os matches no DOM para o clique referenciar
    res.dataset.matches = JSON.stringify(matches.map((n, i) => ({
        idx: i,
        pais: n._pais,
        tipo: n.tipo,
        urlFront: n.urlFront   // chave de identificação única
    })));
}

function selecionarResultado(idx) {
    const res   = document.getElementById('searchResults');
    const metas = JSON.parse(res.dataset.matches || '[]');
    const meta  = metas[idx];
    if (!meta) return;

    fecharBusca();

    // 1. Ajusta estado silenciosamente (sem chamar montarGaleria no meio)
    let precisaRemontar = false;

    if (meta.pais !== paisAtual) {
        paisAtual = meta.pais;
        // atualiza UI dos botões de país
        document.getElementById('btn-br').classList.toggle('active',      meta.pais === 'BR');
        document.getElementById('btn-estrang').classList.toggle('active', meta.pais === 'ESTRANG');
        const wrap = document.getElementById('paisFilterWrap');
        if (meta.pais === 'ESTRANG') {
            wrap.style.display = 'flex';
            atualizarDropdownPaises();
        } else {
            wrap.style.display = 'none';
            paisFiltroAtual = 'TODOS';
        }
        precisaRemontar = true;
    }

    if (meta.tipo !== abaAtivaAtual) {
        abaAtivaAtual = meta.tipo;
        const toggle = document.getElementById('typeToggle');
        const lblCed = document.getElementById('toggle-label-cedulas');
        const lblMoe = document.getElementById('toggle-label-moedas');
        if (meta.tipo === 'MOEDAS') {
            toggle.classList.add('moedas');
            lblCed.classList.remove('active'); lblMoe.classList.add('active');
        } else {
            toggle.classList.remove('moedas');
            lblCed.classList.add('active'); lblMoe.classList.remove('active');
        }
        precisaRemontar = true;
    }

    if (filtroStatusAtual !== 'TODOS') {
        filtroStatusAtual = 'TODOS';
        ['todos','troca','acervo'].forEach(f => document.getElementById('filter-'+f).classList.remove('active'));
        document.getElementById('filter-todos').classList.add('active');
        precisaRemontar = true;
    }

    // 2. Uma única remontagem da galeria se necessário
    if (precisaRemontar) montarGaleria();

    // 3. Localiza o item em notasGlobais (já atualizado pelo montarGaleria acima)
    const globalIdx = notasGlobais.findIndex(n => n.urlFront === meta.urlFront);
    if (globalIdx === -1) return;

    // 4. Abre o modal
    abrirModalInterativo(globalIdx);

    // 5. Flash + scroll no card da galeria
    setTimeout(() => {
        const cards = document.querySelectorAll('.note-card');
        const card  = cards[globalIdx];
        if (!card) return;

        const grid = card.closest('.gallery-grid');
        if (grid && grid.classList.contains('collapsed')) {
            grid.classList.remove('collapsed');
            grid.previousElementSibling?.classList.remove('collapsed');
        }

        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.remove('flash-highlight');
        void card.offsetWidth;
        card.classList.add('flash-highlight');
        setTimeout(() => card.classList.remove('flash-highlight'), 1000);
    }, 150);
}

// ==========================================
// AJUSTE DINÂMICO DO PADDING-TOP
// Mede a altura real do header APÓS o primeiro paint
// e aplica ao body, evitando sobreposição.
// ==========================================
function ajustarPaddingBody() {
    const header = document.getElementById('main-header');
    if (!header) return;
    // requestAnimationFrame garante que o layout já foi calculado pelo browser
    requestAnimationFrame(() => {
        const altura = header.getBoundingClientRect().height;
        document.body.style.paddingTop = (altura + 12) + 'px';
    });
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
window.onload = () => {
    injetarBotoesFlutuantes();
    document.getElementById('toggle-label-cedulas').classList.add('active');
    mudarFiltro('TODOS');
    ajustarPaddingBody();
    window.addEventListener('resize', ajustarPaddingBody);

    // Pré-aquece o cache de busca em background
    setTimeout(() => getTodosItensParaBusca(), 800);
};