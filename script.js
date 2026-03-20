let escalaZoom = 1;
let notasGlobais = [];
let notaAtualIndex = 0;
let abaAtivaAtual = 'CEDULAS'; 
let filtroStatusAtual = 'TODOS'; 

// ==========================================
// IMAGEM DE SEGURANÇA (FALLBACK SE DER ERRO)
// ==========================================
const imagemErroPlaceholder = "https://placehold.co/600x300/0A2E1A/D4AF37?text=Imagem+Indisponivel";

// ==========================================
// DETECTOR DE SCROLL E MENU HAMBÚRGUER
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
function fecharMenuMobile() { const header = document.querySelector('header'); if(header) header.classList.remove('menu-open'); }

// ==========================================
// TRADUTOR DE NÚMEROS PARA EXTENSO
// ==========================================
function numeroParaExtenso(num) {
    if (isNaN(num)) return num; 
    if (num === 0) return "ZERO";
    
    const unidades = ["", "UM", "DOIS", "TRÊS", "QUATRO", "CINCO", "SEIS", "SETE", "OITO", "NOVE", "DEZ", "ONZE", "DOZE", "TREZE", "QUATORZE", "QUINZE", "DEZESSEIS", "DEZESSETE", "DEZOITO", "DEZENOVE"];
    const dezenas = ["", "", "VINTE", "TRINTA", "QUARENTA", "CINQUENTA", "SESSENTA", "SETENTA", "OITENTA", "NOVENTA"];
    const centenas = ["", "CENTO", "DUZENTOS", "TREZENTOS", "QUATROCENTOS", "QUINHENTOS", "SEISCENTOS", "SETECENTOS", "OITOCENTOS", "NOVECENTOS"];

    function converteMenor1000(n) {
        if (n === 100) return "CEM";
        let res = [];
        let c = Math.floor(n / 100);
        let d = n % 100;
        if (c > 0) res.push(centenas[c]);
        if (d > 0) {
            if (d < 20) res.push(unidades[d]);
            else { res.push(dezenas[Math.floor(d / 10)]); let u = d % 10; if (u > 0) res.push(unidades[u]); }
        }
        return res.join(" E ");
    }

    let milhares = Math.floor(num / 1000);
    let resto = num % 1000;
    let partes = [];

    if (milhares > 0) {
        if (milhares === 1) partes.push("MIL");
        else partes.push(converteMenor1000(milhares) + " MIL");
    }
    if (resto > 0) {
        let textoResto = converteMenor1000(resto);
        if (milhares > 0 && (resto < 100 || resto % 100 === 0)) partes.push("E " + textoResto);
        else partes.push(textoResto);
    }
    return partes.join(" ");
}

// ==========================================
// FUNÇÕES DE NAVEGAÇÃO
// ==========================================
function mudarAba(tipo) {
    abaAtivaAtual = tipo;
    document.getElementById('tab-cedulas').classList.remove('active');
    document.getElementById('tab-moedas').classList.remove('active');
    
    if(tipo === 'CEDULAS') document.getElementById('tab-cedulas').classList.add('active');
    else document.getElementById('tab-moedas').classList.add('active');
    montarGaleria(); fecharMenuMobile(); 
}

function mudarFiltro(status) {
    filtroStatusAtual = status;
    document.getElementById('filter-todos').classList.remove('active');
    document.getElementById('filter-troca').classList.remove('active');
    document.getElementById('filter-acervo').classList.remove('active');
    
    if(status === 'TODOS') document.getElementById('filter-todos').classList.add('active');
    else if(status === 'TROCA') document.getElementById('filter-troca').classList.add('active');
    else if(status === 'ACERVO') document.getElementById('filter-acervo').classList.add('active');
    montarGaleria(); fecharMenuMobile(); 
}

function irParaTopo() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

function recolherTodasAsAlas() {
    const headers = document.querySelectorAll('.section-header');
    const grids = document.querySelectorAll('.gallery-grid');
    headers.forEach(h => h.classList.add('collapsed'));
    grids.forEach(g => g.classList.add('collapsed'));
    irParaTopo();
}

