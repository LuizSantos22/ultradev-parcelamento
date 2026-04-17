/**
 * UltraDev_Parcelamento
 * Recalcula parcela e valor à vista sempre que o preço do produto muda
 * (seleção de variante, atualização por AJAX, etc.)
 */
document.observe('dom:loaded', function () {

    var MAX_EL    = $('ud-config-max');
    var DESC_EL   = $('ud-config-desc');
    var TABELA_EL = $('ud-config-tabela');

    // Bloco não está na página (módulo desabilitado ou fora de product view)
    if (!MAX_EL || !DESC_EL || !TABELA_EL) { return; }

    var maxP   = parseInt(MAX_EL.value, 10)   || 1;
    var descP  = parseFloat(DESC_EL.value)    || 0;
    var tabela = [];

    try { tabela = JSON.parse(TABELA_EL.value || '[]'); } catch (e) {}

    var formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    });

    // ------------------------------------------------------------------
    // Lê o preço final atual da página (compatível com o tema Ultimo)
    // ------------------------------------------------------------------
    function lerPreco() {
        // Prioridade: data-price-amount (mais preciso no Ultimo com variantes)
        var candidates = $$('.product-shop .special-price .price',
                            '.product-shop .regular-price .price',
                            '.product-shop .price');

        var el = candidates.find(function (e) { return e.visible(); });
        if (!el) { return 0; }

        var dataPrice = el.getAttribute('data-price-amount');
        if (dataPrice && parseFloat(dataPrice) > 0) {
            return parseFloat(dataPrice);
        }

        // Fallback: texto formatado em BRL (ex: "R$ 1.299,90")
        var txt   = (el.innerText || el.textContent || '').trim();
        var limpo = txt.replace(/[^\d,]/g, '').replace(',', '.');
        return parseFloat(limpo) || 0;
    }

    // ------------------------------------------------------------------
    // Busca o juro configurado para uma quantidade de parcelas
    // ------------------------------------------------------------------
    function getJuro(parcelas) {
        for (var i = 0; i < tabela.length; i++) {
            if (parseInt(tabela[i].parcela, 10) === parcelas) {
                return parseFloat(tabela[i].juros) || 0;
            }
        }
        return 0;
    }

    // ------------------------------------------------------------------
    // Recalcula e atualiza o DOM
    // ------------------------------------------------------------------
    function atualizar() {
        var preco = lerPreco();
        if (!preco || preco <= 0) { return; }

        var juro         = getJuro(maxP);
        var totalJuros   = preco * (1 + (juro / 100));
        var valorParcela = totalJuros / maxP;
        var valorAvista  = preco - (preco * (descP / 100));

        var elParcela = $('ud-valor-parcela');
        var elAvista  = $('ud-valor-avista');

        if (elParcela) { elParcela.innerHTML = formatter.format(valorParcela); }
        if (elAvista)  { elAvista.innerHTML  = formatter.format(valorAvista);  }
    }

    // ------------------------------------------------------------------
    // Disparo inicial (aguarda o Ultimo terminar de montar o preço)
    // ------------------------------------------------------------------
    setTimeout(atualizar, 800);

    // ------------------------------------------------------------------
    // MutationObserver — reage a troca de preço por AJAX / variante
    // ------------------------------------------------------------------
    var priceBox = $$('.product-shop .price-info')[0]
                || $$('.product-shop .price-box')[0];

    if (priceBox) {
        new MutationObserver(function () {
            setTimeout(atualizar, 250);
        }).observe(priceBox, {
            childList: true, characterData: true, subtree: true, attributes: true
        });
    }

    // ------------------------------------------------------------------
    // Hook de segurança para selects e radios de variantes
    // ------------------------------------------------------------------
    $$('.product-shop select', '.product-shop input[type="radio"]').each(function (el) {
        el.observe('change', function () { setTimeout(atualizar, 600); });
    });
});
