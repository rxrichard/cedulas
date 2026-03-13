let escalaZoom = 1;
let notasGlobais = [];
let notaAtualIndex = 0;
let abaAtivaAtual = 'CEDULAS'; 
let filtroStatusAtual = 'TODOS'; // NOVO: Variável do filtro

// ==========================================
// FUNÇÕES DE NAVEGAÇÃO DE ABAS E FILTROS
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
        container.innerHTML = "<h3 style='color:red; text-align:center;'>Nenhuma imagem encontrada no arquivo lista-imagens.js.</h3>";
        return;
    }

    // 1. Processa todos os links da lista
    const itensProcessados = listaDeArquivosUrl.filter(item => item.includes('-FRONT.jpg')).map(item => {
        let statusAtual = "TROCA"; // Padrão
        let url = item;

        if (item.includes('|')) {
            let partes = item.split('|');
            statusAtual = partes[0].trim().toUpperCase(); 
            url = partes[1].trim(); 
        }

        const filename = url.substring(url.lastIndexOf('/') + 1);
        let valor = filename.split('-')[0];
        let moeda = "CRUZEIROS"; 
        let era = "CRUZEIRO";
        let chaveHistoria = "";
        
        let tipoItem = filename.includes("-MOEDA-") ? "MOEDAS" : "CEDULAS";
        
        if (filename.includes("CRUZADOS-NOVOS")) {
            moeda = "CRUZADOS NOVOS"; era = "CRUZADOS NOVOS"; chaveHistoria = `${valor}-CRUZADOS-NOVOS`;
        } else if (filename.includes("CRUZADOS")) {
            moeda = "CRUZADOS"; era = "CRUZADO"; chaveHistoria = `${valor}-CRUZADOS`;
        } else if (filename.includes("CRUZEIRO")) {
            moeda = filename.includes("CRUZEIROS") ? "CRUZEIROS" : "CRUZEIRO"; era = "CRUZEIRO"; chaveHistoria = `${valor}-CRUZEIRO${filename.includes("CRUZEIROS") ? 'S' : ''}`;
        }

        let prefixoLimpo = `${valor}-${moeda.replace(' ', '-')}-`;
        if(filename.includes('CRUZEIROS-A')) prefixoLimpo = `${valor}-CRUZEIROS-`;
        if(filename.includes('CRUZEIRO-B')) prefixoLimpo = `${valor}-CRUZEIRO-`;
        if(tipoItem === "MOEDAS") prefixoLimpo = `${valor}-${moeda.replace(' ', '-')}-MOEDA-`; 
        
        let serialOriginal = filename.replace(prefixoLimpo, '').replace('-FRONT.jpg', '');

        const filenameBackExpected = filename.replace('-FRONT.jpg', '-BACK.jpg');
        let itemBackFound = listaDeArquivosUrl.find(u => u.includes(filenameBackExpected));
        let urlBackFound = itemBackFound;
        if (itemBackFound && itemBackFound.includes('|')) {
            urlBackFound = itemBackFound.split('|')[1].trim();
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
            status: statusAtual
        };
    });

    // 2. FILTRO DUPLO (Aba selecionada + Status de Troca/Acervo)
    const itensParaExibir = itensProcessados.filter(item => {
        let condicaoAba = item.tipo === abaAtivaAtual;
        let condicaoStatus = filtroStatusAtual === 'TODOS' ? true : item.status === filtroStatusAtual;
        return condicaoAba && condicaoStatus;
    });

    if (itensParaExibir.length === 0) {
        let textoAviso = filtroStatusAtual === 'TODOS' ? abaAtivaAtual.toLowerCase() : `notas de ${filtroStatusAtual.toLowerCase()}`;
        container.innerHTML = `<h3 style='color:#777; text-align:center; margin-top: 50px;'>Nenhuma correspondência encontrada para essa categoria.</h3>`;
        return;
    }

    const ordemEras = ["CRUZEIRO", "CRUZADO", "CRUZADOS NOVOS"];
    
    // No final da função montarGaleria, dentro do ordemEras.forEach...
    ordemEras.forEach(era => {
        const itensDaEra = itensParaExibir.filter(n => n.era === era).sort((a,b) => a.valorNum - b.valorNum);
        if(itensDaEra.length === 0) return;
        
        // Criação do Cabeçalho
        const h = document.createElement('div'); 
        h.className = 'section-header'; 
        
        let nomeExibicaoEra = (era === "CRUZADOS NOVOS") ? "CRUZADOS NOVOS" : era + "S";
        h.innerText = `ALA DOS ${nomeExibicaoEra}`; 
        
        // Criação do Grid
        const grid = document.createElement('div'); 
        grid.className = 'gallery-grid';
        
        // Lógica de recolher ao clicar
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

            const card = document.createElement('div'); 
            card.className = 'note-card';
            card.innerHTML = `
                <div class="img-wrapper">
                    <div class="stamp-overlay ${classeCarimbo}">${textoCarimbo}</div>
                    <img src="${n.urlFront}" loading="lazy" onload="this.classList.add('loaded')">
                </div>
                <div class="card-info">
                    <b>${n.valorExibicao} ${n.moeda}</b>
                    <span>SÉRIE/ANO: ${n.serial}</span>
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

    if (n.status === "TROCA") {
        badgeStatus.innerHTML = "<b style='color: #28a745; margin:0;'>P/ TROCA</b>";
        badgeStatus.style.borderColor = "#28a745";
        
        if (waContainer) waContainer.style.display = "block";
        const numeroWhatsApp = "5511999999999"; // <-- COLOQUE SEU NÚMERO AQUI
        const mensagem = encodeURIComponent(`Olá Richard! Vi no seu Acervo Digital a cédula de ${n.valorExibicao} ${n.moeda} (Série: ${n.serial}) e tenho interesse em negociar uma troca!`);
        if (waBtn) waBtn.href = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
    } else {
        badgeStatus.innerHTML = "<b style='color: #dc3545; margin:0;'>ACERVO PESSOAL</b>";
        badgeStatus.style.borderColor = "#dc3545";
        
        if (waContainer) waContainer.style.display = "none";
    }

    let dadosHist = typeof bancoHistorico !== 'undefined' ? bancoHistorico[n.chaveHistoria] : null;
    if (!dadosHist && n.chaveHistoria.endsWith('S')) dadosHist = bancoHistorico[n.chaveHistoria.slice(0, -1)];
    if (!dadosHist) dadosHist = (n.era === "CRUZADO" || n.era === "CRUZADOS NOVOS") ? bancoHistorico["DEFAULT_CRUZADO"] : bancoHistorico["DEFAULT_CRUZEIRO"];
    
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

// Inicia com a Aba Cédulas e o Filtro Todos
window.onload = () => {
    mudarFiltro('TODOS');
};