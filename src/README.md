# Checklist for running the server
### 1. Install required dependencies
Run the following command in your terminal:
```
npm install cors express pg-promise dotenv
```
### 2. Prepare your `.env` file
* If you don't already have one, create a `.env` file in the project root and include your database connection variables (DB host, port, user, password, database name, etc.).

### 3. Allow your local machine to access the Azure PostgreSQL database
* Go to **Azure Portal → Your PostgreSQL Server → Networking (Firewall Rules)**
* Add your **current public IP address**
* **Click the “Save”** button at the top left (easy to forget!)

### 4. Build your project before starting
```
npm run build
```

### 5. Start the server
```
npm start
```
