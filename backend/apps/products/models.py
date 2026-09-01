from django.db import models
from django.utils.translation import gettext_lazy as _

class Category(models.Model):
    slug = models.SlugField(_('slug'), unique=True)
    name = models.CharField(_('name'), max_length=100)
    image = models.ImageField(_('image'), upload_to='categories/', blank=True, null=True)
    description = models.TextField(_('description'), blank=True)

    class Meta:
        verbose_name = _('category')
        verbose_name_plural = _('categories')

    def __str__(self):
        return self.name

class Product(models.Model):
    slug = models.SlugField(_('slug'), unique=True, max_length=200)
    name = models.CharField(_('name'), max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.CharField(_('brand'), max_length=100)
    price = models.BigIntegerField(_('price'))
    original_price = models.BigIntegerField(_('original price'), blank=True, null=True)
    images = models.JSONField(_('images'), default=list, blank=True)
    colors = models.JSONField(_('colors'), default=list, blank=True)
    sizes = models.JSONField(_('sizes'), default=list, blank=True)
    material = models.CharField(_('material'), max_length=100, blank=True)
    description = models.TextField(_('description'), blank=True)
    rating = models.FloatField(_('rating'), default=0.0)
    reviews = models.IntegerField(_('reviews count'), default=0)
    sold = models.IntegerField(_('sold count'), default=0)
    stock = models.IntegerField(_('stock count'), default=0)
    tags = models.JSONField(_('tags'), default=list, blank=True)
    featured = models.BooleanField(_('featured'), default=False)
    new_arrival = models.BooleanField(_('new arrival'), default=False)

    class Meta:
        verbose_name = _('product')
        verbose_name_plural = _('products')

    def __str__(self):
        return self.name

    @property
    def discount(self):
        if self.original_price and self.original_price > self.price:
            return round(((self.original_price - self.price) / self.original_price) * 100)
        return 0
