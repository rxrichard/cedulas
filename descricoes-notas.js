// ARQUIVO: descricoes-notas.js

const bancoHistorico = {
    "1-CRUZEIRO": { 
        hist: "O Cruzeiro foi instituído em 1942 durante o governo de Getúlio Vargas, substituindo o antigo sistema do Réis que existia desde o período colonial. Essa mudança marcou uma modernização do sistema monetário brasileiro e simbolizou a tentativa de organizar a economia.", 
        cur: "Como o Brasil ainda não possuía tecnologia para a grande demanda inicial, as primeiras séries foram impressas no exterior (EUA e na empresa inglesa Thomas de La Rue)." 
    },

    "2-CRUZEIROS": { 
        hist: "Muito utilizada nas décadas de 1940 e 1950, essa cédula trazia homenagens a figuras importantes da história brasileira, como o Duque de Caxias. Era comum em transações cotidianas, representando um valor significativo na época.", 
        cur: "A nota era tão comum e exata que originou a gíria 'Caxias', usada na linguagem popular para definir uma pessoa rígida e pontual com suas obrigações." 
    },

    "5-CRUZEIROS": { 
        hist: "A nota de 5 Cruzeiros foi uma das mais populares do Brasil por muitos anos. Diversas séries homenagearam o Barão do Rio Branco, diplomata responsável pela consolidação das fronteiras brasileiras no início do século XX.", 
        cur: "O reverso de algumas de suas edições clássicas traz a gravura de um Indígena (Alegoria da Amazônia), considerada até hoje uma das artes mais belas da numismática nacional." 
    },

    "10-CRUZEIROS": { 
        hist: "A cédula de 10 Cruzeiros acompanhou um período de forte crescimento urbano e industrial no Brasil. Algumas séries traziam figuras como Getúlio Vargas ou Dom Pedro II, conectando o dinheiro à memória política do país.", 
        cur: "As mudanças de coloração (chancelas) e os medalhões intrincados eram as armas tecnológicas da época para ajudar os caixas de banco a identificarem falsificações." 
    },

    "20-CRUZEIROS": { 
        hist: "Esta cédula ficou marcada pela presença do Marechal Deodoro da Fonseca, líder militar responsável pela Proclamação da República em 1889. A nota ajudava a reforçar símbolos republicanos na identidade nacional.", 
        cur: "O reverso apresenta um trabalho artístico em calcografia (talho-doce), valorizando a arte nacional e marcando a transição do design 'francês' para os padrões geométricos modernos." 
    },

    "50-CRUZADOS": { 
        hist: "Lançada em 1986 com o Plano Cruzado, essa cédula marcou uma tentativa do governo de controlar a hiperinflação. A nota homenageava o poeta Carlos Drummond de Andrade, um dos maiores nomes da literatura brasileira.", 
        cur: "Um detalhe fascinante: o famoso poema 'Canção Amiga' aparece impresso no reverso da nota em microletras, servindo como uma inovação de segurança." 
    },

    "100-CRUZADOS": { 
        hist: "Essa cédula homenageava o presidente Juscelino Kubitschek, responsável pela construção de Brasília e pelo projeto desenvolvimentista conhecido como '50 anos em 5'.", 
        cur: "Pela pressa do congelamento de preços de 1986, as primeiras notas eram antigas cédulas de 100.000 cruzeiros adaptadas com um carimbo circular de '100 Cruzados'." 
    },

    "100-CRUZEIROS": { 
        hist: "Uma das cédulas mais tradicionais do Brasil. Em diferentes períodos homenageou Dom Pedro II, último imperador brasileiro, e também a escritora Cecília Meireles, grande nome da literatura nacional.", 
        cur: "Na versão da Cecília Meireles, o reverso é uma obra de arte que faz referências diretas ao seu 'Romanceiro da Inconfidência' e à sua contribuição à educação." 
    },

    "200-CRUZADOS": { 
        hist: "Parte da família do Plano Cruzado, essa nota apresentou um design mais moderno, com formas geométricas e cores fortes. A Efígie da República representava a personificação simbólica da nação brasileira.", 
        cur: "Esta cédula ajudou a romper a tradição de homenagear apenas figuras históricas humanas, abrindo espaço para a estética que inspirou as cédulas do Real." 
    },

    "200-CRUZEIROS": { 
        hist: "Algumas versões antigas dessa nota traziam a Princesa Isabel. Em séries posteriores dos anos 90, passou a estampar a Efígie da República. A curta vida dessa cédula reflete o período turbulento da economia.", 
        cur: "A clássica versão do Sesquicentenário da Independência é muito especial por trazer retratos duplos (D. Pedro I e Princesa Isabel), algo muito raro no padrão brasileiro." 
    },

    "500-CRUZADOS": { 
        hist: "Essa cédula homenageava o compositor Heitor Villa-Lobos, um dos maiores nomes da música clássica brasileira e responsável por integrar elementos do folclore nacional em composições eruditas.", 
        cur: "O verso da nota mostra Villa-Lobos regendo, rodeado por vitórias-régias e a floresta amazônica, simbolizando sua paixão pela musicalidade nativa do Brasil." 
    },

    "500-CRUZADOS-NOVOS": { 
        hist: "Emitida após a reforma monetária de 1989, que criou o Cruzado Novo e cortou três zeros da moeda anterior. A nota homenageia o biólogo e ambientalista Augusto Ruschi.", 
        cur: "Precursora estética do Real! O foco na fauna e flora (com ilustrações de orquídeas e beija-flores) agradou tanto que definiu o padrão visual das nossas moedas até hoje." 
    },

    "500-CRUZEIROS": { 
        hist: "Ao longo das décadas, essa cédula homenageou personalidades como Dom João VI e o escritor Machado de Assis. O valor frequentemente surgia em períodos de inflação crescente.", 
        cur: "A constante necessidade de reemitir cédulas de 500 ao longo de diferentes décadas é o maior registro físico dos implacáveis ciclos inflacionários do Brasil republicano." 
    },

    "1000-CRUZADOS": { 
        hist: "Essa cédula literária homenageava Machado de Assis, considerado um dos maiores escritores da língua portuguesa, trazendo um forte apelo à história do Rio de Janeiro Imperial.", 
        cur: "No verso da nota aparece o emblema da Academia Brasileira de Letras (instituição fundada pelo próprio autor em 1897) e uma gravura da Rua Primeiro de Março." 
    },

    "1000-CRUZEIROS": { 
        hist: "A nota de 1000 Cruzeiros destacou figuras importantes da diplomacia e da integração nacional, como o Barão do Rio Branco, Pedro Álvares Cabral e o Marechal Cândido Rondon.", 
        cur: "A nota antiga do Barão do Rio Branco foi tão popular que originou uma gíria viva até hoje: mil cruzeiros (e hoje mil reais) passaram a ser chamados de 'um barão'." 
    },

    "5000-CRUZADOS": { 
        hist: "Essa cédula demonstra a excelência artística da Casa da Moeda ao homenagear o pintor Candido Portinari, um dos artistas brasileiros mais reconhecidos internacionalmente.", 
        cur: "É uma verdadeira galeria de bolso. O reverso apresenta um esboço do painel 'Baú de Retalhos' e detalhes da sua monumental obra 'Tiradentes'." 
    },

    "5000-CRUZEIROS": { 
        hist: "Essa nota apresentou personagens históricos como Tiradentes nas séries clássicas e, durante a hiperinflação dos anos 90, o compositor Carlos Gomes, autor da ópera 'O Guarani'.", 
        cur: "Durante a hiperinflação, a versão do maestro circulava tão intensamente e perdia valor tão rápido que é muito comum encontrar esses exemplares severamente desgastados." 
    },

    "10000-CRUZADOS": { 
        hist: "Uma merecida homenagem à ciência. Estampa o genial infectologista Carlos Chagas, responsável pela descoberta da doença que hoje leva o seu nome.", 
        cur: "A nota é riquíssima em detalhes científicos: o reverso mostra Chagas em seu laboratório e a reprodução do ciclo de vida do parasita Trypanosoma cruzi." 
    },

    "10000-CRUZEIROS": { 
        hist: "Dando continuidade ao tema científico, trazia o médico Vital Brazil, fundador do Instituto Butantan e pioneiro na pesquisa de soros antiofídicos.", 
        cur: "O verso apresenta uma incrível e corajosa gravura: a cena detalhada da extração de peçonha de uma serpente, celebrando a ciência nacional." 
    },

    "50000-CRUZADOS": { 
        hist: "A cédula homenageava o historiador Luís da Câmara Cascudo, um dos maiores estudiosos da cultura popular brasileira, nascida em uma época de descontrole econômico acelerado.", 
        cur: "Sua vida útil como 'Cruzado' foi curtíssima. Poucos meses após seu lançamento, o governo mudou a moeda e ela passou a receber o carimbo de '50 Cruzados Novos'." 
    },

    "50000-CRUZEIROS": { 
        hist: "Com a volta do Cruzeiro nos anos 90, a cédula continuou trazendo Câmara Cascudo, reforçando o reconhecimento da importância do folclore na formação cultural brasileira.", 
        cur: "O reverso é uma explosão cultural: ilustra a vibrante cena tradicional do Bumba-meu-boi, valorizando as raízes do povo nordestino." 
    },

    "100000-CRUZEIROS": { 
        hist: "Conhecida como a famosa 'Nota do Beija-Flor', foi lançada em 1992 e simboliza o auge da perda do poder de compra da hiperinflação brasileira.", 
        cur: "Seu design 100% focado na fauna foi um 'teste' do Banco Central. O resultado foi tão positivo que a arte foi salva e reaproveitada na nossa famosa nota de 1 Real." 
    },

    "500000-CRUZEIROS": { 
        hist: "A cédula de maior valor nominal da história do Brasil! Homenageava o escritor modernista Mário de Andrade e circulou por pouquíssimos meses.", 
        cur: "É o símbolo máximo da hiperinflação. Pouco antes da estabilização pelo Plano Real (1994), ela foi convertida. Cortou-se praticamente a proporção de 2.750.000 cruzeiros para 1 real." 
    },

    "DEFAULT_CRUZEIRO": { 
        hist: "O Cruzeiro foi uma das moedas que mais acompanharam a história republicana brasileira, passando por diversas reformas monetárias ao longo do século XX.", 
        cur: "Durante sua longa existência, a Casa da Moeda do Brasil aprimorou significativamente as marcas d'água e a impressão em calcografia (talho-doce)." 
    },

    "DEFAULT_CRUZADO": { 
        hist: "O Cruzado foi criado em 1986 como a primeira grande tentativa moderna de combater a hiperinflação através do corte sistemático de zeros das antigas cédulas.", 
        cur: "Devido à urgência das reformas monetárias, muitas cédulas foram reaproveitadas e adaptadas com carimbos oficiais, criando uma era fascinante para a numismática." 
    },

    "1-WON-COREIA_DO_NORTE": { 
        hist: "Emitida em 1978, esta cédula de 1 Won da Coreia do Norte reflete a ideologia Juche de autossuficiência. O anverso destaca a união das classes sociais (soldado, trabalhador e camponesa) diante da arquitetura de Pyongyang.", 
        cur: "O reverso apresenta uma cena de guerrilha, reforçando a narrativa de resistência militar que é central na cultura política do país." 
    },

    "100-WON-COREIA_DO_NORTE": { 
        hist: "Esta é uma das notas mais emblemáticas da Coreia do Norte, estampando o rosto de Kim Il-sung, o 'Presidente Eterno'. Foi a principal unidade monetária do país durante grande parte da era da Guerra Fria.", 
        cur: "O reverso mostra a casa natal de Kim Il-sung em Mangyongdae, um local tratado como solo sagrado e destino de peregrinação obrigatória para os cidadãos norte-coreanos." 
    },

    "5-KWACHA-ZAMBIA": { 
        hist: "Emitida pela Zâmbia na década de 80, esta nota homenageia Kenneth Kaunda, o primeiro presidente e herói da independência do país. A moeda 'Kwacha' significa 'amanhecer' em várias línguas locais, simbolizando a liberdade.", 
        cur: "A nota é famosa entre colecionadores pela beleza da Águia-pescadora africana no anverso e pela imponente Barragem de Kariba no reverso, uma das maiores do mundo na época." 
    },
};