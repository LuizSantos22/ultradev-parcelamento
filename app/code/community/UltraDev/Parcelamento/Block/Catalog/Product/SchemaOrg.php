<?php
/**
 * UltraDev_Parcelamento — Schema.org (JSON-LD)
 *
 * Injeta structured data no <head> com o menor preço disponível
 * (Pix ou Boleto) para indexação correta pelos motores de busca.
 * Pode ser desativado em: Admin > UltraDev Parcelamento > SEO > Ativar Schema.org
 */
class UltraDev_Parcelamento_Block_Catalog_Product_SchemaOrg extends Mage_Core_Block_Abstract
{
    protected function _toHtml()
    {
        $helper = Mage::helper('ultradev_parcelamento');

        // Verifica se Schema.org está habilitado no backend
        if (!Mage::getStoreConfigFlag('ultradev_parcelamento/seo/schema_org_enabled')) {
            return '';
        }

        $product = Mage::registry('current_product');
        if (!$product || !$helper->hasAnyPaymentMethod()) {
            return '';
        }

        $basePrice = $product->getFinalPrice();
        $prices    = [];

        if ($helper->isPixEnabled()) {
            $prices[] = $helper->calcPixPrice($basePrice);
        }
        if ($helper->isBoletoEnabled()) {
            $prices[] = $helper->calcBoletoPrice($basePrice);
        }

        $lowestPrice = !empty($prices) ? min($prices) : $basePrice;

        $data = [
            '@context' => 'https://schema.org',
            '@type'    => 'Product',
            'name'     => $product->getName(),
            'offers'   => [
                '@type'         => 'Offer',
                'price'         => number_format($lowestPrice, 2, '.', ''),
                'priceCurrency' => 'BRL',
                'availability'  => $product->isSalable()
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                'url'           => $product->getProductUrl(),
            ],
        ];

        return '<script type="application/ld+json">'
            . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            . '</script>';
    }
}
