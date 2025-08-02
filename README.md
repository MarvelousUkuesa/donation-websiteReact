Event Payment & Donation Platform
A flexible and secure web application that provides event organizers with a versatile payment solution. This platform integrates the Stripe API to seamlessly handle both fixed-price ticket sales and open-ended donations through a single, user-friendly interface.

Project Overview
This project was designed to solve a common challenge for event organizers: managing multiple payment types. The application features a dynamic frontend built with React that adapts the user interface based on whether the event requires a set ticket price or is accepting donations. The backend intelligently routes the transaction to Stripe, ensuring a smooth and secure checkout experience for users.

The primary goal is to provide a robust, real-world example of integrating a powerful payment gateway into a modern web application.

Key Features
Dual Payment Modes: Supports both fixed-price ticket purchases and variable donation amounts.

Dynamic UI: The checkout interface intelligently adapts based on the event's payment model.

Secure Payment Processing: Leverages the Stripe API for all transactions, ensuring security and reliability.

Responsive Design: A clean and modern interface that works seamlessly across all devices.

Tech Stack
Frontend: React

Payment Gateway: Stripe API

Backend: Node.js / Express (or your chosen backend)

Styling: Tailwind CSS (or your chosen styling solution)

Containerization: Docker.

the backend is done with Aws lamdba function and access control implementation find the backend code at repo

Getting Started
Follow these instructions to get a local copy of the project up and running for development and testing purposes.

Prerequisites

Node.js (v18.x or later recommended)

npm (or yarn)

A Stripe account to get API keys

Installation

Clone the repository:

git clone https://github.com/your-username/your-repo-name.git

Navigate to the project directory:

cd your-repo-name

Install dependencies:

npm install

Set up environment variables:
Create a .env file in the root of your project and add the necessary environment variables. See the section below for details.

Environment Variables
To run this project, you will need to add the following environment variables to your .env file. These are essential for connecting to the Stripe API.

REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key

Replace the placeholder values with your actual test keys from your Stripe Developer Dashboard.

Available Scripts
In the project directory, you can run the following commands:

npm start

Runs the app in development mode.
Open http://localhost:3000 to view it in your browser. The page will automatically reload when you make changes.

npm run build

Builds the app for production to the build folder. It correctly bundles React in production mode and optimizes the build for the best performance.

npm test

Launches the test runner in interactive watch mode.

Running with Docker
This project includes a Dockerfile for easy containerization, providing a consistent environment for both development and production.

Prerequisites for Docker

Docker Desktop installed and running on your machine.

Build and Run the Container

Build the Docker image:
From the project's root directory, run the following command. This will build the image and tag it with a name you provide.

docker build -t your-app-name .

Run the Docker container:
This command starts the container and maps port 3000 on your machine to port 3000 inside the container.

docker run -p 3000:3000 -d --name your-container-name your-app-name

Once the container is running, the application will be available at http://localhost:3000.

Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!
