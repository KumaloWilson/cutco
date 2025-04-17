# Cutcoin Tuckshop Token System

The Cutcoin Tuckshop Token System is designed to facilitate the distribution and administration of change via tokens at tuckshops. It leverages a Flask backend, MongoDB for data storage, and the Chromastone API for SMS communication.

## Features

- Generate tokens for change distribution
- Redeem tokens and confirm via SMS
- Notify technicians for tuckshop maintenance
- Check available tokens

## Prerequisitess

- Python 3.9+
- MongoDB
- Flask
- A Chromastone API Key

## Setup

1. Clone the repository to your local machine.
2. Ensure MongoDB is running and accessible.
3. Set the following environment variables:

    - `TECHNICIAN_NUMBER`: The phone number of the tuckshop's technician.
    - `TUCKSHOP_ID`: A unique identifier for the tuckshop.

4. Install the required Python packages:

```
pip install -r requirements.txt
```

## Running the Application

>Navigate to the root directory of the project.
>Run the Flask application:

```python app.py```

The server will start on localhost at port 5000.

# cutco
