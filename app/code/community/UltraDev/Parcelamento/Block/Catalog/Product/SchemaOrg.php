<?php
class UltraDev_Parcelamento_Block_Catalog_Product_SchemaOrg extends Mage_Core_Block_Abstract
{
    protected function _toHtml()
    {
        $helper  = Mage::helper('ultradev_parcelamento');
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
