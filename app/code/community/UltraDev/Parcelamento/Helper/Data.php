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
    const XML_PATH_ENABLED          = 'ultradev_parcelamento/general/enabled';
    const XML_PATH_MAX_INSTALLMENTS = 'ultradev_parcelamento/general/max_installments';
    const XML_PATH_CASH_DISCOUNT    = 'ultradev_parcelamento/general/cash_discount';
    const XML_PATH_INTEREST_TABLE   = 'ultradev_parcelamento/general/interest_table';

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
}
