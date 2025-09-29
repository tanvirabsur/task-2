# Website Generator

This project dynamically generates multiple websites from a template using data from a CSV file.

## How it Works

The script `generator.js` reads data from `websites.csv`. For each row in the CSV, it performs the following steps:

1.  **Creates a new directory**: A new directory is created in the `build` folder, named after the domain in the CSV.
2.  **Copies the template**: The `templates` directory, which contains a React-based website template, is copied into the new domain-specific directory.
3.  **Installs dependencies**: `npm install` is run in the new directory to install the necessary Node.js modules for the template.
4.  **Customizes content**:
    *   `src/components/Hero.jsx` is updated with a randomly selected word ("Quick", "Fast", or "Speedy").
    *   `src/components/Contact.jsx` is updated with the phone and address from the CSV data.
5.  **Builds the website**: `npm run build` is executed to generate the final static website files in the `dist` directory within the domain-specific folder.

## Project Structure

*   `generator.js`: The main script for generating the websites.
*   `websites.csv`: The data source containing information for each website (domain, title, description, phone, address).
*   `templates/`: The React-based website template.
*   `build/`: The output directory where the generated websites are stored.

## Prerequisites

*   Node.js and npm must be installed.

## Usage

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run the generator**:
    ```bash
    node generator.js
    ```

After running the script, the generated websites will be available in the `build` directory. Each website's static files will be in its respective `dist` sub-directory.