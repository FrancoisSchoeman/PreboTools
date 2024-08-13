# PreboTools

## Note

This project is still in development and is not yet ready for production use.

## About

PreboTools is a Django-based web application that provides various tools and utilities for Prebo Digital, a digital marketing agency. It's built using Django, Tailwind CSS and Flowbite. This application also uses python-dotenv for handling environment variables and Docker for easy deployment and development.

## Features

- Multiple tools and utilities
- Easy-to-use interface powered by Tailwind CSS and Flowbite
- Docker support for easy setup and deployment

## Roadmap

For the full project roadmap, refer to the [ROADMAP.md](ROADMAP.md) file.

## Getting Started

### Prerequisites

- Python 3.12 or higher
- Docker and Docker Compose (optional)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/FrancoisSchoeman/PreboTools.git
   cd PreboTools
   ```

2. Copy the `.env.example` file to `.env.dev` or to `.env.prod` and update the environment variables:

   ```bash
   cp .env.example .env.dev # for development
   cp .env.example .env.prod # for production
   ```

3. Initialize Tailwind CSS:

   ```bash
   python manage.py tailwind init
   ```

4. Build and run the Docker containers:

   ```bash
   docker-compose up --build
   ```

   For production, use:

   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

   For more detailed production setup instructions, refer to the [DOCKER-COMMANDS.md](DOCKER-COMMANDS.md) file.

5. Access the development application at [http://127.0.0.1:8000/]('http://127.0.0.1:8000/').

### Without Docker

If you prefer not to use Docker, follow these steps:

1. Create a virtual environment and activate it:

   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

2. Install the required packages from `requirements.txt`:

   ```bash
   pip install -r requirements.txt
   ```

3. Change the load_dotenv call in `prebo_tools/settings/secrets.py` to:

   ```python
   load_dotenv('.env.dev')
   ```

4. Initialize Tailwind CSS:

   ```bash
   python manage.py tailwind init
   ```

5. Run migrations and start the development server:

   ```bash
   python manage.py tailwind start
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
   ```

## Contributing

Feel free to contribute to the project by opening issues, submitting pull requests, or providing feedback.

## License

This project is licensed under the MIT License - see the LICENSE.txt file for details.
