/**
 * UltraDev_Parcelamento
 *
 * Responsabilidades:
 *  1. Recalcular widget inline quando o preço do produto muda (variantes)
 *  2. Abrir / fechar o modal de formas de pagamento
 *  3. Gerenciar a navegação por abas (desktop) e accordion (mobile)
 */

;(function () {
    'use strict';

    // =========================================================================
    // 1. UTILITÁRIOS
    // =========================================================================

    function $(id) {
        return document.getElementById(id);
    }

    function $$(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
    }

    function addClass(el, cls) {
        if (el && !el.classList.contains(cls)) el.classList.add(cls);
    }

    function removeClass(el, cls) {
        if (el) el.classList.remove(cls);
    }

    function isMobile() {
        return window.innerWidth < 768;
    }

    var formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    });

    // =========================================================================
    // 2. WIDGET INLINE — recalculo ao mudar variante
    // =========================================================================

    function initWidget() {
        var maxEl    = $('ud-config-max');
        var descEl   = $('ud-config-desc');
        var tabelaEl = $('ud-config-tabela');

        // Bloco não está na página
        if (!maxEl || !descEl || !tabelaEl) { return; }

        var maxP   = parseInt(maxEl.value, 10)  || 1;
        var descP  = parseFloat(descEl.value)   || 0;
        var tabela = [];

        try { tabela = JSON.parse(tabelaEl.value || '[]'); } catch (e) {}

        // ------------------------------------------------------------------
        // Lê o preço final atual (compatível com o tema Ultimo)
        // ------------------------------------------------------------------
        function lerPreco() {
            var candidates = $$(
                '.product-shop .special-price .price,' +
                '.product-shop .regular-price .price,' +
                '.product-shop .price'
            );

            var el = null;
            for (var i = 0; i < candidates.length; i++) {
                if (candidates[i].offsetParent !== null) { el = candidates[i]; break; }
            }
            if (!el) { return 0; }

            var dataPrice = el.getAttribute('data-price-amount');
            if (dataPrice && parseFloat(dataPrice) > 0) {
                return parseFloat(dataPrice);
            }

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
        // Recalcula e atualiza o DOM do widget
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

        // Disparo inicial
        setTimeout(atualizar, 800);

        // MutationObserver — reage a troca de preço por AJAX / variante
        var priceBox = document.querySelector('.product-shop .price-info') ||
                       document.querySelector('.product-shop .price-box');

        if (priceBox && window.MutationObserver) {
            new MutationObserver(function () {
                setTimeout(atualizar, 250);
            }).observe(priceBox, {
                childList: true, characterData: true, subtree: true, attributes: true
            });
        }

        // Hook de segurança para selects e radios de variantes
        $$('.product-shop select, .product-shop input[type="radio"]').forEach(function (el) {
            el.addEventListener('chan
