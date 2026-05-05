/**
 * UltraDev_Parcelamento
 */
;(function () {
    'use strict';

    function $(id) { return document.getElementById(id); }
    function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
    function addClass(el, cls) { if (el && !el.classList.contains(cls)) el.classList.add(cls); }
    function removeClass(el, cls) { if (el) el.classList.remove(cls); }
    function isMobile() { return window.innerWidth < 768; }

    var formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency', currency: 'BRL', minimumFractionDigits: 2
    });

    var _maxP   = 1;
    var _descP  = 0;
    var _tabela = [];

    function lerConfig() {
        var maxEl    = $('ud-config-max');
        var descEl   = $('ud-config-desc');
        var tabelaEl = $('ud-config-tabela');
        if (!maxEl || !descEl || !tabelaEl) { return false; }

        _maxP  = parseInt(maxEl.value, 10)  || 1;
        _descP = parseFloat(descEl.value)   || 0;

        try {
            var parsed = JSON.parse(tabelaEl.value || '[]');
            _tabela = Array.isArray(parsed)
                ? parsed
                : Object.keys(parsed).map(function (k) { return parsed[k]; });
        } catch (e) { _tabela = []; }

        return true;
    }

    function getJuro(parcelas) {
        for (var i = 0; i < _tabela.length; i++) {
            if (parseInt(_tabela[i].parcela, 10) === parcelas) {
                return parseFloat(_tabela[i].juros) || 0;
            }
        }
        return 0;
    }

    function lerPreco() {
        var candidates = $$(
            '.product-shop .special-price .price,' +
            '.product-shop .regular-price .price,' +
            '.product-shop .price'
        );
        candidates = candidates.filter(function(e) {
            return !e.closest('.old-price');
        });
        var el = null;
        for (var i = 0; i < candidates.length; i++) {
            if (candidates[i].offsetParent !== null) { el = candidates[i]; break; }
        }
        if (!el) { return 0; }

        var dataPrice = el.getAttribute('data-price-amount');
        if (dataPrice && parseFloat(dataPrice) > 0) { return parseFloat(dataPrice); }

        var txt   = (el.innerText || el.textContent || '').trim();
        var limpo = txt.replace(/[^\d,]/g, '').replace(',', '.');
        return parseFloat(limpo) || 0;
    }

    // =========================================================================
    // WIDGET INLINE — FIX: inclui "Nx de" no innerHTML
    // =========================================================================
    function initWidget() {
        if (!lerConfig()) { return; }

        function atualizar() {
            var preco = lerPreco();
            if (!preco || preco <= 0) { return; }

            var juro         = getJuro(_maxP);
            var totalJuros   = preco * (1 + (juro / 100));
            var valorParcela = totalJuros / _maxP;
            var valorAvista  = preco - (preco * (_descP / 100));

            var elParcela = $('ud-valor-parcela');
            var elAvista  = $('ud-valor-avista');

            // FIX: inclui o número de parcelas no texto
            if (elParcela) {
                elParcela.innerHTML = _maxP + 'x de ' + formatter.format(valorParcela);
            }
            if (elAvista) {
                elAvista.innerHTML = formatter.format(valorAvista);
            }
        }

        setTimeout(atualizar, 800);

        var priceBox = document.querySelector('.product-shop .price-info') ||
                       document.querySelector('.product-shop .price-box');

        if (priceBox && window.MutationObserver) {
            new MutationObserver(function () {
                setTimeout(atualizar, 250);
            }).observe(priceBox, {
                childList: true, characterData: true, subtree: true, attributes: true
            });
        }

        $$('.product-shop select, .product-shop input[type="radio"]').forEach(function (el) {
            el.addEventListener('change', function () { setTimeout(atualizar, 400); });
        });
    }

    // =========================================================================
    // TABELA DE PARCELAS NO MODAL
    // =========================================================================
    function renderTabelaParcelas() {
        var preco = lerPreco();
        if (!preco || preco <= 0 || _maxP <= 0) { return; }

        var modalPrice = $('ud-modal-product-price');
        if (modalPrice) { modalPrice.innerHTML = formatter.format(preco); }

        var pixDesc = parseFloat($('ud-config-pix-desc') ? $('ud-config-pix-desc').value : 0) || 0;
        var modalPixPrice = $('ud-modal-pix-price');
        if (modalPixPrice && pixDesc > 0) {
            modalPixPrice.innerHTML = formatter.format(preco * (1 - pixDesc / 100));
        }

        var boletoDesc = parseFloat($('ud-config-boleto-desc') ? $('ud-config-boleto-desc').value : 0) || 0;
        var modalBoletoPrice = $('ud-modal-boleto-price');
        if (modalBoletoPrice && boletoDesc > 0) {
            modalBoletoPrice.innerHTML = formatter.format(preco * (1 - boletoDesc / 100));
        }

        var rows = '';
        for (var n = 1; n <= _maxP; n++) {
            var juro    = getJuro(n);
            var total   = preco * (1 + (juro / 100));
            var parcela = total / n;
            var rowClass = (n % 2 === 0) ? 'ud-installment-row--even' : 'ud-installment-row--odd';
            var extra = (juro === 0)
                ? ' <span class="ud-widget__badge" style="font-size:10px;vertical-align:middle;">sem juros</span>'
                : ' <em>(' + juro.toFixed(2).replace('.', ',') + '%)</em>';

            rows += '<div class="ud-installment-row ' + rowClass + '">';
            rows += '<span class="ud-installment-row__label">' + n + 'x ' + formatter.format(parcela) + extra + '</span>';
            rows += '<span class="ud-installment-row__total">' + formatter.format(total) + '</span>';
            rows += '</div>';
        }

        $$('.ud-tabela-parcelas-body').forEach(function (el) { el.innerHTML = rows; });
    }

    // =========================================================================
    // MODAL — FIX: usa delegação via jQuery para evitar conflito com o form
    // =========================================================================
    var _activeTab = null;

    function initModal() {
        var overlay = $('ud-modal-overlay');
        if (!overlay) { return; }

        // Move overlay para o body — fora do <form>
        if (overlay.parentNode && overlay.parentNode.tagName !== 'BODY') {
            document.body.appendChild(overlay);
        }

        function abrirModal(e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            addClass(overlay, 'is-open');
            document.body.style.overflow = 'hidden';
            renderTabelaParcelas();

            if (!isMobile()) {
                var primeiroNav = overlay.querySelector('.ud-nav__item[data-tab]');
                if (primeiroNav) { ativarAba(primeiroNav.getAttribute('data-tab')); }
            } else {
                _activeTab = null;
                fecharTodasAbas();
            }
        }

        function fecharModal(e) {
            if (e) { e.preventDefault(); }
            removeClass(overlay, 'is-open');
            document.body.style.overflow = '';
        }

        // FIX: usa delegação no document — funciona mesmo se o elemento
        // for renderizado depois ou estiver dentro de um <form>
        document.addEventListener('click', function(e) {
            var target = e.target;
            // Sobe na árvore para pegar o link mesmo se clicou no texto dentro dele
            while (target && target !== document) {
                if (target.id === 'ud-open-modal') {
                    abrirModal(e);
                    return;
                }
                if (target.id === 'ud-close-modal') {
                    fecharModal(e);
                    return;
                }
                target = target.parentNode;
            }
        });

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) { fecharModal(); }
        });

        document.addEventListener('keydown', function (e) {
            if ((e.key === 'Escape' || e.keyCode === 27) && overlay.classList.contains('is-open')) {
                fecharModal();
            }
        });

        window.addEventListener('resize', function () {
            if (!overlay.classList.contains('is-open')) { return; }
            if (!isMobile() && !_activeTab) {
                var primeiroNav = overlay.querySelector('.ud-nav__item[data-tab]');
                if (primeiroNav) { ativarAba(primeiroNav.getAttribute('data-tab')); }
            }
        });
    }

    // =========================================================================
    // ABAS
    // =========================================================================
    function initAbas() {
        var overlay = $('ud-modal-overlay');
        if (!overlay) { return; }

        overlay.querySelectorAll('.ud-nav__item[data-tab]').forEach(function (item) {
            item.addEventListener('click', function () {
                var tab = this.getAttribute('data-tab');
                if (isMobile()) {
                    if (_activeTab === tab) {
                        fecharTodasAbas();
                        _activeTab = null;
                    } else {
                        ativarAba(tab);
                    }
                } else {
                    ativarAba(tab);
                }
            });
        });
    }

    function ativarAba(tab) {
        var overlay = $('ud-modal-overlay');
        if (!overlay) { return; }
        _activeTab = tab;

        overlay.querySelectorAll('.ud-nav__item[data-tab]').forEach(function (item) {
            if (item.getAttribute('data-tab') === tab) {
                addClass(item, 'is-active');
            } else {
                removeClass(item, 'is-active');
            }
        });

        if (!isMobile()) {
            overlay.querySelectorAll('.ud-tab-content[data-tab]').forEach(function (panel) {
                if (panel.getAttribute('data-tab') === tab) {
                    addClass(panel, 'is-active');
                } else {
                    removeClass(panel, 'is-active');
                }
            });
        } else {
            overlay.querySelectorAll('.ud-mobile-tab').forEach(function (div) {
                div.innerHTML = '';
            });

            var mobileDiv = overlay.querySelector('.ud-mobile-tab[data-tab="' + tab + '"]');
            var panel     = overlay.querySelector('.ud-tab-content[data-tab="' + tab + '"]');

            if (mobileDiv && panel) {
                var clone = panel.cloneNode(true);
                clone.style.display = 'block';
                mobileDiv.appendChild(clone);
            }
        }
    }

    function fecharTodasAbas() {
        var overlay = $('ud-modal-overlay');
        if (!overlay) { return; }

        overlay.querySelectorAll('.ud-nav__item[data-tab]').forEach(function (item) {
            removeClass(item, 'is-active');
        });
        overlay.querySelectorAll('.ud-mobile-tab').forEach(function (div) {
            div.innerHTML = '';
        });
        overlay.querySelectorAll('.ud-tab-content[data-tab]').forEach(function (panel) {
            removeClass(panel, 'is-active');
        });
    }

    // =========================================================================
    // INIT — FIX: usa tanto DOMContentLoaded quanto jQuery ready para garantir
    // =========================================================================
    function init() {
        lerConfig();
        initWidget();
        // Move o overlay pro body ANTES de initAbas para garantir que
        // os listeners das abas sejam bindados ao elemento na posição correta
        var overlay = document.getElementById('ud-modal-overlay');
        if (overlay && overlay.parentNode && overlay.parentNode.tagName !== 'BODY') {
            document.body.appendChild(overlay);
        }
        initModal();
        initAbas();
    }

    // Tenta com DOMContentLoaded nativo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM já pronto — mas aguarda jQuery estar disponível (Ultimo carrega jQuery no head)
        if (typeof jQuery !== 'undefined') {
            jQuery(init);
        } else {
            init();
        }
    }

}());
