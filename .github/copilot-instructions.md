# Elrabea Angular Project - Copilot Instructions

This document provides guidance for AI coding agents to effectively contribute to the Elrabea Angular project.

## 1. Project Overview & Architecture

This is an Angular application for managing a dental clinic's data, including patients, materials, sessions, and operations. The project follows a feature-based architecture.

- **Core Services**: The `src/app/core/services` directory contains the main data services for the application. These services are responsible for making API calls to the backend.
  - `PatientApi.service.ts`: Manages patient data.
  - `MaterialApi.service.ts`: Manages dental materials.

- **Feature Modules**: Each feature of the application is organized into its own module within `src/app/features`. Each feature module contains its own component, HTML, and CSS.
  - `patients`: Manages patient records.
  - `materials`: Manages dental materials.
  - `sessions`: Manages patient sessions.
  - `operations`: Manages dental operations.

- **Shared Models**: The `src/app/shared/Models` directory contains the data models used throughout the application.
  - `patient.model.ts`
  - `material.model.ts`

## 2. Development Workflow

### Running the Application

To run the application in a development environment, use the following command:

```bash
ng serve
```

The application will be available at `http://localhost:4200/`.

### Building the Project

To build the project for production, use:

```bash
ng build
```

### Running Tests

To run the unit tests, use:

```bash
ng test
```

## 3. Code Conventions

- **Component Naming**: Components are named using the format `feature-name.component.ts`. For example, `patients.component.ts`.
- **Service Naming**: Services are named using the format `service-nameApi.service.ts`. For example, `PatientApi.service.ts`.
- **Styling**: Each component has its own CSS file for styling. Global styles are located in `src/styles.css`.
- **Data Models**: Data models are defined as TypeScript interfaces in the `src/app/shared/Models` directory.

## 4. Key Files

- `src/app/app.routes.ts`: Defines the main application routes.
- `src/app/core/services/`: Contains the data services.
- `src/app/features/`: Contains the feature modules.
- `src/app/shared/Models/`: Contains the data models.
