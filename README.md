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

## Theme Integration

This module registers itself as a child block of `product.info` via layout XML,
so no core template files need to be modified.

Add the following **single line** to your theme's `view.phtml` normaly at app/design/frontend/YOURTHEME/default/template/catalog/product/view.phtml, 
in the position where you want the widget to appear — typically right after the price block and
before the add-to-cart button:

```php
<?php echo $this->getChildHtml('ultradev_parcelamento') ?>
```

Example location inside `app/design/frontend/{package}/{theme}/template/catalog/product/view.phtml`:

```php
<?php echo $priceProperties; ?>   <!-- price block ends here -->

<?php echo $this->getChildHtml('ultradev_parcelamento') ?>  <!-- add this line -->

<?php echo $this->getChildHtml('addtocart') ?>   <!-- add to cart button -->
```

That's all — no business logic inside the template.
