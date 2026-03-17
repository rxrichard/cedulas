let escalaZoom = 1;
let notasGlobais = [];
let notaAtualIndex = 0;
let abaAtivaAtual = 'CEDULAS'; 
let filtroStatusAtual = 'TODOS'; 

// ==========================================
// FUNÇÕES DE NAVEGAÇÃO
// ==========================================
function mudarAba(tipo) {
    abaAtivaAtual = tipo;
    document.getElementById('tab-cedulas').classList.remove('active');
    document.getElementById('tab-moedas').classList.remove('active');
    
    if(tipo === 'CEDULAS') document.getElementById('tab-cedulas').classList.add('active');
    else document.getElementById('tab-moedas').classList.add('active');
    montarGaleria();
}

function mudarFiltro(status) {
    filtroStatusAtual = status;
    document.getElementById('filter-todos').classList.remove('active');
    document.getElementById('filter-troca').classList.remove('active');
    document.getElementById('filter-acervo').classList.remove('active');
    
    if(status === 'TODOS') document.getElementById('filter-todos').classList.add('active');
    else if(status === 'TROCA') document.getElementById('filter-troca').classList.add('active');
    else if(status === 'ACERVO') document.getElementById('filter-acervo').classList.add('active');
    montarGaleria();
}

// ==========================================
// CONSTRUTOR DA GALERIA
// ==========================================
function montarGaleria() {
    const container = document.getElementById('main-container');
    container.innerHTML = ''; 
    notasGlobais = []; 
    
    if (typeof listaDeArquivosUrl === 'undefined' || listaDeArquivosUrl.length === 0) {
        container.innerHTML = "<h3 style='color:red; text-align:center;'>Nenhuma imagem encontrada.</h3>";
        return;
    }

    const itensProcessados = listaDeArquivosUrl.filter(item => item.includes('-FRONT')).map(item => {
        let statusAtual = "TROCA"; 
        let qtd = 1; 
        let url = item;
        let detalheManual = "";

        if (item.includes('|')) {
            let partes = item.split('|');
            let configText = partes[0].trim().toUpperCase(); 
            
            if (configText.includes('-')) {
                let configPartes = configText.split('-');
                statusAtual = configPartes[0].trim();
                qtd = parseInt(configPartes[1].trim()) || 1;
            } else {
                statusAtual = configText;
            }

            if (partes.length >= 3) {
                detalheManual = partes[1].trim();
                url = partes[2].trim();
            } else {
                url = partes[1].trim(); 
            }
        }

        const filename = url.substring(url.lastIndexOf('/') + 1);
        let baseFilename = filename.split('-FRONT')[0]; 
        
        let valor = baseFilename.split('-')[0];
        let moeda = "CRUZEIROS"; 
        let era = "CRUZEIRO";
        let chaveHistoria = "";
        let isEstrang = false;
        
        let tipoItem = baseFilename.includes("-MOEDA-") ? "MOEDAS" : "CEDULAS";
        let serialOriginal = baseFilename;

        if (baseFilename.includes("-ESTRANGEIRA-")) {
            isEstrang = true;
            let partes = baseFilename.split('-ESTRANGEIRA-'); 
            let partesEsq = partes[0].split('-'); 
            moeda = partesEsq[1]; 

            let partesDir = partes[1].split('-'); 
            era = partesDir[0].toUpperCase().replace(/_/g, ' '); 
            chaveHistoria = `${valor}-${moeda}-${era.replace(/ /g, '_')}`; 
            
            let prefixoLimpo = `${partes[0]}-ESTRANGEIRA-${partesDir[0]}-`;
            serialOriginal = baseFilename.replace(prefixoLimpo, '');
            if (!serialOriginal || serialOriginal === baseFilename) serialOriginal = "S/N";

        } 
        else if (baseFilename.includes("CRUZEIROS-REAIS") || baseFilename.includes("CRUZEIRO-REAL")) {
            moeda = baseFilename.includes("CRUZEIROS") ? "CRUZEIROS REAIS" : "CRUZEIRO REAL"; 
            era = "CRUZEIRO REAL"; 
            chaveHistoria = `${valor}-${moeda.replace(' ', '-')}`;
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

        // CORREÇÃO: JUNTA A SÉRIE DO LINK COM O ANO/TEXTO MANUAL
        if (detalheManual !== "") {
            if (serialOriginal !== "" && serialOriginal !== "S/N") {
                serialOriginal = `${serialOriginal} / ${detalheManual}`;
            } else {
                serialOriginal = detalheManual;
            }
        }

        let itemBackFound = listaDeArquivosUrl.find(u => u.includes(baseFilename + '-BACK'));
        let urlBackFound = itemBackFound;
        if (itemBackFound && itemBackFound.includes('|')) {
            let partesVerso = itemBackFound.split('|');
            urlBackFound = partesVerso[partesVerso.length - 1].trim();
        }

        return { 
            urlFront: url, 
            urlBack: urlBackFound, 
            valorNum: parseInt(valor), 
            valorExibicao: valor, 
            moeda: moeda, 
            era: era, 
            serial: serialOriginal, 
            chaveHistoria: chaveHistoria,
            tipo: tipoItem,
            status: statusAtual,
            isEstrang: isEstrang,
            qtd: qtd 
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

    const erasNacionais = ["CRUZEIRO", "CRUZADO", "CRUZADOS NOVOS", "CRUZEIRO REAL"];
    const erasEstrangeiras = [...new Set(itensParaExibir.filter(n => n.isEstrang).map(n => n.era))].sort();
    const ordemEras = [...erasNacionais, ...erasEstrangeiras];
    
    ordemEras.forEach(era => {
        const itensDaEra = itensParaExibir.filter(n => n.era === era).sort((a,b) => a.valorNum - b.valorNum);
        if(itensDaEra.length === 0) return;
        
        const h = document.createElement('div'); 
        h.className = 'section-header collapsed'; 
        
        let isEstaEraEstrangeira = erasEstrangeiras.includes(era);
        if (isEstaEraEstrangeira) {
            h.innerText = `ALA INTERNACIONAL - ${era}`; 
        } else if (era === "CRUZADOS NOVOS") {
            h.innerText = "ALA DOS CRUZADOS NOVOS";
        } else if (era === "CRUZEIRO REAL") {
            h.innerText = "ALA DOS CRUZEIROS REAIS";
        } else {
            h.innerText = `ALA DOS ${era}S`;
        }
        
        const grid = document.createElement('div'); 
        grid.className = 'gallery-grid collapsed'; 
        
        h.onclick = () => {
            h.classList.toggle('collapsed');
            grid.classList.toggle('collapsed');
        };

        container.appendChild(h);
        
        itensDaEra.forEach(n => {
            notasGlobais.push(n);
            const currentIndex = notasGlobais.length - 1;
            
            let classeCarimbo = n.status === "ACERVO" ? "stamp-acervo" : "stamp-troca";
            let textoCarimbo = n.status === "ACERVO" ? "ACERVO PESSOAL" : "P/ TROCA";

            let badgeQtd = n.qtd > 1 ? `<div class="qtd-badge">${n.qtd} UNID.</div>` : '';

            const card = document.createElement('div'); card.className = 'note-card';
            
            card.innerHTML = `
                <div class="img-wrapper">
                    <div class="stamp-overlay ${classeCarimbo}">${textoCarimbo}</div>
                    ${badgeQtd}
                    <img src="${n.urlFront}" loading="lazy" onload="this.classList.add('loaded')">
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
    notaAtualIndex = index;
    const n = notasGlobais[index];

    document.getElementById('imgFront').src = n.urlFront;
    document.getElementById('imgBack').src = n.urlBack || n.urlFront; 

    document.getElementById('infoTitle').innerText = `${n.valorExibicao} ${n.moeda}`;
    document.getElementById('specValor').innerText = `${n.valorExibicao} ${n.moeda}`;
    document.getElementById('specSerial').innerText = n.serial;

    const badgeStatus = document.getElementById('modalStatusBadge');
    const waContainer = document.getElementById('wa-btn-container');
    const waBtn = document.getElementById('wa-btn');

    let qtdTextoModal = n.qtd > 1 ? `<span style="background:var(--gold); color:white; padding:3px 8px; border-radius:12px; font-size:12px; margin-left:10px; box-shadow:0 2px 4px rgba(0,0,0,0.2);">${n.qtd} UNID.</span>` : '';

    if (n.status === "TROCA") {
        badgeStatus.innerHTML = `<b style='color: #28a745; margin:0;'>P/ TROCA</b> ${qtdTextoModal}`;
        badgeStatus.style.borderColor = "#28a745";
        
        if (waContainer) waContainer.style.display = "block";
        const numeroWhatsApp = "5511999999999"; 
        
        let textoQtdWa = n.qtd > 1 ? ` (Vi que você tem ${n.qtd} unidades disponíveis)` : '';
        const mensagem = encodeURIComponent(`Olá Richard! Vi no seu Acervo Digital o item de ${n.valorExibicao} ${n.moeda} (${n.isEstrang ? n.era : 'Detalhes: '+n.serial}) e tenho interesse em negociar uma troca!${textoQtdWa}`);
        if (waBtn) waBtn.href = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
    } else {
        badgeStatus.innerHTML = `<b style='color: #dc3545; margin:0;'>ACERVO PESSOAL</b> ${qtdTextoModal}`;
        badgeStatus.style.borderColor = "#dc3545";
        if (waContainer) waContainer.style.display = "none";
    }

    let dadosHist = typeof bancoHistorico !== 'undefined' ? bancoHistorico[n.chaveHistoria] : null;
    if (!dadosHist && n.chaveHistoria.endsWith('S')) dadosHist = bancoHistorico[n.chaveHistoria.slice(0, -1)];
    
    if (!dadosHist) {
        if (n.isEstrang) dadosHist = bancoHistorico["DEFAULT_ESTRANGEIRA"];
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

function abrirSuperZoom(src) {
    document.getElementById('zoomImg').src = src; escalaZoom = 1; 
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
    mudarFiltro('TODOS');
};