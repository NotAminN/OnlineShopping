from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    mobile = models.CharField(_('mobile number'), max_length=15, unique=True, blank=True, null=True)
    
    @property
    def avatar_initials(self):
        first = self.first_name[0] if self.first_name else ''
        last = self.last_name[0] if self.last_name else ''
        if first or last:
            return f"{first}.{last}".strip('.')
        return self.username[0].upper() if self.username else '?'

class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    title = models.CharField(_('address title'), max_length=100)
    province = models.CharField(_('province'), max_length=100)
    city = models.CharField(_('city'), max_length=100)
    line = models.TextField(_('address line'))
    postal_code = models.CharField(_('postal code'), max_length=20)
    receiver = models.CharField(_('receiver name'), max_length=150)
    phone = models.CharField(_('receiver phone'), max_length=20)
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name = _('address')
        verbose_name_plural = _('addresses')

    def save(self, *args, **kwargs):
        if self.is_default:
            # Set other addresses to not default
            Address.objects.filter(user=self.user).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.user.username}"
