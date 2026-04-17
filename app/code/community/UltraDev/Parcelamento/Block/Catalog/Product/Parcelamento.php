<?php
/**
 * UltraDev_Parcelamento
 *
 * @category  UltraDev
 * @package   UltraDev_Parcelamento
 * @author    UltraDev <contato@ultradev.com.br>
 * @license   MIT
 */
class UltraDev_Parcelamento_Block_Catalog_Product_Parcelamento extends Mage_Core_Block_Template
{
    protected $_template = 'ultradev/parcelamento/product/parcelamento.phtml';

    public function getParcelamentoHelper(): UltraDev_Parcelamento_Helper_Data
    {
        return Mage::helper('ultradev_parcelamento');
    }

    public function getProduct(): ?Mage_Catalog_Model_Product
    {
        return Mage::registry('current_product');
    }

    public function isEnabled(): bool
    {
        return $this->getParcelamentoHelper()->isEnabled();
    }

    public function getMaxInstallments(): int
    {
        return $this->getParcelamentoHelper()->getMaxInstallments();
    }

    public function getCashDiscount(): float
    {
        return $this->getParcelamentoHelper()->getCashDiscount();
    }

    public function getFinalPrice(): float
    {
        return (float) $this->getProduct()->getFinalPrice();
    }

    public function getFormattedInstallmentValue(): string
    {
        $value = $this->getParcelamentoHelper()->calcInstallmentValue($this->getFinalPrice());
        return Mage::helper('core')->currency($value, true, false);
    }

    public function getFormattedCashPrice(): string
    {
        $value = $this->getParcelamentoHelper()->calcCashPrice($this->getFinalPrice());
        return Mage::helper('core')->currency($value, true, false);
    }

    public function getInterestTableJson(): string
    {
        return $this->getParcelamentoHelper()->getInterestTableJson();
    }

    protected function _toHtml(): string
    {
        if (!$this->isEnabled() || !$this->getProduct()) {
            return '';
        }
        return parent::_toHtml();
    }
}
