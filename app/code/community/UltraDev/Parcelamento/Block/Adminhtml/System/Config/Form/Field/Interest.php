<?php
/**
 * UltraDev_Parcelamento
 *
 * @category  UltraDev
 * @package   UltraDev_Parcelamento
 * @author    UltraDev <contato@ultradev.com.br>
 * @license   MIT
 */
class UltraDev_Parcelamento_Block_Adminhtml_System_Config_Form_Field_Interest
    extends Mage_Adminhtml_Block_System_Config_Form_Field_Array_Abstract
{
    public function __construct()
    {
        $this->addColumn('parcela', [
            'label' => Mage::helper('ultradev_parcelamento')->__('Parcela (ex: 2)'),
            'style' => 'width: 100px',
        ]);

        $this->addColumn('juros', [
            'label' => Mage::helper('ultradev_parcelamento')->__('Juros Totais (%)'),
            'style' => 'width: 100px',
        ]);

        $this->_addAfter       = false;
        $this->_addButtonLabel = Mage::helper('ultradev_parcelamento')->__('Adicionar Regra de Juros');

        parent::__construct();
    }
}
