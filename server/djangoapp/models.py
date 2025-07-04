# Uncomment the following imports before adding the Model code

from django.db import models
from django.utils.timezone import now
from django.core.validators import MaxValueValidator, MinValueValidator


# Create your models here.

class CarMake(models.Model):
    """
    A model to represent the make of a car (e.g., Toyota, Ford).
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    # Other fields as needed

    def __str__(self):
        """
        Returns the name of the car make as its string representation.
        """
        return self.name

class CarModel(models.Model):
    """
    A model to represent a specific model of a car (e.g., Camry, F-150).
    """
    # Many-to-One relationship with CarMake
    car_make = models.ForeignKey(CarMake, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    # Choices for the car type field
    CAR_TYPES = [
        ('SEDAN', 'Sedan'),
        ('SUV', 'SUV'),
        ('WAGON', 'Wagon'),
        ('COUPE', 'Coupe'),
        ('TRUCK', 'Truck'),
        # Add more choices as required
    ]
    type = models.CharField(max_length=10, choices=CAR_TYPES, default='SUV')

    # Year field with validators to ensure it's within a reasonable range
    year = models.IntegerField(default=2023,
        validators=[
            MaxValueValidator(2023),
            MinValueValidator(2015)
        ])
    # Other fields as needed

    def __str__(self):
        """
        Returns a string representation including the make and model name.
        """
        return f"{self.car_make.name} {self.name}"