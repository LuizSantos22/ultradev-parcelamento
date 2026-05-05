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

    public function getFinalPrice(): float
    {
        return (float) $this->getProduct()->getFinalPrice();
    }

    // -------------------------------------------------------------------------
    // Cart達o
    // -------------------------------------------------------------------------

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

    public function getAllInstallmentRows(): array
    {
        return $this->getParcelamentoHelper()->getAllInstallmentRows($this->getFinalPrice());
    }

    public function formatCurrency(float $value): string
    {
        return Mage::helper('core')->currency($value, true, false);
    }

    // -------------------------------------------------------------------------
    // Pix
    // -------------------------------------------------------------------------

    public function isPixEnabled(): bool
    {
        return $this->getParcelamentoHelper()->isPixEnabled();
    }

    public function getPixDiscount(): float
    {
        return $this->getParcelamentoHelper()->getPixDiscount();
    }

    public function getFormattedPixPrice(): string
    {
        $value = $this->getParcelamentoHelper()->calcPixPrice($this->getFinalPrice());
        return Mage::helper('core')->currency($value, true, false);
    }

    // -------------------------------------------------------------------------
    // Boleto
    // -------------------------------------------------------------------------

    public function isBoletoEnabled(): bool
    {
        return $this->getParcelamentoHelper()->isBoletoEnabled();
    }

    public function getBoletoDiscount(): float
    {
        return $this->getParcelamentoHelper()->getBoletoDiscount();
    }

    public function getFormattedBoletoPrice(): string
    {
        $value = $this->getParcelamentoHelper()->calcBoletoPrice($this->getFinalPrice());
        return Mage::helper('core')->currency($value, true, false);
    }

    // -------------------------------------------------------------------------
    // Produto (para o modal)
    // -------------------------------------------------------------------------

    public function getProductName(): string
    {
        return $this->getProduct()->getName();
    }

    public function getProductImageUrl(): string
    {
        return (string) Mage::helper('catalog/image')->init($this->getProduct(), 'thumbnail')->resize(56);
    }

    public function getFormattedFinalPrice(): string
    {
        return Mage::helper('core')->currency($this->getFinalPrice(), true, false);
    }

    // -------------------------------------------------------------------------
    // Lifecycle
    // -------------------------------------------------------------------------

    /**
     * Ativa o handle de layout do custom price box se a config estiver habilitada.
     * Precisa rodar antes do _toHtml() para o setTemplate funcionar a tempo.
     */
    protected function _prepareLayout(): self
    {
        parent::_prepareLayout();

        if (Mage::getStoreConfigFlag('ultradev_parcelamento/custom_price/enabled')) {
            $this->getLayout()
                 ->getUpdate()
                 ->addHandle('ultradev_parcelamento_custom_price');
        }

        return $this;
    }

    protected function _toHtml(): string
    {
        $helper = $this->getParcelamentoHelper();

        if (!$helper->hasAnyPaymentMethod() || !$this->getProduct()) {
            return '';
        }

        return parent::_toHtml();
    }
}