function injetarBotoesFlutuantes() {
    if (document.getElementById('floating-actions')) return; 
    const div = document.createElement('div'); div.id = 'floating-actions'; div.className = 'floating-actions';
    
    const btnRecolher = document.createElement('button');
    btnRecolher.className = 'float-btn'; btnRecolher.innerHTML = '🗂️'; 
    btnRecolher.title = "Minimizar todas as Alas"; btnRecolher.onclick = recolherTodasAsAlas;

    const btnTopo = document.createElement('button');
    btnTopo.className = 'float-btn hide'; btnTopo.id = 'btnTopo'; btnTopo.innerHTML = '▲';
    btnTopo.title = "Voltar ao Topo"; btnTopo.onclick = irParaTopo;

    div.appendChild(btnRecolher); div.appendChild(btnTopo); document.body.appendChild(div);
}

// ==========================================
// CONSTRUTOR DA GALERIA
// ==========================================
function montarGaleria() {
    const container = document.getElementById('main-container');
    container.innerHTML = ''; notasGlobais = []; 
    
    if (typeof listaDeArquivosUrl === 'undefined' || listaDeArquivosUrl.length === 0) {
        container.innerHTML = "<h3 style='color:#D4AF37; text-align:center; margin-top: 50px;'>Nenhuma peça encontrada no acervo.</h3>";
        return;
    }

    let arraySeguro = [];
    if (typeof listaDeArquivosUrl === 'string') {
        arraySeguro = [listaDeArquivosUrl];
    } else if (Array.isArray(listaDeArquivosUrl)) {
        arraySeguro = listaDeArquivosUrl;
    }

    let listaLimpa = [];
    arraySeguro.forEach(linha => {
        let blocos = String(linha).split(/(?=<a\s)/i);
        blocos.forEach(b => {
            if(b.trim() !== '') listaLimpa.push(b.trim());
        });
    });

    const itensProcessados = listaLimpa.filter(item => item.includes('-FRONT')).map(item => {
        let partes = item.split('|').map(p => p.trim()); 
        
        let urlFrontFinal = "";
        let textoRestante = [];

        // Inteligência nova: Separa quem é URL de quem é Comentário (ex: 1981, ACERVO)
        partes.forEach(p => {
            if (p.includes('http') || p.includes('<a ') || p.includes('<img')) {
                urlFrontFinal = p;
            } else {
                if(p !== "") textoRestante.push(p);
            }
        });
        
        if (urlFrontFinal.includes('<img') && urlFrontFinal.includes('src=')) {
            const match = urlFrontFinal.match(/src=["']([^"']+)["']/i);
            if (match) urlFrontFinal = match[1];
        }

        const filename = urlFrontFinal.substring(urlFrontFinal.lastIndexOf('/') + 1);
        let baseFilename = filename.split('-FRONT')[0]; 
        let tipoItem = baseFilename.includes("-MOEDA-") ? "MOEDAS" : "CEDULAS";
        
        let statusAtual = "TROCA"; let qtd = 1; let detalheManual = "";

        // Lê os comentários independentemente da ordem!
        textoRestante.forEach(p => {
            let pUpper = p.toUpperCase();
            if (pUpper.startsWith("ACERVO") || pUpper.startsWith("TROCA")) {
                statusAtual = pUpper.startsWith("ACERVO") ? "ACERVO" : "TROCA";
                if (pUpper.includes('-')) {
                    let valorApos = pUpper.split('-')[1].trim();
                    if (tipoItem === "MOEDAS" && !isNaN(parseInt(valorApos))) qtd = parseInt(valorApos);
                    else { detalheManual += (detalheManual !== "" ? " / " : "") + valorApos; }
                }
            } else {
                detalheManual += (detalheManual !== "" ? " / " : "") + p;
            }
        });

        let valor = baseFilename.split('-')[0];
        let moeda = "CRUZEIROS"; let era = "CRUZEIRO"; let chaveHistoria = ""; let isEstrang = false; let serialOriginal = baseFilename;

        // ========================================================
        // A NOVA MÁGICA INFALÍVEL PARA PAÍSES COM TRAÇO (COREIA-DO-NORTE)
        // ========================================================
        if (baseFilename.includes("-ESTRANGEIRA-")) {
            isEstrang = true;
            let pEstrang = baseFilename.split('-ESTRANGEIRA-'); 
            
            // Esquerda: Pega a moeda e substitui o traço por espaço se tiver (Ex: NOVO-PESO -> NOVO PESO)
            let partesEsq = pEstrang[0].split('-'); 
            moeda = partesEsq.slice(1).join(' '); 
            
            // Direita: Limpa a palavra MOEDA se tiver, e divide pelos traços
            let ladoDireito = pEstrang[1].replace('-MOEDA-', '-'); 
            let partesDir = ladoDireito.split('-'); 
            
            // O ÚLTIMO item depois do último traço é SEMPRE a série
            serialOriginal = partesDir.pop(); 
            
            // Tudo que sobrou antes da série é o País! Junta com espaço!
            era = partesDir.join(' ').toUpperCase(); 
            
            chaveHistoria = `${valor}-${moeda.replace(/ /g, '_')}-${era.replace(/ /g, '_')}`; 
            if (!serialOriginal || serialOriginal === baseFilename) serialOriginal = "S/N";
        } 
        else if (baseFilename.includes("CRUZEIROS-REAIS") || baseFilename.includes("CRUZEIRO-REAL")) {
            moeda = baseFilename.includes("CRUZEIROS") ? "CRUZEIROS REAIS" : "CRUZEIRO REAL"; 
            era = "CRUZEIRO REAL"; chaveHistoria = `${valor}-${moeda.replace(' ', '-')}`;
        }
        else if (baseFilename.includes("-REAIS") || baseFilename.includes("-REAL")) {
            moeda = baseFilename.includes("REAIS") ? "REAIS" : "REAL"; 
            era = "REAL"; chaveHistoria = `${valor}-${moeda}`;
        }
        else if (baseFilename.includes("CRUZADOS-NOVOS")) {
            moeda = "CRUZADOS NOVOS"; era = "CRUZADOS NOVOS"; chaveHistoria = `${valor}-CRUZADOS-NOVOS`;
        } else if (baseFilename.includes("CRUZADOS")) {
            moeda = "CRUZADOS"; era = "CRUZADO"; chaveHistoria = `${valor}-CRUZADOS`;
        } else if (baseFilename.includes("CRUZEIRO")) {
            moeda = baseFilename.includes("CRUZEIROS") ? "CRUZEIROS" : "CRUZEIRO"; era = "CRUZEIRO"; chaveHistoria = `${valor}-CRUZEIRO${baseFilename.includes("CRUZEIROS") ? 'S' : ''}`;
        }

        if (!isEstrang) {
            let prefixoLimpo = `${valor}-${moeda.replace(' ', '-')}-`;
            if(baseFilename.includes('CRUZEIROS-A')) prefixoLimpo = `${valor}-CRUZEIROS-`;
            if(baseFilename.includes('CRUZEIRO-B')) prefixoLimpo = `${valor}-CRUZEIRO-`;
            if(tipoItem === "MOEDAS") prefixoLimpo = `${valor}-${moeda.replace(' ', '-')}-MOEDA-`; 
            serialOriginal = baseFilename.replace(prefixoLimpo, '');
        }

        // Junta a série original com as suas anotações
        if (detalheManual !== "") serialOriginal = (serialOriginal !== "" && serialOriginal !== "S/N") ? `${serialOriginal} / ${detalheManual}` : detalheManual;

        let itemBackFound = listaLimpa.find(u => u.includes(baseFilename + '-BACK'));
        let urlBackFinal = itemBackFound;
        
        if (itemBackFound) {
            let partesBack = itemBackFound.split('|').map(p => p.trim());
            let urlBackString = "";
            partesBack.forEach(p => {
                if (p.includes('http') || p.includes('<a ') || p.includes('<img')) urlBackString = p;
            });
            
            if (urlBackString.includes('<img') && urlBackString.includes('src=')) {
                const matchB = urlBackString.match(/src=["']([^"']+)["']/i);
                if (matchB) urlBackFinal = matchB[1];
            } else {
                urlBackFinal = urlBackString;
            }
        }

        return { 
            urlFront: urlFrontFinal, urlBack: urlBackFinal, 
            valorNum: parseInt(valor), valorExibicao: numeroParaExtenso(parseInt(valor)), 
            moeda: moeda, era: era, serial: serialOriginal, chaveHistoria: chaveHistoria,
            tipo: tipoItem, status: statusAtual, isEstrang: isEstrang, qtd: qtd 
        };
    });

    const itensParaExibir = itensProcessados.filter(item => {
        let condicaoAba = item.tipo === abaAtivaAtual;
        let condicaoStatus = filtroStatusAtual === 'TODOS' ? true : item.status === filtroStatusAtual;
        return condicaoAba && condicaoStatus;
    });

    if (itensParaExibir.length === 0) {
        container.innerHTML = `<h3 style='color:#777; text-align:center; margin-top: 50px;'>Nenhuma correspondência encontrada.</h3>`;
        return;
    }

    const erasNacionais = ["CRUZEIRO", "CRUZADO", "CRUZADOS NOVOS", "CRUZEIRO REAL", "REAL"];
    const erasEstrangeiras = [...new Set(itensParaExibir.filter(n => n.isEstrang).map(n => n.era))].sort();
    const ordemEras = [...erasNacionais, ...erasEstrangeiras];
    
    ordemEras.forEach(era => {
        const itensDaEra = itensParaExibir.filter(n => n.era === era).sort((a,b) => a.valorNum - b.valorNum);
        if(itensDaEra.length === 0) return;
        
        const h = document.createElement('div'); h.className = 'section-header collapsed'; 
        
        if (erasEstrangeiras.includes(era)) h.innerText = `ALA INTERNACIONAL - ${era}`; 
        else if (era === "CRUZADOS NOVOS") h.innerText = "ALA DOS CRUZADOS NOVOS";
        else if (era === "CRUZEIRO REAL") h.innerText = "ALA DOS CRUZEIROS REAIS";
        else if (era === "REAL") h.innerText = "ALA DO REAL"; 
        else h.innerText = `ALA DOS ${era}S`;
        
        const grid = document.createElement('div'); grid.className = 'gallery-grid collapsed'; 
        
        h.onclick = () => { h.classList.toggle('collapsed'); grid.classList.toggle('collapsed'); };
        container.appendChild(h);
        
        itensDaEra.forEach(n => {
            notasGlobais.push(n);
            const currentIndex = notasGlobais.length - 1;
            
            let classeCarimbo = n.status === "ACERVO" ? "stamp-acervo" : "stamp-troca";
            let textoCarimbo = n.status === "ACERVO" ? "ACERVO" : "P/ TROCA";
            let badgeQtd = (n.qtd > 1 && n.tipo === "MOEDAS") ? `<div class="qtd-badge">${n.qtd} UNID.</div>` : '';

            const card = document.createElement('div'); card.className = 'note-card';
            
            card.innerHTML = `
                <div class="img-wrapper">
                    <div class="stamp-overlay ${classeCarimbo}"><b>${textoCarimbo}</b></div>
                    ${badgeQtd}
                    <img src="${n.urlFront}" loading="lazy" 
                         onload="this.classList.add('loaded'); this.parentElement.classList.add('is-loaded');"
                         onerror="this.onerror=null; this.style.display='none'; this.parentElement.classList.add('is-error');">
                </div>
                <div class="card-info">
                    <b>${n.valorExibicao} ${n.moeda}</b>
                    <span>DETALHES: ${n.serial}</span>
                </div>
            `;
            card.onclick = () => abrirModalInterativo(currentIndex);
            grid.appendChild(card);
        });
        
        container.appendChild(grid);
    });
}

