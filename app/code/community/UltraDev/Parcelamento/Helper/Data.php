<?php
/**
 * UltraDev_Parcelamento
 *
 * @category  UltraDev
 * @package   UltraDev_Parcelamento
 * @author    UltraDev <contato@ultradev.com.br>
 * @license   MIT
 */
class UltraDev_Parcelamento_Helper_Data extends Mage_Core_Helper_Abstract
{
    // -------------------------------------------------------------------------
    // Config paths — Cartão
    // -------------------------------------------------------------------------
    const XML_PATH_ENABLED          = 'ultradev_parcelamento/general/enabled';
    const XML_PATH_MAX_INSTALLMENTS = 'ultradev_parcelamento/general/max_installments';
    const XML_PATH_CASH_DISCOUNT    = 'ultradev_parcelamento/general/cash_discount';
    const XML_PATH_INTEREST_TABLE   = 'ultradev_parcelamento/general/interest_table';

    // -------------------------------------------------------------------------
    // Config paths — Pix
    // -------------------------------------------------------------------------
    const XML_PATH_PIX_ENABLED      = 'ultradev_parcelamento/pix/enabled';
    const XML_PATH_PIX_DISCOUNT     = 'ultradev_parcelamento/pix/discount';

    // -------------------------------------------------------------------------
    // Config paths — Boleto
    // -------------------------------------------------------------------------
    const XML_PATH_BOLETO_ENABLED   = 'ultradev_parcelamento/boleto/enabled';
    const XML_PATH_BOLETO_DISCOUNT  = 'ultradev_parcelamento/boleto/discount';

    // =========================================================================
    // Cartão de Crédito
    // =========================================================================

    public function isEnabled(): bool
    {
        return Mage::getStoreConfigFlag(self::XML_PATH_ENABLED);
    }

    public function getMaxInstallments(): int
    {
        return (int) Mage::getStoreConfig(self::XML_PATH_MAX_INSTALLMENTS);
    }

    public function getCashDiscount(): float
    {
        return (float) Mage::getStoreConfig(self::XML_PATH_CASH_DISCOUNT);
    }

    public function getInterestTable(): array
    {
        $raw   = Mage::getStoreConfig(self::XML_PATH_INTEREST_TABLE);
        $table = empty($raw) ? [] : @unserialize($raw);
        return is_array($table) ? $table : [];
    }

    public function getInterestForInstallment(int $installments): float
    {
        foreach ($this->getInterestTable() as $row) {
            if (isset($row['parcela']) && (int) $row['parcela'] === $installments) {
                return (float) $row['juros'];
            }
        }
        return 0.0;
    }

    public function getInterestTableJson(): string
    {
        return json_encode($this->getInterestTable()) ?: '[]';
    }

    public function calcInstallmentValue(float $basePrice, int $installments = 0): float
    {
        if ($installments === 0) {
            $installments = $this->getMaxInstallments();
        }
        $interest = $this->getInterestForInstallment($installments);
        $total    = $basePrice * (1 + ($interest / 100));
        return $installments > 0 ? ($total / $installments) : $total;
    }

    public function calcCashPrice(float $basePrice): float
    {
        $discount = $this->getCashDiscount();
        return $basePrice - ($basePrice * ($discount / 100));
    }

    /**
     * Retorna todas as linhas da tabela de parcelamento calculadas.
     * Usada pelo modal para gerar as linhas dinamicamente.
     *
     * @param  float $basePrice
     * @return array [ ['installments'=>int, 'value'=>float, 'total'=>float, 'interest'=>float, 'has_interest'=>bool] ]
     */
    public function getAllInstallmentRows(float $basePrice): array
    {
        $rows = [];
        $max  = $this->getMaxInstallments();

        for ($i = 1; $i <= $max; $i++) {
            $interest    = $this->getInterestForInstallment($i);
            $total       = $basePrice * (1 + ($interest / 100));
            $value       = $total / $i;

            $rows[] = [
                'installments' => $i,
                'value'        => $value,
                'total'        => $total,
                'interest'     => $interest,
                'has_interest' => $interest > 0,
            ];
        }

        return $rows;
    }

    // =========================================================================
    // Pix
    // =========================================================================

    public function isPixEnabled(): bool
    {
        return Mage::getStoreConfigFlag(self::XML_PATH_PIX_ENABLED);
    }

    public function getPixDiscount(): float
    {
        return (float) Mage::getStoreConfig(self::XML_PATH_PIX_DISCOUNT);
    }

    public function calcPixPrice(float $basePrice): float
    {
        $discount = $this->getPixDiscount();
        return $basePrice - ($basePrice * ($discount / 100));
    }

    // =========================================================================
    // Boleto
    // =========================================================================

    public function isBoletoEnabled(): bool
    {
        return Mage::getStoreConfigFlag(self::XML_PATH_BOLETO_ENABLED);
    }

    public function getBoletoDiscount(): float
    {
        return (float) Mage::getStoreConfig(self::XML_PATH_BOLETO_DISCOUNT);
    }

    public function calcBoletoPrice(float $basePrice): float
    {
        $discount = $this->getBoletoDiscount();
        return $basePrice - ($basePrice * ($discount / 100));
    }

    // =========================================================================
    // Utilitário
    // =========================================================================

    /**
     * Retorna true se ao menos um método de pagamento está habilitado.
     * Usado pelo Block para decidir se renderiza o modal.
     */
    public function hasAnyPaymentMethod(): bool
    {
        return $this->isEnabled() || $this->isPixEnabled() || $this->isBoletoEnabled();
    }
}
