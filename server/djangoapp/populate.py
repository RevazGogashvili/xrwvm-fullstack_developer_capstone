from .models import CarMake, CarModel


def initiate():
    # --- UPDATED CAR MAKES ---
    car_make_data = [
        {"name": "NISSAN", "description": "Great cars. Japanese technology"},
        {"name": "Mercedes", "description": "Great cars. German technology"},
        {"name": "Audi", "description": "Great cars. German technology"},
        {"name": "Kia", "description": "Great cars. Korean technology"},
        {"name": "Toyota", "description": "Great cars. Japanese technology"},
        {"name": "Volvo", "description": "Great cars. Swedish technology"},
        {"name": "Ford", "description": "Great cars. American technology"},
        {"name": "Porsche", "description": "Great cars. German technology"},
    ]

    car_make_instances = []
    # Clear existing data to prevent duplicates on re-run
    CarModel.objects.all().delete()
    CarMake.objects.all().delete()

    for data in car_make_data:
        car_make_instances.append(
            CarMake.objects.create(
                name=data['name'], description=data['description']
            )
        )

    # --- UPDATED CAR MODELS ---
    # Create CarModel instances with the corresponding CarMake instances
    car_model_data = [
        # Nissan (index 0)
        {"name": "Pathfinder", "type": "SUV", "year": 2023, "car_make": car_make_instances[0]},
        {"name": "Qashqai", "type": "SUV", "year": 2023, "car_make": car_make_instances[0]},
        {"name": "XTRAIL", "type": "SUV", "year": 2023, "car_make": car_make_instances[0]},
        # Mercedes (index 1) - Corrected to Sedan
        {"name": "A-Class", "type": "Sedan", "year": 2023, "car_make": car_make_instances[1]},
        {"name": "C-Class", "type": "Sedan", "year": 2023, "car_make": car_make_instances[1]},
        {"name": "E-Class", "type": "Sedan", "year": 2023, "car_make": car_make_instances[1]},
        # Audi (index 2) - Corrected to Sedan
        {"name": "A4", "type": "Sedan", "year": 2023, "car_make": car_make_instances[2]},
        {"name": "A5", "type": "Sedan", "year": 2023, "car_make": car_make_instances[2]},
        {"name": "A6", "type": "Sedan", "year": 2023, "car_make": car_make_instances[2]},
        # Kia (index 3)
        {"name": "Sorrento", "type": "SUV", "year": 2023, "car_make": car_make_instances[3]},
        {"name": "Carnival", "type": "SUV", "year": 2023, "car_make": car_make_instances[3]},
        {"name": "Cerato", "type": "Sedan", "year": 2023, "car_make": car_make_instances[3]},
        # Toyota (index 4)
        {"name": "Corolla", "type": "Sedan", "year": 2023, "car_make": car_make_instances[4]},
        {"name": "Camry", "type": "Sedan", "year": 2023, "car_make": car_make_instances[4]},
        {"name": "Kluger", "type": "SUV", "year": 2023, "car_make": car_make_instances[4]},

        # --- NEWLY ADDED MODELS ---

        # New Mercedes SUVs (index 1)
        {"name": "ML 350", "type": "SUV", "year": 2023, "car_make": car_make_instances[1]},
        {"name": "ML 320", "type": "SUV", "year": 2023, "car_make": car_make_instances[1]},
        {"name": "GL 350", "type": "SUV", "year": 2023, "car_make": car_make_instances[1]},
        {"name": "GL 450", "type": "SUV", "year": 2023, "car_make": car_make_instances[1]},
        {"name": "G 55 AMG", "type": "SUV", "year": 2023, "car_make": car_make_instances[1]},

        # New Audi SUVs (index 2)
        {"name": "Q5", "type": "SUV", "year": 2023, "car_make": car_make_instances[2]},
        {"name": "Q7", "type": "SUV", "year": 2023, "car_make": car_make_instances[2]},
        {"name": "Q8", "type": "SUV", "year": 2023, "car_make": car_make_instances[2]},

        # New Volvo Wagon (index 5)
        {"name": "C90", "type": "Wagon", "year": 2015, "car_make": car_make_instances[5]},

        # New Ford Trucks (index 6)
        {"name": "F-150", "type": "TRUCK", "year": 2022, "car_make": car_make_instances[6]},
        {"name": "F-250", "type": "TRUCK", "year": 2022, "car_make": car_make_instances[6]},
        {"name": "F-350", "type": "TRUCK", "year": 2022, "car_make": car_make_instances[6]},
        {"name": "Ranger", "type": "TRUCK", "year": 2022, "car_make": car_make_instances[6]},

        # New Porsche Models (index 7)
        {"name": "911", "type": "COUPE", "year": 2020, "car_make": car_make_instances[7]},
        {"name": "911 GT", "type": "COUPE", "year": 2022, "car_make": car_make_instances[7]},
        {"name": "918", "type": "CONVERTIBLE", "year": 2023, "car_make": car_make_instances[7]},
        {"name": "911 Spider", "type": "CONVERTIBLE", "year": 2022, "car_make": car_make_instances[7]},
    ]

    for data in car_model_data:
        CarModel.objects.create(
            name=data['name'],
            car_make=data['car_make'],
            type=data['type'],
            year=data['year']
        )