// ==========================================
// MODAL E INTERAÇÕES
// ==========================================
function abrirModalInterativo(index) {
    notaAtualIndex = index; const n = notasGlobais[index];

    const imgF = document.getElementById('imgFront');
    const imgB = document.getElementById('imgBack');

    imgF.classList.remove('loaded');
    imgF.parentElement.classList.remove('is-loaded', 'is-error');
    imgF.style.display = 'block';
    
    imgF.src = n.urlFront;
    imgF.onload = function() { this.classList.add('loaded'); this.parentElement.classList.add('is-loaded'); };
    imgF.onerror = function() { this.style.display='none'; this.parentElement.classList.add('is-error'); };

    imgB.classList.remove('loaded');
    imgB.parentElement.classList.remove('is-loaded', 'is-error');
    imgB.style.display = 'block';
    
    imgB.src = n.urlBack || n.urlFront; 
    imgB.onload = function() { this.classList.add('loaded'); this.parentElement.classList.add('is-loaded'); };
    imgB.onerror = function() { this.style.display='none'; this.parentElement.classList.add('is-error'); };

    document.getElementById('infoTitle').innerText = `${n.valorExibicao} ${n.moeda}`;
    document.getElementById('specValor').innerText = `${n.valorNum} ${n.moeda}`;
    document.getElementById('specSerial').innerText = n.serial;

    const badgeStatus = document.getElementById('modalStatusBadge');
    const waContainer = document.getElementById('wa-btn-container');
    const waBtn = document.getElementById('wa-btn');
    let qtdTextoModal = (n.qtd > 1 && n.tipo === "MOEDAS") ? `<span style="background:var(--gold); color:white; padding:3px 8px; border-radius:12px; font-size:12px; margin-left:10px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${n.qtd} UNID.</span>` : '';

    if (n.status === "ACERVO") {
        badgeStatus.innerHTML = `<b style='color: #dc3545; margin:0;'>ACERVO PESSOAL</b> ${qtdTextoModal}`;
        badgeStatus.style.borderColor = "#dc3545";
        if (waContainer) waContainer.style.display = "none";
    } else {
        badgeStatus.innerHTML = `<b style='color: #28a745; margin:0;'>P/ TROCA</b> ${qtdTextoModal}`;
        badgeStatus.style.borderColor = "#28a745";
        if (waContainer) waContainer.style.display = "block";
        const numeroWhatsApp = "5511999999999"; 
        let textoQtdWa = (n.qtd > 1 && n.tipo === "MOEDAS") ? ` (Vi que você tem ${n.qtd} unidades disponíveis)` : '';
        const mensagem = encodeURIComponent(`Olá Richard! Vi no seu Acervo Digital o item de ${n.valorExibicao} ${n.moeda} (${n.isEstrang ? n.era : 'Detalhes: '+n.serial}) e tenho interesse em negociar uma troca!${textoQtdWa}`);
        if (waBtn) waBtn.href = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
    }

    let dadosHist = typeof bancoHistorico !== 'undefined' ? bancoHistorico[n.chaveHistoria] : null;
    if (!dadosHist && n.chaveHistoria.endsWith('S')) dadosHist = bancoHistorico[n.chaveHistoria.slice(0, -1)];
    
    if (!dadosHist) {
        if (n.isEstrang) dadosHist = bancoHistorico["DEFAULT_ESTRANGEIRA"];
        else if (n.era === "REAL") dadosHist = bancoHistorico["DEFAULT_REAL"];
        else if (n.era === "CRUZEIRO REAL") dadosHist = bancoHistorico["DEFAULT_CRUZEIRO_REAL"];
        else if (n.era === "CRUZADO" || n.era === "CRUZADOS NOVOS") dadosHist = bancoHistorico["DEFAULT_CRUZADO"];
        else dadosHist = bancoHistorico["DEFAULT_CRUZEIRO"];
    }
    
    document.getElementById('infoDesc').innerText = dadosHist ? dadosHist.hist : "Descrição indisponível.";
    document.getElementById('infoCuriosity').innerText = dadosHist ? dadosHist.cur : "";

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
// CONTROLE DO SUPER ZOOM 
// ==========================================
function abrirSuperZoom(src_ignorado) {
    const estaVirado = document.getElementById('flipper').classList.contains('flipped');
    const n = notasGlobais[notaAtualIndex];
    
    const srcCorreto = (estaVirado && n.urlBack) ? n.urlBack : n.urlFront;

    document.getElementById('zoomImg').src = srcCorreto; 
    escalaZoom = 1; 
    document.getElementById('zoomImg').style.transform = `scale(1)`;
    document.getElementById('superZoom').classList.add('open');
}

function controlarScrollZoom(e) {
    e.preventDefault();
    escalaZoom = e.deltaY < 0 ? Math.min(4, escalaZoom + 0.2) : Math.max(1, escalaZoom - 0.2);
    document.getElementById('zoomImg').style.transform = `scale(${escalaZoom})`;
}

function atualizarPosicaoZoom(e) {
    const i = e.target; i.style.transformOrigin = `${(e.offsetX/i.offsetWidth)*100}% ${(e.offsetY/i.offsetHeight)*100}%`;
}

function fecharModal(id) { document.getElementById(id).classList.remove('open'); if(id === 'modalInterativo') document.body.style.overflow = ''; }
function fecharTudo() { fecharModal('superZoom'); fecharModal('modalInterativo'); document.getElementById('flipper').classList.remove('flipped'); }

document.addEventListener('keydown', (e) => {
    if(e.key === "Escape") {
        if(document.getElementById('superZoom').classList.contains('open')) fecharModal('superZoom');
        else fecharTudo();
    }
    if(!document.getElementById('superZoom').classList.contains('open') && document.getElementById('modalInterativo').classList.contains('open')) {
        if(e.key === "ArrowLeft") navegar(-1);
        if(e.key === "ArrowRight") navegar(1);
    }
});

window.onload = () => {
    injetarBotoesFlutuantes();
    mudarFiltro('TODOS');
};