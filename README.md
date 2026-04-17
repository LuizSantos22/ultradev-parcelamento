# UltraDev_Parcelamento

Installment widget with configurable interest rates for **OpenMage** / Magento 1.x.

Displays on the product page:
- Per-installment price (with optional interest rates per installment count)
- Cash price with configurable percentage discount
- Live update when the customer switches product variants (JS + MutationObserver)

---

## Installation via Composer

```bash
composer require ultradev/magento-parcelamento
```

Make sure your root `composer.json` includes the Magento installer:

```json
"require": {
    "magento-hackathon/magento-composer-installer": "*"
}
```

---

## Manual Installation

Copy the directories keeping the structure intact:
