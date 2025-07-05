from django.contrib import admin
from .models import CarMake, CarModel


# Register your models here.

# CarModelInline class
class CarModelInline(admin.TabularInline):
    """
    Allows editing of CarModel objects directly on the CarMake admin page.
    'TabularInline' provides a compact, table-based layout.
    """
    model = CarModel
    extra = 1  # Provides one extra blank form for adding a new CarModel


# CarModelAdmin class
class CarModelAdmin(admin.ModelAdmin):
    """
    Customizes the admin interface for the CarModel.
    """
    list_display = ('name', 'car_make', 'type', 'year')  # Fields to display
    list_filter = ['car_make', 'type']  # Fields to create filters for
    search_fields = ['name', 'car_make__name']  # Fields to search by


# CarMakeAdmin class with CarModelInline
class CarMakeAdmin(admin.ModelAdmin):
    """
    Customizes the admin interface for CarMake and includes CarModelInline.
    """
    list_display = ('name', 'description')
    search_fields = ['name']
    inlines = [CarModelInline]  # Embeds the CarModel form


# Register models here
# We register the models with their custom admin classes now.
admin.site.register(CarMake, CarMakeAdmin)
admin.site.register(CarModel, CarModelAdmin)
