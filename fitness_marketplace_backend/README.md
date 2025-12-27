# 🏋️ Fitness Marketplace Backend Setup

This document provides instructions for setting up and running the Fitness Marketplace backend application on a Windows environment.

## 🚀 Getting Started

Follow these steps to get the server running locally and start making API calls.

### Prerequisites

  * **Python 3.x** (with `pip` and the `py` launcher installed)
  * **Git** (for cloning the repository)
  * **Postman** (or any other API client for testing)

## 💻 Local Setup

### 1\. Clone the Repository

If you haven't already, clone the repository to your local machine:

```bash
git clone <repository_url>
cd fitness_marketplace_backend
```

### 2\. Install Dependencies

You'll need to install all required Python packages using the `requirements.txt` file.

```bash
pip install -r requirements.txt
```

-----

### 3\. Configure Environment Variables

The application requires a `.env` file for configuration, especially for database connection and security keys.

1.  Create a file named **`.env`** in the root directory of the project.

2.  Copy and paste the following configuration into the file, replacing the placeholder values as necessary:

    ```env
    MONGO_URI=mongodb+srv://marketplace:abcd1234@cluster0.n4tvq3v.mongodb.net/fitness_marketplace?retryWrites=true&w=majority
    MONGO_DB_NAME=fitness_marketplace
    SECRET_KEY=your-super-secret-key-change-this-in-production
    ```

-----

### 4\. Run the Server

Start the FastAPI application using `uvicorn` with the hot-reload feature enabled. This command uses the **`py -m`** syntax to ensure compatibility.

```bash
py -m uvicorn app.main:app --reload
```

The server will typically start on **`http://127.0.0.1:8000`** (or another port if specified). Note the URL displayed in your terminal.

-----

## 🧪 API Testing with Postman

Once the server is running, you can test the endpoints using Postman.

### Example: Get All Listings

1.  Open **Postman** and create a new HTTP request.

2.  Set the request method to **`GET`**.

3.  Construct the full URL using the server address and the API path. The listings routes are defined in `app/interfaces/route/listings.py`.

    **Example URL:**

    ```
    http://127.0.0.1:8000/api/v1/listings
    ```

    > *(Replace `/api/v1/listings` with the specific path found in your `listings.py` file.)*

4.  Click **Send** to test the endpoint.
