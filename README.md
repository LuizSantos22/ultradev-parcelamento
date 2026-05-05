# UltraDev_Parcelamento

Installment widget with configurable interest rates for **OpenMage** / Magento 1.x.

Displays on the product page:
- Per-installment price (with optional interest rates per installment count)
- Cash price with configurable percentage discount
- Pix and Boleto prices with configurable percentage discounts
- Payment modal with installment table, Pix and Boleto details
- Live update when the customer switches product variants (JS + MutationObserver)
- Schema.org (JSON-LD) structured data injection for Pix/Boleto price SEO indexing

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

app/code/community/UltraDev/Parcelamento/
app/design/frontend/base/default/layout/
app/design/frontend/base/default/template/ultradev/
app/design/frontend/ultimo/default/template/ultradev/
app/design/frontend/ultimo/layout/
app/etc/modules/
skin/frontend/base/default/css/ultradev/
skin/frontend/base/default/js/ultradev/
skin/frontend/ultimo/default/css/ultradev/
skin/frontend/ultimo/default/js/ultradev/

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

## Ultimo Theme — local.xml
If you are using the Ultimo theme and have enabled Price Box Customizado (Admin → UltraDev → Parcelamento), you also need to declare the block inside your app/design/frontend/ultimo/default/layout/local.xml, within the <reference name="product.info">:

``` <reference name="product.info">
    <block type="catalog/product_price" name="product.price" template="ultradev/parcelamento/product/price.phtml" />
</reference> ```


That's all — no business logic inside the template.
