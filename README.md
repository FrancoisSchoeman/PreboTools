# PreboTools

## Note

This project is still in development.

## About

PreboTools is a web application that provides various tools and utilities for Prebo Digital, a digital marketing agency. It's built using Django and Next.js. This application also uses Docker for easy deployment and development of the backend.

## Features

- Multiple tools and utilities
- Easy-to-use interface powered by Tailwind CSS and Shadcn UI
- Docker support for easy setup and deployment

## Roadmap

For the full project roadmap, refer to the [ROADMAP.md](ROADMAP.md) file.

## Getting Started

### Prerequisites

- Python 3.12 or higher
- Node.js 18 or higher
- Docker and Docker Compose (optional)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/FrancoisSchoeman/PreboTools.git
   cd PreboTools
   ```

2. Create environment files:

   ```bash
   cd backend
   cp .env.example .env.dev
   ```

   ```bash
   cd frontend
   cp .env.example .env.local
   ```

3. Install backend dependencies:

   ```bash
   cd backend
   pip install -r backend/requirements.txt
   ```

4. Install frontend dependencies:

   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

5. Build and run the backend Docker container:

   ```bash
   docker compose up --build
   ```

   For more detailed production setup instructions, refer to the [DOCKER-COMMANDS.md](DOCKER-COMMANDS.md) file.

6. Run the frontend development server:

   ```bash
   cd frontend
   npm run dev
   ```

7. Access the development application:
   - Backend: [http://localhost:8002/](http://localhost:8002/)
   - Frontend: [http://localhost:3000/](http://localhost:3000/)

### Without Docker

If you prefer not to use Docker, follow these steps:

#### Backend Setup

1. Create a virtual environment and activate it:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

2. Install backend dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

3. Run migrations and start the backend server:

   ```bash
   python backend/manage.py makemigrations
   python backend/manage.py migrate
   python backend/manage.py runserver
   ```

#### Frontend Setup

1. Install frontend dependencies:

   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

2. Start the frontend development server:

   ```bash
   npm run dev
   ```

## Contributing

Feel free to contribute to the project by opening issues, submitting pull requests, or providing feedback.
